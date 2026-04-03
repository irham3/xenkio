import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { TimeComplexityCalculatorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'time-complexity-calculator';

export const metadata: Metadata = {
    title: 'Time Complexity Calculator | Analyze Big O Notation Online',
    description:
        'Analyze the time and space complexity of your algorithm. Detect loops, recursion, and divide-and-conquer patterns. Get instant Big O notation with explanation.',
    keywords: [
        'time complexity calculator',
        'big o notation',
        'algorithm complexity',
        'space complexity',
        'big o calculator',
        'algorithm analysis',
        'O(n) O(n²) O(log n)',
        'kalkulator kompleksitas waktu',
        'analisis algoritma',
        'big o notation calculator',
    ],
    openGraph: {
        title: 'Time Complexity Calculator | Xenkio Tools',
        description:
            'Analyze Big O time and space complexity of your algorithm. Instant, no sign-up required.',
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

export default function TimeComplexityCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Time Complexity Calculator',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Detect Big O time complexity from code',
            'Detect Big O space complexity',
            'Recognize loop nesting depth',
            'Identify recursion patterns',
            'Identify divide-and-conquer patterns',
            'Identify factorial/permutation patterns',
            'Big O complexity reference table',
            'Growth rate visual comparison chart',
            'Common algorithm pattern presets',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            {tool.title}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {tool.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-3xl pb-16">
                <TimeComplexityCalculatorClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                What is Time Complexity?
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Big O Notation</strong> describes
                                    how the running time or memory usage of an algorithm grows relative
                                    to the input size <em>n</em>. It focuses on the dominant term and
                                    ignores constants.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Time complexity</strong> measures
                                    the number of operations performed. A single loop is O(n); two nested
                                    loops are O(n²); divide-and-conquer algorithms like binary search are
                                    O(log n).
                                </p>
                                <p>
                                    <strong className="text-gray-800">Space complexity</strong> measures
                                    the additional memory your algorithm uses. Iterative solutions often
                                    need O(1) extra space, while recursive ones consume O(n) stack space.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                How to Use This Tool
                            </h2>
                            <div className="space-y-2 text-sm text-gray-600">
                                {[
                                    { step: '1', text: 'Choose a quick pattern preset or paste your own code.' },
                                    { step: '2', text: 'Click "Analyze Complexity" to run the heuristic analysis.' },
                                    { step: '3', text: 'Review the detected time and space Big O notation.' },
                                    { step: '4', text: 'Read the explanation to understand the detected patterns.' },
                                    { step: '5', text: 'Expand the reference table to compare all common complexities.' },
                                ].map((s) => (
                                    <div key={s.step} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                                        <span className="flex-none w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                            {s.step}
                                        </span>
                                        <span>{s.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
