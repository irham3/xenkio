"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Copy,
    AlertCircle,
    FileCode,
    FileText,
    Check,
    Trash2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

const URL_MODES = [
    { id: 'encode', name: 'Encoder', description: 'Convert text to URL-encoded format' },
    { id: 'decode', name: 'Decoder', description: 'Convert URL-encoded text back to standard text' }
] as const;

export default function UrlEncoderClient() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const processConversion = (text: string, currentMode: "encode" | "decode") => {
        if (!text) {
            setOutput("");
            setError(null);
            return;
        }

        try {
            setError(null);
            if (currentMode === "encode") {
                setOutput(encodeURIComponent(text));
            } else {
                setOutput(decodeURIComponent(text));
            }
        } catch {
            setError("Invalid URL format for decoding");
            setOutput("");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInput(value);
        processConversion(value, mode);
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied to clipboard!");
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
        setError(null);
    };

    const setModeAndProcess = (newMode: "encode" | "decode") => {
        setMode(newMode);
        processConversion(input, newMode);
    };

    const currentModeInfo = URL_MODES.find(m => m.id === mode);

    return (
        <div className="w-full">
            {/* Mode Switcher Tabs */}
            <div
                className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200"
                role="tablist"
                aria-label="URL Encoder mode selection"
            >
                {URL_MODES.map((m) => (
                    <button
                        key={m.id}
                        role="tab"
                        aria-selected={mode === m.id}
                        onClick={() => setModeAndProcess(m.id)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                            mode === m.id
                                ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        )}
                    >
                        {m.id === 'encode' ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        {m.name}
                    </button>
                ))}
            </div>

            {/* Main Tool Area */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-2 gap-0">

                    {/* LEFT PANEL: Input */}
                    <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                        <div className="space-y-4">
                            {/* Input Header */}
                            <div className="flex items-baseline justify-between">
                                <Label htmlFor="input-text" className="text-sm font-semibold text-gray-800">
                                    {mode === 'encode' ? 'Text to Encode' : 'URL to Decode'}
                                </Label>
                                <span className="text-xs text-gray-400 font-medium tabular-nums">
                                    {input.length} chars
                                </span>
                            </div>

                            {/* Input Textarea */}
                            <textarea
                                id="input-text"
                                value={input}
                                onChange={handleInputChange}
                                placeholder={mode === 'encode'
                                    ? "Type or paste text to encode..."
                                    : "Paste URL encoded text to decode..."
                                }
                                className="w-full min-h-[300px] p-4 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400 font-mono"
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                    disabled={!input}
                                    className="flex-1 gap-2 hover:text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </Button>
                            </div>

                            {/* Mode Description */}
                            <p className="text-xs text-gray-500 leading-relaxed pt-2">
                                {currentModeInfo?.description}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Output */}
                    <div className="p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[300px]">
                        <div className="flex flex-col h-full">
                            {/* Output Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    {mode === 'encode' ? 'Encoded Output' : 'Decoded Text'}
                                </h3>
                                {output && !error && (
                                    <span className="text-xs text-gray-400 font-medium tabular-nums">
                                        {output.length} chars
                                    </span>
                                )}
                            </div>

                            {/* Output Area */}
                            <div className="flex-1 relative group h-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={error ? 'error' : output ? 'output' : 'empty'}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                            "w-full h-full min-h-[300px] p-4 rounded-xl border font-mono text-[13px] leading-relaxed break-all transition-all duration-300",
                                            error
                                                ? "bg-red-50 border-red-200 text-red-600"
                                                : output
                                                    ? "bg-white border-gray-200 text-gray-700 shadow-sm"
                                                    : "bg-white/50 border-dashed border-gray-200 text-gray-400 is-empty"
                                        )}
                                    >
                                        {error ? (
                                            <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                                                <AlertCircle className="w-10 h-10 text-red-400" />
                                                <p className="font-semibold text-sm">Decoding Error</p>
                                                <p className="text-xs opacity-80 text-center max-w-[250px]">{error}</p>
                                            </div>
                                        ) : output ? (
                                            output
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full gap-3 py-8 opacity-50">
                                                {mode === 'encode' ? (
                                                    <FileCode className="w-10 h-10 text-gray-300" />
                                                ) : (
                                                    <FileText className="w-10 h-10 text-gray-300" />
                                                )}
                                                <p className="text-sm">
                                                    {mode === 'encode'
                                                        ? 'Enter text to see URL encoded output...'
                                                        : 'Enter URL to see decoded text...'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Copy Button */}
                                {output && !error && (
                                    <div className="absolute top-3 right-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCopy}
                                            className={cn(
                                                "h-8 gap-1.5 text-xs font-medium border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all cursor-pointer",
                                                copied && "text-green-600 border-green-500 bg-green-50"
                                            )}
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
