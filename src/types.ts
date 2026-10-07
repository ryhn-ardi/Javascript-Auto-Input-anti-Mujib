export interface ScoreItem {
  index: number;
  originalText: string;
  value: number;
  isValid: boolean;
}

export type FillMode = 'single-target' | 'multi-columns' | 'sequential';

export interface MultiColumnEntry {
  id: string;
  name: string;
  rawText: string;
  items: ScoreItem[];
  validValues: number[];
}

export interface ScriptOptions {
  offset: number;
  delayMs: number;
  fillMode: FillMode;
  totalColumnsPerRow: number;
  targetColumnIndex: number; // 1-based (1 = Kolom 1, 2 = Kolom 2, ...)
  customSelector: string;
  useCustomSelector: boolean;
  triggerEvents: {
    clickFocus: boolean;
    reactPrototypeSetter: boolean;
    inputChangeEvents: boolean;
    enterTabKeys: boolean;
    blurEvent: boolean;
  };
  decimalFormat: 'dot' | 'comma' | 'original';
  autoScroll: boolean;
  logToConsole: boolean;
}

export interface ScoreStats {
  total: number;
  min: number;
  max: number;
  average: number;
  validCount: number;
  invalidCount: number;
}

