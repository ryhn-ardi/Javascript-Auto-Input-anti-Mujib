import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ScriptOutputPanel } from './components/ScriptOutputPanel';
import { GuideModal } from './components/GuideModal';
import { SimulatorModal } from './components/SimulatorModal';
import { parseRawScores, generateAutoFillScript } from './utils/scriptGenerator';
import { ScriptOptions } from './types';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

const INITIAL_RAW_VALUES = `95.4\n95.6\n92\n94.8\n88.5\n90\n87.2\n96.5`;

export default function App() {
  const [rawText, setRawText] = useState(INITIAL_RAW_VALUES);
  const [options, setOptions] = useState<ScriptOptions>({
    offset: 3,
    delayMs: 1500,
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

  const [script, setScript] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Parse scores
  const { items, validValues, stats } = parseRawScores(rawText);

  // Generate script handler
  const handleGenerateScript = useCallback(() => {
    const generated = generateAutoFillScript(validValues, options);
    setScript(generated);
  }, [validValues, options]);

  // Initial and reactive generation
  useEffect(() => {
    handleGenerateScript();
  }, [handleGenerateScript]);

  const handleReset = () => {
    setRawText('');
    setOptions({
      offset: 3,
      delayMs: 1500,
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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[240px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

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
            onGenerate={handleGenerateScript}
          />

          {/* Result Code & Stats Area */}
          <ScriptOutputPanel
            script={script}
            items={items}
            validScores={validValues}
            stats={stats}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        </div>

        {/* Quick Highlights / Feature Pills */}
        <div className="mt-8 pt-6 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-900">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5 font-medium">Bypass State React & Vue</strong>
              Otomatis memicu prototype setter agar nilai tersimpan pada form modern e-Rapor.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5 font-medium">Aman & Tanpa Install Ekstensi</strong>
              Hanya berjalan langsung di Console DevTools bawaan browser tanpa instalasi tambahan.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-900">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5 font-medium">Format Excel Fleksibel</strong>
              Langsung paste 1 kolom nilai dari Excel, CSV, ataupun daftar nilai berformat koma.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-5 text-center text-xs text-slate-400">
        <p>Rapor Auto-Fill Script Generator &bull; Dibuat untuk mempermudah guru dan tenaga pendidik</p>
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
        delayMs={options.delayMs}
        offset={options.offset}
      />
    </div>
  );
}
