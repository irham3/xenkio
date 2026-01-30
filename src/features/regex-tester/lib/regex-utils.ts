import { RegexFlags, RegexMatch, RegexResult } from '../types';

export const DEFAULT_FLAGS: RegexFlags = {
  global: true,
  ignoreCase: false,
  multiline: false,
  dotAll: false,
  unicode: false,
  sticky: false,
};

export const DEFAULT_CONFIG = {
  pattern: '',
  flags: DEFAULT_FLAGS,
};

export function buildFlagsString(flags: RegexFlags): string {
  let result = '';
  if (flags.global) result += 'g';
  if (flags.ignoreCase) result += 'i';
  if (flags.multiline) result += 'm';
  if (flags.dotAll) result += 's';
  if (flags.unicode) result += 'u';
  if (flags.sticky) result += 'y';
  return result;
}

export function getLineAndColumn(text: string, index: number): { line: number; column: number } {
  const lines = text.substring(0, index).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getTime(): number {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
}

export function testRegex(pattern: string, flags: RegexFlags, testString: string): RegexResult {
  const startTime = getTime();
  
  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      error: null,
      executionTime: 0,
    };
  }

  try {
    const flagsString = buildFlagsString(flags);
    const regex = new RegExp(pattern, flagsString);
    const matches: RegexMatch[] = [];

    if (flags.global) {
      let match: RegExpExecArray | null;
      let matchIndex = 0;
      
      // Prevent infinite loop on zero-width matches
      let lastIndex = -1;
      
      while ((match = regex.exec(testString)) !== null) {
        const { line, column } = getLineAndColumn(testString, match.index);
        
        matches.push({
          id: generateId(),
          fullMatch: match[0],
          groups: match.slice(1),
          index: match.index,
          length: match[0].length,
          lineNumber: line,
          columnNumber: column,
        });
        
        matchIndex++;
        
        // Prevent infinite loop for zero-width matches
        if (regex.lastIndex === lastIndex) {
          regex.lastIndex++;
        }
        lastIndex = regex.lastIndex;
        
        // Safety limit to prevent performance issues
        if (matchIndex >= 1000) {
          break;
        }
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        const { line, column } = getLineAndColumn(testString, match.index);
        matches.push({
          id: generateId(),
          fullMatch: match[0],
          groups: match.slice(1),
          index: match.index,
          length: match[0].length,
          lineNumber: line,
          columnNumber: column,
        });
      }
    }

    return {
      isValid: true,
      matches,
      error: null,
      executionTime: getTime() - startTime,
    };
  } catch (error) {
    return {
      isValid: false,
      matches: [],
      error: error instanceof Error ? error.message : 'Invalid regular expression',
      executionTime: getTime() - startTime,
    };
  }
}

export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const COMMON_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL', pattern: 'https?://[^\\s]+' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
  { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: 'Time (HH:MM)', pattern: '([01]?\\d|2[0-3]):[0-5]\\d' },
  { name: 'Hex Color', pattern: '#[a-fA-F0-9]{6}\\b' },
  { name: 'HTML Tag', pattern: '<[^>]+>' },
  { name: 'Alphanumeric', pattern: '^[a-zA-Z0-9]+$' },
  { name: 'Numbers Only', pattern: '^\\d+$' },
] as const;
