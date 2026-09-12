import React from 'react';
import { ScoreItem } from '../types';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ScorePreviewTableProps {
  items: ScoreItem[];
}

export const ScorePreviewTable: React.FC<ScorePreviewTableProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Belum ada data nilai. Masukkan daftar nilai di panel sebelah kiri.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[360px] scrollbar-thin scrollbar-thumb-slate-700">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400">
          <tr>
            <th className="py-2.5 px-3 font-semibold w-16">No.</th>
            <th className="py-2.5 px-3 font-semibold">Teks Asli</th>
            <th className="py-2.5 px-3 font-semibold">Nilai Terurai</th>
            <th className="py-2.5 px-3 font-semibold w-24">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {items.map((item) => (
            <tr
              key={item.index}
              className={`hover:bg-slate-800/40 transition-colors ${
                !item.isValid ? 'bg-rose-950/20 text-rose-300' : 'text-slate-300'
              }`}
            >
              <td className="py-2 px-3 text-slate-500 font-sans">
                #{item.index}
              </td>
              <td className="py-2 px-3 text-slate-400">
                {item.originalText}
              </td>
              <td className="py-2 px-3 font-bold text-white">
                {item.isValid ? item.value : '-'}
              </td>
              <td className="py-2 px-3 font-sans">
                {item.isValid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <CheckCircle className="w-3 h-3" /> Valid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/40">
                    <AlertCircle className="w-3 h-3" /> Abaikan
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
