'use client';

import { PomodoroTimer } from '@/features/pomodoro-timer/components/pomodoro-timer';
import { Card } from '@/components/ui/card';

export function PomodoroClient() {
    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-4 md:px-6">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Pomodoro <span className="text-primary-600">Timer</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    Boost your productivity with our advanced Pomodoro Timer. Stay focused, track your sessions, and take breaks efficiently.
                </p>
            </div>

            <Card className="p-8 md:p-12 shadow-large bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl">
                <PomodoroTimer />
            </Card>


        </div>
    );
}
