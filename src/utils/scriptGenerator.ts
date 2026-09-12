import { ScoreItem, ScoreStats, ScriptOptions } from '../types';

/**
 * Parses raw text copied from Excel columns, CSV, or spaces into numeric scores.
 * Accurately supports both Indonesian comma decimals (e.g. 85,5) and standard dot decimals (85.5).
 */
export function parseRawScores(rawText: string): { items: ScoreItem[]; validValues: number[]; stats: ScoreStats } {
  if (!rawText.trim()) {
    return {
      items: [],
      validValues: [],
      stats: { total: 0, min: 0, max: 0, average: 0, validCount: 0, invalidCount: 0 },
    };
  }

  // Check if pasted lines look like Excel rows (tab-separated or newline-separated)
  const lines = rawText.split(/\r?\n/);
  const tokens: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // If the line contains tabs (Excel multiple columns copied), check if the last token or number column has the score
    if (trimmedLine.includes('\t')) {
      const parts = trimmedLine.split('\t').map((p) => p.trim()).filter(Boolean);
      // Look for a part that looks like a score number
      const scoreCandidate = parts.find((part) => {
        const normalized = part.replace(',', '.');
        return !isNaN(Number(normalized)) && normalized !== '';
      });
      if (scoreCandidate) {
        tokens.push(scoreCandidate);
      } else {
        // Just push the last column or all columns
        parts.forEach((p) => tokens.push(p));
      }
    } else if (trimmedLine.includes(';') || (trimmedLine.includes(',') && !trimmedLine.match(/^\d+,\d+$/))) {
      // Split by semicolon or comma-separated tokens (if not a standalone single comma decimal)
      const parts = trimmedLine.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
      parts.forEach((p) => tokens.push(p));
    } else {
      // Single token or space separated
      const spaceParts = trimmedLine.split(/\s+/).filter(Boolean);
      if (spaceParts.length > 1) {
        spaceParts.forEach((sp) => tokens.push(sp));
      } else {
        tokens.push(trimmedLine);
      }
    }
  }

  const items: ScoreItem[] = [];
  const validValues: number[] = [];

  tokens.forEach((token, idx) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    // Convert comma decimal to dot: e.g. "95,4" -> "95.4"
    const normalized = cleanToken.replace(',', '.');
    const num = Number(normalized);

    const isValid = !isNaN(num) && cleanToken !== '';

    items.push({
      index: items.length + 1,
      originalText: cleanToken,
      value: isValid ? num : 0,
      isValid,
    });

    if (isValid) {
      validValues.push(num);
    }
  });

  const validCount = validValues.length;
  const total = validCount;
  const min = validCount > 0 ? Math.min(...validValues) : 0;
  const max = validCount > 0 ? Math.max(...validValues) : 0;
  const sum = validValues.reduce((acc, v) => acc + v, 0);
  const average = validCount > 0 ? Number((sum / validCount).toFixed(2)) : 0;

  return {
    items,
    validValues,
    stats: {
      total,
      min,
      max,
      average,
      validCount,
      invalidCount: items.length - validCount,
    },
  };
}

/**
 * Builds the JavaScript console script to be pasted in browser devtools
 */
export function generateAutoFillScript(values: number[], options: ScriptOptions): string {
  if (values.length === 0) {
    return '// Silakan masukkan daftar nilai terlebih dahulu pada kolom input.';
  }

  const {
    offset,
    delayMs,
    customSelector,
    useCustomSelector,
    triggerEvents,
    decimalFormat,
    autoScroll,
    logToConsole,
  } = options;

  const selectorStr = useCustomSelector && customSelector.trim()
    ? customSelector.trim()
    : 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])';

  return `/**
 * =======================================================
 *  Rapor Auto-Fill Script (Console Automation)
 *  Total Nilai: ${values.length} Siswa
 *  Jeda Simpan: ${delayMs} ms
 *  Offset Input: ${offset}
 * =======================================================
 *  CARA PAKAI:
 *  1. Buka halaman pengisian nilai rapor di browser.
 *  2. Tekan F12 atau Ctrl+Shift+I (Cmd+Option+I di Mac).
 *  3. Klik tab "Console".
 *  4. Paste seluruh kode di bawah ini lalu tekan ENTER.
 *  5. Jangan tutup tab sampai proses pengisian selesai.
 * =======================================================
 */

(async function masukanNilaiOtomatis() {
  const daftarNilai = ${JSON.stringify(values)};
  const OFFSET_AWAL = ${offset};
  const DELAY_MS = ${delayMs};
  const FORMAT_DESIMAL = '${decimalFormat}'; // 'dot', 'comma', atau 'original'
  const TARGET_SELECTOR = ${JSON.stringify(selectorStr)};

  ${logToConsole ? `console.log("%c[RAPOR AUTO-FILL] Memulai proses...", "background: #2563eb; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold;");` : ''}

  // Cari seluruh elemen input yang cocok
  const allInputs = Array.from(document.querySelectorAll(TARGET_SELECTOR));
  const inputElements = allInputs.slice(OFFSET_AWAL);

  if (inputElements.length === 0) {
    console.error("%c[ERROR] Elemen input nilai tidak ditemukan! Pastikan halaman rapor sudah terbuka penuh dan selector cocok.", "color: #ef4444; font-weight: bold;");
    return;
  }

  const jumlahTarget = Math.min(daftarNilai.length, inputElements.length);
  ${logToConsole ? `console.log(\`%c[INFO] Ditemukan \${inputElements.length} kolom input. Akan mengisi \${jumlahTarget} siswa.\`, "color: #10b981;");` : ''}

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Bypass React/Vue/Angular synthetic event setter
  function setInputValue(element, value) {
    let formattedVal = String(value);
    if (FORMAT_DESIMAL === 'comma') {
      formattedVal = formattedVal.replace('.', ',');
    } else if (FORMAT_DESIMAL === 'dot') {
      formattedVal = formattedVal.replace(',', '.');
    }

    ${triggerEvents.reactPrototypeSetter ? `
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototypeSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
    
    if (prototypeSetter && valueSetter !== prototypeSetter) {
      prototypeSetter.call(element, formattedVal);
    } else if (valueSetter) {
      valueSetter.call(element, formattedVal);
    } else {
      element.value = formattedVal;
    }` : `element.value = formattedVal;`}
  }

  for (let i = 0; i < jumlahTarget; i++) {
    const el = inputElements[i];
    const nilai = daftarNilai[i];

    ${autoScroll ? `el.scrollIntoView({ behavior: 'smooth', block: 'center' });` : ''}
    ${triggerEvents.clickFocus ? `
    el.click();
    el.focus();` : ''}

    setInputValue(el, nilai);

    ${triggerEvents.inputChangeEvents ? `
    ['focus', 'keydown', 'keypress', 'input', 'keyup', 'change'].forEach(type => {
      el.dispatchEvent(new Event(type, { bubbles: true }));
    });` : ''}

    ${triggerEvents.enterTabKeys ? `
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, code: 'Enter', bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', keyCode: 9, code: 'Tab', bubbles: true }));` : ''}

    ${triggerEvents.blurEvent ? `
    el.blur();
    el.dispatchEvent(new Event('blur', { bubbles: true }));` : ''}

    ${logToConsole ? `console.log(\`✅ [\${i + 1}/\${jumlahTarget}] Nilai Siswa #\${i + 1}: \${nilai}\`);` : ''}
    await sleep(DELAY_MS);
  }

  ${logToConsole ? `console.log("%c🎉 Selesai! Seluruh nilai (\${jumlahTarget} siswa) berhasil dimasukkan otomatis.", "background: #059669; color: #fff; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 13px;");` : ''}
})();`;
}
