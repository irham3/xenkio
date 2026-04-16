/**
 * Polyfills for older browsers to ensure compatibility with modern libraries.
 * Targets compatibility for Chrome 116 and similar legacy versions.
 */

// 1. Promise.withResolvers (Chrome 119+)
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

// 2. ReadableStream async iterator (Chrome 124+)
if (typeof ReadableStream !== 'undefined' && !(ReadableStream.prototype as unknown as Record<string | symbol, unknown>)[Symbol.asyncIterator]) {
    (ReadableStream.prototype as unknown as Record<string | symbol, unknown>)[Symbol.asyncIterator] = async function* () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - ReadableStream doesn't have getReader in types in some contexts
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

// 3. Object.groupBy (Chrome 117+)
if (typeof Object.groupBy === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Polyfilling for runtime even if types exist
    Object.groupBy = function <T, K extends PropertyKey>(
        items: Iterable<T>,
        callbackfn: (item: T, index: number) => K
    ): Record<K, T[]> {
        const obj = Object.create(null);
        let i = 0;
        for (const item of items) {
            const key = callbackfn(item, i++);
            if (obj[key]) {
                obj[key].push(item);
            } else {
                obj[key] = [item];
            }
        }
        return obj;
    };
}

// 4. URL.canParse (Chrome 120+)
if (typeof URL.canParse === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Polyfilling for runtime even if types exist
    URL.canParse = function (url: string | URL, base?: string | URL): boolean {
        try {
            new URL(url, base);
            return true;
        } catch {
            return false;
        }
    };
}

// 5. Array.prototype.toSorted (Chrome 110+) - Just in case
if (!Array.prototype.toSorted) {
    Array.prototype.toSorted = function(compareFn) {
        return [...this].sort(compareFn);
    };
}

// 6. Array.prototype.toReversed (Chrome 110+) - Just in case
if (!Array.prototype.toReversed) {
    Array.prototype.toReversed = function() {
        return [...this].reverse();
    };
}

// 7. Array.prototype.with (Chrome 110+) - Just in case
if (!Array.prototype.with) {
    Array.prototype.with = function(index, value) {
        if (index < 0) index += this.length;
        if (index < 0 || index >= this.length) throw new RangeError('Invalid index');
        const result = [...this];
        result[index] = value;
        return result;
    };
}

// Add other polyfills here if needed
