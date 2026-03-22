'use client';

import { useRunningText } from '@/features/running-text/hooks/use-running-text';
import { RunningTextDisplay } from '@/features/running-text/components/running-text-display';
import { RunningTextControls } from '@/features/running-text/components/running-text-controls';

export default function RunningTextClient() {
    const { config, isFullscreen, updateConfig, resetConfig, toggleFullscreen } =
        useRunningText();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            {/* Preview + Display */}
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <RunningTextDisplay
                        config={config}
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={toggleFullscreen}
                    />
                </div>
                <p className="text-xs text-gray-400 text-center">
                    Click the{' '}
                    <span className="font-semibold">⛶ fullscreen</span> icon in the top-right
                    corner of the display to go fullscreen. Press{' '}
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 border border-gray-200">
                        Esc
                    </kbd>{' '}
                    to exit.
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-fit">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Customize</h2>
                <RunningTextControls
                    config={config}
                    updateConfig={updateConfig}
                    onReset={resetConfig}
                />
            </div>
        </div>
    );
}
