import { Base64Mode } from './types';

export const BASE64_MODES: { id: Base64Mode; name: string; description: string }[] = [
  { 
    id: 'encode', 
    name: 'Encode', 
    description: 'Convert text to Base64 format' 
  },
  { 
    id: 'decode', 
    name: 'Decode', 
    description: 'Convert Base64 back to original text' 
  },
];

export const DEFAULT_OPTIONS = {
  mode: 'encode' as Base64Mode,
  urlSafe: false,
};
