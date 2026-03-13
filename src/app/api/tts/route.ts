import { NextResponse } from 'next/server';

const MAX_CHUNK_LENGTH = 200;

function splitText(text: string): string[] {
    const chunks: string[] = [];
    let remaining = text.trim();

    while (remaining.length > 0) {
        if (remaining.length <= MAX_CHUNK_LENGTH) {
            chunks.push(remaining);
            break;
        }

        let splitAt = -1;
        // Try to split at sentence boundaries first
        for (const sep of ['. ', '! ', '? ', '; ']) {
            const idx = remaining.lastIndexOf(sep, MAX_CHUNK_LENGTH);
            if (idx > 0) {
                splitAt = idx + 1;
                break;
            }
        }

        // Fall back to comma or space
        if (splitAt === -1) {
            splitAt = remaining.lastIndexOf(', ', MAX_CHUNK_LENGTH);
            if (splitAt > 0) splitAt += 1;
        }
        if (splitAt <= 0) {
            splitAt = remaining.lastIndexOf(' ', MAX_CHUNK_LENGTH);
        }
        if (splitAt <= 0) {
            splitAt = MAX_CHUNK_LENGTH;
        }

        chunks.push(remaining.substring(0, splitAt).trim());
        remaining = remaining.substring(splitAt).trim();
    }

    return chunks;
}

export async function POST(request: Request) {
    try {
        const { text, lang } = await request.json();

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        const ttsLang = (lang || 'en-US').toLowerCase();
        const chunks = splitText(text);
        const audioBuffers: ArrayBuffer[] = [];

        for (const chunk of chunks) {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(ttsLang)}&q=${encodeURIComponent(chunk)}&client=tw-ob`;

            const response = await fetch(ttsUrl, {
                headers: {
                    'Referer': 'https://translate.google.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            });

            if (!response.ok) {
                return NextResponse.json(
                    { error: 'Failed to generate audio. Please try again later.' },
                    { status: 502 }
                );
            }

            const buffer = await response.arrayBuffer();
            audioBuffers.push(buffer);
        }

        // Concatenate all audio chunks
        const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const buf of audioBuffers) {
            combined.set(new Uint8Array(buf), offset);
            offset += buf.byteLength;
        }

        return new NextResponse(combined.buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'attachment; filename="speech.mp3"',
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
