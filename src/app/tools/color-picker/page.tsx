export const runtime = 'edge';

import { Metadata } from 'next';
import { DUMMY_TOOLS } from '@/data/tools';
import { ColorPickerClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'color-picker';

export const metadata: Metadata = {
  title: 'Color Picker 2025 - HEX, RGB, HSL Converter & Picker Tool',
  description: 'Pick colors from images and convert between HEX, RGB, and HSL color formats instantly. Free online color picker with preset colors, history tracking, and real-time preview.',
  keywords: ['color picker', 'hex to rgb', 'rgb to hsl', 'color converter', 'color palette', 'color tool', 'pick color from image', '2025'],
  openGraph: {
    title: 'Color Picker - HEX, RGB, HSL Converter | Xenkio',
    description: 'Pick colors from images and convert between HEX, RGB, and HSL formats instantly.',
    type: 'website',
  }
};

export default function ColorPickerPage() {
  const tool = DUMMY_TOOLS.find(t => t.slug === slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Tool Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
      </div>

      {/* Feature UI (Client Component) */}
      <ColorPickerClient />
    </div>
  );
}
