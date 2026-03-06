import { MorseOptions, MorseResult } from '../types';
import { CHAR_TO_MORSE, MORSE_TO_CHAR } from '../constants';

export function processMorse(options: MorseOptions): MorseResult {
  const startTime = performance.now();
  let output = '';

  try {
    const { mode, input } = options;

    if (!input.trim()) {
      return {
        output: '',
        mode,
        inputLength: 0,
        outputLength: 0,
        executionTime: performance.now() - startTime,
      };
    }

    if (mode === 'encode') {
      output = encodeToMorse(input);
    } else {
      const decoded = decodeFromMorse(input);
      if (decoded.error) {
        return {
          output: '',
          mode,
          inputLength: input.length,
          outputLength: 0,
          executionTime: performance.now() - startTime,
          error: decoded.error,
        };
      }
      output = decoded.text;
    }
  } catch (err: unknown) {
    return {
      output: '',
      mode: options.mode,
      inputLength: options.input.length,
      outputLength: 0,
      executionTime: performance.now() - startTime,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }

  return {
    output,
    mode: options.mode,
    inputLength: options.input.length,
    outputLength: output.length,
    executionTime: performance.now() - startTime,
  };
}

function encodeToMorse(text: string): string {
  const upperText = text.toUpperCase();
  const words = upperText.split(/\s+/);

  const morseWords = words.map((word) => {
    const morseChars: string[] = [];
    for (const char of word) {
      const morse = CHAR_TO_MORSE[char];
      if (morse) {
        morseChars.push(morse);
      }
      // Skip unsupported characters silently
    }
    return morseChars.join(' ');
  });

  return morseWords.filter((w) => w.length > 0).join(' / ');
}

function decodeFromMorse(morseText: string): { text: string; error?: string } {
  const trimmed = morseText.trim();

  // Validate: morse code should only contain dots, dashes, spaces, and slashes
  if (!/^[.\-/ ]+$/.test(trimmed)) {
    return {
      text: '',
      error: 'Invalid Morse code. Use dots (.), dashes (-), spaces to separate letters, and slashes (/) to separate words.',
    };
  }

  const words = trimmed.split(/\s*\/\s*/);

  const decodedWords = words.map((word) => {
    const letters = word.trim().split(/\s+/);
    return letters
      .map((letter) => {
        if (!letter) return '';
        const char = MORSE_TO_CHAR[letter];
        if (!char) return '?';
        return char;
      })
      .join('');
  });

  return { text: decodedWords.join(' ') };
}
