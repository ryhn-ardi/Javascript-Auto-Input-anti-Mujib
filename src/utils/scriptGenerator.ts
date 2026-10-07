import { ScoreItem, ScoreStats, ScriptOptions, MultiColumnEntry } from '../types';

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

  // Check if pasted lines look like Excel rows
  const lines = rawText.split(/\r?\n/);
  const tokens: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // If the line contains tabs (Excel single or multiple columns), check parts
    if (trimmedLine.includes('\t')) {
      const parts = trimmedLine.split('\t').map((p) => p.trim()).filter(Boolean);
      parts.forEach((p) => tokens.push(p));
    } else if (trimmedLine.includes(';') || (trimmedLine.includes(',') && !trimmedLine.match(/^\d+,\d+$/))) {
      const parts = trimmedLine.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
      parts.forEach((p) => tokens.push(p));
    } else {
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

  tokens.forEach((token) => {
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
 * Parses multi-column raw text (e.g. from Excel multiple columns copied with tabs)
 */
export function parseMultiColumnExcelText(rawText: string, totalColumns: number): MultiColumnEntry[] {
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const result: MultiColumnEntry[] = [];

  for (let c = 0; c < totalColumns; c++) {
    result.push({
      id: `col_${c + 1}`,
      name: `Kolom ${c + 1}`,
      rawText: '',
      items: [],
      validValues: [],
    });
  }

  const columnLines: string[][] = Array.from({ length: totalColumns }, () => []);

  lines.forEach((line) => {
    const parts = line.split('\t');
    for (let c = 0; c < totalColumns; c++) {
      if (parts[c] !== undefined && parts[c].trim() !== '') {
        columnLines[c].push(parts[c].trim());
      }
    }
  });

  for (let c = 0; c < totalColumns; c++) {
    const textJoined = columnLines[c].join('\n');
    const parsed = parseRawScores(textJoined);
    result[c].rawText = textJoined;
    result[c].items = parsed.items;
    result[c].validValues = parsed.validValues;
  }

  return result;
}

/**
 * Builds the JavaScript console script to be pasted in browser devtools
 */
export function generateAutoFillScript(
  values: number[],
  options: ScriptOptions,
  multiColumnData?: MultiColumnEntry[]
): string {
  const {
    offset,
    delayMs,
    fillMode,
    targetingMethod,
    totalColumnsPerRow,
    targetColumnIndex,
    highlightActiveCell,
    customSelector,
    useCustomSelector,
    triggerEvents,
    decimalFormat,
    autoScroll,
    logToConsole,
  } = options;

  // Validation
  if (fillMode === 'multi-columns') {
    const hasData = multiColumnData && multiColumnData.some((c) => c.validValues.length > 0);
    if (!hasData) {
      return '// Silakan masukkan daftar nilai untuk kolom-kolom terlebih dahulu.';
    }
  } else if (values.length === 0) {
    return '// Silakan masukkan daftar nilai terlebih dahulu pada kolom input.';
  }

  const selectorStr = useCustomSelector && customSelector.trim()
    ? customSelector.trim()
    : 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])';

  const isMultiTarget = fillMode === 'single-target';
  const isMultiBatch = fillMode === 'multi-columns';
  const isTableRowTargeting = targetingMethod === 'table-row';

  // Multi-column batch data formatting
  const multiColArrayString = isMultiBatch && multiColumnData
    ? JSON.stringify(multiColumnData.map((col) => col.validValues))
    : '[]';

  const columnHeaderDescription = isMultiTarget
    ? `Target: Kolom ke-${targetColumnIndex} (dari Total ${totalColumnsPerRow} kolom per siswa)\n *  Metode: ${isTableRowTargeting ? 'Deteksi Baris Tabel (Anti-Meleset)' : 'Flat Index Stride'}\n *  ⚠️ Kolom lainnya (1 s/d ${totalColumnsPerRow}) TIDAK AKAN DIGANGGU!`
    : isMultiBatch
    ? `Mode: Batch Multi-Kolom (${totalColumnsPerRow} Kolom per Siswa Sekaligus)`
    : `Mode: 1 Kolom Tunggal Sejajar (${values.length} Siswa)`;

  return `/**
 * =======================================================
 *  Rapor Auto-Fill Script (Console Automation)
 *  Total Nilai: ${isMultiBatch ? 'Multi-Kolom' : `${values.length} Siswa`}
 *  ${columnHeaderDescription}
 *  Jeda Simpan: ${delayMs} ms | Offset Awal: ${offset}
 * =======================================================
 *  CARA PAKAI:
 *  1. Buka halaman pengisian nilai rapor di browser (Google Chrome / Edge / Firefox).
 *  2. Tekan F12 atau Ctrl+Shift+I (Cmd+Option+I di Mac).
 *  3. Klik tab "Console".
 *  4. Paste seluruh kode di bawah ini lalu tekan ENTER.
 *  5. Perhatikan kotak input akan menyala hijau saat diisi otomatis.
 * =======================================================
 */

(async function masukanNilaiOtomatis() {
  const OFFSET_AWAL = ${offset};
  const DELAY_MS = ${delayMs};
  const FORMAT_DESIMAL = '${decimalFormat}'; // 'dot', 'comma', atau 'original'
  const TARGET_SELECTOR = ${JSON.stringify(selectorStr)};
  const MODE_PENGISIAN = '${fillMode}';
  const METODE_TARGETING = '${targetingMethod}'; // 'table-row' (Anti-Meleset) atau 'flat-stride'
  const TOTAL_KOLOM_PER_BARIS = ${totalColumnsPerRow};
  const TARGET_KOLOM_KE = ${targetColumnIndex}; // 1-based (Kolom ke-1, 2, 3...)
  const HIGHLIGHT_CELL = ${highlightActiveCell};

  ${isMultiBatch ? `const DATA_MULTI_KOLOM = ${multiColArrayString};` : `const daftarNilai = ${JSON.stringify(values)};`}

  ${logToConsole ? `console.log("%c[RAPOR AUTO-FILL v2.5] Inisialisasi pengisian nilai otomatis...", "background: #2563eb; color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px;");` : ''}

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fungsi pengisi nilai yang mendukung React, Vue, jQuery, & Plain HTML
  function setInputValue(element, value) {
    let formattedVal = String(value);
    if (FORMAT_DESIMAL === 'comma') {
      formattedVal = formattedVal.replace('.', ',');
    } else if (FORMAT_DESIMAL === 'dot') {
      formattedVal = formattedVal.replace(',', '.');
    }

    ${triggerEvents.reactPrototypeSetter ? `
    // 1. Bypass React & Vue prototype setter
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototypeSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
    
    if (prototypeSetter && valueSetter !== prototypeSetter) {
      prototypeSetter.call(element, formattedVal);
    } else if (valueSetter) {
      valueSetter.call(element, formattedVal);
    } else {
      element.value = formattedVal;
    }` : `element.value = formattedVal;`}

    // 2. Direct property & attribute fallback
    element.value = formattedVal;
    element.setAttribute('value', formattedVal);
  }

  // Fungsi trigger event dengan micro-delay agar form e-Rapor tidak membatalkan nilai
  async function triggerInputEvents(el, nilai, labelInfo) {
    if (!el) return;

    if (HIGHLIGHT_CELL) {
      el.style.outline = '3px solid #10b981';
      el.style.backgroundColor = '#ecfdf5';
      el.style.transition = 'all 0.2s ease';
    }

    ${autoScroll ? `el.scrollIntoView({ behavior: 'smooth', block: 'center' });` : ''}
    
    ${triggerEvents.clickFocus ? `
    el.click();
    el.focus();
    await sleep(40); // micro-delay agar browser dan listener memproses fokus` : ''}

    setInputValue(el, nilai);

    ${triggerEvents.inputChangeEvents ? `
    // Dispatch input & change dengan bubbles dan cancelable
    el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    ['keydown', 'keypress', 'keyup'].forEach(type => {
      el.dispatchEvent(new KeyboardEvent(type, { key: String(nilai), bubbles: true }));
    });` : ''}

    ${triggerEvents.enterTabKeys ? `
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, code: 'Enter', bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', keyCode: 9, code: 'Tab', bubbles: true }));` : ''}

    await sleep(40); // micro-delay sebelum blur agar event change tersimpan

    ${triggerEvents.blurEvent ? `
    el.blur();
    el.dispatchEvent(new Event('blur', { bubbles: true }));` : ''}

    if (HIGHLIGHT_CELL) {
      // Tinggalkan outline lembut tanda sudah terisi
      el.style.outline = '1px solid #10b981';
      el.style.backgroundColor = '#f0fdf4';
    }

    ${logToConsole ? `console.log(labelInfo);` : ''}
    await sleep(DELAY_MS);
  }

  // STRATEGI 1: Deteksi Baris Tabel (table tbody tr) - ANTI MELESET
  // Mencari baris siswa langsung di dalam tabel. Baris 1 = Siswa 1, Baris 2 = Siswa 2.
  const tableRows = Array.from(document.querySelectorAll('table tbody tr, table tr')).filter(tr => {
    // Pastikan baris memiliki input nilai dan bukan baris header murni
    const inps = tr.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])');
    return inps.length > 0;
  });

  const useRowMode = METODE_TARGETING === 'table-row' && tableRows.length > 0;

  if (useRowMode) {
    ${logToConsole ? `console.log(\`%c[DETEKSI PINTAR] Ditemukan \${tableRows.length} baris siswa di tabel rapor. Menggunakan metode Baris Tabel (Anti-Meleset)!\`, "color: #10b981; font-weight: bold;");` : ''}
  } else {
    ${logToConsole ? `console.log("%c[INFO] Menggunakan metode Flat Index Stride...", "color: #0284c7;");` : ''}
  }

  // Cari seluruh input untuk fallback flat mode
  const allInputs = Array.from(document.querySelectorAll(TARGET_SELECTOR));

  if (tableRows.length === 0 && allInputs.length === 0) {
    console.error("%c[ERROR] Tidak ditemukan elemen input nilai sama sekali pada halaman ini! Pastikan tabel rapor sudah terbuka.", "color: #ef4444; font-weight: bold;");
    return;
  }

  // ========================================================
  // EKSEKUSI PENGISIAN
  // ========================================================

  ${isMultiTarget ? `
  // MODE: Target 1 Kolom Spesifik (Kolom ke-${targetColumnIndex})
  ${logToConsole ? `console.log(\`%c[TARGET] Menargetkan Kolom ke-\${TARGET_KOLOM_KE} dari Total \${TOTAL_KOLOM_PER_BARIS} kolom. Kolom lain aman tidak diganggu!\`, "color: #10b981; font-weight: bold;");` : ''}

  let filledCount = 0;

  if (useRowMode) {
    // Mode Baris Tabel: Siswa i = Baris ke-(OFFSET_AWAL + i)
    const effectiveRows = tableRows.slice(OFFSET_AWAL);
    const totalTarget = Math.min(daftarNilai.length, effectiveRows.length);

    for (let i = 0; i < totalTarget; i++) {
      const row = effectiveRows[i];
      const rowInputs = Array.from(row.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'));

      const targetColIdx = TARGET_KOLOM_KE - 1;
      const el = rowInputs[targetColIdx];
      const nilai = daftarNilai[i];

      if (!el) {
        console.warn(\`%c[PERINGATAN] Siswa #\${i + 1} di baris tabel tidak memiliki kolom ke-\${TARGET_KOLOM_KE}! (Hanya ada \${rowInputs.length} kolom di baris ini).\`, "color: #f59e0b;");
        continue;
      }

      await triggerInputEvents(
        el,
        nilai,
        \`✅ [Siswa #\${i + 1} | Baris #\${i + 1}] Kolom #\${TARGET_KOLOM_KE} diisi: \${nilai}\`
      );
      filledCount++;
    }
  } else {
    // Mode Flat Stride Fallback
    for (let i = 0; i < daftarNilai.length; i++) {
      const targetIdx = OFFSET_AWAL + (i * TOTAL_KOLOM_PER_BARIS) + (TARGET_KOLOM_KE - 1);
      if (targetIdx >= allInputs.length) {
        console.warn(\`%c[BATAS] Input ke-\${targetIdx + 1} tidak tersedia di halaman. Berhenti pada siswa #\${i}.\`, "color: #f59e0b;");
        break;
      }

      const el = allInputs[targetIdx];
      const nilai = daftarNilai[i];

      await triggerInputEvents(
        el,
        nilai,
        \`✅ [Siswa #\${i + 1}] Kolom #\${TARGET_KOLOM_KE} diisi: \${nilai} (Index DOM: \${targetIdx})\`
      );
      filledCount++;
    }
  }

  ${logToConsole ? `console.log(\`%c🎉 Selesai! Berhasil mengisi \${filledCount} nilai pada Kolom ke-\${TARGET_KOLOM_KE}.\`, "background: #059669; color: #fff; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 13px;");` : ''}

  ` : isMultiBatch ? `
  // MODE: Batch Multi-Kolom Sekaligus
  const maxStudents = Math.max(...DATA_MULTI_KOLOM.map(col => col.length));
  ${logToConsole ? `console.log(\`%c[BATCH] Mengisi \${DATA_MULTI_KOLOM.length} kolom sekaligus untuk \${maxStudents} siswa.\`, "color: #10b981; font-weight: bold;");` : ''}

  let totalFilled = 0;

  if (useRowMode) {
    const effectiveRows = tableRows.slice(OFFSET_AWAL);
    const totalTarget = Math.min(maxStudents, effectiveRows.length);

    for (let s = 0; s < totalTarget; s++) {
      const row = effectiveRows[s];
      const rowInputs = Array.from(row.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'));

      for (let c = 0; c < DATA_MULTI_KOLOM.length && c < TOTAL_KOLOM_PER_BARIS; c++) {
        const colData = DATA_MULTI_KOLOM[c];
        const nilai = colData[s];

        if (nilai === undefined || nilai === null || nilai === '') continue;

        const el = rowInputs[c];
        if (!el) continue;

        await triggerInputEvents(
          el,
          nilai,
          \`✅ [Siswa #\${s + 1} | Kolom #\${c + 1}] Nilai: \${nilai}\`
        );
        totalFilled++;
      }
    }
  } else {
    for (let s = 0; s < maxStudents; s++) {
      for (let c = 0; c < DATA_MULTI_KOLOM.length && c < TOTAL_KOLOM_PER_BARIS; c++) {
        const colData = DATA_MULTI_KOLOM[c];
        const nilai = colData[s];

        if (nilai === undefined || nilai === null || nilai === '') continue;

        const targetIdx = OFFSET_AWAL + (s * TOTAL_KOLOM_PER_BARIS) + c;
        if (targetIdx >= allInputs.length) break;

        const el = allInputs[targetIdx];
        await triggerInputEvents(
          el,
          nilai,
          \`✅ [Siswa #\${s + 1} | Kolom #\${c + 1}] Nilai: \${nilai}\`
        );
        totalFilled++;
      }
    }
  }

  ${logToConsole ? `console.log(\`%c🎉 Selesai! Berhasil mengisi \${totalFilled} sel nilai di semua kolom.\`, "background: #059669; color: #fff; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 13px;");` : ''}

  ` : `
  // MODE: 1 Kolom Sederhana (Sequential)
  let inputElements = [];
  if (useRowMode) {
    inputElements = tableRows.slice(OFFSET_AWAL).map(row => {
      return row.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])');
    }).filter(Boolean);
  } else {
    inputElements = allInputs.slice(OFFSET_AWAL);
  }

  const jumlahTarget = Math.min(daftarNilai.length, inputElements.length);

  for (let i = 0; i < jumlahTarget; i++) {
    const el = inputElements[i];
    const nilai = daftarNilai[i];

    await triggerInputEvents(
      el,
      nilai,
      \`✅ [\${i + 1}/\${jumlahTarget}] Nilai Siswa #\${i + 1}: \${nilai}\`
    );
  }

  ${logToConsole ? `console.log(\`%c🎉 Selesai! Seluruh nilai (\${jumlahTarget} siswa) berhasil dimasukkan otomatis.\`, "background: #059669; color: #fff; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 13px;");` : ''}
  `}
})();`;
}
