import { HtmlFormatterOptions, HtmlFormatterResult, FormatStats } from '../types';

/**
 * Format HTML with configurable options
 * Uses a custom implementation for browser compatibility and edge runtime support
 */
export function formatHtml(options: HtmlFormatterOptions): HtmlFormatterResult {
  const startTime = performance.now();
  const { html, indentType, indentSize, wrapLineLength, preserveNewlines, maxPreserveNewlines, wrapAttributes, unformatted } = options;

  if (!html.trim()) {
    return {
      formatted: '',
      originalSize: 0,
      formattedSize: 0,
      executionTime: 0,
    };
  }

  try {
    const indent = indentType === 'tabs' ? '\t' : ' '.repeat(indentSize);
    const formatted = beautifyHtml(html, {
      indent,
      wrapLineLength,
      preserveNewlines,
      maxPreserveNewlines,
      wrapAttributes,
      unformatted,
    });

    const executionTime = performance.now() - startTime;

    return {
      formatted,
      originalSize: html.length,
      formattedSize: formatted.length,
      executionTime,
    };
  } catch (error) {
    return {
      formatted: html,
      originalSize: html.length,
      formattedSize: html.length,
      executionTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

interface BeautifyOptions {
  indent: string;
  wrapLineLength: number;
  preserveNewlines: boolean;
  maxPreserveNewlines: number;
  wrapAttributes: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline';
  unformatted: string[];
}

/**
 * Custom HTML beautifier implementation
 * Handles indentation, tag formatting, and attribute wrapping
 */
function beautifyHtml(html: string, options: BeautifyOptions): string {
  const { indent, wrapLineLength, preserveNewlines, maxPreserveNewlines, wrapAttributes, unformatted } = options;

  // Self-closing tags that should not have a closing tag
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  // Tags that should have their content on a new line
  const blockElements = new Set([
    'html', 'head', 'body', 'header', 'footer', 'main', 'nav', 'section',
    'article', 'aside', 'div', 'p', 'ul', 'ol', 'li', 'table', 'thead',
    'tbody', 'tfoot', 'tr', 'th', 'td', 'form', 'fieldset', 'figure',
    'figcaption', 'blockquote', 'pre', 'address', 'details', 'summary',
    'dialog', 'hgroup', 'menu', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
  ]);

  // Tags that preserve whitespace/formatting
  const preserveContentTags = new Set(['pre', 'code', 'textarea', 'script', 'style', ...unformatted]);

  let result = '';
  let indentLevel = 0;
  let position = 0;
  let inPreservedContent = false;
  let preservedTag = '';

  // Helper to get current indentation
  const getIndent = (level: number): string => indent.repeat(level);

  // Helper to wrap attributes
  const formatAttributes = (attrs: string, tagName: string, currentIndent: string): string => {
    if (!attrs.trim()) return '';

    // Parse attributes
    const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    const attributes: { name: string; value?: string; quote: string }[] = [];
    let match;

    while ((match = attrRegex.exec(attrs)) !== null) {
      const name = match[1];
      const value = match[2] ?? match[3] ?? match[4];
      const quote = match[2] !== undefined ? '"' : match[3] !== undefined ? "'" : '';
      attributes.push({ name, value, quote });
    }

    if (attributes.length === 0) return '';

    // Format based on wrapAttributes setting
    const attrStrings = attributes.map(attr => {
      if (attr.value === undefined) return attr.name;
      return `${attr.name}=${attr.quote}${attr.value}${attr.quote}`;
    });

    const singleLine = ' ' + attrStrings.join(' ');
    const tagOpenLength = tagName.length + 1; // <tagName

    if (wrapAttributes === 'auto') {
      if (wrapLineLength > 0 && currentIndent.length + tagOpenLength + singleLine.length > wrapLineLength && attributes.length > 1) {
        const attrIndent = currentIndent + indent;
        return '\n' + attrStrings.map(a => attrIndent + a).join('\n') + '\n' + currentIndent;
      }
      return singleLine;
    }

    if (wrapAttributes === 'force' || wrapAttributes === 'force-expand-multiline') {
      if (attributes.length > 1) {
        const attrIndent = currentIndent + indent;
        return '\n' + attrStrings.map(a => attrIndent + a).join('\n') + '\n' + currentIndent;
      }
      return singleLine;
    }

    if (wrapAttributes === 'force-aligned') {
      if (attributes.length > 1) {
        const alignIndent = ' '.repeat(tagOpenLength + currentIndent.length + 1);
        return ' ' + attrStrings[0] + '\n' + attrStrings.slice(1).map(a => alignIndent + a).join('\n');
      }
      return singleLine;
    }

    return singleLine;
  };

  // Normalize input - remove extra whitespace but preserve structure
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Main parsing loop
  while (position < html.length) {
    // Check for DOCTYPE
    if (html.substring(position, position + 9).toLowerCase() === '<!doctype') {
      const endPos = html.indexOf('>', position);
      if (endPos !== -1) {
        const doctype = html.substring(position, endPos + 1);
        result += doctype + '\n';
        position = endPos + 1;
        continue;
      }
    }

    // Check for comment
    if (html.substring(position, position + 4) === '<!--') {
      const endPos = html.indexOf('-->', position);
      if (endPos !== -1) {
        const comment = html.substring(position, endPos + 3);
        const currentIndent = getIndent(indentLevel);
        // Add newline before comment if needed
        if (result && !result.endsWith('\n')) {
          result += '\n';
        }
        result += currentIndent + comment + '\n';
        position = endPos + 3;
        continue;
      }
    }

    // Check for opening tag
    if (html[position] === '<' && html[position + 1] !== '/') {
      // Handle preserved content tags (script, style, pre, etc.)
      if (inPreservedContent) {
        const closeTag = `</${preservedTag}>`;
        const closePos = html.toLowerCase().indexOf(closeTag.toLowerCase(), position);
        if (closePos !== -1) {
          result += html.substring(position, closePos);
          position = closePos;
          inPreservedContent = false;
          preservedTag = '';
        }
        continue;
      }

      // Find end of tag
      const tagEnd = html.indexOf('>', position);
      if (tagEnd === -1) break;

      const fullTag = html.substring(position, tagEnd + 1);
      const isSelfClosing = fullTag.endsWith('/>');

      // Extract tag name and attributes
      const tagMatch = fullTag.match(/<([a-zA-Z][a-zA-Z0-9-]*)\s*([\s\S]*?)\s*\/?>/);
      if (!tagMatch) {
        result += html[position];
        position++;
        continue;
      }

      const tagName = tagMatch[1].toLowerCase();
      const attributes = tagMatch[2];
      const isVoid = voidElements.has(tagName);
      const isBlock = blockElements.has(tagName);
      const currentIndent = getIndent(indentLevel);

      // Add newline before block elements
      if (isBlock && result && !result.endsWith('\n')) {
        result += '\n';
      }

      // Build formatted tag
      let formattedTag = currentIndent + '<' + tagName;
      formattedTag += formatAttributes(attributes, tagName, currentIndent);
      formattedTag += isVoid || isSelfClosing ? ' />' : '>';

      result += formattedTag;

      // Handle content after opening tag
      if (!isVoid && !isSelfClosing) {
        if (preserveContentTags.has(tagName)) {
          inPreservedContent = true;
          preservedTag = tagName;
        } else if (isBlock) {
          result += '\n';
          indentLevel++;
        }
      } else if (isBlock) {
        result += '\n';
      }

      position = tagEnd + 1;
      continue;
    }

    // Check for closing tag
    if (html.substring(position, position + 2) === '</') {
      const tagEnd = html.indexOf('>', position);
      if (tagEnd === -1) break;

      const fullTag = html.substring(position, tagEnd + 1);
      const tagMatch = fullTag.match(/<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/);

      if (!tagMatch) {
        result += html[position];
        position++;
        continue;
      }

      const tagName = tagMatch[1].toLowerCase();
      const isBlock = blockElements.has(tagName);

      if (isBlock) {
        indentLevel = Math.max(0, indentLevel - 1);
        const currentIndent = getIndent(indentLevel);
        
        // Add newline before closing tag if needed
        if (result && !result.endsWith('\n')) {
          result += '\n';
        }
        result += currentIndent + `</${tagName}>` + '\n';
      } else {
        result += `</${tagName}>`;
      }

      position = tagEnd + 1;
      continue;
    }

    // Handle text content
    if (inPreservedContent) {
      result += html[position];
      position++;
      continue;
    }

    // Collect text content
    let textEnd = html.indexOf('<', position);
    if (textEnd === -1) textEnd = html.length;

    let text = html.substring(position, textEnd);
    
    // Normalize whitespace in text
    text = text.replace(/\s+/g, ' ').trim();

    if (text) {
      // If we're at the start of a line, add indentation
      if (result.endsWith('\n')) {
        result += getIndent(indentLevel);
      }
      result += text;
    }

    position = textEnd;
  }

  // Clean up multiple blank lines if not preserving
  if (!preserveNewlines) {
    result = result.replace(/\n{3,}/g, '\n\n');
  } else {
    const maxNewlines = maxPreserveNewlines + 1;
    const regex = new RegExp(`\n{${maxNewlines + 1},}`, 'g');
    result = regex.source ? result.replace(regex, '\n'.repeat(maxNewlines)) : result;
  }

  // Remove trailing whitespace from lines
  result = result.split('\n').map(line => line.trimEnd()).join('\n');

  // Ensure single trailing newline
  result = result.trim() + '\n';

  return result;
}

/**
 * Minify HTML by removing unnecessary whitespace
 */
export function minifyHtml(html: string): string {
  if (!html.trim()) return '';

  // Preserve content in pre, code, textarea, script, style
  const preserved: string[] = [];
  let index = 0;

  // Replace preserved content with placeholders
  const preservePattern = /<(pre|code|textarea|script|style)[^>]*>[\s\S]*?<\/\1>/gi;
  html = html.replace(preservePattern, (match) => {
    preserved.push(match);
    return `__PRESERVED_${index++}__`;
  });

  // Minify
  html = html
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/\s+>/g, '>') // Remove whitespace before >
    .replace(/<\s+/g, '<'); // Remove whitespace after <

  // Restore preserved content
  preserved.forEach((content, i) => {
    html = html.replace(`__PRESERVED_${i}__`, content);
  });

  return html.trim();
}

/**
 * Calculate formatting statistics
 */
export function calculateStats(original: string, formatted: string): FormatStats {
  const originalLines = original.split('\n').length;
  const formattedLines = formatted.split('\n').length;
  const originalSize = original.length;
  const formattedSize = formatted.length;

  return {
    originalLines,
    formattedLines,
    originalSize,
    formattedSize,
    sizeDiff: formattedSize - originalSize,
    lineDiff: formattedLines - originalLines,
  };
}

/**
 * Validate if string is valid HTML (basic check)
 */
export function isValidHtml(html: string): { valid: boolean; error?: string } {
  if (!html.trim()) {
    return { valid: true };
  }

  // Check for basic tag structure
  const openTags: string[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*>/g;
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const [fullMatch, tagName] = match;
    const isClosing = fullMatch.startsWith('</');
    const isSelfClosing = fullMatch.endsWith('/>');
    const lowerTagName = tagName.toLowerCase();

    if (isClosing) {
      const lastOpen = openTags.pop();
      if (lastOpen !== lowerTagName) {
        return {
          valid: false,
          error: `Mismatched tag: expected </${lastOpen}> but found </${lowerTagName}>`,
        };
      }
    } else if (!isSelfClosing && !voidElements.has(lowerTagName)) {
      openTags.push(lowerTagName);
    }
  }

  if (openTags.length > 0) {
    return {
      valid: false,
      error: `Unclosed tags: ${openTags.map(t => `<${t}>`).join(', ')}`,
    };
  }

  return { valid: true };
}
