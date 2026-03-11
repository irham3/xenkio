export type TextToSpeechState = {
    isSpeaking: boolean;
    isPaused: boolean;
    isSupported: boolean;
    error: string | null;
    currentCharIndex: number;
    voices: SpeechSynthesisVoice[];
};

export type TextToSpeechOptions = {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice | null;
};
