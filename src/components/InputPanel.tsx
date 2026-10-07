import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  Upload,
  Info,
  Clock,
  Layers,
  CheckCircle2,
  Code,
  Columns,
  Grid3X3,
  Check,
  AlertCircle,
  HelpCircle,
  Crosshair,
  Sparkles,
  Eye
} from 'lucide-react';
import { ScriptOptions, MultiColumnEntry, FillMode, TargetingMethod } from '../types';

interface InputPanelProps {
  rawText: string;
  setRawText: (val: string) => void;
  options: ScriptOptions;
  setOptions: React.Dispatch<React.SetStateAction<ScriptOptions>>;
  multiColumnEntries: MultiColumnEntry[];
  setMultiColumnEntries: React.Dispatch<React.SetStateAction<MultiColumnEntry[]>>;
  onGenerate: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  rawText,
  setRawText,
  options,
  setOptions,
  multiColumnEntries,
  setMultiColumnEntries,
  onGenerate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeMultiTab, setActiveMultiTab] = useState(0);
  const [copiedTestSnippet, setCopiedTestSnippet] = useState(false);

  const applyPreset = (type: 'sample10' | 'comma' | 'full32' | 'multicolumn3') => {
    if (type === 'sample10') {
      setRawText(`95.4\n95.6\n92.0\n94.8\n88.5\n89.2\n91.0\n93.5\n87.0\n96.2`);
    } else if (type === 'comma') {
      setRawText(`95,4\n95,6\n92,0\n94,8\n88,5\n90,0\n87,5\n96,0\n91,5\n89,0`);
    } else if (type === 'full32') {
      const sample = [
        92, 88, 95.5, 85, 90, 94.5, 87, 91, 93, 89,
        96, 84.5, 90, 88.5, 92.5, 86, 95, 91.5, 89, 93.5,
        87.5, 90, 94, 85.5, 89.5, 92, 97, 88, 90.5, 86.5, 93, 95
      ].join('\n');
      setRawText(sample);
    } else if (type === 'multicolumn3') {
      const col1 = [88, 92, 85, 90, 94, 87, 89, 93, 91, 86];
      const col2 = [90, 94, 88, 92, 96, 89, 91, 95, 93, 88];
      const col3 = [86, 90, 84, 88, 92, 85, 87, 91, 89, 84];
      
      setOptions(prev => ({
        ...prev,
        fillMode: 'multi-columns',
        totalColumnsPerRow: 3,
      }));

      setMultiColumnEntries([
        { id: 'col_1', name: 'Kolom 1 (TP 1)', rawText: col1.join('\n'), items: [], validValues: col1 },
        { id: 'col_2', name: 'Kolom 2 (TP 2)', rawText: col2.join('\n'), items: [], validValues: col2 },
        { id: 'col_3', name: 'Kolom 3 (TP 3)', rawText: col3.join('\n'), items: [], validValues: col3 },
      ]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleTotalColumnsChange = (total: number) => {
    const validTotal = Math.max(1, Math.min(10, total));
    setOptions(prev => {
      let targetCol = prev.targetColumnIndex;
      if (targetCol > validTotal) {
        targetCol = validTotal;
      }
      return {
        ...prev,
        totalColumnsPerRow: validTotal,
        targetColumnIndex: targetCol,
      };
    });

    setMultiColumnEntries(prev => {
      const updated = [...prev];
      while (updated.length < validTotal) {
        const c = updated.length + 1;
        updated.push({
          id: `col_${c}`,
          name: `Kolom ${c}`,
          rawText: '',
          items: [],
          validValues: [],
        });
      }
      return updated.slice(0, validTotal);
    });
  };

  const handleTargetColumnSelect = (colIndex: number) => {
    setOptions(prev => ({
      ...prev,
      targetColumnIndex: colIndex,
    }));
  };

  const handleModeChange = (mode: FillMode) => {
    setOptions(prev => ({
      ...prev,
      fillMode: mode,
      totalColumnsPerRow: mode === 'sequential' ? 1 : Math.max(2, prev.totalColumnsPerRow),
    }));
  };

  const handleTargetingMethodChange = (method: TargetingMethod) => {
    setOptions(prev => ({
      ...prev,
      targetingMethod: method,
    }));
  };

  // Helper snippet for user to copy into Console to instantly test which cell is selected
  const copyTestCheckerSnippet = () => {
    const snippet = `// TEST CEK LOKASI SEL TARGET DI RAPOR
(function testCekSel() {
  const baris = Array.from(document.querySelectorAll('table tbody tr, table tr')).filter(r => r.querySelectorAll('input:not([type="hidden"])').length > 0);
  if (baris.length === 0) {
    console.error("❌ Baris tabel tidak ditemukan. Coba cek struktur halaman.");
    return;
  }
  const siswa1 = baris[${options.offset}];
  const kolom = Array.from(siswa1.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'))[${options.targetColumnIndex - 1}];
  if (kolom) {
    kolom.scrollIntoView({ behavior: 'smooth', block: 'center' });
    kolom.style.outline = '4px solid #ef4444';
    kolom.style.backgroundColor = '#fef2f2';
    kolom.focus();
    console.log("%c✅ LOKASI DITEMUKAN! Periksa kotak merah di layar Anda:", "background: #10b981; color: white; padding: 4px; font-weight: bold;", kolom);
  } else {
    console.warn("❌ Kolom ke-${options.targetColumnIndex} tidak ditemukan pada baris pertama!");
  }
})();`;
    navigator.clipboard.writeText(snippet);
    setCopiedTestSnippet(true);
    setTimeout(() => setCopiedTestSnippet(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Mode Selector Navigation Tabs */}
      <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs">
          <button
            type="button"
            onClick={() => handleModeChange('single-target')}
            className={`px-3 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              options.fillMode === 'single-target'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5 shrink-0" />
            <span>Target 1 Kolom</span>
            <span className="text-[10px] bg-blue-900/70 text-blue-200 px-1.5 py-0.2 rounded font-normal">
              Solusi Utama
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('multi-columns')}
            className={`px-3 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              options.fillMode === 'multi-columns'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 shrink-0" />
            <span>Multi-Kolom Sekaligus</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('sequential')}
            className={`px-3 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              options.fillMode === 'sequential'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>1 Kolom Saja</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Single Target Column Setup */}
      {options.fillMode === 'single-target' && (
        <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-500/30 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                <Columns className="w-3.5 h-3.5 text-blue-400" />
                Pengaturan Posisi Kolom Rapor
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pilih jumlah total kolom di tabel rapor Anda, lalu klik kolom ke berapa yang ingin diisi.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 shrink-0">
              Kolom Lain Aman
            </span>
          </div>

          {/* 1. Step: Total Columns per row */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-300">
                1. Berapa Total Kolom Nilai per Siswa di Halaman Rapor?
              </label>
              <span className="text-[11px] text-blue-400 font-mono font-bold">
                {options.totalColumnsPerRow} Kolom / Siswa
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleTotalColumnsChange(num)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all text-center ${
                    options.totalColumnsPerRow === num
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {num} Kolom
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Contoh: Jika ada kolom TP 1, TP 2, TP 3, maka pilih <strong>3 Kolom</strong>.
            </p>
          </div>

          {/* 2. Step: Choose Target Column */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                2. Anda Ingin Mengisi Kolom ke Berapa?
              </label>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/50">
                Target: Kolom ke-{options.targetColumnIndex}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Array.from({ length: options.totalColumnsPerRow }).map((_, idx) => {
                const colNum = idx + 1;
                const isTarget = options.targetColumnIndex === colNum;
                return (
                  <button
                    key={colNum}
                    type="button"
                    onClick={() => handleTargetColumnSelect(colNum)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isTarget
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      {isTarget && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      Kolom {colNum}
                    </span>
                    <span className="text-[10px] font-mono opacity-80">
                      {isTarget ? '👉 AKAN DIISI' : 'Lewati (Aman)'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Step: Targeting Method (Anti-Meleset) */}
          <div className="pt-1 border-t border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                Metode Penargetan Lokasi Kolom:
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {options.targetingMethod === 'table-row' ? 'Anti-Meleset Aktif' : 'Mode Flat'}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTargetingMethodChange('table-row')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  options.targetingMethod === 'table-row'
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 ring-1 ring-emerald-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${options.targetingMethod === 'table-row' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  Deteksi Baris Tabel (Rekomendasi)
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Mencari baris siswa di dalam tabel. Baris 1 = Siswa 1. <strong>Kebal terhadap kolom pencarian di luar tabel!</strong>
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleTargetingMethodChange('flat-stride')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  options.targetingMethod === 'flat-stride'
                    ? 'bg-blue-950/40 border-blue-500/80 text-blue-200 ring-1 ring-blue-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${options.targetingMethod === 'flat-stride' ? 'text-blue-400' : 'text-slate-500'}`} />
                  Flat Index + Offset
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Membaca seluruh input dari atas ke bawah. Berguna jika halaman tidak memakai tabel HTML standar.
                </p>
              </button>
            </div>
          </div>

          {/* Quick Inspector Snippet Helper */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold block text-slate-200">Cek Sel Target di Browser (Inspector):</span>
                <span className="text-[11px] text-slate-400">Tandai kotak input Siswa 1 Kolom {options.targetColumnIndex} dengan bingkai merah di layar rapor Anda.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={copyTestCheckerSnippet}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/50 flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copiedTestSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5" />}
              {copiedTestSnippet ? 'Snippet Tes Tersalin!' : 'Copy Snippet Tes Cek Sel'}
            </button>
          </div>

          {/* Visual Stride Diagram */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-blue-400" />
              Ilustrasi Alur Pengisian di Browser Anda:
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 w-16 shrink-0 font-sans">Siswa #1:</span>
                {Array.from({ length: options.totalColumnsPerRow }).map((_, i) => (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded text-[10px] border ${
                      i + 1 === options.targetColumnIndex
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600 font-bold'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {i + 1 === options.targetColumnIndex ? `Kolom ${i + 1} (DIISI)` : `Kolom ${i + 1} (DILEWATI)`}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 w-16 shrink-0 font-sans">Siswa #2:</span>
                {Array.from({ length: options.totalColumnsPerRow }).map((_, i) => (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded text-[10px] border ${
                      i + 1 === options.targetColumnIndex
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600 font-bold'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {i + 1 === options.targetColumnIndex ? `Kolom ${i + 1} (DIISI)` : `Kolom ${i + 1} (DILEWATI)`}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-emerald-400/90 mt-1.5 font-sans">
              ✓ Menggunakan deteksi baris tabel langsung sehingga Siswa 1 baris pertama tidak akan tertukar atau meleset ke kolom pencarian.
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: Multi-Column Batch Setup */}
      {options.fillMode === 'multi-columns' && (
        <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-500/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                <Grid3X3 className="w-3.5 h-3.5 text-blue-400" />
                Mode Batch: Isi Beberapa Kolom Sekaligus
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paste data multi-kolom dari Excel atau kelola nilai per kolom di bawah ini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => applyPreset('multicolumn3')}
              className="text-[11px] font-semibold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/60 shrink-0 hover:bg-blue-900"
            >
              Pakai Contoh 3 Kolom
            </button>
          </div>

          {/* Column count chooser */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300 font-semibold">Jumlah Kolom:</span>
            <div className="flex gap-1">
              {[2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleTotalColumnsChange(cnt)}
                  className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
                    options.totalColumnsPerRow === cnt
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cnt} Kolom
                </button>
              ))}
            </div>
          </div>

          {/* Sub tabs per column */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800">
            {multiColumnEntries.slice(0, options.totalColumnsPerRow).map((col, idx) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveMultiTab(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-t border-l border-r whitespace-nowrap ${
                  activeMultiTab === idx
                    ? 'bg-slate-900 text-blue-400 border-slate-700'
                    : 'bg-slate-950 text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                {col.name} ({col.validValues.length} nilai)
              </button>
            ))}
          </div>

          {/* Active Column Textarea */}
          {multiColumnEntries[activeMultiTab] && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">
                  Daftar Nilai untuk {multiColumnEntries[activeMultiTab].name}:
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {multiColumnEntries[activeMultiTab].validValues.length} nilai terdeteksi
                </span>
              </div>
              <textarea
                rows={6}
                value={multiColumnEntries[activeMultiTab].rawText}
                onChange={(e) => {
                  const val = e.target.value;
                  const lines = val.split(/[\n,\s]+/).map(v => v.trim().replace(',', '.')).filter(v => v !== '' && !isNaN(Number(v))).map(Number);
                  setMultiColumnEntries(prev => {
                    const copy = [...prev];
                    copy[activeMultiTab] = {
                      ...copy[activeMultiTab],
                      rawText: val,
                      validValues: lines,
                    };
                    return copy;
                  });
                }}
                placeholder={`Paste nilai untuk ${multiColumnEntries[activeMultiTab].name}...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Main Single Column Textarea (Shown for 'single-target' and 'sequential') */}
      {options.fillMode !== 'multi-columns' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label htmlFor="rawValues" className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              {options.fillMode === 'single-target'
                ? `Daftar Nilai untuk Kolom ke-${options.targetColumnIndex} (Paste dari Excel):`
                : 'Daftar Nilai (Paste dari Excel / Kolom):'}
            </label>
            
            {/* Presets & File Upload */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => applyPreset('sample10')}
                className="text-[11px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Contoh 10
              </button>
              <button
                type="button"
                onClick={() => applyPreset('comma')}
                className="text-[11px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Format Koma (,)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('full32')}
                className="text-[11px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Kelas 32 Siswa
              </button>
              
              <label className="text-[11px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-900/40 cursor-pointer transition-colors inline-flex items-center gap-1">
                <Upload className="w-3 h-3" />
                File .txt/.csv
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="rawValues"
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="95.4&#10;95.6&#10;92.0&#10;94.8&#10;...atau copy 1 kolom nilai dari Excel"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono text-slate-200 placeholder:text-slate-600 transition-all resize-y leading-relaxed"
            ></textarea>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Mendukung copy-paste kolom Excel langsung, koma desimal (95,5), maupun titik desimal (95.5).
          </p>
        </div>
      )}

      {/* Basic Settings: Offset & Delay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Offset Input */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="offsetInput" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Offset Baris / Input Teratas:
            </label>
            <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              {options.targetingMethod === 'table-row' ? 'Skip baris header' : 'Skip input'}
            </span>
          </div>
          <input
            type="number"
            id="offsetInput"
            value={options.offset}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                offset: Math.max(0, parseInt(e.target.value) || 0),
              }))
            }
            min="0"
            max="50"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-sm text-center font-mono text-white focus:outline-none focus:border-blue-500"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            {options.targetingMethod === 'table-row'
              ? 'Jika baris pertama tabel adalah judul atau filter, atur ke 1. Jika langsung siswa #1, biarkan 0.'
              : 'Jumlah kolom input di atas tabel yang dilewati (misal search bar).'}
          </p>
        </div>

        {/* Delay Input */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="delayInput" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Jeda Simpan / Delay (ms):
            </label>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50 font-mono">
              {(options.delayMs / 1000).toFixed(1)}s
            </span>
          </div>
          <input
            type="number"
            id="delayInput"
            value={options.delayMs}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                delayMs: Math.max(300, parseInt(e.target.value) || 1000),
              }))
            }
            step="100"
            min="300"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-sm text-center font-mono text-white focus:outline-none focus:border-blue-500"
          />
          {/* Quick delay presets */}
          <div className="flex items-center justify-between gap-1 mt-1.5">
            <button
              type="button"
              onClick={() => setOptions((p) => ({ ...p, delayMs: 600 }))}
              className={`text-[10px] flex-1 py-1 rounded border transition-colors ${
                options.delayMs === 600
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Cepat (600ms)
            </button>
            <button
              type="button"
              onClick={() => setOptions((p) => ({ ...p, delayMs: 1200 }))}
              className={`text-[10px] flex-1 py-1 rounded border transition-colors ${
                options.delayMs === 1200
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Standar (1.2s)
            </button>
            <button
              type="button"
              onClick={() => setOptions((p) => ({ ...p, delayMs: 2000 }))}
              className={`text-[10px] flex-1 py-1 rounded border transition-colors ${
                options.delayMs === 2000
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Aman (2s)
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Options Accordion */}
      <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            Pengaturan Lanjutan (Format Desimal, Selector & Event Trigger)
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-4 pt-2 border-t border-slate-800/60 space-y-4 text-xs">
            {/* Visual Highlight Option */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Highlight Visual Hijau di Layar:</span>
                <span className="text-[11px] text-slate-400">Memberikan garis bingkai hijau menyala pada sel yang sedang diisi di halaman rapor Anda.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.highlightActiveCell}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      highlightActiveCell: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Decimal Format */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Format Desimal Output:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'original', label: 'Asli / Sesuai Input' },
                  { id: 'dot', label: 'Titik (misal 95.5)' },
                  { id: 'comma', label: 'Koma (misal 95,5)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        decimalFormat: item.id as 'dot' | 'comma' | 'original',
                      }))
                    }
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                      options.decimalFormat === item.id
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Selector Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  Target CSS Selector Khusus:
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.useCustomSelector}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        useCustomSelector: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {options.useCustomSelector ? (
                <input
                  type="text"
                  value={options.customSelector}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      customSelector: e.target.value,
                    }))
                  }
                  placeholder='misal: input.nilai-siswa atau input[name*="nilai"]'
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-[11px] text-slate-500 font-mono bg-slate-900/60 p-2 rounded border border-slate-800/60">
                  Default: input:not([type="hidden"]):not([type="submit"]):not([readonly])
                </p>
              )}
            </div>

            {/* Event Triggers */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-300">
                Trigger Event Otomatis:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={options.triggerEvents.reactPrototypeSetter}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        triggerEvents: {
                          ...prev.triggerEvents,
                          reactPrototypeSetter: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-300">
                    Bypass React / Vue prototype setter
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={options.triggerEvents.enterTabKeys}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        triggerEvents: {
                          ...prev.triggerEvents,
                          enterTabKeys: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-300">
                    Simulasi tombol Enter & Tab
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={options.autoScroll}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        autoScroll: e.target.checked,
                      }))
                    }
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-300">
                    Auto-scroll ke baris aktif
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={options.logToConsole}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        logToConsole: e.target.checked,
                      }))
                    }
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-300">
                    Log progres berwarna di console
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Script Button */}
      <button
        type="button"
        id="btnGenerate"
        onClick={onGenerate}
        className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-5 h-5" />
        Generate Skrip
      </button>
    </div>
  );
};
