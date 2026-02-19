
import { IndentType, IndentSize } from './types';

export const INDENT_TYPES: { id: IndentType; label: string }[] = [
  { id: 'SPACE', label: 'Spaces' },
  { id: 'TAB', label: 'Tabs' },
];

export const INDENT_SIZES: { id: IndentSize; label: string }[] = [
  { id: 2, label: '2 Spaces' },
  { id: 4, label: '4 Spaces' },
  { id: 8, label: '8 Spaces' },
];

export const SAMPLE_JSON = `{
  "name": "Xenkio",
  "version": "1.0.0",
  "description": "All-in-One Productivity Tools",
  "tools": [
    {
      "id": "json-formatter",
      "name": "JSON Formatter",
      "tags": ["developer", "data", "format"]
    },
    {
      "id": "pdf-tools",
      "name": "PDF Convert",
      "tags": ["document", "pdf"]
    }
  ],
  "author": {
    "name": "Altruis",
    "url": "https://xenkio.com"
  },
  "settings": {
    "theme": "light",
    "notifications": true
  }
}`;
