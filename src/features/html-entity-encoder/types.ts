export type EntityMode = 'encode' | 'decode';

export interface HtmlEntityOptions {
  input: string;
  mode: EntityMode;
}

export interface HtmlEntityResult {
  output: string;
  originalSize: number;
  resultSize: number;
  executionTime: number;
  error?: string;
}

export interface HtmlEntityStats {
  originalChars: number;
  resultChars: number;
  entitiesCount: number;
  sizeDiff: number;
}
