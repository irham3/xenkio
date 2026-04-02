import { Metadata } from 'next';
import KeyframeAnimationGeneratorClient from './client';

export const metadata: Metadata = {
  title: 'CSS Keyframe Animation Generator | Create Animations Online',
  description:
    'Create CSS keyframe animations visually. Define keyframes, set easing, duration, delay, and direction — then copy the @keyframes CSS code instantly.',
  keywords: [
    'css keyframe animation generator',
    'css animation maker',
    'keyframe generator',
    '@keyframes generator',
    'css animation tool',
    'animation css generator',
    'web animation tool',
    'css transition generator',
    'css animation editor',
    'keyframe animation builder',
  ],
  openGraph: {
    title: 'CSS Keyframe Animation Generator | Free Online Tool',
    description:
      'Build CSS @keyframes animations visually. Live preview, preset animations, and instant code export.',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Xenkio | Free Browser-Based Tools',
        type: 'image/jpeg',
      },
    ],
  },
};

export default function KeyframeAnimationGeneratorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CSS Keyframe Animation Generator',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Create CSS keyframe animations visually with live preview. Define keyframes, set animation properties, and export ready-to-use @keyframes CSS code.',
    featureList: [
      'Visual keyframe editor',
      'Live animation preview',
      '8 preset animations',
      'Easing function selector',
      'Duration and delay controls',
      'Direction and fill mode settings',
      'Instant CSS code export',
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              CSS Keyframe Animation Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Build CSS @keyframes animations visually — define keyframes, pick easing, and copy
              production-ready code instantly
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 pb-8 max-w-5xl">
        <KeyframeAnimationGeneratorClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">CSS @keyframes Explained</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">@keyframes Rule</strong> | Defines the
                  animation sequence by specifying CSS property values at specific points
                  (percentages) in the animation timeline. Use{' '}
                  <code className="text-gray-700 bg-gray-100 px-1 rounded">from</code> / 0% for the
                  start and{' '}
                  <code className="text-gray-700 bg-gray-100 px-1 rounded">to</code> / 100% for the
                  end.
                </p>
                <p>
                  <strong className="text-gray-800">animation Property</strong> | Attaches a
                  keyframe animation to an element with shorthand including name, duration, easing,
                  delay, iteration count, direction, and fill mode.
                </p>
                <p>
                  <strong className="text-gray-800">Transform Animations</strong> | Use{' '}
                  <code className="text-gray-700 bg-gray-100 px-1 rounded">transform</code> for
                  performant translate, rotate, scale, and skew effects that are GPU-accelerated.
                  Prefer{' '}
                  <code className="text-gray-700 bg-gray-100 px-1 rounded">opacity</code> and
                  transform over animating layout properties.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Start with a Preset</strong> | Choose from 8
                  built-in animation presets like Fade In, Bounce, Pulse, Spin, and more to get
                  started quickly. Each preset is fully editable.
                </p>
                <p>
                  <strong className="text-gray-800">Edit Keyframes</strong> | Add or remove
                  keyframes and define CSS properties at each percentage point. Type any CSS
                  property name with autocomplete suggestions for common properties.
                </p>
                <p>
                  <strong className="text-gray-800">Live Preview</strong> | Watch your animation
                  play in real time in the preview pane. Use Play/Pause and Restart controls to
                  inspect individual frames.
                </p>
                <p>
                  <strong className="text-gray-800">Copy &amp; Use</strong> | Click{' '}
                  <strong>Copy CSS</strong> to get the generated{' '}
                  <code className="text-gray-700 bg-gray-100 px-1 rounded">@keyframes</code> block
                  and the{' '}
                  <code className="text-gray-700 bg-gray-100 px-1 rounded">.animated-element</code>{' '}
                  class. Apply it to any element in your project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
