'use client';

import { useCollisionCalculator } from '@/features/uuid-collision-calculator/hooks/use-collision-calculator';
import { IdTypeSelector } from '@/features/uuid-collision-calculator/components/id-type-selector';
import { CollisionResultCard } from '@/features/uuid-collision-calculator/components/collision-result';
import { getIdType } from '@/features/uuid-collision-calculator/lib/collision-utils';
import { Hash, Info } from 'lucide-react';

/** Log-scale slider: maps slider position [0,100] ↔ n in [1, 1e18] */
const SLIDER_MIN = 1;
const SLIDER_MAX = 100;
const N_MIN = 1;
const N_MAX = 1e18;

function sliderToN(slider: number): number {
    const t = (slider - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
    return Math.round(Math.pow(N_MAX / N_MIN, t) * N_MIN);
}

function nToSlider(n: number): number {
    const t = Math.log(n / N_MIN) / Math.log(N_MAX / N_MIN);
    return Math.round(SLIDER_MIN + t * (SLIDER_MAX - SLIDER_MIN));
}

function formatNLabel(n: number): string {
    if (n >= 1e15) return `${(n / 1e15).toFixed(1)}Q`;
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toString();
}

export default function UUIDCollisionClient() {
    const { config, result, updateIdType, updateIdCount, updateCustomBits } = useCollisionCalculator();

    const sliderValue = nToSlider(config.idCount);
    const currentType = getIdType(config.idType);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-10">
            {/* Left: Settings */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 space-y-8">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Hash className="h-5 w-5 text-primary-500" />
                        Configuration
                    </h3>

                    <IdTypeSelector
                        value={config.idType}
                        onChange={updateIdType}
                        customBits={config.customBits}
                        onCustomBitsChange={updateCustomBits}
                    />

                    {/* ID count slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                                IDs Generated
                            </label>
                            <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-mono">
                                {formatNLabel(config.idCount)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={SLIDER_MIN}
                            max={SLIDER_MAX}
                            step="1"
                            value={sliderValue}
                            onChange={(e) => updateIdCount(sliderToN(Number(e.target.value)))}
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                            <span>1</span>
                            <span>1M</span>
                            <span>1B</span>
                            <span>1T</span>
                            <span>1Q</span>
                        </div>
                    </div>

                    {/* Selected type info */}
                    {config.idType !== 'custom' && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                            <Info className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500 leading-relaxed">
                                <span className="font-black text-gray-700">{currentType.label}</span>
                                {' — '}{currentType.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Result */}
            <div className="lg:col-span-3 space-y-8">
                <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        Collision Analysis
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto normal-case tracking-normal">
                            Based on Birthday Problem
                        </span>
                    </h3>
                    <CollisionResultCard result={result} />
                </div>

                {/* Info box */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 space-y-4">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary-400" />
                        How It Works
                    </h4>
                    <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
                        <p>
                            The <span className="font-semibold text-gray-700">Birthday Problem</span> tells us the probability
                            that at least two values collide when drawing <em>n</em> items uniformly from a space of <em>N</em>{' '}
                            possible values:
                        </p>
                        <p className="font-mono text-xs bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 text-gray-700">
                            P(collision) ≈ 1 − e<sup>−n² / (2N)</sup>
                        </p>
                        <p>
                            For UUID v4 (122 bits), you would need to generate roughly{' '}
                            <span className="font-semibold text-gray-700">2.7 × 10¹⁸</span> UUIDs before hitting a{' '}
                            <span className="font-semibold text-gray-700">50% collision probability</span> — far beyond any
                            practical system.
                        </p>
                        <p>
                            Shorter identifiers (NanoID-10, UUID v7 within same ms) have fewer random bits and are
                            more susceptible to collisions under heavy load.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
