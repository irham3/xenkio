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
      const isRegex = !lastChar || /[=(:,;!&|?{}\[+\-~^%<>]/.test(lastChar) ||
        /^(return|typeof|instanceof|in|delete|void|throw|new|case)$/.test(prev);

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
 * Beautify/format JavaScript with proper indentation
 */
export function beautifyJs(js: string, indentSize: number): string {
  if (!js.trim()) return '';

  const indent = ' '.repeat(indentSize);
  const tokens: string[] = [];
  let i = 0;

  // Tokenize while preserving strings, comments, regex
  while (i < js.length) {
    // Single-line comment
    if (js[i] === '/' && js[i + 1] === '/') {
      let comment = '';
      while (i < js.length && js[i] !== '\n') {
        comment += js[i];
        i++;
      }
      tokens.push(comment);
      continue;
    }

    // Multi-line comment
    if (js[i] === '/' && js[i + 1] === '*') {
      let comment = '';
      while (i < js.length && !(js[i] === '*' && js[i + 1] === '/')) {
        comment += js[i];
        i++;
      }
      comment += '*/';
      i += 2;
      tokens.push(comment);
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

    // String literals
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

    // Whitespace
    if (/\s/.test(js[i])) {
      while (i < js.length && /\s/.test(js[i])) i++;
      tokens.push(' ');
      continue;
    }

    // Punctuation that affects formatting
    if ('{};,'.includes(js[i])) {
      tokens.push(js[i]);
      i++;
      continue;
    }

    // Other characters
    let chunk = '';
    while (i < js.length && !/[\s{};,`"'/]/.test(js[i])) {
      chunk += js[i];
      i++;
    }
    if (chunk) {
      tokens.push(chunk);
    }
  }

  // Build formatted output
  const lines: string[] = [];
  let currentLine = '';
  let indentLevel = 0;

  const pushLine = () => {
    if (currentLine.trim()) {
      lines.push(indent.repeat(indentLevel) + currentLine.trim());
    }
    currentLine = '';
  };

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];

    if (token === '{') {
      currentLine += ' {';
      pushLine();
      indentLevel++;
    } else if (token === '}') {
      pushLine();
      indentLevel = Math.max(0, indentLevel - 1);
      lines.push(indent.repeat(indentLevel) + '}');
      // Add blank line after closing brace unless next is } or else/catch/finally
      const next = tokens.slice(t + 1).find(tk => tk.trim() !== '');
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
    } else if (token.startsWith('//')) {
      if (currentLine.trim()) {
        currentLine += ' ' + token;
        pushLine();
      } else {
        lines.push(indent.repeat(indentLevel) + token);
      }
    } else if (token.startsWith('/*')) {
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
