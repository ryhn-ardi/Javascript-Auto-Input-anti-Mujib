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
  Code
} from 'lucide-react';
import { ScriptOptions } from '../types';

interface InputPanelProps {
  rawText: string;
  setRawText: (val: string) => void;
  options: ScriptOptions;
  setOptions: React.Dispatch<React.SetStateAction<ScriptOptions>>;
  onGenerate: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  rawText,
  setRawText,
  options,
  setOptions,
  onGenerate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyPreset = (type: 'sample10' | 'comma' | 'full32') => {
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

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label htmlFor="rawValues" className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Daftar Nilai (Paste dari Excel / Kolom)
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

      {/* Main Textarea */}
      <div>
        <div className="relative">
          <textarea
            id="rawValues"
            rows={9}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="95.4&#10;95.6&#10;92.0&#10;94.8&#10;...atau copy 1 kolom dari Excel"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono text-slate-200 placeholder:text-slate-600 transition-all resize-y leading-relaxed"
          ></textarea>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          Mendukung copy-paste kolom Excel, koma, spasi, desimal titik (95.5) maupun desimal koma (95,5).
        </p>
      </div>

      {/* Basic Settings: Offset & Delay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Offset Input */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="offsetInput" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Offset Input Teratas:
            </label>
            <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              Skip header
            </span>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Jumlah kolom input teratas yang dilewati (misal kolom pencarian / filter siswa). Default: 3.
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
