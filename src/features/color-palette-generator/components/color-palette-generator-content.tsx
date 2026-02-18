import React from 'react';
import { Lock, Download, Zap, RefreshCw } from 'lucide-react';

export function ColorPaletteGeneratorContent() {
    return (
        <div className="mt-16 space-y-16">
            {/* Quick Guide */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary-500" />
                    How to use the Color Palette Generator
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg border border-primary-100">1</div>
                        <h3 className="font-semibold text-gray-900">Generate Colors</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Press <kbd className="font-sans font-semibold border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 text-gray-500 text-xs">Space</kbd> or click the Generate button to create a fresh set of harmonious colors.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg border border-primary-100">2</div>
                        <h3 className="font-semibold text-gray-900">Lock Favorites</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Click the <Lock className="w-3 h-3 inline mx-1" /> icon on any color strip to lock it. Future generations will update only the unlocked colors around it.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg border border-primary-100">3</div>
                        <h3 className="font-semibold text-gray-900">Export & Use</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Copy individual HEX codes by clicking the text, or export the entire palette as CSS variables or JSON for your project.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Features</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Powerful color tools for professional designers and developers.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                            <RefreshCw className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Generation</h3>
                        <p className="text-gray-600 text-sm">
                            Create millions of color combinations instantly. Just hit spacebar to explore new ideas.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Locking</h3>
                        <p className="text-gray-600 text-sm">
                            Lock specific colors you like and let the generator find matching colors for the rest of the palette.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                            <Download className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Export</h3>
                        <p className="text-gray-600 text-sm">
                            Download your palette as JSON or copy-paste CSS variables directly into your stylesheet.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Accessibility First</h3>
                        <p className="text-gray-600 text-sm">
                            Real-time WCAG contrast ratio analysis for both black and white text on every color.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-pink-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Curated Collection</h3>
                        <p className="text-gray-600 text-sm">
                            Access our library of professionally designed color palettes to jump-start your project.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
