import { BinaryMode, BinarySeparator } from './types';

export const BINARY_MODES: { id: BinaryMode; name: string; description: string }[] = [
  {
    id: 'encode',
    name: 'Text → Binary',
    description: 'Convert plain text into 8-bit binary strings (one byte per character, space-separated by default).',
  },
  {
    id: 'decode',
    name: 'Binary → Text',
    description: 'Convert 8-bit binary strings back into readable text.',
  },
];

export const BINARY_SEPARATORS: { id: BinarySeparator; label: string; char: string }[] = [
  { id: 'space', label: 'Space', char: ' ' },
  { id: 'dash', label: 'Dash ( - )', char: '-' },
  { id: 'none', label: 'None', char: '' },
];

export const DEFAULT_OPTIONS = {
  mode: 'encode' as BinaryMode,
  input: '',
  separator: 'space' as BinarySeparator,
};
