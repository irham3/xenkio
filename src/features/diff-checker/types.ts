export type DiffViewMode = 'split' | 'unified';

export type DiffType = 'chars' | 'words' | 'lines';

export interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DiffOptions {
  originalText: string;
  modifiedText: string;
  diffType: DiffType;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}

export interface DiffResult {
  changes: DiffChange[];
  stats: DiffStats;
  executionTime: number;
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  totalLines: {
    original: number;
    modified: number;
  };
}
