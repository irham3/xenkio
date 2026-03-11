"use client";

import { motion } from "framer-motion";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpeechControlsProps {
    isSpeaking: boolean;
    isPaused: boolean;
    isSupported: boolean;
    hasText: boolean;
    onPlay: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
}

export function SpeechControls({
    isSpeaking,
    isPaused,
    isSupported,
    hasText,
    onPlay,
    onPause,
    onResume,
    onStop,
}: SpeechControlsProps) {
    if (!isSupported) {
        return (
            <div className="p-6 text-center border rounded-lg bg-destructive/10 text-destructive">
                <p className="font-medium">Browser Not Supported</p>
                <p className="text-sm mt-1">
                    Text to speech is not supported in this browser. Please try Chrome, Edge, or Safari.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-8">
            <div className="relative">
                {/* Pulse Animation Rings */}
                {isSpeaking && !isPaused && (
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
                    onClick={() => {
                        if (isSpeaking && !isPaused) {
                            onPause();
                        } else if (isPaused) {
                            onResume();
                        } else {
                            onPlay();
                        }
                    }}
                    disabled={!hasText && !isSpeaking}
                    className={cn(
                        "h-32 w-32 rounded-full relative z-0 transition-all duration-300 shadow-2xl border-4 border-white/20",
                        isSpeaking && !isPaused
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : isPaused
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                >
                    {isSpeaking && !isPaused ? (
                        <Pause className="h-16 w-16" />
                    ) : (
                        <Play className="h-16 w-16 ml-2" />
                    )}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                {isSpeaking && (
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onStop}
                        className="gap-2"
                    >
                        <Square className="h-5 w-5" />
                        Stop
                    </Button>
                )}
            </div>

            <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                    {isSpeaking && !isPaused
                        ? "Speaking..."
                        : isPaused
                          ? "Paused"
                          : "Ready to Speak"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    {isSpeaking && !isPaused
                        ? "Click to pause the speech"
                        : isPaused
                          ? "Click to resume speaking"
                          : "Enter text and click play to start"}
                </p>
            </div>
        </div>
    );
}
