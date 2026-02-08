"use client";

import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MicrophoneControlProps {
    isListening: boolean;
    onToggle: () => void;
    isSupported: boolean;
}

export function MicrophoneControl({
    isListening,
    onToggle,
    isSupported,
}: MicrophoneControlProps) {
    if (!isSupported) {
        return (
            <div className="p-6 text-center border rounded-lg bg-destructive/10 text-destructive">
                <p className="font-medium">Browser Not Supported</p>
                <p className="text-sm mt-1">
                    Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-8">
            <div className="relative">
                {/* Pulse Animation Rings */}
                {isListening && (
                    <>
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                            className="absolute inset-0 bg-primary/20 rounded-full"
                        />
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: 0.5,
                            }}
                            className="absolute inset-0 bg-primary/20 rounded-full"
                        />
                    </>
                )}

                <Button
                    size="lg"
                    onClick={onToggle}
                    className={cn(
                        "h-32 w-32 rounded-full relative z-0 transition-all duration-300 shadow-2xl border-4 border-white/20",
                        isListening
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                >
                    {isListening ? (
                        <MicOff className="h-16 w-16" />
                    ) : (
                        <Mic className="h-16 w-16" />
                    )}
                </Button>
            </div>

            <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                    {isListening ? "Listening..." : "Tap to Speak"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    {isListening
                        ? "Speak clearly into your microphone"
                        : "Click the microphone button to start dictation"}
                </p>
            </div>
        </div>
    );
}
