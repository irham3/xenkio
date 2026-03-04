'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GestureGuideProps {
    onClose: () => void;
}

export function GestureGuide({ onClose }: GestureGuideProps) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close guide"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">Gesture Control</p>
                    <h2 className="text-xl font-bold text-gray-900">How to Navigate with Gestures</h2>
                    <p className="text-sm text-gray-500 mt-1">Hold your hand up to the camera and swipe to flip pages</p>
                </div>

                {/* Animated Hand Guide */}
                <div className="px-6 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Swipe Left → Next Page */}
                        <div className="relative flex flex-col items-center p-5 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                            <div className="relative w-full h-28 flex items-center justify-center mb-3">
                                {/* Background arrow hint */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
                                    <ChevronRight className="w-24 h-24" />
                                </div>
                                {/* Animated hand SVG */}
                                <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    {/* Trail effect */}
                                    <line x1="25" y1="50" x2="95" y2="50" stroke="#0EA5E9" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                                    <circle cx="25" cy="50" r="4" fill="#0EA5E9" opacity="0.2" />
                                    <circle cx="95" cy="50" r="4" fill="#0EA5E9" opacity="0.4" />
                                    {/* Arrow at end */}
                                    <polygon points="90,44 100,50 90,56" fill="#0EA5E9" opacity="0.5" />
                                    {/* Animated Hand */}
                                    <g className="animate-swipe-right">
                                        {/* Palm */}
                                        <rect x="-16" y="-20" width="32" height="28" rx="6" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1.5" />
                                        {/* Fingers */}
                                        <rect x="-14" y="-38" width="7" height="22" rx="3.5" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                        <rect x="-5" y="-42" width="7" height="26" rx="3.5" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                        <rect x="4" y="-40" width="7" height="24" rx="3.5" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                        <rect x="13" y="-36" width="6" height="20" rx="3" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                        {/* Thumb */}
                                        <rect x="-24" y="-14" width="14" height="7" rx="3.5" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                    </g>
                                </svg>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span className="text-sm font-bold text-gray-900">Swipe Right</span>
                                    <ChevronRight className="w-4 h-4 text-primary-500" />
                                </div>
                                <p className="text-[11px] text-gray-500 leading-snug">Move hand right<br />to go to next page</p>
                            </div>
                        </div>

                        {/* Swipe Right → Previous Page */}
                        <div className="relative flex flex-col items-center p-5 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                            <div className="relative w-full h-28 flex items-center justify-center mb-3">
                                {/* Background arrow hint */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
                                    <ChevronLeft className="w-24 h-24" />
                                </div>
                                {/* Animated hand SVG */}
                                <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    {/* Trail effect */}
                                    <line x1="95" y1="50" x2="25" y2="50" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                                    <circle cx="95" cy="50" r="4" fill="#8B5CF6" opacity="0.2" />
                                    <circle cx="25" cy="50" r="4" fill="#8B5CF6" opacity="0.4" />
                                    {/* Arrow at end */}
                                    <polygon points="30,44 20,50 30,56" fill="#8B5CF6" opacity="0.5" />
                                    {/* Animated Hand */}
                                    <g className="animate-swipe-left">
                                        {/* Palm */}
                                        <rect x="-16" y="-20" width="32" height="28" rx="6" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1.5" />
                                        {/* Fingers */}
                                        <rect x="-14" y="-38" width="7" height="22" rx="3.5" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                        <rect x="-5" y="-42" width="7" height="26" rx="3.5" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                        <rect x="4" y="-40" width="7" height="24" rx="3.5" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                        <rect x="13" y="-36" width="6" height="20" rx="3" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                        {/* Thumb */}
                                        <rect x="-24" y="-14" width="14" height="7" rx="3.5" fill="#f5d0a9" stroke="#d4a574" strokeWidth="1" />
                                    </g>
                                </svg>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <ChevronLeft className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-bold text-gray-900">Swipe Left</span>
                                </div>
                                <p className="text-[11px] text-gray-500 leading-snug">Move hand left<br />to go to previous page</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="px-6 py-4">
                    <div className="grid grid-cols-3 gap-3">
                        <TipCard
                            emoji="💡"
                            title="Good Lighting"
                            description="Ensure your face and hand are well-lit"
                        />
                        <TipCard
                            emoji="📏"
                            title="Arm Distance"
                            description="Keep hand 30-60 cm from the camera"
                        />
                        <TipCard
                            emoji="🖐️"
                            title="Open Palm"
                            description="Spread fingers for best detection"
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                    >
                        Got it, start detecting!
                    </button>
                </div>

                {/* Animation styles */}
                <style jsx>{`
                    @keyframes swipeRight {
                        0% { transform: translate(30px, 50px); opacity: 0.3; }
                        15% { opacity: 1; }
                        70% { opacity: 1; }
                        85% { transform: translate(90px, 50px); opacity: 0.3; }
                        100% { transform: translate(90px, 50px); opacity: 0; }
                    }
                    @keyframes swipeLeft {
                        0% { transform: translate(90px, 50px); opacity: 0.3; }
                        15% { opacity: 1; }
                        70% { opacity: 1; }
                        85% { transform: translate(30px, 50px); opacity: 0.3; }
                        100% { transform: translate(30px, 50px); opacity: 0; }
                    }
                    :global(.animate-swipe-right) {
                        animation: swipeRight 2s ease-in-out infinite;
                    }
                    :global(.animate-swipe-left) {
                        animation: swipeLeft 2s ease-in-out 0.5s infinite;
                    }
                `}</style>
            </div>
        </div>
    );
}

function TipCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-lg mb-1.5">{emoji}</span>
            <h4 className="text-[11px] font-bold text-gray-900 mb-0.5">{title}</h4>
            <p className="text-[10px] text-gray-500 leading-snug">{description}</p>
        </div>
    );
}
