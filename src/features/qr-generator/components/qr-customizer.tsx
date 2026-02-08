
'use client';

import { useState } from 'react';
import { QRConfig } from '../types';
import { QR_ERROR_LEVELS } from '../constants';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Frame, Settings2, Palette } from 'lucide-react';

interface QrCustomizerProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export function QrCustomizer({ config, onChange }: QrCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'frame' | 'options'>('design');

  const tabs = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'frame', label: 'Frame', icon: Frame },
    { id: 'options', label: 'Options', icon: Settings2 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[300px]">

        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Shapes Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Shapes</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Dots Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['square', 'rounded', 'dots'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => onChange({ dotStyle: style })}
                        className={cn(
                          "px-2 py-1.5 text-xs rounded-md border transition-all",
                          config.dotStyle === style
                            ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Corners Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['square', 'rounded', 'extra-rounded'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => onChange({ cornerStyle: style })}
                        className={cn(
                          "px-2 py-1.5 text-xs rounded-md border transition-all",
                          config.cornerStyle === style
                            ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Colors</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Use Gradient</Label>
                  <input
                    type="checkbox"
                    checked={config.gradient?.enabled}
                    onChange={(e) => {
                      const isEnabled = e.target.checked;
                      onChange({
                        fgColor: isEnabled ? config.fgColor : '#000000',
                        gradient: {
                          ...(config.gradient || { startColor: '#000000', endColor: '#0EA5E9', rotation: 45 }),
                          enabled: isEnabled
                        }
                      });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                {config.gradient?.enabled ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Start Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.gradient.startColor}
                            onChange={(e) => onChange({
                              gradient: { ...config.gradient!, startColor: e.target.value }
                            })}
                            className="h-8 w-8 rounded border p-0.5"
                          />
                          <input
                            type="text"
                            value={config.gradient.startColor}
                            onChange={(e) => onChange({
                              gradient: { ...config.gradient!, startColor: e.target.value }
                            })}
                            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">End Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.gradient.endColor}
                            onChange={(e) => onChange({
                              gradient: { ...config.gradient!, endColor: e.target.value }
                            })}
                            className="h-8 w-8 rounded border p-0.5"
                          />
                          <input
                            type="text"
                            value={config.gradient.endColor}
                            onChange={(e) => onChange({
                              gradient: { ...config.gradient!, endColor: e.target.value }
                            })}
                            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Gradient Rotation ({config.gradient.rotation}°)</Label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={config.gradient.rotation}
                        onChange={(e) => onChange({
                          gradient: { ...config.gradient!, rotation: parseInt(e.target.value) }
                        })}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Background Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.bgColor}
                          onChange={(e) => onChange({ bgColor: e.target.value })}
                          className="h-8 w-8 rounded border p-0.5"
                        />
                        <input
                          type="text"
                          value={config.bgColor}
                          onChange={(e) => onChange({ bgColor: e.target.value })}
                          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Foreground</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.fgColor}
                          onChange={(e) => onChange({ fgColor: e.target.value })}
                          className="h-8 w-8 rounded border p-0.5"
                        />
                        <input
                          type="text"
                          value={config.fgColor}
                          onChange={(e) => onChange({ fgColor: e.target.value })}
                          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs text uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Background</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.bgColor}
                          onChange={(e) => onChange({ bgColor: e.target.value })}
                          className="h-8 w-8 rounded border p-0.5"
                        />
                        <input
                          type="text"
                          value={config.bgColor}
                          onChange={(e) => onChange({ bgColor: e.target.value })}
                          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs text uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Custom Corner Colors</Label>
                    <input
                      type="checkbox"
                      checked={!!config.cornerColor}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onChange({ cornerColor: '#000000', cornerDotColor: '#000000' });
                        } else {
                          onChange({ cornerColor: undefined, cornerDotColor: undefined });
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>

                  {config.cornerColor && (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase text-gray-500 font-bold">Outer Corner Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.cornerColor}
                            onChange={(e) => onChange({ cornerColor: e.target.value })}
                            className="h-8 w-8 rounded border p-0.5"
                          />
                          <input
                            type="text"
                            value={config.cornerColor}
                            onChange={(e) => onChange({ cornerColor: e.target.value })}
                            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase text-gray-500 font-bold">Inner Corner Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.cornerDotColor}
                            onChange={(e) => onChange({ cornerDotColor: e.target.value })}
                            className="h-8 w-8 rounded border p-0.5"
                          />
                          <input
                            type="text"
                            value={config.cornerDotColor}
                            onChange={(e) => onChange({ cornerDotColor: e.target.value })}
                            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'frame' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Frame Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['none', 'simple', 'modern', 'badge'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onChange({
                        frame: { ...(config.frame || { text: 'SCAN ME', color: '#000000' }), style }
                      })}
                      className={cn(
                        "px-3 py-2 text-sm rounded-md border transition-all",
                        config.frame?.style === style
                          ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {config.frame?.style !== 'none' && (
                <>
                  <div className="space-y-2">
                    <Label>Frame Text</Label>
                    <input
                      type="text"
                      value={config.frame?.text}
                      onChange={(e) => onChange({
                        frame: { ...config.frame!, text: e.target.value }
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="ENTER TEXT"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frame Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.frame?.color}
                        onChange={(e) => onChange({
                          frame: { ...config.frame!, color: e.target.value }
                        })}
                        className="h-9 w-9 rounded border p-0.5"
                      />
                      <input
                        type="text"
                        value={config.frame?.color}
                        onChange={(e) => onChange({
                          frame: { ...config.frame!, color: e.target.value }
                        })}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'options' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Error Correction Level</Label>
              <select
                value={config.level}
                onChange={(e) => onChange({ level: e.target.value as QRConfig['level'] })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {QR_ERROR_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Higher levels allow for more damage to the QR code but produce complex patterns.
                Choose &apos;High&apos; if you plan to add a logo.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Margin</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeMargin}
                  onChange={(e) => onChange({ includeMargin: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Include White Margin</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
