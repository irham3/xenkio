"use client";

import { useState } from "react";
import { useSpeechToText } from "@/features/speech-to-text/hooks/use-speech-to-text";
import { MicrophoneControl } from "@/features/speech-to-text/components/microphone-control";
import { TranscriptEditor } from "@/features/speech-to-text/components/transcript-editor";
import { LanguageSelector } from "@/features/speech-to-text/components/language-selector";
import { DEFAULT_LANGUAGE } from "@/features/speech-to-text/constants";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SpeechToTextClient() {
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        setTranscript,
        isSupported,
        error,
    } = useSpeechToText({ lang: language });

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Speech to Text
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Convert your voice into text instantly.
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
                    <Card className="p-6">
                        <LanguageSelector
                            value={language}
                            onChange={setLanguage}
                            disabled={isListening}
                        />
                    </Card>

                    <Card className="p-6">
                        <MicrophoneControl
                            isListening={isListening}
                            onToggle={toggleListening}
                            isSupported={isSupported}
                        />
                    </Card>

                    <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                        <h4 className="font-semibold mb-2 text-foreground">Tips:</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Speak clearly and at a normal pace</li>
                            <li>Ensure your microphone is connected</li>
                            <li>Use a quiet environment for best results</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    <TranscriptEditor
                        transcript={transcript}
                        interimTranscript={interimTranscript}
                        isListening={isListening}
                        onChange={setTranscript}
                        onClear={resetTranscript}
                    />
                </div>
            </div>
        </div>
    );
}
