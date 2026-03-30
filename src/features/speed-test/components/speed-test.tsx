'use client';

import { Download, Upload, Wifi, RotateCcw, Play, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSpeedTest } from '../hooks/use-speed-test';
import { formatSpeed, getSpeedRating, getPingRating, getJitterRating } from '../lib/speed-utils';
import type { SpeedTestPhase } from '../types';

// ─── Circular gauge ──────────────────────────────────────────────────────────

interface GaugeProps {
    value: number | null;
    maxValue: number;
    size?: number;
    strokeWidth?: number;
    color: string;
    label: string;
    unit: string;
    isActive?: boolean;
    progress?: number;
}

function SpeedGauge({
    value,
    maxValue,
    size = 200,
    strokeWidth = 14,
    color,
    label,
    unit,
    isActive = false,
    progress = 0,
}: GaugeProps) {
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    // Only render 270° arc (from 135° to 405°)
    const arcAngle = 270;
    const circumference = (arcAngle / 360) * 2 * Math.PI * radius;

    const valueFraction = value !== null ? Math.min(value / maxValue, 1) : 0;
    const progressFraction = isActive ? progress / 100 : valueFraction;

    const dashOffset = circumference * (1 - progressFraction);

    // Convert start/end angles to SVG coords
    const startAngle = 135;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const polarToCartesian = (angle: number) => ({
        x: center + radius * Math.cos(toRad(angle)),
        y: center + radius * Math.sin(toRad(angle)),
    });

    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(startAngle + arcAngle - 0.01);

    const arcPath = [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`,
    ].join(' ');

    const displayValue = value !== null ? value : 0;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="overflow-visible">
                    {/* Track */}
                    <path
                        d={arcPath}
                        fill="none"
                        stroke="#E4E4E7"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                    {/* Progress */}
                    <path
                        d={arcPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            transition: 'stroke-dashoffset 0.4s ease',
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pb-6">
                    {isActive ? (
                        <>
                            <p className={cn('text-3xl font-black font-mono leading-none', 'text-gray-900')}>
                                {displayValue >= 100
                                    ? Math.round(displayValue)
                                    : displayValue.toFixed(1)}
                            </p>
                            <p className="text-xs font-semibold text-gray-400 mt-1">{unit}</p>
                        </>
                    ) : value !== null ? (
                        <>
                            <p className={cn('text-3xl font-black font-mono leading-none', 'text-gray-900')}>
                                {displayValue >= 100
                                    ? Math.round(displayValue)
                                    : displayValue.toFixed(1)}
                            </p>
                            <p className="text-xs font-semibold text-gray-400 mt-1">{unit}</p>
                        </>
                    ) : (
                        <p className="text-2xl font-black text-gray-300">—</p>
                    )}
                </div>
            </div>

            <p className="text-sm font-semibold text-gray-600">{label}</p>
        </div>
    );
}

// ─── Phase label ──────────────────────────────────────────────────────────────

function phaseLabel(phase: SpeedTestPhase): string {
    switch (phase) {
        case 'ping': return 'Measuring latency…';
        case 'download': return 'Testing download speed…';
        case 'upload': return 'Testing upload speed…';
        case 'complete': return 'Test complete';
        case 'error': return 'Test failed';
        default: return 'Ready to test';
    }
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

interface StatPillProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    ratingLabel: string;
    ratingColor: string;
    ratingBg: string;
}

function StatPill({ icon, label, value, ratingLabel, ratingColor, ratingBg }: StatPillProps) {
    return (
        <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-lg font-black font-mono text-gray-900 leading-tight">{value}</p>
            </div>
            {ratingLabel !== '—' && (
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', ratingColor, ratingBg)}>
                    {ratingLabel}
                </span>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SpeedTest() {
    const { state, runTest, reset } = useSpeedTest();
    const { phase, result, progress, liveValue } = state;

    const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';
    const isDone = phase === 'complete';
    const isError = phase === 'error';

    const downloadRating = getSpeedRating(result.download);
    const uploadRating = getSpeedRating(result.upload);
    const pingRating = getPingRating(result.ping);
    const jitterRating = getJitterRating(result.jitter);

    // Dynamic values for the gauge while test is active
    const downloadGaugeValue = phase === 'download'
        ? (liveValue ?? 0)
        : (result.download ?? 0);

    const uploadGaugeValue = phase === 'upload'
        ? (liveValue ?? 0)
        : (result.upload ?? 0);

    return (
        <div className="space-y-6">
            {/* Main test card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
                <div className="p-6 md:p-10 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className={cn(
                            'text-sm font-semibold transition-colors',
                            isRunning ? 'text-primary-600' : isDone ? 'text-success-600' : isError ? 'text-error-600' : 'text-gray-400',
                        )}>
                            {phaseLabel(phase)}
                        </p>

                        {/* Phase progress bar */}
                        {isRunning && (
                            <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Gauges */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16">
                        <SpeedGauge
                            value={downloadGaugeValue}
                            maxValue={1000}
                            color="#0284C7"
                            label="Download"
                            unit="Mbps"
                            isActive={phase === 'download'}
                            progress={progress}
                            size={190}
                        />

                        {/* Ping center display */}
                        <div className="flex flex-col items-center gap-3">
                            <div className={cn(
                                'w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center transition-all',
                                isRunning ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-gray-50',
                            )}>
                                {phase === 'ping' ? (
                                    <>
                                        <p className="text-xl font-black font-mono text-gray-900 leading-none">
                                            {liveValue !== null ? Math.round(liveValue) : '…'}
                                        </p>
                                        <p className="text-[10px] font-semibold text-gray-400 mt-0.5">ms</p>
                                    </>
                                ) : result.ping !== null ? (
                                    <>
                                        <p className="text-xl font-black font-mono text-gray-900 leading-none">
                                            {result.ping}
                                        </p>
                                        <p className="text-[10px] font-semibold text-gray-400 mt-0.5">ms</p>
                                    </>
                                ) : (
                                    <Wifi className="w-7 h-7 text-gray-300" />
                                )}
                            </div>
                            <p className="text-sm font-semibold text-gray-600">Ping</p>
                        </div>

                        <SpeedGauge
                            value={uploadGaugeValue}
                            maxValue={1000}
                            color="#F97316"
                            label="Upload"
                            unit="Mbps"
                            isActive={phase === 'upload'}
                            progress={progress}
                            size={190}
                        />
                    </div>

                    {/* Error state */}
                    {isError && (
                        <div className="flex items-start gap-3 bg-error-50 border border-error-200 rounded-xl p-4 max-w-md mx-auto">
                            <AlertTriangle className="w-5 h-5 text-error-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-error-700">{state.error}</p>
                        </div>
                    )}

                    {/* Action button */}
                    <div className="flex justify-center">
                        {phase === 'idle' || isError ? (
                            <Button
                                onClick={runTest}
                                size="lg"
                                className="gap-2 px-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-base font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                <Play className="w-5 h-5" />
                                Start Test
                            </Button>
                        ) : isDone ? (
                            <Button
                                onClick={reset}
                                variant="outline"
                                size="lg"
                                className="gap-2 px-8 rounded-full border-gray-200 hover:bg-gray-50 font-semibold"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Test Again
                            </Button>
                        ) : (
                            <Button
                                onClick={reset}
                                variant="outline"
                                size="sm"
                                className="gap-2 border-gray-200 hover:bg-gray-50 text-gray-500"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results summary */}
            {(isDone || isRunning) && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatPill
                        icon={<Wifi className="w-5 h-5 text-primary-500" />}
                        label="Ping"
                        value={result.ping !== null ? `${result.ping} ms` : '—'}
                        ratingLabel={pingRating.label}
                        ratingColor={pingRating.color}
                        ratingBg={pingRating.bgColor}
                    />
                    <StatPill
                        icon={<Zap className="w-5 h-5 text-primary-500" />}
                        label="Jitter"
                        value={result.jitter !== null ? `${result.jitter} ms` : '—'}
                        ratingLabel={jitterRating.label}
                        ratingColor={jitterRating.color}
                        ratingBg={jitterRating.bgColor}
                    />
                    <StatPill
                        icon={<Download className="w-5 h-5 text-primary-500" />}
                        label="Download"
                        value={formatSpeed(result.download)}
                        ratingLabel={downloadRating.label}
                        ratingColor={downloadRating.color}
                        ratingBg={downloadRating.bgColor}
                    />
                    <StatPill
                        icon={<Upload className="w-5 h-5 text-primary-500" />}
                        label="Upload"
                        value={formatSpeed(result.upload)}
                        ratingLabel={uploadRating.label}
                        ratingColor={uploadRating.color}
                        ratingBg={uploadRating.bgColor}
                    />
                </div>
            )}
        </div>
    );
}
