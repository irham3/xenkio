export interface RegexOptions {
  pattern: string;
  testText: string;
  flags: RegexFlags;
}

export interface RegexFlags {
  global: boolean;
  caseInsensitive: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
  sticky: boolean;
}

export interface RegexMatch {
  match: string;
  index: number;
  groups: Record<string, string> | null;
  length: number;
}

export interface RegexResult {
  isValid: boolean;
  matches: RegexMatch[];
  matchCount: number;
  executionTime: number;
  error?: string;
}
