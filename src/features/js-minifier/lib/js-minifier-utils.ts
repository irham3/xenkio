import { JsMinifierStats } from '../types';

/**
 * Minify JavaScript by removing comments, unnecessary whitespace, and newlines.
 * Preserves string literals, template literals, and regex literals.
 */
export function minifyJs(js: string): string {
  if (!js.trim()) return '';

  const tokens: string[] = [];
  let i = 0;

  while (i < js.length) {
    // Single-line comment
    if (js[i] === '/' && js[i + 1] === '/') {
      // Skip until end of line
      while (i < js.length && js[i] !== '\n') i++;
      continue;
    }

    // Multi-line comment
    if (js[i] === '/' && js[i + 1] === '*') {
      i += 2;
      while (i < js.length && !(js[i] === '*' && js[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // Template literal
    if (js[i] === '`') {
      let str = '`';
      i++;
      while (i < js.length && js[i] !== '`') {
        if (js[i] === '\\') {
          str += js[i] + (js[i + 1] || '');
          i += 2;
          continue;
        }
        str += js[i];
        i++;
      }
      str += '`';
      i++;
      tokens.push(str);
      continue;
    }

    // String literals (single or double quote)
    if (js[i] === '"' || js[i] === "'") {
      const quote = js[i];
      let str = quote;
      i++;
      while (i < js.length && js[i] !== quote) {
        if (js[i] === '\\') {
          str += js[i] + (js[i + 1] || '');
          i += 2;
          continue;
        }
        if (js[i] === '\n') break;
        str += js[i];
        i++;
      }
      str += quote;
      i++;
      tokens.push(str);
      continue;
    }

    // Regex literal - detect by checking previous non-whitespace token
    if (js[i] === '/') {
      const prev = tokens.length > 0 ? tokens[tokens.length - 1].trim() : '';
      const lastChar = prev[prev.length - 1];
      // Division follows: identifiers, numbers, ), ], ++, --
      // Regex follows: operators, keywords, opening brackets, commas, semicolons
      const isDivision = lastChar && (/[a-zA-Z_$0-9)\]]/.test(lastChar) || prev === '++' || prev === '--');
      const isRegex = !isDivision && (!lastChar || /[=(:,;!&|?{}\[+\-~^%<>]/.test(lastChar) ||
        /^(return|typeof|instanceof|in|delete|void|throw|new|case)$/.test(prev));

      if (isRegex) {
        let regex = '/';
        i++;
        while (i < js.length && js[i] !== '/') {
          if (js[i] === '\\') {
            regex += js[i] + (js[i + 1] || '');
            i += 2;
            continue;
          }
          if (js[i] === '\n') break;
          regex += js[i];
          i++;
        }
        regex += '/';
        i++;
        // Regex flags
        while (i < js.length && /[gimsuy]/.test(js[i])) {
          regex += js[i];
          i++;
        }
        tokens.push(regex);
        continue;
      }
    }

    // Whitespace
    if (/\s/.test(js[i])) {
      // Collapse all whitespace into a single space
      while (i < js.length && /\s/.test(js[i])) i++;
      tokens.push(' ');
      continue;
    }

    // Other characters (operators, identifiers, etc.)
    if (/[a-zA-Z_$0-9]/.test(js[i])) {
      let word = '';
      while (i < js.length && /[a-zA-Z_$0-9]/.test(js[i])) {
        word += js[i];
        i++;
      }
      tokens.push(word);
      continue;
    }

    // Single character (operators, punctuation)
    tokens.push(js[i]);
    i++;
  }

  // Join tokens and remove unnecessary spaces
  let result = '';
  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];

    if (token === ' ') {
      const prev = result[result.length - 1] || '';
      const next = tokens[t + 1] || '';
      const nextChar = next[0] || '';

      // Keep space only between two identifier characters or keywords
      const prevIsWord = /[a-zA-Z_$0-9]/.test(prev);
      const nextIsWord = /[a-zA-Z_$0-9]/.test(nextChar);

      if (prevIsWord && nextIsWord) {
        result += ' ';
      }
    } else {
      result += token;
    }
  }

  return result.trim();
}

/**
 * Beautify/format JavaScript with proper indentation.
 *
 * The tokeniser is intentionally kept simple – it only needs to
 * recognise string / template / regex / comment boundaries so that we
 * never reformat code that lives inside them.  Every other character
 * is either a formatting‐significant punctuation token (`{ } ; ,`)
 * or an "other" chunk that we preserve as‑is.
 */
export function beautifyJs(js: string, indentSize: number): string {
  if (!js.trim()) return '';

  const indent = ' '.repeat(indentSize);

  /* ------------------------------------------------------------------ */
  /*  Tokenise                                                          */
  /* ------------------------------------------------------------------ */
  const tokens: string[] = [];
  const len = js.length;
  let i = 0;

  while (i < len) {
    const ch = js[i];
    const ch2 = js[i + 1]; // may be undefined – that's fine

    // ---- single‑line comment ----
    if (ch === '/' && ch2 === '/') {
      const start = i;
      while (i < len && js[i] !== '\n') i++;
      tokens.push(js.substring(start, i));
      continue;
    }

    // ---- multi‑line comment ----
    if (ch === '/' && ch2 === '*') {
      const start = i;
      i += 2;
      while (i < len && !(js[i] === '*' && js[i + 1] === '/')) i++;
      i += 2; // skip */
      tokens.push(js.substring(start, i));
      continue;
    }

    // ---- template literal ----
    if (ch === '`') {
      const start = i;
      i++;
      while (i < len && js[i] !== '`') {
        if (js[i] === '\\') { i += 2; continue; }
        i++;
      }
      i++; // closing `
      tokens.push(js.substring(start, i));
      continue;
    }

    // ---- string literal ----
    if (ch === '"' || ch === "'") {
      const start = i;
      const quote = ch;
      i++;
      while (i < len && js[i] !== quote) {
        if (js[i] === '\\') { i += 2; continue; }
        if (js[i] === '\n') break;
        i++;
      }
      i++; // closing quote
      tokens.push(js.substring(start, i));
      continue;
    }

    // ---- whitespace ----
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f') {
      while (i < len) {
        const c = js[i];
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f') { i++; } else { break; }
      }
      tokens.push(' ');
      continue;
    }

    // ---- formatting punctuation (each char is its own token) ----
    if (ch === '{' || ch === '}' || ch === ';' || ch === ',') {
      tokens.push(ch);
      i++;
      continue;
    }

    // ---- everything else (identifiers, operators, `/`, etc.) ----
    // Grab as many chars as possible that are NOT whitespace / formatting‐punct / string‐start / comment‐start.
    {
      const start = i;
      i++; // always advance at least 1 character to avoid infinite loops
      while (i < len) {
        const c = js[i];
        // Stop at chars that should start their own token
        if (
          c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' ||
          c === '{' || c === '}' || c === ';' || c === ',' ||
          c === '"' || c === "'" || c === '`'
        ) break;
        // Stop before comment starts
        if (c === '/' && (js[i + 1] === '/' || js[i + 1] === '*')) break;
        i++;
      }
      tokens.push(js.substring(start, i));
      continue;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Build formatted output                                            */
  /* ------------------------------------------------------------------ */
  const lines: string[] = [];
  let currentLine = '';
  let indentLevel = 0;

  const pushLine = () => {
    const trimmed = currentLine.trim();
    if (trimmed) {
      lines.push(indent.repeat(indentLevel) + trimmed);
    }
    currentLine = '';
  };

  const tokenCount = tokens.length;
  for (let t = 0; t < tokenCount; t++) {
    const token = tokens[t];

    if (token === '{') {
      currentLine += ' {';
      pushLine();
      indentLevel++;
    } else if (token === '}') {
      pushLine();
      indentLevel = Math.max(0, indentLevel - 1);
      lines.push(indent.repeat(indentLevel) + '}');
      // Add blank line after closing brace unless next is } ; or else/catch/finally
      let next: string | undefined;
      for (let j = t + 1; j < tokenCount; j++) {
        if (tokens[j].trim() !== '') { next = tokens[j]; break; }
      }
      if (next && next !== '}' && next !== ';' && !/^(else|catch|finally)/.test(next.trim())) {
        lines.push('');
      }
    } else if (token === ';') {
      currentLine += ';';
      pushLine();
    } else if (token === ',') {
      currentLine += ',';
    } else if (token === ' ') {
      if (currentLine && !currentLine.endsWith(' ')) {
        currentLine += ' ';
      }
    } else if (token[0] === '/' && token[1] === '/') {
      // single-line comment
      if (currentLine.trim()) {
        currentLine += ' ' + token;
        pushLine();
      } else {
        lines.push(indent.repeat(indentLevel) + token);
      }
    } else if (token[0] === '/' && token[1] === '*') {
      // multi-line comment
      pushLine();
      const commentLines = token.split('\n');
      for (const cl of commentLines) {
        lines.push(indent.repeat(indentLevel) + cl.trim());
      }
    } else {
      currentLine += token;
    }
  }

  if (currentLine.trim()) {
    pushLine();
  }

  // Clean up multiple blank lines
  let output = lines.join('\n');
  output = output.replace(/\n{3,}/g, '\n\n');

  return output.trim() + '\n';
}

/**
 * Calculate size and compression statistics
 */
export function calculateStats(original: string, result: string): JsMinifierStats {
  const originalSize = new Blob([original]).size;
  const resultSize = new Blob([result]).size;
  const compressionRatio = originalSize > 0
    ? ((originalSize - resultSize) / originalSize) * 100
    : 0;

  return {
    originalLines: original.split('\n').length,
    resultLines: result.split('\n').length,
    originalSize,
    resultSize,
    sizeDiff: resultSize - originalSize,
    compressionRatio,
  };
}
