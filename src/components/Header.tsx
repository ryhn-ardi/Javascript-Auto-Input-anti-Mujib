import React from 'react';
import { Sparkles, BookOpen, PlayCircle, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenSimulator: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenSimulator,
  onReset,
}) => {
  return (
    <header className="border-b border-slate-800/80 pb-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Rapor Auto-Fill <span className="text-blue-400">Script Generator</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60">
              v2.0
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Generate skrip Console browser untuk otomatisasi pengisian nilai rapor dari Excel atau daftar kolom secara cepat, aman, dan fleksibel.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 hover:text-white border border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Panduan Pakai (F12)
          </button>

          <button
            type="button"
            onClick={onOpenSimulator}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
            Uji Coba Simulasi
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Reset data input"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </header>
  );
};
