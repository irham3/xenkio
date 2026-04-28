'use client';

import { useRef, useCallback, useEffect } from 'react';
import type { Guide } from '../types';
import { useScreenRuler } from '../hooks/use-screen-ruler';

const RULER_SIZE = 24;
const TICK_SMALL = 4;
const TICK_MED = 8;
const TICK_LARGE = 14;
const CM_PER_INCH = 2.54;

const HINTS = [
    {
        icon: '\u{1F4CF}',
        title: 'Add Guides',
        desc: 'Drag from the top or left ruler to create horizontal / vertical guide lines.',
    },
    {
        icon: '\u{1F4D0}',
        title: 'Measure Distance',
        desc: 'Enable the Measure mode then click-drag on the canvas to measure width, height, and diagonal.',
    },
    {
        icon: '\u{1F3AF}',
        title: 'Calibrate DPI',
        desc: 'Adjust the DPI value to match your screen for accurate real-world measurements (cm, mm, in).',
    },
];

interface TickInterval {
    minor: number;
    major: number;
    label: number;
}

function getTickInterval(unit: string, dpi: number): TickInterval {
    switch (unit) {
        case 'cm':
            return { minor: dpi * 0.1 * CM_PER_INCH, major: dpi * 0.5 * CM_PER_INCH, label: dpi * CM_PER_INCH };
        case 'mm':
            return { minor: dpi * 0.0254, major: dpi * 0.127, label: dpi * CM_PER_INCH / 10 };
        case 'in':
            return { minor: dpi / 16, major: dpi / 4, label: dpi };
        default:
            return { minor: 10, major: 50, label: 100 };
    }
}

function drawRuler(
    canvas: HTMLCanvasElement,
    axis: 'horizontal' | 'vertical',
    length: number,
    unit: string,
    dpi: number,
) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isH = axis === 'horizontal';
    const { minor, major, label } = getTickInterval(unit, dpi);
    const w = isH ? length : RULER_SIZE;
    const h = isH ? RULER_SIZE : length;
    const ratio = window.devicePixelRatio || 1;

    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(ratio, ratio);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';

    for (let px = 0; px <= length; px += minor) {
        const isLabelTick = Math.abs(px % label) < 0.5;
        const isMajorTick = Math.abs(px % major) < 0.5;
        const tickLen = isLabelTick ? TICK_LARGE : isMajorTick ? TICK_MED : TICK_SMALL;

        ctx.beginPath();
        if (isH) {
            ctx.moveTo(px, RULER_SIZE);
            ctx.lineTo(px, RULER_SIZE - tickLen);
        } else {
            ctx.moveTo(RULER_SIZE, px);
            ctx.lineTo(RULER_SIZE - tickLen, px);
        }
        ctx.stroke();

        if (isLabelTick && px > 0) {
            ctx.save();
            if (isH) {
                ctx.fillText(String(Math.round(px)), px, RULER_SIZE - tickLen - 2);
            } else {
                ctx.translate(RULER_SIZE - tickLen - 2, px);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(String(Math.round(px)), 0, 0);
            }
            ctx.restore();
        }
    }
}

interface GuideDragProps {
    guide: Guide;
    onDragStart: (id: string, axis: 'horizontal' | 'vertical') => void;
    onRemove: (id: string) => void;
    label: string;
}

function GuideLine({ guide, onDragStart, onRemove, label }: GuideDragProps) {
    const isH = guide.axis === 'horizontal';
    const style: React.CSSProperties = isH
        ? { top: guide.position, left: 0, right: 0, height: 1, cursor: 'ns-resize' }
        : { left: guide.position, top: 0, bottom: 0, width: 1, cursor: 'ew-resize' };

    return (
        <div
            className="absolute group"
            style={style}
            onMouseDown={(e) => {
                e.stopPropagation();
                onDragStart(guide.id, guide.axis);
            }}
        >
            <div
                className="absolute"
                style={
                    isH
                        ? { left: 0, right: 0, top: -3, height: 7 }
                        : { top: 0, bottom: 0, left: -3, width: 7 }
                }
            />
            <div
                className={`absolute bg-primary-500 opacity-80 ${
                    isH ? 'left-0 right-0 h-px' : 'top-0 bottom-0 w-px'
                }`}
            />
            <div
                className={`absolute flex items-center gap-1 bg-primary-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none z-10 ${
                    isH ? 'top-1 left-4' : 'left-1 top-4'
                }`}
            >
                {label}
            </div>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onRemove(guide.id);
                }}
                className={`absolute opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] leading-none z-20 pointer-events-auto ${
                    isH ? 'right-2 -top-1.5' : 'bottom-2 -right-1.5'
                }`}
            >
                {'\u00d7'}
            </button>
        </div>
    );
}

interface MeasurementOverlayProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    labelW: string;
    labelH: string;
    labelD: string;
    onClear: () => void;
}

function MeasurementOverlay({
    startX, startY, endX, endY, labelW, labelH, labelD, onClear,
}: MeasurementOverlayProps) {
    const minX = Math.min(startX, endX);
    const minY = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);

    if (w < 2 && h < 2) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-30">
            <div
                className="absolute border-2 border-dashed border-accent-500 bg-accent-500/10"
                style={{ left: minX, top: minY, width: w, height: h }}
            />
            {w > 40 && (
                <div
                    className="absolute -translate-x-1/2 bg-accent-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap"
                    style={{ left: minX + w / 2, top: minY - 20 }}
                >
                    {labelW}
                </div>
            )}
            {h > 30 && (
                <div
                    className="absolute -translate-y-1/2 bg-accent-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap"
                    style={{ left: minX + w + 6, top: minY + h / 2 }}
                >
                    {labelH}
                </div>
            )}
            <div
                className="absolute -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-auto cursor-pointer"
                style={{ left: (startX + endX) / 2, top: (startY + endY) / 2 }}
                onClick={onClear}
                title="Click to clear measurement"
            >
                {'\u2197'} {labelD}
            </div>
            {[{ x: startX, y: startY }, { x: endX, y: endY }].map((pt, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-accent-500 border-2 border-white shadow"
                    style={{ left: pt.x - 4, top: pt.y - 4 }}
                />
            ))}
        </div>
    );
}

export function ScreenRuler() {
    const {
        state,
        formatValue,
        setUnit,
        setDpi,
        toggleCrosshair,
        toggleMeasureMode,
        addGuide,
        removeGuide,
        clearGuides,
        startDragGuide,
        stopDragGuide,
        handleMouseMove,
        startMeasure,
        endMeasure,
        clearMeasurement,
        getDraggingGuide,
    } = useScreenRuler();

    const containerRef = useRef<HTMLDivElement>(null);
    const hRulerRef = useRef<HTMLCanvasElement>(null);
    const vRulerRef = useRef<HTMLCanvasElement>(null);

    const getRelativePos = useCallback((e: React.MouseEvent) => {
        const el = containerRef.current;
        if (!el) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        return {
            x: e.clientX - rect.left - RULER_SIZE,
            y: e.clientY - rect.top - RULER_SIZE,
        };
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !hRulerRef.current || !vRulerRef.current) return;
        const w = el.clientWidth - RULER_SIZE;
        const h = el.clientHeight - RULER_SIZE;
        drawRuler(hRulerRef.current, 'horizontal', w, state.unit, state.dpi);
        drawRuler(vRulerRef.current, 'vertical', h, state.unit, state.dpi);
    }, [state.unit, state.dpi]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            if (!hRulerRef.current || !vRulerRef.current) return;
            const w = el.clientWidth - RULER_SIZE;
            const h = el.clientHeight - RULER_SIZE;
            drawRuler(hRulerRef.current, 'horizontal', w, state.unit, state.dpi);
            drawRuler(vRulerRef.current, 'vertical', h, state.unit, state.dpi);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [state.unit, state.dpi]);

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const { x, y } = getRelativePos(e);
            handleMouseMove(x, y);
        },
        [getRelativePos, handleMouseMove]
    );

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) return;
            if (state.measureMode) {
                const { x, y } = getRelativePos(e);
                startMeasure(x, y);
            }
        },
        [state.measureMode, getRelativePos, startMeasure]
    );

    const onMouseUp = useCallback(() => {
        if (getDraggingGuide()) stopDragGuide();
        endMeasure();
    }, [getDraggingGuide, stopDragGuide, endMeasure]);

    const onHRulerMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            addGuide('horizontal', e.clientY - rect.top - RULER_SIZE);
        },
        [addGuide]
    );

    const onVRulerMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            addGuide('vertical', e.clientX - rect.left - RULER_SIZE);
        },
        [addGuide]
    );

    const { mouseX, mouseY, guides, measurement, showCrosshair, unit, dpi, measureMode } = state;

    let measDx = 0;
    let measDy = 0;
    let measDist = 0;
    if (measurement) {
        measDx = Math.abs(measurement.endX - measurement.startX);
        measDy = Math.abs(measurement.endY - measurement.startY);
        measDist = Math.sqrt(measDx * measDx + measDy * measDy);
    }

    const UNITS: Array<{ value: typeof unit; label: string }> = [
        { value: 'px', label: 'px' },
        { value: 'cm', label: 'cm' },
        { value: 'mm', label: 'mm' },
        { value: 'in', label: 'in' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                    {UNITS.map((u) => (
                        <button
                            key={u.value}
                            type="button"
                            onClick={() => setUnit(u.value)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                unit === u.value
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {u.label}
                        </button>
                    ))}
                </div>

                <div className="h-5 w-px bg-gray-200" />

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">DPI:</span>
                    <input
                        type="number"
                        min={72}
                        max={400}
                        value={dpi}
                        onChange={(e) => setDpi(Number(e.target.value))}
                        className="w-16 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-700"
                    />
                </div>

                <div className="h-5 w-px bg-gray-200" />

                <button
                    type="button"
                    onClick={toggleCrosshair}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        showCrosshair
                            ? 'bg-primary-50 text-primary-700 border-primary-200'
                            : 'text-gray-500 hover:bg-gray-100 border-transparent'
                    }`}
                >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="8" r="3" />
                        <line x1="8" y1="1" x2="8" y2="4" />
                        <line x1="8" y1="12" x2="8" y2="15" />
                        <line x1="1" y1="8" x2="4" y2="8" />
                        <line x1="12" y1="8" x2="15" y2="8" />
                    </svg>
                    Crosshair
                </button>

                <button
                    type="button"
                    onClick={toggleMeasureMode}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        measureMode
                            ? 'bg-accent-50 text-accent-700 border-accent-200'
                            : 'text-gray-500 hover:bg-gray-100 border-transparent'
                    }`}
                >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 8h14M8 1v14" />
                        <rect x="3" y="3" width="10" height="10" rx="1" strokeDasharray="2 2" />
                    </svg>
                    Measure
                </button>

                <div className="h-5 w-px bg-gray-200" />

                <button
                    type="button"
                    onClick={clearGuides}
                    disabled={guides.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-transparent"
                >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 4h12M6 4V2h4v2M13 4l-1 10H4L3 4" />
                    </svg>
                    Clear Guides
                </button>

                <div className="ml-auto flex items-center gap-2 font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                    <span>X: <span className="text-gray-800 font-semibold">{formatValue(Math.max(0, mouseX))}</span></span>
                    <span className="text-gray-300">|</span>
                    <span>Y: <span className="text-gray-800 font-semibold">{formatValue(Math.max(0, mouseY))}</span></span>
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm select-none"
                style={{ height: 460, cursor: measureMode ? 'crosshair' : 'default' }}
                onMouseMove={onMouseMove}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                <div
                    className="absolute top-0 left-0 z-30 bg-gray-100 border-r border-b border-gray-200"
                    style={{ width: RULER_SIZE, height: RULER_SIZE }}
                />
                <canvas
                    ref={hRulerRef}
                    className="absolute top-0 z-20 cursor-s-resize"
                    style={{ left: RULER_SIZE, height: RULER_SIZE }}
                    onMouseDown={onHRulerMouseDown}
                />
                <canvas
                    ref={vRulerRef}
                    className="absolute left-0 z-20 cursor-e-resize"
                    style={{ top: RULER_SIZE, width: RULER_SIZE }}
                    onMouseDown={onVRulerMouseDown}
                />
                <div
                    className="absolute"
                    style={{
                        top: RULER_SIZE,
                        left: RULER_SIZE,
                        right: 0,
                        bottom: 0,
                        background:
                            'repeating-linear-gradient(0deg, transparent, transparent 19px, #f1f5f9 19px, #f1f5f9 20px),' +
                            'repeating-linear-gradient(90deg, transparent, transparent 19px, #f1f5f9 19px, #f1f5f9 20px)',
                    }}
                />
                {showCrosshair && mouseX >= 0 && mouseY >= 0 && (
                    <>
                        <div className="absolute pointer-events-none z-10" style={{ left: mouseX + RULER_SIZE, top: RULER_SIZE, bottom: 0, width: 1, background: 'rgba(14,165,233,0.5)' }} />
                        <div className="absolute pointer-events-none z-10" style={{ top: mouseY + RULER_SIZE, left: RULER_SIZE, right: 0, height: 1, background: 'rgba(14,165,233,0.5)' }} />
                        <div className="absolute pointer-events-none" style={{ left: mouseX + RULER_SIZE - 2, top: 0, width: 4, height: RULER_SIZE, background: 'rgba(14,165,233,0.4)', zIndex: 25 }} />
                        <div className="absolute pointer-events-none" style={{ top: mouseY + RULER_SIZE - 2, left: 0, height: 4, width: RULER_SIZE, background: 'rgba(14,165,233,0.4)', zIndex: 25 }} />
                    </>
                )}
                <div className="absolute z-20" style={{ top: RULER_SIZE, left: RULER_SIZE, right: 0, bottom: 0 }}>
                    {guides.map((g) => (
                        <GuideLine
                            key={g.id}
                            guide={g}
                            label={formatValue(g.position)}
                            onDragStart={startDragGuide}
                            onRemove={removeGuide}
                        />
                    ))}
                </div>
                {measurement && (
                    <MeasurementOverlay
                        startX={measurement.startX + RULER_SIZE}
                        startY={measurement.startY + RULER_SIZE}
                        endX={measurement.endX + RULER_SIZE}
                        endY={measurement.endY + RULER_SIZE}
                        labelW={formatValue(measDx)}
                        labelH={formatValue(measDy)}
                        labelD={formatValue(measDist)}
                        onClear={clearMeasurement}
                    />
                )}
            </div>

            {measurement && (
                <div className="flex flex-wrap items-center gap-4 bg-accent-50 border border-accent-200 rounded-xl px-4 py-3 text-sm font-mono">
                    <div className="flex items-center gap-2">
                        <span className="text-accent-500 text-xs font-semibold uppercase tracking-wider">Width:</span>
                        <span className="text-accent-800 font-bold">{formatValue(measDx)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent-500 text-xs font-semibold uppercase tracking-wider">Height:</span>
                        <span className="text-accent-800 font-bold">{formatValue(measDy)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent-500 text-xs font-semibold uppercase tracking-wider">Distance:</span>
                        <span className="text-accent-800 font-bold">{formatValue(measDist)}</span>
                    </div>
                    <button type="button" onClick={clearMeasurement} className="ml-auto text-xs text-accent-600 hover:text-accent-800 underline">
                        Clear
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {HINTS.map((h) => (
                    <div key={h.title} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <span className="text-xl shrink-0">{h.icon}</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{h.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{h.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
