import { minifyJs, beautifyJs, calculateStats } from '../lib/js-minifier-utils';

export type WorkerRequest =
  | { type: 'minify'; js: string }
  | { type: 'beautify'; js: string; indentSize: number };

export type WorkerResponse =
  | { type: 'success'; output: string; originalSize: number; resultSize: number; executionTime: number; stats: ReturnType<typeof calculateStats> }
  | { type: 'error'; message: string; originalSize: number; resultSize: number };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { type } = e.data;

  try {
    const startTime = performance.now();

    let output: string;
    if (type === 'minify') {
      output = minifyJs(e.data.js);
    } else {
      output = beautifyJs(e.data.js, e.data.indentSize);
    }

    const executionTime = performance.now() - startTime;
    const stats = calculateStats(e.data.js, output);

    const response: WorkerResponse = {
      type: 'success',
      output,
      originalSize: e.data.js.length,
      resultSize: output.length,
      executionTime,
      stats,
    };
    self.postMessage(response);
  } catch (err) {
    const js = (e.data as { js: string }).js;
    const response: WorkerResponse = {
      type: 'error',
      message: err instanceof Error ? err.message : `${type === 'minify' ? 'Minification' : 'Beautification'} failed`,
      originalSize: js.length,
      resultSize: js.length,
    };
    self.postMessage(response);
  }
};
