import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ScriptOutputPanel } from './components/ScriptOutputPanel';
import { GuideModal } from './components/GuideModal';
import { SimulatorModal } from './components/SimulatorModal';
import { parseRawScores, generateAutoFillScript } from './utils/scriptGenerator';
import { ScriptOptions, MultiColumnEntry } from './types';
import { ShieldCheck, Zap, Sparkles, Columns } from 'lucide-react';

const INITIAL_RAW_VALUES = `95.4\n95.6\n92\n94.8\n88.5\n90\n87.2\n96.5`;

export default function App() {
  const [rawText, setRawText] = useState(INITIAL_RAW_VALUES);
  const [options, setOptions] = useState<ScriptOptions>({
    offset: 0,
    delayMs: 1500,
    fillMode: 'single-target',
    targetingMethod: 'table-row', // Anti-meleset default
    totalColumnsPerRow: 3,
    targetColumnIndex: 2, // Kolom ke-2 default
    highlightActiveCell: true, // Visual feedback di layar e-Rapor
    customSelector: '',
    useCustomSelector: false,
    triggerEvents: {
      clickFocus: true,
      reactPrototypeSetter: true,
      inputChangeEvents: true,
      enterTabKeys: true,
      blurEvent: true,
    },
    decimalFormat: 'original',
    autoScroll: true,
    logToConsole: true,
  });

  const [multiColumnEntries, setMultiColumnEntries] = useState<MultiColumnEntry[]>([
    { id: 'col_1', name: 'Kolom 1 (TP 1)', rawText: '88\n92\n85\n90\n94\n87\n89\n93', items: [], validValues: [88, 92, 85, 90, 94, 87, 89, 93] },
    { id: 'col_2', name: 'Kolom 2 (TP 2)', rawText: INITIAL_RAW_VALUES, items: [], validValues: [95.4, 95.6, 92, 94.8, 88.5, 90, 87.2, 96.5] },
    { id: 'col_3', name: 'Kolom 3 (TP 3)', rawText: '86\n90\n84\n88\n92\n85\n87\n91', items: [], validValues: [86, 90, 84, 88, 92, 85, 87, 91] },
  ]);

  const [script, setScript] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Parse scores for single column / target mode
  const { items, validValues, stats } = parseRawScores(rawText);

  // Generate script handler
  const handleGenerateScript = useCallback(() => {
    const generated = generateAutoFillScript(validValues, options, multiColumnEntries);
    setScript(generated);
  }, [validValues, options, multiColumnEntries]);

  // Initial and reactive generation
  useEffect(() => {
    handleGenerateScript();
  }, [handleGenerateScript]);

  const handleReset = () => {
    setRawText('');
    setOptions({
      offset: 0,
      delayMs: 1500,
      fillMode: 'single-target',
      targetingMethod: 'table-row',
      totalColumnsPerRow: 3,
      targetColumnIndex: 1,
      highlightActiveCell: true,
      customSelector: '',
      useCustomSelector: false,
      triggerEvents: {
        clickFocus: true,
        reactPrototypeSetter: true,
        inputChangeEvents: true,
        enterTabKeys: true,
        blurEvent: true,
      },
      decimalFormat: 'original',
      autoScroll: true,
      logToConsole: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Header */}
        <Header
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onReset={handleReset}
        />

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Form Input Data */}
          <InputPanel
            rawText={rawText}
            setRawText={setRawText}
            options={options}
            setOptions={setOptions}
            multiColumnEntries={multiColumnEntries}
            setMultiColumnEntries={setMultiColumnEntries}
            onGenerate={handleGenerateScript}
          />

          {/* Result Code & Stats Area */}
          <ScriptOutputPanel
            script={script}
            items={items}
            validScores={validValues}
            stats={stats}
            options={options}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        </div>

        {/* Quick Highlights / Feature Pills */}
        <div className="mt-8 pt-6 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-900">
            <Columns className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5 font-medium">Proteksi Kolom Lain</strong>
              Mengisi khusus kolom 2, 3, dst. dengan melompati kolom lainnya tanpa merusak nilai yang sudah ada.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-900">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5 font-medium">Bypass State React & Vue</strong>
              Otomatis memicu prototype setter agar nilai tersimpan permanen pada form e-Rapor modern.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5 font-medium">Aman & Tanpa Ekstensi</strong>
              Langsung dijalankan di tab Console (F12) browser Anda tanpa install aplikasi atau plugin luar.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-5 text-center text-xs text-slate-500">
        <p>Rapor Auto-Fill Script Generator &bull; Multi-Column & Single-Target Protection for Indonesian Teachers</p>
      </footer>

      {/* Modals */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        scores={validValues}
        stats={stats}
        options={options}
        multiColumnEntries={multiColumnEntries}
      />
    </div>
  );
}
