export interface RegexConfig {
  pattern: string;
  flags: RegexFlags;
}

export interface RegexFlags {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
  sticky: boolean;
}

export interface RegexMatch {
  id: string;
  fullMatch: string;
  groups: string[];
  index: number;
  length: number;
  lineNumber: number;
  columnNumber: number;
}

export interface RegexResult {
  isValid: boolean;
  matches: RegexMatch[];
  error: string | null;
  executionTime: number;
}

export interface RegexHistoryItem {
  id: string;
  pattern: string;
  flags: string;
  testString: string;
  matchCount: number;
  createdAt: number;
}
