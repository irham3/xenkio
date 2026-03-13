import { useState, useEffect, useCallback, useRef } from 'react';
import { TextToSpeechState, TextToSpeechOptions } from '../types';
import { DEFAULT_LANGUAGE, DEFAULT_RATE, DEFAULT_PITCH, DEFAULT_VOLUME } from '../constants';

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
    const [state, setState] = useState<TextToSpeechState>({
        isSpeaking: false,
        isPaused: false,
        isSupported: false,
        error: null,
        currentCharIndex: 0,
        voices: [],
    });
    const [isDownloading, setIsDownloading] = useState(false);

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Check browser support and load voices
    useEffect(() => {
        const isSupported = 'speechSynthesis' in window;
        const rafId = requestAnimationFrame(() => {
            setState(prev => ({ ...prev, isSupported }));
        });

        if (!isSupported) {
            return () => cancelAnimationFrame(rafId);
        }

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setState(prev => ({ ...prev, voices: availableVoices }));
            }
        };

        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            cancelAnimationFrame(rafId);
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = useCallback((text: string) => {
        if (!text.trim()) {
            setState(prev => ({ ...prev, error: 'Please enter some text to speak.' }));
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang ?? DEFAULT_LANGUAGE;
        utterance.rate = options.rate ?? DEFAULT_RATE;
        utterance.pitch = options.pitch ?? DEFAULT_PITCH;
        utterance.volume = options.volume ?? DEFAULT_VOLUME;

        if (options.voice) {
            utterance.voice = options.voice;
        }

        utterance.onstart = () => {
            setState(prev => ({ ...prev, isSpeaking: true, isPaused: false, error: null }));
        };

        utterance.onend = () => {
            setState(prev => ({ ...prev, isSpeaking: false, isPaused: false, currentCharIndex: 0 }));
        };

        utterance.onerror = (event) => {
            if (event.error === 'canceled') return;
            setState(prev => ({
                ...prev,
                isSpeaking: false,
                isPaused: false,
                error: `Speech synthesis error: ${event.error}`,
            }));
        };

        utterance.onboundary = (event) => {
            setState(prev => ({ ...prev, currentCharIndex: event.charIndex }));
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [options.lang, options.rate, options.pitch, options.volume, options.voice]);

    const pause = useCallback(() => {
        if (!state.isSpeaking || state.isPaused) return;
        window.speechSynthesis.pause();
        setState(prev => ({ ...prev, isPaused: true }));
    }, [state.isSpeaking, state.isPaused]);

    const resume = useCallback(() => {
        if (!state.isPaused) return;
        window.speechSynthesis.resume();
        setState(prev => ({ ...prev, isPaused: false }));
    }, [state.isPaused]);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setState(prev => ({ ...prev, isSpeaking: false, isPaused: false, currentCharIndex: 0 }));
    }, []);

    const downloadAudio = useCallback(async (text: string) => {
        if (!text.trim()) {
            setState(prev => ({ ...prev, error: 'Please enter some text to download.' }));
            return;
        }

        setIsDownloading(true);
        setState(prev => ({ ...prev, error: null }));

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    lang: options.lang ?? DEFAULT_LANGUAGE,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Failed to generate audio');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'speech.mp3';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Failed to download audio',
            }));
        } finally {
            setIsDownloading(false);
        }
    }, [options.lang]);

    return {
        ...state,
        isDownloading,
        speak,
        pause,
        resume,
        stop,
        downloadAudio,
    };
}
