import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechToTextOptions, SpeechToTextState, SpeechRecognition } from '../types';
import { DEFAULT_LANGUAGE } from '../constants';

export function useSpeechToText(options: SpeechToTextOptions = {}) {
    const [state, setState] = useState<SpeechToTextState>({
        isListening: false,
        transcript: '',
        interimTranscript: '',
        error: null,
        isSupported: false, // Will be checked in useEffect
    });

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Use a ref for the transcript to avoid dependency cycles in callbacks
    const transcriptRef = useRef('');

    // Move this to the top and use function declaration for hoisting and clarity
    function setupEventListeners(recognition: SpeechRecognition) {
        recognition.onstart = () => {
            setState(prev => ({ ...prev, isListening: true }));
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscriptChunk = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptChunk += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscriptChunk) {
                // Append to our ref and update state
                // Add a space if needed to prevent words from merging
                const currentRef = transcriptRef.current;
                const prefix = currentRef && !currentRef.endsWith(' ') ? ' ' : '';
                transcriptRef.current = currentRef + prefix + finalTranscriptChunk;

                setState(prev => ({
                    ...prev,
                    transcript: transcriptRef.current,
                    interimTranscript
                }));
            } else {
                setState(prev => ({ ...prev, interimTranscript }));
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);

            let errorMessage = 'An error occurred during speech recognition.';

            if (event.error === 'not-allowed') {
                if (!window.isSecureContext) {
                    errorMessage = 'Speech recognition requires a secure connection (HTTPS). Please ensure your site is served over HTTPS or localhost.';
                } else {
                    errorMessage = 'Microphone access is blocked. Please click the lock icon (🔐) in your browser address bar and set Microphone to "Allow".';
                }
            } else if (event.error === 'no-speech') {
                return;
            } else if (event.error === 'aborted') {
                return;
            } else if (event.error === 'network') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else {
                errorMessage = `Error: ${event.error}`;
            }

            setState(prev => ({
                ...prev,
                isListening: false,
                error: errorMessage
            }));
        };

        recognition.onend = () => {
            setState(prev => ({ ...prev, isListening: false }));
        };
    }

    useEffect(() => {
        // innovative check for browser support
        const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
        setState(prev => ({ ...prev, isSupported }));

        if (isSupported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = options.continuous ?? true;
            recognition.interimResults = options.interimResults ?? true;
            recognition.lang = options.lang ?? DEFAULT_LANGUAGE;
            recognitionRef.current = recognition;
            setupEventListeners(recognition);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []); // Only run once on mount

    // Update language if options change
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = options.lang ?? DEFAULT_LANGUAGE;
        }
    }, [options.lang]);

    const startListening = useCallback(async () => {
        if (state.isListening) return;

        const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
        if (!isSupported) {
            setState(prev => ({ ...prev, isSupported: false, error: 'Speech recognition is not supported in this browser.' }));
            return;
        }

        // Force a permission prompt using the MediaDevices API if needed
        try {
            await window.navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            console.error("Microphone access denied via MediaDevices", err);
            setState(prev => ({
                ...prev,
                error: 'Microphone access is BLOCKED by your browser. Please click the LOCK icon (🔐) next to the URL and set Microphone to "Allow", then refresh the page.'
            }));
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = options.continuous ?? true;
        recognition.interimResults = options.interimResults ?? true;
        recognition.lang = options.lang ?? DEFAULT_LANGUAGE;

        recognitionRef.current = recognition;
        setupEventListeners(recognition);

        // Reset error state
        setState(prev => ({ ...prev, error: null }));

        try {
            recognition.start();
        } catch (error) {
            console.error("Speech recognition start failed", error);
            setState(prev => ({ ...prev, error: 'Failed to start speech recognition.' }));
        }
    }, [state.isListening, options.continuous, options.interimResults, options.lang]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current || !state.isListening) return;

        recognitionRef.current.stop();
    }, [state.isListening]);

    const resetTranscript = useCallback(() => {
        transcriptRef.current = '';
        setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
    }, []);

    const setTranscript = useCallback((newTranscript: string) => {
        transcriptRef.current = newTranscript;
        setState(prev => ({ ...prev, transcript: newTranscript }));
    }, []);

    return {
        ...state,
        startListening,
        stopListening,
        resetTranscript,
        setTranscript,
        setLanguage: (lang: string) => {
            if (recognitionRef.current) {
                recognitionRef.current.lang = lang;
            }
        }
    };
}
