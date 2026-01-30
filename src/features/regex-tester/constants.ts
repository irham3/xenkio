import { RegexFlags } from './types';

export const DEFAULT_FLAGS: RegexFlags = {
  global: true,
  caseInsensitive: false,
  multiline: false,
  dotAll: false,
  unicode: false,
  sticky: false,
};

export const FLAG_DESCRIPTIONS: Record<keyof RegexFlags, { label: string; flag: string; description: string }> = {
  global: {
    label: 'Global',
    flag: 'g',
    description: 'Find all matches, not just the first one',
  },
  caseInsensitive: {
    label: 'Case Insensitive',
    flag: 'i',
    description: 'Match both uppercase and lowercase letters',
  },
  multiline: {
    label: 'Multiline',
    flag: 'm',
    description: '^ and $ match start/end of each line',
  },
  dotAll: {
    label: 'Dot All',
    flag: 's',
    description: '. matches newline characters as well',
  },
  unicode: {
    label: 'Unicode',
    flag: 'u',
    description: 'Enable unicode support for patterns',
  },
  sticky: {
    label: 'Sticky',
    flag: 'y',
    description: 'Match only at lastIndex position',
  },
};

export interface CommonPattern {
  name: string;
  pattern: string;
  description: string;
}

export const COMMON_PATTERNS: CommonPattern[] = [
  {
    name: 'Email',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    description: 'Match email addresses',
  },
  {
    name: 'URL',
    pattern: 'https?:\\/\\/[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+',
    description: 'Match HTTP/HTTPS URLs',
  },
  {
    name: 'Phone (US)',
    pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
    description: 'Match US phone numbers',
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    description: 'Match IPv4 addresses',
  },
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '\\d{4}-\\d{2}-\\d{2}',
    description: 'Match ISO date format',
  },
  {
    name: 'Hex Color',
    pattern: '#[a-fA-F0-9]{6}\\b|#[a-fA-F0-9]{3}\\b',
    description: 'Match hex color codes',
  },
  {
    name: 'HTML Tag',
    pattern: '<([a-z]+)[^>]*>.*?<\\/\\1>|<[a-z]+[^>]*\\/>',
    description: 'Match HTML tags with content',
  },
  {
    name: 'Numbers Only',
    pattern: '\\d+',
    description: 'Match one or more digits',
  },
  {
    name: 'Words Only',
    pattern: '\\b[a-zA-Z]+\\b',
    description: 'Match whole words (letters only)',
  },
  {
    name: 'Whitespace',
    pattern: '\\s+',
    description: 'Match whitespace characters',
  },
];
