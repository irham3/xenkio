import { SegmentType } from '../types';

export const FONT_FAMILIES: Record<string, string> = {
    sans: 'ui-sans-serif, system-ui, sans-serif',
    serif: 'ui-serif, Georgia, serif',
    mono: 'ui-monospace, "Cascadia Code", monospace',
};

/**
 * Common abbreviations that should NOT trigger a sentence split.
 * Pattern: word followed by a dot that is NOT end of sentence.
 */
const ABBREVIATIONS = /\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr|vs|etc|i\.e|e\.g|fig|vol|no|pp|ed|rev|approx|dept|est|inc|ltd|corp|avg|max|min|sq|ft|km|cm|mm|kg|lb|oz|mph|rpm)\./gi;

/**
 * Pre-process script to protect abbreviations from being split.
 * Replace their trailing dot with a placeholder.
 */
function protectAbbreviations(text: string): string {
    return text.replace(ABBREVIATIONS, (match) => match.slice(0, -1) + '\u2024'); // ․ = one dot leader
}

function restoreAbbreviations(text: string): string {
    return text.replace(/\u2024/g, '.');
}

/**
 * Protect repeating punctuation like "..." or "!!!" from splitting.
 */
function protectRepeatedPunctuation(text: string): string {
    return text
        .replace(/\.{2,}/g, (m) => '\u2026'.repeat(m.length)) // → …
        .replace(/!{2,}/g, (m) => '！'.repeat(m.length))      // full-width !
        .replace(/\?{2,}/g, (m) => '？'.repeat(m.length));    // full-width ?
}

function restoreRepeatedPunctuation(text: string): string {
    return text
        .replace(/\u2026+/g, (m) => '.'.repeat(m.length))
        .replace(/！+/g, (m) => '!'.repeat(m.length))
        .replace(/？+/g, (m) => '?'.repeat(m.length));
}

/** Split long text by words respecting a max character width. */
function splitByWordWrap(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];
    const words = text.split(' ');
    const chunks: string[] = [];
    let current = '';
    for (const word of words) {
        if (current && (current + ' ' + word).length > maxLen) {
            chunks.push(current.trim());
            current = word;
        } else {
            current = current ? current + ' ' + word : word;
        }
    }
    if (current) chunks.push(current.trim());
    return chunks.filter(Boolean);
}

export function splitIntoSegments(script: string, segmentType: SegmentType): string[] {
    if (!script.trim()) return [];

    switch (segmentType) {
        case 'paragraph':
            return script
                .split(/\n\s*\n/)
                .map((s) => s.trim())
                .filter(Boolean);

        case 'sentence':
            return script
                .split(/(?<=[.!?])\s+/)
                .map((s) => s.trim())
                .filter(Boolean);

        case 'line':
            return script
                .split(/\n/)
                .map((s) => s.trim())
                .filter(Boolean);

        case 'smart': {
            // --- Pre-process: protect things we don't want to split on ---
            const safe = protectRepeatedPunctuation(protectAbbreviations(script));

            // 1. Split by structural newlines first (preserves paragraph intent)
            const blocks = safe.split(/\n+/).filter(Boolean);
            const segments: string[] = [];

            blocks.forEach((block) => {
                // 2. Split by major punctuation (sentence boundaries)
                const sentences = block.split(/(?<=[.!?])\s+/).filter(Boolean);

                sentences.forEach((sentence) => {
                    const s = sentence.trim();
                    if (!s) return;

                    if (s.length <= 90) {
                        segments.push(s);
                    } else {
                        // 3. Split by minor punctuation (, ; : —)
                        const phrases = s.split(/(?<=[,;:—])\s+/).filter(Boolean);
                        phrases.forEach((phrase) => {
                            const p = phrase.trim();
                            if (!p) return;
                            if (p.length <= 90) {
                                segments.push(p);
                            } else {
                                // 4. Last resort: split by word wrap
                                segments.push(...splitByWordWrap(p, 90));
                            }
                        });
                    }
                });
            });

            // --- Post-process: restore all protected chars ---
            return segments
                .map((s) => restoreAbbreviations(restoreRepeatedPunctuation(s)))
                .filter(Boolean);
        }

        default:
            return [script];
    }
}

/**
 * Estimate reading duration based on word count and scroll speed.
 * Average reading/speaking pace: ~130 words per minute for teleprompter.
 * scrollSpeed scale: 1 = 0.4 px/frame → at 60fps = 24 px/s
 *
 * Returns a human-readable string like "~2m 30s".
 */
export function estimateDuration(script: string, scrollSpeed: number): string {
    const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) return '0s';

    // Words per second based on scrollSpeed (heuristic calibrated to 60fps)
    // speed 1 = slowest (~80wpm), speed 10 = fastest (~200wpm)
    const wpm = 80 + (scrollSpeed - 1) * (120 / 9);
    const totalSeconds = Math.round((wordCount / wpm) * 60);

    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m === 0) return `~${s}s`;
    if (s === 0) return `~${m}m`;
    return `~${m}m ${s}s`;
}
