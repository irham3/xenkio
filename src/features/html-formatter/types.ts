export type IndentType = 'spaces' | 'tabs';
export type IndentSize = 2 | 4 | 8;
export type WrapLineLength = 0 | 80 | 120 | 160;

export interface HtmlFormatterOptions {
  html: string;
  indentType: IndentType;
  indentSize: IndentSize;
  wrapLineLength: WrapLineLength;
  preserveNewlines: boolean;
  maxPreserveNewlines: number;
  wrapAttributes: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline';
  unformatted: string[];
}

export interface HtmlFormatterResult {
  formatted: string;
  originalSize: number;
  formattedSize: number;
  executionTime: number;
  error?: string;
}

export interface FormatStats {
  originalLines: number;
  formattedLines: number;
  originalSize: number;
  formattedSize: number;
  sizeDiff: number;
  lineDiff: number;
}
