import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  PlayCircle,
  Table as TableIcon,
  Code as CodeIcon,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { ScoreItem, ScoreStats } from '../types';
import { ScorePreviewTable } from './ScorePreviewTable';

interface ScriptOutputPanelProps {
  script: string;
  items: ScoreItem[];
  validScores: number[];
  stats: ScoreStats;
  onOpenSimulator: () => void;
}

export const ScriptOutputPanel: React.FC<ScriptOutputPanelProps> = ({
  script,
  items,
  validScores,
  stats,
  onOpenSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'table'>('code');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!script || script.startsWith('// Silakan')) return;
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    if (!script || script.startsWith('// Silakan')) return;
    const blob = new Blob([script], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapor-autofill-${validScores.length}-siswa.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col space-y-4 shadow-xl">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm font-bold text-slate-200">
            Hasil Skrip JavaScript:
          </label>
          <span
            id="studentCount"
            className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60 inline-flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            {validScores.length} Siswa Terdeteksi
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CodeIcon className="w-3.5 h-3.5" />
            Skrip JS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'table'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Tabel Nilai ({items.length})
          </button>
        </div>
      </div>

      {/* Mini Stats Badges */}
      {validScores.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
              Rata-Rata
            </span>
            <span className="font-bold text-blue-400 font-mono text-sm">
              {stats.average}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
              Nilai Terendah
            </span>
            <span className="font-bold text-rose-400 font-mono text-sm">
              {stats.min}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
              Nilai Tertinggi
            </span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {stats.max}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-[320px]">
        {activeTab === 'code' ? (
          <div className="relative flex-1 flex flex-col">
            <textarea
              id="outputScript"
              readOnly
              value={script}
              placeholder="Hasil skrip akan muncul di sini setelah Anda memasukkan daftar nilai..."
              className="w-full flex-1 min-h-[300px] bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-400 focus:outline-none resize-none leading-relaxed select-all"
            />
            {script && !script.startsWith('// Silakan') && (
              <div className="absolute top-3 right-3 text-[10px] text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
                JavaScript Console Script
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
            <ScorePreviewTable items={items} />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          id="btnCopy"
          onClick={handleCopy}
          disabled={!script || script.startsWith('// Silakan')}
          className={`w-full font-semibold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
            copied
              ? 'bg-blue-600 text-white shadow-blue-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 animate-bounce" />
              Tersalin ke Clipboard!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Skrip ke Clipboard
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!script || script.startsWith('// Silakan')}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Download .js
          </button>

          <button
            type="button"
            onClick={onOpenSimulator}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
            Uji di Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
