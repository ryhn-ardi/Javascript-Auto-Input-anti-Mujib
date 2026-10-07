import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Square, RotateCcw, CheckCircle, Search, HelpCircle, Columns, Sparkles } from 'lucide-react';
import { ScoreStats, ScriptOptions, MultiColumnEntry } from '../types';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: number[];
  stats: ScoreStats;
  options: ScriptOptions;
  multiColumnEntries?: MultiColumnEntry[];
}

const MOCK_STUDENTS = [
  'Aditya Pratama', 'Aisyah Putri', 'Budi Santoso', 'Citra Dewi',
  'Dimas Anggara', 'Eka Rahmawati', 'Fajar Ramadhan', 'Gita Gutawa',
  'Hadi Nugroho', 'Indah Permata', 'Joko Widodo', 'Kartika Sari'
];

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  scores,
  stats,
  options,
  multiColumnEntries,
}) => {
  // Matrix of input values: studentIndex_colIndex -> value string
  const [gridValues, setGridValues] = useState<{ [key: string]: string }>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentActiveCell, setCurrentActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const isCancelledRef = useRef(false);

  const totalCols = options.fillMode === 'sequential' ? 1 : options.totalColumnsPerRow;
  const targetCol = options.targetColumnIndex; // 1-based

  useEffect(() => {
    if (!isOpen) {
      isCancelledRef.current = true;
      setIsSimulating(false);
      setCurrentActiveCell(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testList = scores.length > 0 ? scores : [95.4, 92.0, 88.5, 94.0, 90.5, 87.0, 96.0, 89.5];

  // Helper to pre-fill mock existing data in other columns
  const fillMockExistingOtherColumns = () => {
    const newGrid: { [key: string]: string } = {};
    MOCK_STUDENTS.forEach((_, sIdx) => {
      for (let c = 1; c <= totalCols; c++) {
        if (c !== targetCol) {
          // Pre-fill existing scores in other columns
          newGrid[`${sIdx}_${c}`] = String(80 + ((sIdx * 3 + c * 4) % 18));
        }
      }
    });
    setGridValues(newGrid);
    setLogs([`ℹ️ Kolom lainnya telah diisi nilai acak sebagai simulasi nilai yang sudah ada.`]);
  };

  const handleStartSimulation = async () => {
    isCancelledRef.current = false;
    setIsSimulating(true);

    if (options.fillMode === 'single-target') {
      setLogs([
        `[Mulai] Target Kolom ke-${targetCol} dari total ${totalCols} kolom per siswa...`,
        `[Keamanan] Kolom lain (1 s/d ${totalCols} selain kolom ${targetCol}) TIDAK akan diganggu!`,
      ]);

      const simDelay = Math.max(300, Math.min(options.delayMs, 800));

      for (let i = 0; i < testList.length && i < MOCK_STUDENTS.length; i++) {
        if (isCancelledRef.current) break;

        setCurrentActiveCell({ row: i, col: targetCol });
        const studentName = MOCK_STUDENTS[i];
        const val = testList[i];

        setLogs((prev) => [
          `[Siswa #${i + 1} - ${studentName}] Mengisi Kolom #${targetCol} -> ${val} (Kolom lain aman)`,
          ...prev.slice(0, 10),
        ]);

        setGridValues((prev) => ({
          ...prev,
          [`${i}_${targetCol}`]: String(val),
        }));

        await new Promise((res) => setTimeout(res, simDelay));
      }
    } else if (options.fillMode === 'multi-columns' && multiColumnEntries) {
      setLogs([`[Mulai] Batch Multi-Kolom (${totalCols} kolom per siswa)...`]);
      const simDelay = Math.max(250, Math.min(options.delayMs, 600));

      for (let i = 0; i < MOCK_STUDENTS.length; i++) {
        if (isCancelledRef.current) break;

        for (let c = 1; c <= totalCols; c++) {
          if (isCancelledRef.current) break;

          const colData = multiColumnEntries[c - 1]?.validValues || [];
          const val = colData[i];
          if (val === undefined || val === null) continue;

          setCurrentActiveCell({ row: i, col: c });
          setLogs((prev) => [
            `[Siswa #${i + 1}] Kolom #${c} -> ${val}`,
            ...prev.slice(0, 10),
          ]);

          setGridValues((prev) => ({
            ...prev,
            [`${i}_${c}`]: String(val),
          }));

          await new Promise((res) => setTimeout(res, simDelay));
        }
      }
    } else {
      // Sequential
      setLogs([`[Mulai] Mengisi 1 kolom berurutan untuk ${testList.length} siswa...`]);
      const simDelay = Math.max(300, Math.min(options.delayMs, 800));

      for (let i = 0; i < testList.length && i < MOCK_STUDENTS.length; i++) {
        if (isCancelledRef.current) break;

        setCurrentActiveCell({ row: i, col: 1 });
        const val = testList[i];

        setLogs((prev) => [
          `[Siswa #${i + 1}] Nilai -> ${val}`,
          ...prev.slice(0, 10),
        ]);

        setGridValues((prev) => ({
          ...prev,
          [`${i}_1`]: String(val),
        }));

        await new Promise((res) => setTimeout(res, simDelay));
      }
    }

    if (!isCancelledRef.current) {
      setCurrentActiveCell(null);
      setLogs((prev) => [
        `🎉 [Selesai] Berhasil mengisi seluruh nilai tanpa mengganggu kolom lainnya!`,
        ...prev.slice(0, 10),
      ]);
    }
    setIsSimulating(false);
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    setIsSimulating(false);
    setCurrentActiveCell(null);
  };

  const handleReset = () => {
    handleStop();
    setGridValues({});
    setLogs(['Form simulasi telah di-reset (kosong).']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Simulasi Multi-Kolom Auto-Fill e-Rapor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Coba simulasi pengisian kolom spesifik untuk melihat bagaimana kolom lain tetap aman terlindungi.
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

        {/* Action Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {!isSimulating ? (
              <button
                type="button"
                onClick={handleStartSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Mulai Uji Simulasi
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Hentikan
              </button>
            )}

            {options.fillMode === 'single-target' && totalCols > 1 && (
              <button
                type="button"
                onClick={fillMockExistingOtherColumns}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-blue-300 border border-slate-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Isi Nilai Dummy di Kolom Lain
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Kosongkan Form
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              Target: <strong className="text-emerald-400">Kolom #{targetCol}</strong> dari {totalCols} Kolom
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Header Banner */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-blue-900/40 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-slate-300">
                Mode Aktif: <strong className="text-white uppercase">{options.fillMode}</strong>
              </span>
            </div>
            <div className="text-slate-400">
              Offset Awal: <span className="font-mono text-blue-400">{options.offset} input</span> dilewati
            </div>
          </div>

          {/* Interactive Multi-Column Table */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Nama Siswa</th>
                  {Array.from({ length: totalCols }).map((_, cIdx) => {
                    const colNum = cIdx + 1;
                    const isTarget = options.fillMode === 'single-target' && colNum === targetCol;
                    return (
                      <th
                        key={cIdx}
                        className={`py-2.5 px-3 text-center transition-colors min-w-[110px] ${
                          isTarget
                            ? 'bg-emerald-950/60 text-emerald-300 border-b-2 border-b-emerald-500'
                            : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Kolom {colNum}</span>
                          {isTarget && (
                            <span className="text-[10px] bg-emerald-500 text-slate-950 px-1 rounded font-bold">
                              TARGET
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-2.5 px-3 w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {MOCK_STUDENTS.map((name, sIdx) => {
                  const isAnyColActive = currentActiveCell?.row === sIdx;

                  return (
                    <tr
                      key={sIdx}
                      className={`transition-colors ${
                        isAnyColActive ? 'bg-blue-950/30' : 'hover:bg-slate-900/30'
                      }`}
                    >
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">
                        {sIdx + 1}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-200">
                        {name}
                      </td>
                      {Array.from({ length: totalCols }).map((_, cIdx) => {
                        const colNum = cIdx + 1;
                        const isCellActive =
                          currentActiveCell?.row === sIdx && currentActiveCell?.col === colNum;
                        const isTargetCol =
                          options.fillMode === 'single-target' && colNum === targetCol;
                        const val = gridValues[`${sIdx}_${colNum}`];
                        const hasVal = val !== undefined && val !== '';

                        return (
                          <td
                            key={cIdx}
                            className={`py-2 px-2 text-center transition-colors ${
                              isTargetCol ? 'bg-emerald-950/20' : ''
                            }`}
                          >
                            <input
                              type="text"
                              value={val || ''}
                              readOnly
                              placeholder="--"
                              className={`w-20 px-2 py-1 rounded text-center font-mono font-bold text-xs border transition-all ${
                                isCellActive
                                  ? 'bg-emerald-900/80 border-emerald-400 ring-2 ring-emerald-400 text-white animate-pulse'
                                  : isTargetCol && hasVal
                                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 font-bold'
                                  : hasVal
                                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                                  : 'bg-slate-900/80 border-slate-800 text-slate-600'
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center">
                        {isAnyColActive ? (
                          <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">
                            ● Mengetik...
                          </span>
                        ) : gridValues[`${sIdx}_${targetCol}`] ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Terisi
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            Menunggu
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Realtime Console Log */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Output Log Simulasi Browser:
            </div>
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes('Selesai')
                    ? 'text-emerald-400 font-bold'
                    : log.includes('Mulai') || log.includes('Target')
                    ? 'text-blue-400'
                    : log.includes('Aman') || log.includes('aman')
                    ? 'text-emerald-300'
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
