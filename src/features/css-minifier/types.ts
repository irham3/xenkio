export type IndentSize = 2 | 4 | 8;

export interface CssMinifierOptions {
  css: string;
  indentSize: IndentSize;
}

export interface CssMinifierResult {
  output: string;
  originalSize: number;
  resultSize: number;
  executionTime: number;
  error?: string;
}

export interface CssMinifierStats {
  originalLines: number;
  resultLines: number;
  originalSize: number;
  resultSize: number;
  sizeDiff: number;
  compressionRatio: number;
}
