"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function TextInput({ value, onChange, disabled }: TextInputProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success("Text copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy text");
        }
    };

    const handleClear = () => {
        onChange("");
        toast.info("Text cleared");
    };

    return (
        <div className="space-y-4 w-full bg-card p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Text</h3>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!value}
                    >
                        {copied ? (
                            <Check className="h-4 w-4 mr-2" />
                        ) : (
                            <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? "Copied" : "Copy"}
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

            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type or paste your text here..."
                className="min-h-[300px] text-lg leading-relaxed resize-none p-4 font-normal"
                disabled={disabled}
            />

            <div className="text-xs text-muted-foreground text-right">
                {value.length} characters | {value.split(/\s+/).filter(Boolean).length} words
            </div>
        </div>
    );
}
