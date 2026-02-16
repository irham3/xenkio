import { JsonFormatterOptions, IndentType, IndentSize } from './types';

export const INDENT_TYPES: { id: IndentType; label: string }[] = [
    { id: 'spaces', label: 'Spaces' },
    { id: 'tabs', label: 'Tabs' },
];

export const INDENT_SIZES: { id: IndentSize; label: string }[] = [
    { id: 2, label: '2' },
    { id: 4, label: '4' },
    { id: 8, label: '8' },
];

export const DEFAULT_OPTIONS: JsonFormatterOptions = {
    json: '',
    indentType: 'spaces',
    indentSize: 2,
    sortKeys: false,
};

export const SAMPLE_JSON = `{
  "projectName": "Xenkio",
  "version": "1.0.0",
  "features": [
    "JSON Formatter",
    "Image Compressor",
    "PDF Tools"
  ],
  "author": {
    "name": "Xenkio Team",
    "website": "https://xenkio.com"
  },
  "settings": {
    "darkMode": true,
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "stats": [42, 13, 7]
}`;
