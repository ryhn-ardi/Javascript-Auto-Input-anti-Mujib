import React from 'react';
import { X, Terminal, AlertTriangle, Lightbulb, Columns, Crosshair, CheckCircle2 } from 'lucide-react';

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
          {/* Solusi Meleset Callout */}
          <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wide">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              Solusi Jika Sel Siswa 1 Meleset / Masih Kosong
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Jika di console tertulis Siswa 1 ada nilainya namun di tabel kolomnya masih kosong, hal tersebut terjadi karena halaman e-Rapor memiliki <strong>kolom pencarian (search box), filter, atau tombol header</strong> di atas tabel yang ikut terbaca sebagai input ke-0.
            </p>
            <div className="text-xs text-emerald-200 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/40 space-y-1">
              <div>✓ <strong>Deteksi Baris Tabel (Anti-Meleset)</strong> telah diaktifkan secara otomatis. Skrip akan langsung mengincar baris siswa <code>&lt;tbody tr&gt;</code> sehingga kebal dari kolom pencarian di luar tabel!</div>
              <div>✓ Fitur <strong>Highlight Visual</strong> akan memberi bingkai hijau menyala di layar rapor Anda saat nilai sedang diisi.</div>
              <div>✓ Gunakan tombol <strong>"Copy Snippet Tes Cek Sel"</strong> di aplikasi untuk memberi tanda kotak merah pada sel target sebelum menjalankan skrip penuh.</div>
            </div>
          </div>

          {/* Multi-column highlight callout */}
          <div className="p-3.5 bg-blue-950/40 rounded-xl border border-blue-800/50 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wide">
              <Columns className="w-4 h-4 text-blue-400" />
              Mengisi Kolom 2, 3, dst. Tanpa Merusak Kolom 1
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Jika tabel rapor memiliki 2 sampai 5 kolom nilai per siswa (misalnya TP 1, TP 2, STS, SAS), pilih tab <strong className="text-emerald-400">"Target 1 Kolom"</strong>. Tentukan total kolom per siswa dan klik kolom target (misal Kolom 2). Skrip hanya akan mengisi kolom tersebut ke bawah secara vertikal, <strong>tanpa mengubah ataupun merusak nilai yang sudah tersimpan di Kolom 1</strong>.
            </p>
          </div>

          {/* Step list */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Pilih Kolom & Copy Skrip</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Atur Total Kolom (misal 3) dan klik Kolom Target (misal Kolom 2). Paste daftar nilai Anda, lalu klik tombol hijau <strong className="text-emerald-400">"Copy Skrip ke Clipboard"</strong>.
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
                  Buka halaman web e-Rapor tempat tabel nilai berada.
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
                <h4 className="font-semibold text-slate-200">Tekan Enter & Pantau Hasil</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[11px]">ENTER</kbd>. Kotak input akan menyala hijau satu per satu menandakan nilai tersimpan sukses.
                </p>
              </div>
            </div>
          </div>

          {/* Practical Tips */}
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-3">
            <h5 className="font-bold text-xs text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Tips Pengaturan Lanjutan:
            </h5>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>
                <strong>Offset Baris Tabel:</strong> Jika di tabel Anda ada baris judul sub-tabel atau filter di baris pertama <code>tbody</code>, atur <strong>Offset = 1</strong> agar skrip mulai dari baris siswa pertama.
              </li>
              <li>
                <strong>Jeda Simpan (Delay):</strong> Jika sistem e-Rapor otomatis menyimpan via AJAX/server, gunakan jeda simpan <strong>1200ms - 2000ms</strong> agar server sekolah tidak kewalahan.
              </li>
              <li>
                <strong>Format Desimal:</strong> Jika rapor menolak titik desimal (misal 85.5 tidak masuk), ubah ke <strong>Koma (85,5)</strong> di Pengaturan Lanjutan.
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
