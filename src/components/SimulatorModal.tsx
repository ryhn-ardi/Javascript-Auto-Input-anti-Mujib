import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Square, RotateCcw, CheckCircle, Search, HelpCircle } from 'lucide-react';
import { ScoreStats } from '../types';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: number[];
  stats: ScoreStats;
  delayMs: number;
  offset: number;
}

const MOCK_STUDENTS = [
  'Aditya Pratama', 'Aisyah Putri', 'Budi Santoso', 'Citra Dewi',
  'Dimas Anggara', 'Eka Rahmawati', 'Fajar Ramadhan', 'Gita Gutawa',
  'Hadi Nugroho', 'Indah Permata', 'Joko Widodo', 'Kartika Sari',
  'Lukman Hakim', 'Maya Safitri', 'Nabila Zahra', 'Oki Setiana'
];

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  scores,
  stats,
  delayMs,
  offset,
}) => {
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentActiveIndex, setCurrentActiveIndex] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      isCancelledRef.current = true;
      setIsSimulating(false);
      setCurrentActiveIndex(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testList = scores.length > 0 ? scores : [95.4, 92.0, 88.5, 94.0, 90.5];

  const handleStartSimulation = async () => {
    isCancelledRef.current = false;
    setIsSimulating(true);
    setLogs([`[Mulai] Menguji pengisian otomatis untuk ${testList.length} siswa...`]);

    const simDelay = Math.max(350, Math.min(delayMs, 1000)); // slightly faster for preview responsiveness

    for (let i = 0; i < testList.length && i < MOCK_STUDENTS.length; i++) {
      if (isCancelledRef.current) break;

      setCurrentActiveIndex(i);
      const studentName = MOCK_STUDENTS[i];
      const val = testList[i];

      setLogs((prev) => [
        `[Siswa #${i + 1}] Memasukkan nilai ${val} untuk ${studentName}...`,
        ...prev.slice(0, 8),
      ]);

      // Simulate typing
      setInputs((prev) => ({
        ...prev,
        [`student_${i}`]: String(val),
      }));

      await new Promise((res) => setTimeout(res, simDelay));
    }

    if (!isCancelledRef.current) {
      setCurrentActiveIndex(null);
      setLogs((prev) => [
        `🎉 [Selesai] Berhasil mengisi semua nilai tanpa kendala!`,
        ...prev.slice(0, 8),
      ]);
    }
    setIsSimulating(false);
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    setIsSimulating(false);
    setCurrentActiveIndex(null);
  };

  const handleReset = () => {
    handleStop();
    setInputs({});
    setLogs(['Form simulasi telah di-reset.']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Simulasi Interaktif Auto-Fill e-Rapor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Coba langsung cara kerja skrip di formulir tiruan ini sebelum menerapkannya di browser rapor Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 bg-slate-950/30 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            {!isSimulating ? (
              <button
                type="button"
                onClick={handleStartSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Mulai Uji Simulasi
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Hentikan
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Kosongkan Form
            </button>
          </div>

          <div className="text-slate-400">
            Nilai tersedia: <span className="text-emerald-400 font-bold">{testList.length} siswa</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Mock search filter (explaining offset) */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                disabled
                placeholder="Cari siswa... (Input ini dilewati karena Offset = 1)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
            <span className="text-[11px] text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800/40">
              Offset: {offset} input dilewati
            </span>
          </div>

          {/* Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-12">No</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3 w-36">Input Nilai Rapor</th>
                  <th className="py-2.5 px-3 w-28">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {MOCK_STUDENTS.map((name, idx) => {
                  const isActive = currentActiveIndex === idx;
                  const val = inputs[`student_${idx}`];
                  const hasValue = val !== undefined && val !== '';

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        isActive
                          ? 'bg-blue-950/40 border-l-2 border-l-blue-500'
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-300">
                        {name}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={val || ''}
                          readOnly
                          placeholder="--"
                          className={`w-24 px-2 py-1 rounded text-center font-mono font-bold text-xs border transition-all ${
                            isActive
                              ? 'bg-blue-900/50 border-blue-400 ring-2 ring-blue-500/40 text-blue-200 animate-pulse'
                              : hasValue
                              ? 'bg-slate-900 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        />
                      </td>
                      <td className="py-2 px-3">
                        {isActive ? (
                          <span className="text-[10px] text-blue-400 font-semibold">
                            Sedang mengisi...
                          </span>
                        ) : hasValue ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Terisi
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            Kosong
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Console Log output */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Console Log Simulator:
            </div>
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes('Selesai')
                    ? 'text-emerald-400 font-semibold'
                    : log.includes('Mulai')
                    ? 'text-blue-400'
                    : 'text-slate-300'
                }
              >
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
