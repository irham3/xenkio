import { IndentSize, IndentType, WrapLineLength, HtmlFormatterOptions } from './types';

export const INDENT_TYPES: { id: IndentType; label: string }[] = [
  { id: 'spaces', label: 'Spaces' },
  { id: 'tabs', label: 'Tabs' },
];

export const INDENT_SIZES: { id: IndentSize; label: string }[] = [
  { id: 2, label: '2' },
  { id: 4, label: '4' },
  { id: 8, label: '8' },
];

export const WRAP_LINE_LENGTHS: { id: WrapLineLength; label: string }[] = [
  { id: 0, label: 'No wrap' },
  { id: 80, label: '80' },
  { id: 120, label: '120' },
  { id: 160, label: '160' },
];

export const WRAP_ATTRIBUTES_OPTIONS: { id: HtmlFormatterOptions['wrapAttributes']; label: string; description: string }[] = [
  { id: 'auto', label: 'Auto', description: 'Wrap when line exceeds max length' },
  { id: 'force', label: 'Force', description: 'Always wrap attributes' },
  { id: 'force-aligned', label: 'Force Aligned', description: 'Wrap and align attributes' },
  { id: 'force-expand-multiline', label: 'Expand Multiline', description: 'Expand multiline attributes' },
];

export const DEFAULT_OPTIONS: HtmlFormatterOptions = {
  html: '',
  indentType: 'spaces',
  indentSize: 2,
  wrapLineLength: 120,
  preserveNewlines: true,
  maxPreserveNewlines: 2,
  wrapAttributes: 'auto',
  unformatted: ['wbr', 'code', 'pre', 'textarea'],
};

export const SAMPLE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sample Page</title><style>body{font-family:sans-serif;margin:0;padding:20px;}</style></head><body><header><nav><ul><li><a href="/">Home</a></li><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li></ul></nav></header><main><article><h1>Hello World</h1><p>This is a sample HTML page for testing the formatter.</p><div class="container"><span class="highlight">Formatted HTML is easier to read!</span></div></article></main><footer><p>&copy; 2024 Sample Company</p></footer></body></html>`;
