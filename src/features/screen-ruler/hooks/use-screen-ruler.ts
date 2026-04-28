'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Unit, Guide, ScreenRulerState } from '../types';

function generateId(): string {
    return Math.random().toString(36).slice(2, 9);
}

function detectDpi(): number {
    if (typeof window === 'undefined') return 96;
    const el = document.createElement('div');
    el.style.width = '1in';
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const dpi = el.offsetWidth;
    document.body.removeChild(el);
    return dpi || 96;
}

export function useScreenRuler() {
    const [state, setState] = useState<ScreenRulerState>({
        unit: 'px',
        dpi: 96,
        guides: [],
        measurement: null,
        mouseX: 0,
        mouseY: 0,
        showCrosshair: true,
        measureMode: false,
    });

    const draggingGuideRef = useRef<string | null>(null);
    const draggingAxisRef = useRef<'horizontal' | 'vertical' | null>(null);
    const measureStartRef = useRef<{ x: number; y: number } | null>(null);
    const isMeasuringActiveRef = useRef(false);

    // Detect DPI on mount
    useEffect(() => {
        const dpi = detectDpi();
        setState((s) => ({ ...s, dpi }));
    }, []);

    const convertFromPx = useCallback(
        (px: number, unit: Unit, dpi: number): number => {
            switch (unit) {
                case 'cm':
                    return (px / dpi) * 2.54;
                case 'mm':
                    return (px / dpi) * 25.4;
                case 'in':
                    return px / dpi;
                default:
                    return px;
            }
        },
        []
    );

    const formatValue = useCallback(
        (px: number, unit?: Unit): string => {
            const u = unit ?? state.unit;
            const val = convertFromPx(px, u, state.dpi);
            switch (u) {
                case 'cm':
                    return `${val.toFixed(2)} cm`;
                case 'mm':
                    return `${val.toFixed(1)} mm`;
                case 'in':
                    return `${val.toFixed(3)} in`;
                default:
                    return `${Math.round(val)} px`;
            }
        },
        [state.unit, state.dpi, convertFromPx]
    );

    const setUnit = useCallback((unit: Unit) => {
        setState((s) => ({ ...s, unit }));
    }, []);

    const setDpi = useCallback((dpi: number) => {
        setState((s) => ({ ...s, dpi }));
    }, []);

    const toggleCrosshair = useCallback(() => {
        setState((s) => ({ ...s, showCrosshair: !s.showCrosshair }));
    }, []);

    const toggleMeasureMode = useCallback(() => {
        setState((s) => {
            const next = !s.measureMode;
            if (!next) {
                isMeasuringActiveRef.current = false;
                measureStartRef.current = null;
                return { ...s, measureMode: false, measurement: null };
            }
            return { ...s, measureMode: true };
        });
    }, []);

    const addGuide = useCallback((axis: 'horizontal' | 'vertical', position: number) => {
        const guide: Guide = { id: generateId(), axis, position };
        setState((s) => ({ ...s, guides: [...s.guides, guide] }));
    }, []);

    const updateGuide = useCallback((id: string, position: number) => {
        setState((s) => ({
            ...s,
            guides: s.guides.map((g) => (g.id === id ? { ...g, position } : g)),
        }));
    }, []);

    const removeGuide = useCallback((id: string) => {
        setState((s) => ({ ...s, guides: s.guides.filter((g) => g.id !== id) }));
    }, []);

    const clearGuides = useCallback(() => {
        setState((s) => ({ ...s, guides: [] }));
    }, []);

    const startDragGuide = useCallback((id: string, axis: 'horizontal' | 'vertical') => {
        draggingGuideRef.current = id;
        draggingAxisRef.current = axis;
    }, []);

    const stopDragGuide = useCallback(() => {
        draggingGuideRef.current = null;
        draggingAxisRef.current = null;
    }, []);

    const handleMouseMove = useCallback(
        (x: number, y: number) => {
            if (draggingGuideRef.current) {
                const pos = draggingAxisRef.current === 'horizontal' ? y : x;
                updateGuide(draggingGuideRef.current, pos);
            }

            setState((s) => {
                if (isMeasuringActiveRef.current && measureStartRef.current) {
                    return {
                        ...s,
                        mouseX: x,
                        mouseY: y,
                        measurement: {
                            startX: measureStartRef.current!.x,
                            startY: measureStartRef.current!.y,
                            endX: x,
                            endY: y,
                        },
                    };
                }
                return { ...s, mouseX: x, mouseY: y };
            });
        },
        [updateGuide]
    );

    const startMeasure = useCallback((x: number, y: number) => {
        isMeasuringActiveRef.current = true;
        measureStartRef.current = { x, y };
        setState((s) => ({
            ...s,
            measurement: { startX: x, startY: y, endX: x, endY: y },
        }));
    }, []);

    const endMeasure = useCallback(() => {
        isMeasuringActiveRef.current = false;
        measureStartRef.current = null;
    }, []);

    const clearMeasurement = useCallback(() => {
        isMeasuringActiveRef.current = false;
        measureStartRef.current = null;
        setState((s) => ({ ...s, measurement: null }));
    }, []);

    const getDraggingGuide = useCallback(() => draggingGuideRef.current, []);

    return {
        state,
        formatValue,
        convertFromPx,
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
    };
}
