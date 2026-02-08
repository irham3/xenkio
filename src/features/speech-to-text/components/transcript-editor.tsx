"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

interface TranscriptEditorProps {
    transcript: string;
    interimTranscript: string;
    onChange: (value: string) => void;
    onClear: () => void;
    isListening: boolean;
}

export function TranscriptEditor({
    transcript,
    interimTranscript,
    onChange,
    onClear,
    isListening,
}: TranscriptEditorProps) {
    const [value, setValue] = useState(transcript);
    const [copied, setCopied] = useState(false);

    // Sync internal state with prop changes (when transcript updates from speech)
    useEffect(() => {
        setValue(transcript);
    }, [transcript]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success("Transcript copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy transcript");
        }
    };

    const handleDownload = () => {
        const blob = new Blob([value], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transcript-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Transcript downloaded");
    };

    const handleClear = () => {
        if (confirm("Are you sure you want to clear the transcript?")) {
            setValue("");
            onClear();
            toast.info("Transcript cleared");
        }
    };

    return (
        <div className="space-y-4 w-full bg-card p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transcript</h3>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!value}
                    >
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        disabled={!value}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={!value}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </div>
            </div>

            <div className="relative min-h-[300px]">
                <Textarea
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        onChange(e.target.value);
                    }}
                    placeholder="Your speech will appear here..."
                    className="min-h-[300px] text-lg leading-relaxed resize-none p-4 font-normal"
                />
                {isListening && interimTranscript && (
                    <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                        <span className="text-muted-foreground italic bg-background/80 px-2 py-1 rounded">
                            {interimTranscript}
                        </span>
                    </div>
                )}
            </div>
            <div className="text-xs text-muted-foreground text-right">
                {value.length} characters | {value.split(/\s+/).filter(Boolean).length} words
            </div>
        </div>
    );
}
