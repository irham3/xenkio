export type IndentSize = 2 | 4 | 8;

export interface JsMinifierOptions {
  js: string;
  indentSize: IndentSize;
}

export interface JsMinifierResult {
  output: string;
  originalSize: number;
  resultSize: number;
  executionTime: number;
  error?: string;
}

export interface JsMinifierStats {
  originalLines: number;
  resultLines: number;
  originalSize: number;
  resultSize: number;
  sizeDiff: number;
  compressionRatio: number;
}
