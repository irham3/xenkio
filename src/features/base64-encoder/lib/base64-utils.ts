import { Base64Options, Base64Result } from '../types';

export function processBase64(options: Base64Options): Base64Result {
  const startTime = performance.now();
  let output = '';

  try {
    const { mode, input } = options;

    if (!input) {
      return {
        output: '',
        mode,
        inputLength: 0,
        outputLength: 0,
        executionTime: performance.now() - startTime,
      };
    }

    if (mode === 'encode') {
      // Handle UTF-8 characters properly by encoding to UTF-8 bytes first
      const encoder = new TextEncoder();
      const bytes = encoder.encode(input);
      const binaryString = Array.from(bytes)
        .map((byte) => String.fromCharCode(byte))
        .join('');
      output = btoa(binaryString);
    } else {
      // Decode Base64 to UTF-8 text
      try {
        const binaryString = atob(input);
        const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
        const decoder = new TextDecoder();
        output = decoder.decode(bytes);
      } catch {
        return {
          output: '',
          mode,
          inputLength: input.length,
          outputLength: 0,
          executionTime: performance.now() - startTime,
          error: 'Invalid Base64 string. Please check your input.',
        };
      }
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
