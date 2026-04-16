/**
 * Polyfills for older browsers to ensure compatibility with modern libraries.
 * Chrome 116 doesn't have Promise.withResolvers, which is used by pdfjs-dist 4.0+.
 */

if (typeof (Promise as unknown as Record<string, unknown>).withResolvers === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Polyfilling a missing standard feature
    Promise.withResolvers = function <T>() {
        let resolve!: (value: T | PromiseLike<T>) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

// Polyfill for ReadableStream async iterator (Chrome < 124)
// Use a more specific type cast to avoid 'any', converting through unknown first
if (typeof ReadableStream !== 'undefined' && !(ReadableStream.prototype as unknown as Record<string | symbol, unknown>)[Symbol.asyncIterator]) {
    (ReadableStream.prototype as unknown as Record<string | symbol, unknown>)[Symbol.asyncIterator] = async function* () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - ReadableStream doesn't have getReader in types in some contexts, or we are polyfilling
        const reader = (this as unknown as ReadableStream<unknown>).getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) return;
                yield value;
            }
        } finally {
            reader.releaseLock();
        }
    };
}

// Add other polyfills here if needed
