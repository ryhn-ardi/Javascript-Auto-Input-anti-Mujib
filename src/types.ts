export interface ScoreItem {
  index: number;
  originalText: string;
  value: number;
  isValid: boolean;
}

export interface ScriptOptions {
  offset: number;
  delayMs: number;
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
