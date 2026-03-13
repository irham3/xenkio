"use client";

import { useState } from "react";
import { useTextToSpeech } from "@/features/text-to-speech/hooks/use-text-to-speech";
import { SpeechControls } from "@/features/text-to-speech/components/speech-controls";
import { TextInput } from "@/features/text-to-speech/components/text-input";
import { LanguageSelector } from "@/features/text-to-speech/components/language-selector";
import { VoiceSelector } from "@/features/text-to-speech/components/voice-selector";
import { SpeechSettings } from "@/features/text-to-speech/components/speech-settings";
import { DEFAULT_LANGUAGE, DEFAULT_RATE, DEFAULT_PITCH } from "@/features/text-to-speech/constants";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function TextToSpeechClient() {
    const [text, setText] = useState("");
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [rate, setRate] = useState(DEFAULT_RATE);
    const [pitch, setPitch] = useState(DEFAULT_PITCH);

    const {
        isSpeaking,
        isPaused,
        isSupported,
        isDownloading,
        error,
        voices,
        speak,
        pause,
        resume,
        stop,
        downloadAudio,
    } = useTextToSpeech({ lang: language, rate, pitch, voice: selectedVoice });

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        setSelectedVoice(null);
        if (isSpeaking) stop();
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Text to Speech
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Convert your text into natural-sounding speech instantly.
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-8 md:grid-cols-[300px_1fr]">
                <div className="space-y-6">
                    <Card className="p-6 space-y-5">
                        <LanguageSelector
                            value={language}
                            onChange={handleLanguageChange}
                            disabled={isSpeaking}
                        />
                        <VoiceSelector
                            voices={voices}
                            selectedVoice={selectedVoice}
                            onChange={setSelectedVoice}
                            language={language}
                            disabled={isSpeaking}
                        />
                    </Card>

                    <Card className="p-6">
                        <SpeechSettings
                            rate={rate}
                            pitch={pitch}
                            onRateChange={setRate}
                            onPitchChange={setPitch}
                            disabled={isSpeaking && !isPaused}
                        />
                    </Card>

                    <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                        <h4 className="font-semibold mb-2 text-foreground">Tips:</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Adjust speed and pitch before playing</li>
                            <li>Try different voices for the selected language</li>
                            <li>Use punctuation for natural pauses</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    <TextInput
                        value={text}
                        onChange={setText}
                        disabled={isSpeaking && !isPaused}
                    />

                    <Card className="p-6">
                        <SpeechControls
                            isSpeaking={isSpeaking}
                            isPaused={isPaused}
                            isSupported={isSupported}
                            isDownloading={isDownloading}
                            hasText={text.trim().length > 0}
                            onPlay={() => speak(text)}
                            onPause={pause}
                            onResume={resume}
                            onStop={stop}
                            onDownload={() => downloadAudio(text)}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
