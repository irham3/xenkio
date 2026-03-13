import { useState, useEffect, useCallback, useRef } from 'react';
import { TextToSpeechState, TextToSpeechOptions } from '../types';
import { DEFAULT_LANGUAGE, DEFAULT_RATE, DEFAULT_PITCH, DEFAULT_VOLUME } from '../constants';

/** Delay (ms) after speech ends to capture any trailing audio before stopping the recorder */
const RECORDING_TAIL_DELAY_MS = 300;

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

        if (!navigator.mediaDevices?.getDisplayMedia) {
            setState(prev => ({
                ...prev,
                error: 'Audio download is not supported in your browser. Please try Chrome or Edge.',
            }));
            return;
        }

        setIsDownloading(true);
        setState(prev => ({ ...prev, error: null }));

        let displayStream: MediaStream | null = null;
        let audioStream: MediaStream | null = null;

        try {
            // Capture audio from the current browser tab
            displayStream = await navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: true, // Needed for browser compatibility; video track is stopped immediately
                preferCurrentTab: true, // Chrome 94+: auto-selects current tab
            } as DisplayMediaStreamOptions & { preferCurrentTab?: boolean });

            // Stop video tracks — we only need audio
            displayStream.getVideoTracks().forEach(track => track.stop());

            const audioTracks = displayStream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No audio track captured. Please share a tab with "Share tab audio" enabled.');
            }

            audioStream = new MediaStream(audioTracks);
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';
            const recorder = new MediaRecorder(audioStream, { mimeType });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
                a.download = `speech-${timestamp}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                audioStream?.getTracks().forEach(track => track.stop());
                setIsDownloading(false);
            };

            // Start recording before speaking
            recorder.start();

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

            utterance.onend = () => {
                setTimeout(() => {
                    if (recorder.state === 'recording') {
                        recorder.stop();
                    }
                }, RECORDING_TAIL_DELAY_MS);
            };

            utterance.onerror = (event) => {
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
                audioStream?.getTracks().forEach(track => track.stop());
                if (event.error !== 'canceled') {
                    setState(prev => ({
                        ...prev,
                        error: `Speech error: ${event.error}`,
                    }));
                }
                setIsDownloading(false);
            };

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            displayStream?.getTracks().forEach(track => track.stop());
            audioStream?.getTracks().forEach(track => track.stop());
            const message = err instanceof Error ? err.message : 'Failed to download audio';
            setState(prev => ({
                ...prev,
                error: message.includes('denied') || message.includes('NotAllowed')
                    ? 'Permission denied. Please allow tab audio sharing to record the speech.'
                    : message,
            }));
            setIsDownloading(false);
        }
    }, [options.lang, options.rate, options.pitch, options.volume, options.voice]);

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
