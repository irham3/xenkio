import { CssMinifierStats } from '../types';

/**
 * Minify CSS by removing comments, whitespace, and unnecessary characters
 */
export function minifyCss(css: string): string {
  if (!css.trim()) return '';

  let result = css;

  // Remove CSS comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove newlines and carriage returns
  result = result.replace(/[\r\n]+/g, '');

  // Collapse multiple spaces into one
  result = result.replace(/\s{2,}/g, ' ');

  // Remove spaces around { } : ; ,
  result = result.replace(/\s*\{\s*/g, '{');
  result = result.replace(/\s*\}\s*/g, '}');
  result = result.replace(/\s*:\s*/g, ':');
  result = result.replace(/\s*;\s*/g, ';');
  result = result.replace(/\s*,\s*/g, ',');

  // Remove last semicolon before }
  result = result.replace(/;}/g, '}');

  // Remove leading/trailing whitespace
  result = result.trim();

  return result;
}

/**
 * Beautify/format CSS with proper indentation
 */
export function beautifyCss(css: string, indentSize: number): string {
  if (!css.trim()) return '';

  const indent = ' '.repeat(indentSize);
  let result = css;

  // Remove existing comments for clean formatting, then re-process
  // First normalize whitespace
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Normalize spaces
  result = result.replace(/\s+/g, ' ').trim();

  // Add newline after {
  result = result.replace(/\{\s*/g, ' {\n');

  // Add newline before }
  result = result.replace(/\s*\}/g, '\n}');

  // Add newline after ;
  result = result.replace(/;\s*/g, ';\n');

  // Add newline after } (for separating rules)
  result = result.replace(/\}\s*/g, '}\n\n');

  // Process line by line for indentation
  const lines = result.split('\n');
  const formatted: string[] = [];
  let indentLevel = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Decrease indent for closing brace
    if (line.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formatted.push(indent.repeat(indentLevel) + line);

    // Increase indent after opening brace
    if (line.endsWith('{')) {
      indentLevel++;
    }
  }

  // Clean up multiple blank lines
  let output = formatted.join('\n');
  output = output.replace(/\n{3,}/g, '\n\n');

  return output.trim() + '\n';
}

/**
 * Calculate size and compression statistics
 */
export function calculateStats(original: string, result: string): CssMinifierStats {
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
