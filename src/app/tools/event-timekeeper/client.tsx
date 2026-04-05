'use client';

import {
    useEventTimekeeper,
    ActiveDisplay,
    EventList,
    ImportExport,
    FocusMode,
    TimekeeperSettings,
} from '@/features/event-timekeeper';
import { Maximize2, Clock, CalendarRange } from 'lucide-react';

export function EventTimekeeperClient() {
    const {
        state,
        config,
        items,
        activeEvent,
        nextEvent,
        remainingSeconds,
        totalDurationMinutes,
        estimatedEndTime,
        startSchedule,
        pause,
        resume,
        stop,
        advanceNext,
        goToPrevious,
        jumpTo,
        addEvent,
        removeEvent,
        updateEvent,
        reorderEvents,
        adjustDuration,
        importEvents,
        updateConfig,
        toggleFocusMode,
    } = useEventTimekeeper();

    // Focus Mode Overlay
    if (state.isFocusMode) {
        return (
            <FocusMode
                activeEvent={activeEvent}
                nextEvent={nextEvent}
                remainingSeconds={remainingSeconds}
                isPaused={state.isPaused}
                warningThreshold={config.warningThresholdMinutes}
                criticalThreshold={config.criticalThresholdMinutes}
                onToggleFocus={toggleFocusMode}
                onPause={pause}
                onResume={resume}
                onNext={advanceNext}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Active Display */}
            <ActiveDisplay
                activeEvent={activeEvent}
                nextEvent={nextEvent}
                remainingSeconds={remainingSeconds}
                isRunning={state.isRunning}
                isPaused={state.isPaused}
                warningThreshold={config.warningThresholdMinutes}
                criticalThreshold={config.criticalThresholdMinutes}
                onStart={startSchedule}
                onPause={pause}
                onResume={resume}
                onStop={stop}
                onNext={advanceNext}
                onPrevious={goToPrevious}
            />

            {/* Focus Mode Button */}
            {state.isRunning && (
                <div className="flex justify-center">
                    <button
                        onClick={toggleFocusMode}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:text-primary-600 hover:border-primary-300 transition-colors bg-white"
                    >
                        <Maximize2 className="w-4 h-4" />
                        Presenter Focus Mode
                    </button>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Schedule */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <CalendarRange className="w-4 h-4 text-primary-500" />
                                Schedule
                            </h2>
                            <ImportExport items={items} onImport={importEvents} />
                        </div>

                        <EventList
                            schedule={state.events}
                            items={items}
                            activeIndex={state.activeIndex}
                            isRunning={state.isRunning}
                            onReorder={reorderEvents}
                            onAddEvent={addEvent}
                            onRemoveEvent={removeEvent}
                            onUpdateEvent={updateEvent}
                            onAdjustDuration={adjustDuration}
                            onJumpTo={jumpTo}
                        />
                    </div>
                </div>

                {/* Settings */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <TimekeeperSettings
                            config={config}
                            onChange={updateConfig}
                            totalDuration={totalDurationMinutes}
                            estimatedEnd={estimatedEndTime}
                        />
                    </div>

                    {/* Quick Info */}
                    <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                        <div className="flex gap-3">
                            <Clock className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-primary-700 leading-relaxed space-y-1">
                                <p><strong>Tips:</strong></p>
                                <ul className="list-disc list-inside text-xs space-y-0.5 text-primary-600">
                                    <li>Double-click a session to edit inline</li>
                                    <li>Drag sessions to reorder</li>
                                    <li>Import from CSV or Excel</li>
                                    <li>Use Focus Mode for presenters</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
