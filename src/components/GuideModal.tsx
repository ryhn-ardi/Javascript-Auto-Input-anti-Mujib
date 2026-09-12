import React from 'react';
import { X, Terminal, CheckCircle2, AlertTriangle, Lightbulb, Copy } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">
              Panduan Pemakaian Skrip di Browser
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Step list */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Copy Skrip</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Klik tombol hijau <strong className="text-emerald-400">"Copy Skrip ke Clipboard"</strong> di aplikasi ini setelah memasukkan daftar nilai.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Buka Halaman Rapor & Buka DevTools</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Buka halaman web e-Rapor (Kurikulum Merdeka, K13, ARD, dsb.) tempat kolom nilai berada.
                  Tekan tombol <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[11px]">F12</kbd> di keyboard, atau klik kanan di mana saja lalu pilih <strong className="text-slate-300">"Inspeksi" (Inspect)</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Buka Tab Console & Paste</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Klik tab <strong className="text-blue-400">"Console"</strong> di bagian atas panel Developer Tools.
                  Paste skrip dengan menekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[11px]">Ctrl + V</kbd> (atau <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[11px]">Cmd + V</kbd> di Mac).
                </p>
                <div className="mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Jika browser menampilkan peringatan keamanan <em>"allow pasting"</em>, ketik tulisan <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200 font-bold">allow pasting</code> lalu tekan Enter terlebih dahulu, setelah itu ulangi paste skrip.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Tekan Enter & Duduk Santai</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[11px]">ENTER</kbd>. Browser akan mengisi nilai satu per satu secara berurutan disertai jeda simpan. Anda dapat melihat progresnya langsung di layar dan log console.
                </p>
              </div>
            </div>
          </div>

          {/* Practical Tips */}
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-3">
            <h5 className="font-bold text-xs text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Tips Penting untuk Guru / Pengajar:
            </h5>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>
                <strong>Offset Input Teratas:</strong> Jika nilai pertama malah masuk ke kolom pencarian atau filter mata pelajaran, atur nilai <span className="text-blue-400 font-mono">Offset</span> (misal: 1, 2, atau 3) agar skrip melompati kolom non-nilai tersebut.
              </li>
              <li>
                <strong>Jeda Simpan (Delay):</strong> Jika sistem e-Rapor sekolah Anda lambat atau otomatis menyimpan via AJAX/server, gunakan jeda simpan <strong>1500ms - 2000ms</strong> agar server tidak error / timeout.
              </li>
              <li>
                <strong>Format Desimal:</strong> Jika rapor menolak titik desimal (misal 85.5 tidak valid), ubah pengaturan desimal ke <strong>Koma (85,5)</strong> di menu Pengaturan Lanjutan.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
