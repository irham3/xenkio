import { EntityMode, HtmlEntityStats } from '../types';

const NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&nbsp;': '\u00A0',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
  '&laquo;': '«',
  '&raquo;': '»',
  '&bull;': '•',
  '&middot;': '·',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&para;': '¶',
  '&sect;': '§',
  '&cent;': '¢',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
};

export function encodeHtmlEntities(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)!;
    const char = text[i];

    switch (char) {
      case '&':
        result += '&amp;';
        break;
      case '<':
        result += '&lt;';
        break;
      case '>':
        result += '&gt;';
        break;
      case '"':
        result += '&quot;';
        break;
      case "'":
        result += '&#39;';
        break;
      default:
        if (code > 127) {
          result += `&#${code};`;
          // Skip the low surrogate for characters beyond BMP
          if (code > 0xFFFF) i++;
        } else {
          result += char;
        }
    }
  }
  return result;
}

export function decodeHtmlEntities(text: string): string {
  let result = text;

  // Decode named entities
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    result = result.replaceAll(entity, char);
  }

  // Decode hex numeric entities (&#xHH;)
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
  });

  // Decode decimal numeric entities (&#DDD;)
  result = result.replace(/&#(\d+);/g, (_, dec) => {
    return String.fromCodePoint(parseInt(dec, 10));
  });

  return result;
}

export function calculateStats(original: string, result: string, mode: EntityMode): HtmlEntityStats {
  let entitiesCount = 0;

  if (mode === 'encode') {
    // Count entities in the result
    const matches = result.match(/&[#a-zA-Z0-9]+;/g);
    entitiesCount = matches ? matches.length : 0;
  } else {
    // Count entities in the original
    const matches = original.match(/&[#a-zA-Z0-9]+;/g);
    entitiesCount = matches ? matches.length : 0;
  }

  return {
    originalChars: original.length,
    resultChars: result.length,
    entitiesCount,
    sizeDiff: result.length - original.length,
  };
}
