'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Copy,
  Check,
  Plus,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';

interface KeyframeProperty {
  id: string;
  property: string;
  value: string;
}

interface AnimationKeyframe {
  id: string;
  offset: number;
  properties: KeyframeProperty[];
}

interface AnimationConfig {
  name: string;
  duration: number;
  easing: string;
  delay: number;
  iterations: string;
  direction: AnimationDirection;
  fillMode: AnimationFillMode;
  keyframes: AnimationKeyframe[];
}

interface PresetAnimation {
  name: string;
  description: string;
  config: Omit<AnimationConfig, 'name'>;
}

const EASING_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'cubic-bezier(0.68,-0.55,0.265,1.55)', label: 'Spring (Bounce)' },
  { value: 'cubic-bezier(0.25,0.46,0.45,0.94)', label: 'Ease Out Quad' },
  { value: 'cubic-bezier(0.55,0.055,0.675,0.19)', label: 'Ease In Cubic' },
  { value: 'steps(5, end)', label: 'Steps (5)' },
];

const DIRECTION_OPTIONS: { value: AnimationDirection; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'alternate', label: 'Alternate' },
  { value: 'alternate-reverse', label: 'Alternate Reverse' },
];

const FILL_MODE_OPTIONS: { value: AnimationFillMode; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'forwards', label: 'Forwards' },
  { value: 'backwards', label: 'Backwards' },
  { value: 'both', label: 'Both' },
];

const ITERATION_OPTIONS = [
  { value: 'infinite', label: 'Infinite' },
  { value: '1', label: '1 time' },
  { value: '2', label: '2 times' },
  { value: '3', label: '3 times' },
  { value: '5', label: '5 times' },
];

const COMMON_PROPERTIES = [
  'opacity',
  'transform',
  'background-color',
  'color',
  'border-radius',
  'box-shadow',
  'width',
  'height',
  'margin-top',
  'padding',
  'font-size',
  'letter-spacing',
  'filter',
  'clip-path',
  'border-color',
  'outline-color',
  'text-shadow',
];

function createId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createProperty(property = '', value = ''): KeyframeProperty {
  return { id: createId(), property, value };
}

function createKeyframe(offset: number, properties: KeyframeProperty[] = []): AnimationKeyframe {
  return { id: createId(), offset, properties };
}

const PRESET_ANIMATIONS: PresetAnimation[] = [
  {
    name: 'Fade In',
    description: 'Simple opacity fade from invisible to visible',
    config: {
      duration: 0.8,
      easing: 'ease-out',
      delay: 0,
      iterations: '1',
      direction: 'normal',
      fillMode: 'forwards',
      keyframes: [
        createKeyframe(0, [createProperty('opacity', '0')]),
        createKeyframe(100, [createProperty('opacity', '1')]),
      ],
    },
  },
  {
    name: 'Bounce',
    description: 'Bouncing up and down effect',
    config: {
      duration: 1,
      easing: 'cubic-bezier(0.68,-0.55,0.265,1.55)',
      delay: 0,
      iterations: 'infinite',
      direction: 'alternate',
      fillMode: 'none',
      keyframes: [
        createKeyframe(0, [createProperty('transform', 'translateY(0)')]),
        createKeyframe(100, [createProperty('transform', 'translateY(-30px)')]),
      ],
    },
  },
  {
    name: 'Pulse',
    description: 'Gentle scale pulsing effect',
    config: {
      duration: 1.5,
      easing: 'ease-in-out',
      delay: 0,
      iterations: 'infinite',
      direction: 'alternate',
      fillMode: 'none',
      keyframes: [
        createKeyframe(0, [createProperty('transform', 'scale(1)')]),
        createKeyframe(100, [createProperty('transform', 'scale(1.1)')]),
      ],
    },
  },
  {
    name: 'Spin',
    description: 'Continuous 360° rotation',
    config: {
      duration: 1.2,
      easing: 'linear',
      delay: 0,
      iterations: 'infinite',
      direction: 'normal',
      fillMode: 'none',
      keyframes: [
        createKeyframe(0, [createProperty('transform', 'rotate(0deg)')]),
        createKeyframe(100, [createProperty('transform', 'rotate(360deg)')]),
      ],
    },
  },
  {
    name: 'Slide In Left',
    description: 'Slides in from the left with fade',
    config: {
      duration: 0.6,
      easing: 'ease-out',
      delay: 0,
      iterations: '1',
      direction: 'normal',
      fillMode: 'forwards',
      keyframes: [
        createKeyframe(0, [
          createProperty('opacity', '0'),
          createProperty('transform', 'translateX(-50px)'),
        ]),
        createKeyframe(100, [
          createProperty('opacity', '1'),
          createProperty('transform', 'translateX(0)'),
        ]),
      ],
    },
  },
  {
    name: 'Shake',
    description: 'Horizontal shake for attention',
    config: {
      duration: 0.6,
      easing: 'ease-in-out',
      delay: 0,
      iterations: '1',
      direction: 'normal',
      fillMode: 'none',
      keyframes: [
        createKeyframe(0, [createProperty('transform', 'translateX(0)')]),
        createKeyframe(20, [createProperty('transform', 'translateX(-10px)')]),
        createKeyframe(40, [createProperty('transform', 'translateX(10px)')]),
        createKeyframe(60, [createProperty('transform', 'translateX(-10px)')]),
        createKeyframe(80, [createProperty('transform', 'translateX(10px)')]),
        createKeyframe(100, [createProperty('transform', 'translateX(0)')]),
      ],
    },
  },
  {
    name: 'Flip',
    description: 'Card flip effect on Y axis',
    config: {
      duration: 1,
      easing: 'ease-in-out',
      delay: 0,
      iterations: 'infinite',
      direction: 'alternate',
      fillMode: 'none',
      keyframes: [
        createKeyframe(0, [createProperty('transform', 'rotateY(0deg)')]),
        createKeyframe(100, [createProperty('transform', 'rotateY(180deg)')]),
      ],
    },
  },
  {
    name: 'Color Shift',
    description: 'Background color transition loop',
    config: {
      duration: 3,
      easing: 'linear',
      delay: 0,
      iterations: 'infinite',
      direction: 'alternate',
      fillMode: 'none',
      keyframes: [
        createKeyframe(0, [createProperty('background-color', '#3b82f6')]),
        createKeyframe(50, [createProperty('background-color', '#8b5cf6')]),
        createKeyframe(100, [createProperty('background-color', '#ec4899')]),
      ],
    },
  },
];

const DEFAULT_CONFIG: AnimationConfig = {
  name: 'my-animation',
  duration: 1,
  easing: 'ease-in-out',
  delay: 0,
  iterations: 'infinite',
  direction: 'alternate',
  fillMode: 'none',
  keyframes: [
    createKeyframe(0, [
      createProperty('opacity', '0'),
      createProperty('transform', 'translateY(20px)'),
    ]),
    createKeyframe(100, [
      createProperty('opacity', '1'),
      createProperty('transform', 'translateY(0)'),
    ]),
  ],
};

function generateCSS(config: AnimationConfig): string {
  const { name, duration, easing, delay, iterations, direction, fillMode, keyframes } = config;

  const sorted = [...keyframes].sort((a, b) => a.offset - b.offset);

  const keyframeBlock = sorted
    .map((kf) => {
      const props = kf.properties
        .filter((p) => p.property.trim() && p.value.trim())
        .map((p) => `    ${p.property}: ${p.value};`)
        .join('\n');
      return `  ${kf.offset}% {\n${props}\n  }`;
    })
    .join('\n\n');

  const animationValue = [
    name,
    `${duration}s`,
    easing,
    delay > 0 ? `${delay}s` : null,
    iterations !== '1' ? iterations : null,
    direction !== 'normal' ? direction : null,
    fillMode !== 'none' ? fillMode : null,
  ]
    .filter(Boolean)
    .join(' ');

  return `@keyframes ${name} {\n${keyframeBlock}\n}\n\n.animated-element {\n  animation: ${animationValue};\n}`;
}

export function KeyframeAnimationGenerator(): React.ReactElement {
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [expandedKeyframes, setExpandedKeyframes] = useState<Set<string>>(
    new Set(config.keyframes.map((kf) => kf.id))
  );
  const previewRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const animationKeyRef = useRef(0);
  const [animKey, setAnimKey] = useState(0);

  const generatedCSS = useMemo(() => generateCSS(config), [config]);

  // Inject animation style into a <style> tag
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = generatedCSS;
  }, [generatedCSS]);

  // Cleanup style element on unmount
  useEffect(() => {
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(generatedCSS)
      .then(() => {
        setCopied(true);
        toast.success('CSS copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy'));
  }, [generatedCSS]);

  const handleRestart = useCallback(() => {
    animationKeyRef.current += 1;
    setAnimKey(animationKeyRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const loadPreset = useCallback((preset: PresetAnimation) => {
    setConfig({
      ...preset.config,
      name: preset.name.toLowerCase().replace(/\s+/g, '-'),
    });
    setExpandedKeyframes(new Set(preset.config.keyframes.map((kf) => kf.id)));
    animationKeyRef.current += 1;
    setAnimKey(animationKeyRef.current);
    setIsPlaying(true);
    toast.success(`Loaded preset: ${preset.name}`);
  }, []);

  const addKeyframe = useCallback(() => {
    const sorted = [...config.keyframes].sort((a, b) => a.offset - b.offset);
    let newOffset = 50;
    if (sorted.length >= 2) {
      const last = sorted[sorted.length - 1].offset;
      const secondLast = sorted[sorted.length - 2].offset;
      newOffset = Math.round((secondLast + last) / 2);
      if (newOffset === secondLast || newOffset === last) {
        newOffset = Math.min(last + 10, 99);
      }
    }
    const newKf = createKeyframe(newOffset);
    setConfig((prev) => ({ ...prev, keyframes: [...prev.keyframes, newKf] }));
    setExpandedKeyframes((prev) => new Set([...prev, newKf.id]));
  }, [config.keyframes]);

  const removeKeyframe = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      keyframes: prev.keyframes.filter((kf) => kf.id !== id),
    }));
    setExpandedKeyframes((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const updateKeyframeOffset = useCallback((id: string, offset: number) => {
    setConfig((prev) => ({
      ...prev,
      keyframes: prev.keyframes.map((kf) => (kf.id === id ? { ...kf, offset } : kf)),
    }));
  }, []);

  const addProperty = useCallback((keyframeId: string) => {
    setConfig((prev) => ({
      ...prev,
      keyframes: prev.keyframes.map((kf) =>
        kf.id === keyframeId
          ? { ...kf, properties: [...kf.properties, createProperty()] }
          : kf
      ),
    }));
  }, []);

  const removeProperty = useCallback((keyframeId: string, propId: string) => {
    setConfig((prev) => ({
      ...prev,
      keyframes: prev.keyframes.map((kf) =>
        kf.id === keyframeId
          ? { ...kf, properties: kf.properties.filter((p) => p.id !== propId) }
          : kf
      ),
    }));
  }, []);

  const updateProperty = useCallback(
    (keyframeId: string, propId: string, field: 'property' | 'value', val: string) => {
      setConfig((prev) => ({
        ...prev,
        keyframes: prev.keyframes.map((kf) =>
          kf.id === keyframeId
            ? {
                ...kf,
                properties: kf.properties.map((p) =>
                  p.id === propId ? { ...p, [field]: val } : p
                ),
              }
            : kf
        ),
      }));
    },
    []
  );

  const toggleKeyframeExpand = useCallback((id: string) => {
    setExpandedKeyframes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const updateConfig = useCallback(
    <K extends keyof Omit<AnimationConfig, 'keyframes'>>(
      key: K,
      value: AnimationConfig[K]
    ) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const sortedKeyframes = useMemo(
    () => [...config.keyframes].sort((a, b) => a.offset - b.offset),
    [config.keyframes]
  );

  const previewStyle: React.CSSProperties = isPlaying
    ? {
        animationName: config.name,
        animationDuration: `${config.duration}s`,
        animationTimingFunction: config.easing,
        animationDelay: `${config.delay}s`,
        animationIterationCount: config.iterations,
        animationDirection: config.direction,
        animationFillMode: config.fillMode,
        animationPlayState: 'running',
      }
    : {
        animationPlayState: 'paused',
        animationName: config.name,
        animationDuration: `${config.duration}s`,
        animationTimingFunction: config.easing,
        animationDelay: `${config.delay}s`,
        animationIterationCount: config.iterations,
        animationDirection: config.direction,
        animationFillMode: config.fillMode,
      };

  return (
    <div className="space-y-6">
      {/* Preset Animations */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Preset Animations
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_ANIMATIONS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              title={preset.description}
              className={cn(
                'text-left px-3 py-2 rounded-md text-xs font-medium border transition-colors',
                'border-gray-200 bg-white text-gray-700',
                'hover:border-gray-400 hover:bg-gray-50'
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-5">
          {/* Animation Settings */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Animation Settings</h2>

            {/* Name */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Animation Name</Label>
              <Input
                value={config.name}
                onChange={(e) =>
                  updateConfig(
                    'name',
                    e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  )
                }
                placeholder="my-animation"
                className="h-8 text-sm"
              />
            </div>

            {/* Duration & Delay */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">
                  Duration: <span className="font-semibold text-gray-800">{config.duration}s</span>
                </Label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={config.duration}
                  onChange={(e) => updateConfig('duration', parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-gray-800"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">
                  Delay: <span className="font-semibold text-gray-800">{config.delay}s</span>
                </Label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={config.delay}
                  onChange={(e) => updateConfig('delay', parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-gray-800"
                />
              </div>
            </div>

            {/* Easing & Iterations */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Easing</Label>
                <select
                  value={config.easing}
                  onChange={(e) => updateConfig('easing', e.target.value)}
                  className="w-full h-8 border border-gray-200 rounded-md text-xs px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  {EASING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Iterations</Label>
                <select
                  value={config.iterations}
                  onChange={(e) => updateConfig('iterations', e.target.value)}
                  className="w-full h-8 border border-gray-200 rounded-md text-xs px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  {ITERATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direction & Fill Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Direction</Label>
                <select
                  value={config.direction}
                  onChange={(e) =>
                    updateConfig('direction', e.target.value as AnimationDirection)
                  }
                  className="w-full h-8 border border-gray-200 rounded-md text-xs px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  {DIRECTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Fill Mode</Label>
                <select
                  value={config.fillMode}
                  onChange={(e) =>
                    updateConfig('fillMode', e.target.value as AnimationFillMode)
                  }
                  className="w-full h-8 border border-gray-200 rounded-md text-xs px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  {FILL_MODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Keyframes Editor */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Keyframes{' '}
                <span className="text-gray-400 font-normal">({config.keyframes.length})</span>
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={addKeyframe}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Keyframe
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sortedKeyframes.map((kf) => (
                <div
                  key={kf.id}
                  className="border border-gray-200 rounded-md overflow-hidden"
                >
                  {/* Keyframe Header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <button
                      onClick={() => toggleKeyframeExpand(kf.id)}
                      className="flex items-center gap-1 flex-1 min-w-0"
                    >
                      {expandedKeyframes.has(kf.id) ? (
                        <ChevronUp className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-gray-700 min-w-[32px]">
                        {kf.offset}%
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {kf.properties
                          .filter((p) => p.property)
                          .map((p) => p.property)
                          .join(', ') || 'no properties'}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={kf.offset}
                        onChange={(e) =>
                          updateKeyframeOffset(
                            kf.id,
                            Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                          )
                        }
                        className="w-14 h-6 border border-gray-200 rounded text-xs text-center px-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                      />
                      <button
                        onClick={() => removeKeyframe(kf.id)}
                        disabled={config.keyframes.length <= 2}
                        className={cn(
                          'p-1 rounded transition-colors',
                          config.keyframes.length <= 2
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        )}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Keyframe Properties */}
                  {expandedKeyframes.has(kf.id) && (
                    <div className="p-3 space-y-2">
                      {kf.properties.map((prop) => (
                        <div key={prop.id} className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              list={`props-${kf.id}`}
                              value={prop.property}
                              onChange={(e) =>
                                updateProperty(kf.id, prop.id, 'property', e.target.value)
                              }
                              placeholder="property"
                              className="h-7 text-xs"
                            />
                            <datalist id={`props-${kf.id}`}>
                              {COMMON_PROPERTIES.map((p) => (
                                <option key={p} value={p} />
                              ))}
                            </datalist>
                          </div>
                          <Input
                            value={prop.value}
                            onChange={(e) =>
                              updateProperty(kf.id, prop.id, 'value', e.target.value)
                            }
                            placeholder="value"
                            className="h-7 text-xs flex-1"
                          />
                          <button
                            onClick={() => removeProperty(kf.id, prop.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addProperty(kf.id)}
                        className="h-6 text-xs text-gray-500 gap-1 px-2"
                      >
                        <Plus className="w-3 h-3" />
                        Add property
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview & Output */}
        <div className="space-y-5">
          {/* Live Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">Live Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                    isPlaying
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restart
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="relative h-56 flex items-center justify-center bg-[linear-gradient(45deg,#f9fafb_25%,transparent_25%),linear-gradient(-45deg,#f9fafb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f9fafb_75%),linear-gradient(-45deg,transparent_75%,#f9fafb_75%)] bg-[length:20px_20px] bg-[0_0,0_10px,10px_-10px,-10px_0px]">
              <div
                key={animKey}
                ref={previewRef}
                className="animated-element w-20 h-20 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-medium select-none"
                style={previewStyle}
              >
                Preview
              </div>
            </div>

            {/* Timeline indicator */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 flex-shrink-0">Timeline</span>
                <div className="flex-1 relative h-4">
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                    <div className="w-full h-0.5 bg-gray-200 rounded" />
                  </div>
                  {sortedKeyframes.map((kf) => (
                    <div
                      key={kf.id}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                      style={{ left: `${kf.offset}%` }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-800 border-2 border-white shadow-sm" />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{config.duration}s</span>
              </div>
            </div>
          </div>

          {/* Generated CSS */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">Generated CSS</span>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied ? 'Copied!' : 'Copy CSS'}
              </Button>
            </div>
            <pre className="p-4 text-xs text-gray-700 bg-white overflow-x-auto leading-relaxed font-mono max-h-72 overflow-y-auto whitespace-pre-wrap">
              {generatedCSS}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
