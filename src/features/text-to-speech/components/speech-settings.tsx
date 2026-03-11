"use client";

import { Slider } from "@/components/ui/slider";
import {
    DEFAULT_RATE,
    DEFAULT_PITCH,
    MIN_RATE,
    MAX_RATE,
    RATE_STEP,
    MIN_PITCH,
    MAX_PITCH,
    PITCH_STEP,
} from "../constants";

interface SpeechSettingsProps {
    rate: number;
    pitch: number;
    onRateChange: (value: number) => void;
    onPitchChange: (value: number) => void;
    disabled?: boolean;
}

export function SpeechSettings({
    rate,
    pitch,
    onRateChange,
    onPitchChange,
    disabled,
}: SpeechSettingsProps) {
    return (
        <div className="space-y-5">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Speed</label>
                    <span className="text-sm text-muted-foreground">{rate.toFixed(1)}x</span>
                </div>
                <Slider
                    value={[rate]}
                    onValueChange={([v]) => onRateChange(v)}
                    min={MIN_RATE}
                    max={MAX_RATE}
                    step={RATE_STEP}
                    disabled={disabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slow</span>
                    <button
                        type="button"
                        className="hover:text-foreground transition-colors"
                        onClick={() => onRateChange(DEFAULT_RATE)}
                    >
                        Reset
                    </button>
                    <span>Fast</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Pitch</label>
                    <span className="text-sm text-muted-foreground">{pitch.toFixed(1)}</span>
                </div>
                <Slider
                    value={[pitch]}
                    onValueChange={([v]) => onPitchChange(v)}
                    min={MIN_PITCH}
                    max={MAX_PITCH}
                    step={PITCH_STEP}
                    disabled={disabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <button
                        type="button"
                        className="hover:text-foreground transition-colors"
                        onClick={() => onPitchChange(DEFAULT_PITCH)}
                    >
                        Reset
                    </button>
                    <span>High</span>
                </div>
            </div>
        </div>
    );
}
