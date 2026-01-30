import { RegexFlags, RegexMatch, RegexResult, RegexOptions } from '../types';

/**
 * Builds a flags string from the RegexFlags object
 */
export function buildFlagsString(flags: RegexFlags): string {
  let flagStr = '';
  if (flags.global) flagStr += 'g';
  if (flags.caseInsensitive) flagStr += 'i';
  if (flags.multiline) flagStr += 'm';
  if (flags.dotAll) flagStr += 's';
  if (flags.unicode) flagStr += 'u';
  if (flags.sticky) flagStr += 'y';
  return flagStr;
}

/**
 * Validates a regex pattern and returns any error
 */
export function validatePattern(pattern: string, flags: RegexFlags): string | null {
  if (!pattern) return null;
  
  try {
    const flagStr = buildFlagsString(flags);
    new RegExp(pattern, flagStr);
    return null;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return error.message;
    }
    return 'Invalid regular expression';
  }
}

/**
 * Executes regex matching and returns the result
 */
export function executeRegex(options: RegexOptions): RegexResult {
  const { pattern, testText, flags } = options;
  const startTime = performance.now();

  // Empty pattern
  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      matchCount: 0,
      executionTime: 0,
    };
  }

  // Validate pattern first
  const validationError = validatePattern(pattern, flags);
  if (validationError) {
    return {
      isValid: false,
      matches: [],
      matchCount: 0,
      executionTime: performance.now() - startTime,
      error: validationError,
    };
  }

  try {
    const flagStr = buildFlagsString(flags);
    const regex = new RegExp(pattern, flagStr);
    const matches: RegexMatch[] = [];

    if (flags.global) {
      let match: RegExpExecArray | null;
      // Prevent infinite loops for zero-length matches
      let lastIndex = -1;
      while ((match = regex.exec(testText)) !== null) {
        if (regex.lastIndex === lastIndex) {
          regex.lastIndex++;
          continue;
        }
        lastIndex = regex.lastIndex;
        
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.groups ? { ...match.groups } : null,
          length: match[0].length,
        });

        // Safety limit to prevent too many matches
        if (matches.length >= 1000) break;
      }
    } else {
      const match = regex.exec(testText);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.groups ? { ...match.groups } : null,
          length: match[0].length,
        });
      }
    }

    return {
      isValid: true,
      matches,
      matchCount: matches.length,
      executionTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      isValid: false,
      matches: [],
      matchCount: 0,
      executionTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
