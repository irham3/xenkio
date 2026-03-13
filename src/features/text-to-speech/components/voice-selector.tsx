"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface VoiceSelectorProps {
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    onChange: (voice: SpeechSynthesisVoice | null) => void;
    language: string;
    disabled?: boolean;
}

export function VoiceSelector({
    voices,
    selectedVoice,
    onChange,
    language,
    disabled,
}: VoiceSelectorProps) {
    const filteredVoices = voices.filter((v) => v.lang.startsWith(language.split('-')[0]));
    const displayVoices = filteredVoices.length > 0 ? filteredVoices : voices;

    if (displayVoices.length === 0) {
        return (
            <div className="w-full">
                <label className="text-sm font-medium mb-1.5 block">
                    Voice
                </label>
                <p className="text-sm text-muted-foreground">
                    No voices available. Your browser will use the default voice.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <label className="text-sm font-medium mb-1.5 block">
                Voice
            </label>
            <Select
                value={selectedVoice?.name ?? ""}
                onValueChange={(name) => {
                    const voice = voices.find((v) => v.name === name) ?? null;
                    onChange(voice);
                }}
                disabled={disabled}
            >
                <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Default voice" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-950 border shadow-xl z-[100] min-w-[200px] max-h-[300px]">
                    {displayVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                            {voice.name}
                            {voice.default && " (Default)"}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
