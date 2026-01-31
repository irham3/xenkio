import { DiffType, DiffViewMode } from './types';

export const DIFF_TYPES: { id: DiffType; name: string; description: string }[] = [
  { id: 'chars', name: 'Characters', description: 'Compare character by character' },
  { id: 'words', name: 'Words', description: 'Compare word by word' },
  { id: 'lines', name: 'Lines', description: 'Compare line by line' },
];

export const VIEW_MODES: { id: DiffViewMode; name: string }[] = [
  { id: 'split', name: 'Split View' },
  { id: 'unified', name: 'Unified View' },
];

export const DEFAULT_OPTIONS = {
  diffType: 'words' as DiffType,
  ignoreCase: false,
  ignoreWhitespace: false,
  viewMode: 'unified' as DiffViewMode,
};

export const SAMPLE_ORIGINAL = `The quick brown fox jumps over the lazy dog.
This is a sample text for comparison.
Feel free to edit this text.`;

export const SAMPLE_MODIFIED = `The quick red fox leaps over the lazy cat.
This is an example text for comparison.
Feel free to modify this text.`;
