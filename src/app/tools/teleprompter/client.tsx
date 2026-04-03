'use client';

import { useCallback } from 'react';
import { useTeleprompter } from '@/features/teleprompter/hooks/use-teleprompter';
import { TeleprompterSetup } from '@/features/teleprompter/components/teleprompter-setup';
import { TeleprompterDisplay } from '@/features/teleprompter/components/teleprompter-display';
import { ReadingDisplay } from '@/features/teleprompter/components/reading-display';

export default function TeleprompterClient() {
    const {
        config,
        state,
        scrollRef,
        updateConfig,
        startTeleprompter,
        startReading,
        backToSetup,
        togglePlay,
        resetScroll,
        onScroll,
        goNext,
        goPrev,
        toggleFullscreen,
    } = useTeleprompter();

    const handleFontSizeChange = useCallback(
        (delta: number) => {
            updateConfig({ fontSize: Math.min(120, Math.max(20, config.fontSize + delta)) });
        },
        [config.fontSize, updateConfig],
    );

    const handleSpeedChange = useCallback(
        (delta: number) => {
            updateConfig({ scrollSpeed: Math.min(10, Math.max(1, config.scrollSpeed + delta)) });
        },
        [config.scrollSpeed, updateConfig],
    );

    if (config.mode === 'teleprompter') {
        return (
            <TeleprompterDisplay
                config={config}
                state={state}
                scrollRef={scrollRef}
                onTogglePlay={togglePlay}
                onReset={resetScroll}
                onBack={backToSetup}
                onScroll={onScroll}
                onToggleFullscreen={toggleFullscreen}
                onFontSizeChange={handleFontSizeChange}
                onSpeedChange={handleSpeedChange}
            />
        );
    }

    if (config.mode === 'reading') {
        return (
            <ReadingDisplay
                config={config}
                state={state}
                onNext={goNext}
                onPrev={goPrev}
                onBack={backToSetup}
                onToggleFullscreen={toggleFullscreen}
                onFontSizeChange={handleFontSizeChange}
            />
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Teleprompter</h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    Baca naskah dengan mudah — mode teleprompter gulir otomatis atau mode baca dengan
                    navigasi next/prev.
                </p>
            </div>
            <TeleprompterSetup
                config={config}
                updateConfig={updateConfig}
                onStartTeleprompter={startTeleprompter}
                onStartReading={startReading}
            />
        </div>
    );
}
