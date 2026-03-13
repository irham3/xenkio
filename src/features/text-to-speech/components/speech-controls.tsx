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
        <div className="space-y-4">
            <div className="relative">
                {/* Subtle pulse animation while speaking to indicate active playback */}
                {isSpeaking && !isPaused && (
                    <motion.div
                        initial={{ opacity: 0.25 }}
                        animate={{ opacity: [0.2, 0.45, 0.2] }}
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-xl bg-primary/20"
                    />
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
                        "relative z-10 h-14 w-full rounded-xl text-base font-semibold transition-all duration-300 shadow-sm gap-2",
                        isSpeaking && !isPaused
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : isPaused
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                >
                    {isSpeaking && !isPaused ? (
                        <>
                            <Pause className="h-5 w-5" />
                            Pause Speech
                        </>
                    ) : isPaused ? (
                        <>
                            <Play className="h-5 w-5" />
                            Resume Speech
                        </>
                    ) : (
                        <>
                            <Play className="h-5 w-5" />
                            Play Speech
                        </>
                    )}
                </Button>
            </div>

            {isSpeaking && (
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onStop}
                    className="w-full h-12 gap-2"
                >
                    <Square className="h-5 w-5" />
                    Stop
                </Button>
            )}

            <div className="space-y-1 text-center">
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
