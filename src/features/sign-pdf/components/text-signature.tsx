import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { fontDancing, fontGreatVibes, fontAlexBrush, fontPacifico, fontSatisfy } from '../fonts';

const FONTS = [
    { name: 'Dancing Script', family: "var(--font-dancing), cursive" },
    { name: 'Great Vibes', family: "var(--font-great-vibes), cursive" },
    { name: 'Alex Brush', family: "var(--font-alex-brush), cursive" },
    { name: 'Pacifico', family: "var(--font-pacifico), cursive" },
    { name: 'Satisfy', family: "var(--font-satisfy), cursive" },
];

interface TextSignatureProps {
    onSave: (dataUrl: string) => void;
    color: string;
}

export function TextSignature({ onSave, color }: TextSignatureProps) {
    const [text, setText] = useState('');
    const [selectedFont, setSelectedFont] = useState(FONTS[0].family);

    const handleSave = () => {
        if (!text.trim()) return;

        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.font = `60px ${selectedFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        onSave(canvas.toDataURL('image/png'));
    };

    return (
        <div className={cn(
            "space-y-6",
            fontDancing.variable,
            fontGreatVibes.variable,
            fontAlexBrush.variable,
            fontPacifico.variable,
            fontSatisfy.variable
        )}>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type your name</label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Signature text..."
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                {FONTS.map((font) => (
                    <button
                        key={font.name}
                        onClick={() => setSelectedFont(font.family)}
                        className={cn(
                            "p-4 border rounded-xl text-xl text-center transition-all bg-gray-50 hover:bg-white hover:shadow-md",
                            selectedFont === font.family ? "border-primary-500 bg-white shadow-sm ring-1 ring-primary-500" : "border-gray-200"
                        )}
                        style={{ fontFamily: font.family, color: color }}
                    >
                        {text || font.name}
                    </button>
                ))}
            </div>

            <Button
                onClick={handleSave}
                disabled={!text.trim()}
                className="w-full bg-primary-600 hover:bg-primary-700 h-11 text-base font-semibold transition-all shadow-lg shadow-primary-600/20"
            >
                <Check className="w-4 h-4 mr-2" />
                Use Text Signature
            </Button>
        </div>
    );
}
