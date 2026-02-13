'use client';

import { useState, useCallback, useMemo } from 'react';
import { GradientConfig, ColorStop, GradientType } from '../types';
import { DEFAULT_GRADIENT, MIN_STOPS, MAX_STOPS } from '../constants';

let stopCounter = 100;

function generateStopId(): string {
  stopCounter += 1;
  return `stop-${stopCounter}`;
}

function randomHexColor(): string {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return `#${hex.toUpperCase()}`;
}

export function useGradientGenerator() {
  const [config, setConfig] = useState<GradientConfig>(DEFAULT_GRADIENT);

  const setType = useCallback((type: GradientType) => {
    setConfig((prev) => ({ ...prev, type }));
  }, []);

  const setAngle = useCallback((angle: number) => {
    setConfig((prev) => ({ ...prev, angle }));
  }, []);

  const updateStop = useCallback((id: string, updates: Partial<Omit<ColorStop, 'id'>>) => {
    setConfig((prev) => ({
      ...prev,
      stops: prev.stops.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const addStop = useCallback(() => {
    setConfig((prev) => {
      if (prev.stops.length >= MAX_STOPS) return prev;
      const lastStop = prev.stops[prev.stops.length - 1];
      const secondLast = prev.stops[prev.stops.length - 2];
      const newPosition = Math.min(100, Math.round((lastStop.position + secondLast.position) / 2));
      const newStop: ColorStop = {
        id: generateStopId(),
        color: randomHexColor(),
        position: newPosition,
      };
      const stops = [...prev.stops, newStop].sort((a, b) => a.position - b.position);
      return { ...prev, stops };
    });
  }, []);

  const removeStop = useCallback((id: string) => {
    setConfig((prev) => {
      if (prev.stops.length <= MIN_STOPS) return prev;
      return { ...prev, stops: prev.stops.filter((s) => s.id !== id) };
    });
  }, []);

  const applyPreset = useCallback((preset: GradientConfig) => {
    setConfig(preset);
  }, []);

  const randomize = useCallback(() => {
    const types: GradientType[] = ['linear', 'radial', 'conic'];
    const type = types[Math.floor(Math.random() * types.length)];
    const angle = Math.floor(Math.random() * 360);
    const numStops = Math.floor(Math.random() * 3) + 2;
    const stops: ColorStop[] = Array.from({ length: numStops }, (_, i) => ({
      id: generateStopId(),
      color: randomHexColor(),
      position: Math.round((i / (numStops - 1)) * 100),
    }));
    setConfig({ type, angle, stops });
  }, []);

  const cssOutput = useMemo(() => {
    const stopStr = config.stops.map((s) => `${s.color} ${s.position}%`).join(', ');
    switch (config.type) {
      case 'linear':
        return `linear-gradient(${config.angle}deg, ${stopStr})`;
      case 'radial':
        return `radial-gradient(circle, ${stopStr})`;
      case 'conic':
        return `conic-gradient(from ${config.angle}deg, ${stopStr})`;
    }
  }, [config]);

  const fullCss = useMemo(() => `background: ${cssOutput};`, [cssOutput]);

  const tailwindClass = useMemo(() => {
    if (config.type !== 'linear' || config.stops.length !== 2) {
      return null;
    }
    const directionMap: Record<number, string> = {
      0: 'bg-gradient-to-t',
      45: 'bg-gradient-to-tr',
      90: 'bg-gradient-to-r',
      135: 'bg-gradient-to-br',
      180: 'bg-gradient-to-b',
      225: 'bg-gradient-to-bl',
      270: 'bg-gradient-to-l',
      315: 'bg-gradient-to-tl',
    };
    const dir = directionMap[config.angle];
    if (!dir) return null;
    return `${dir} from-[${config.stops[0].color}] to-[${config.stops[1].color}]`;
  }, [config]);

  return {
    config,
    setConfig,
    setType,
    setAngle,
    updateStop,
    addStop,
    removeStop,
    applyPreset,
    randomize,
    cssOutput,
    fullCss,
    tailwindClass,
  };
}
