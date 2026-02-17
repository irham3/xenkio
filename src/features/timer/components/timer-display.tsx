import { cn } from '@/lib/utils';

interface TimerDisplayProps {
    remainingTime: number;
    initialDuration: number;
    isPaused: boolean;
}

export function TimerDisplay({ remainingTime, initialDuration, isPaused }: TimerDisplayProps) {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    const percentage = initialDuration > 0 ? (remainingTime / initialDuration) * 100 : 0;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = ((100 - percentage) / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Progress Circle Background */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className="stroke-gray-100 fill-none"
                        strokeWidth="4"
                    />
                    {/* Progress Circle Foreground */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className={cn(
                            "stroke-primary-500 fill-none transition-all duration-1000 ease-linear",
                            remainingTime === 0 && "stroke-success-500",
                            isPaused && "stroke-amber-400"
                        )}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Timer Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={cn(
                        "text-6xl md:text-7xl font-mono font-bold tracking-tighter transition-colors",
                        remainingTime === 0 ? "text-success-600" : isPaused ? "text-amber-600" : "text-gray-900"
                    )}>
                        {hours > 0 && <span>{String(hours).padStart(2, '0')}:</span>}
                        <span>{String(minutes).padStart(2, '0')}</span>:
                        <span>{String(seconds).padStart(2, '0')}</span>
                    </div>
                    {remainingTime === 0 && (
                        <div className="mt-2 text-success-600 font-semibold animate-bounce">
                            Time&apos;s up!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
