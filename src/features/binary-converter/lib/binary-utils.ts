import { BinaryOptions, BinaryResult } from '../types';
import { BINARY_SEPARATORS } from '../constants';

export function processBinary(options: BinaryOptions): BinaryResult {
  const startTime = performance.now();

  try {
    const { mode, input, separator } = options;

    if (!input.trim()) {
      return {
        output: '',
        mode,
        inputLength: 0,
        outputLength: 0,
        charCount: 0,
        executionTime: performance.now() - startTime,
      };
    }

    const sepChar = BINARY_SEPARATORS.find((s) => s.id === separator)?.char ?? ' ';

    if (mode === 'encode') {
      const result = encodeTextToBinary(input, sepChar);
      return {
        output: result,
        mode,
        inputLength: input.length,
        outputLength: result.length,
        charCount: input.length,
        executionTime: performance.now() - startTime,
      };
    } else {
      const decoded = decodeBinaryToText(input, separator);
      if (decoded.error) {
        return {
          output: '',
          mode,
          inputLength: input.length,
          outputLength: 0,
          charCount: 0,
          executionTime: performance.now() - startTime,
          error: decoded.error,
        };
      }
      return {
        output: decoded.text,
        mode,
        inputLength: input.length,
        outputLength: decoded.text.length,
        charCount: decoded.text.length,
        executionTime: performance.now() - startTime,
      };
    }
  } catch (err: unknown) {
    return {
      output: '',
      mode: options.mode,
      inputLength: options.input.length,
      outputLength: 0,
      charCount: 0,
      executionTime: performance.now() - startTime,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

// ── Encode ────────────────────────────────────────────────────────────────────

function encodeTextToBinary(text: string, separator: string): string {
  const binaries: string[] = [];

  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;

    if (codePoint <= 0x7f) {
      // ASCII – 1 byte, padded to 8 bits
      binaries.push(codePoint.toString(2).padStart(8, '0'));
    } else if (codePoint <= 0x7ff) {
      // 2-byte UTF-8
      const b1 = 0xc0 | (codePoint >> 6);
      const b2 = 0x80 | (codePoint & 0x3f);
      binaries.push(b1.toString(2).padStart(8, '0'));
      binaries.push(b2.toString(2).padStart(8, '0'));
    } else if (codePoint <= 0xffff) {
      // 3-byte UTF-8
      const b1 = 0xe0 | (codePoint >> 12);
      const b2 = 0x80 | ((codePoint >> 6) & 0x3f);
      const b3 = 0x80 | (codePoint & 0x3f);
      binaries.push(b1.toString(2).padStart(8, '0'));
      binaries.push(b2.toString(2).padStart(8, '0'));
      binaries.push(b3.toString(2).padStart(8, '0'));
    } else {
      // 4-byte UTF-8 (supplementary characters, e.g. emoji)
      const b1 = 0xf0 | (codePoint >> 18);
      const b2 = 0x80 | ((codePoint >> 12) & 0x3f);
      const b3 = 0x80 | ((codePoint >> 6) & 0x3f);
      const b4 = 0x80 | (codePoint & 0x3f);
      binaries.push(b1.toString(2).padStart(8, '0'));
      binaries.push(b2.toString(2).padStart(8, '0'));
      binaries.push(b3.toString(2).padStart(8, '0'));
      binaries.push(b4.toString(2).padStart(8, '0'));
    }
  }

  return binaries.join(separator);
}

// ── Decode ────────────────────────────────────────────────────────────────────

function decodeBinaryToText(
  binaryText: string,
  separatorId: string
): { text: string; error?: string } {
  const trimmed = binaryText.trim();

  // Infer separator: try to split by dash first, then space, then 8-char chunks
  let tokens: string[];

  if (separatorId === 'none') {
    // No separator – split into 8-char chunks
    if (trimmed.length % 8 !== 0) {
      return {
        text: '',
        error:
          'Binary length is not a multiple of 8. Make sure each character is represented by exactly 8 bits.',
      };
    }
    tokens = trimmed.match(/.{8}/g) ?? [];
  } else if (separatorId === 'dash') {
    tokens = trimmed.split('-');
  } else {
    // Default: space-separated (also handles mixed whitespace)
    tokens = trimmed.split(/\s+/);
  }

  // Validate tokens
  for (const token of tokens) {
    if (!/^[01]{8}$/.test(token)) {
      return {
        text: '',
        error: `Invalid binary token "${token.slice(0, 16)}". Each group must be exactly 8 bits (0s and 1s only).`,
      };
    }
  }

  // Convert bytes to UTF-8 string
  const bytes = tokens.map((t) => parseInt(t, 2));
  const uint8 = new Uint8Array(bytes);

  try {
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(uint8);
    return { text: decoded };
  } catch {
    return {
      text: '',
      error: 'Could not decode the binary as valid UTF-8 text. Please check your input.',
    };
  }
}
