import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { ScientificCalculatorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'scientific-calculator';

export const metadata: Metadata = {
    title: 'Scientific Calculator | Free Online Calculator with Advanced Functions',
    description: 'Free scientific calculator with trigonometric, logarithmic, exponential, and factorial functions. Supports DEG/RAD mode, expression history, and keyboard input. No sign-up required.',
    keywords: [
        'scientific calculator',
        'online calculator',
        'trigonometry calculator',
        'logarithm calculator',
        'math calculator',
        'sine cosine tangent',
        'factorial calculator',
        'free calculator online',
        'kalkulator ilmiah',
        'kalkulator online',
    ],
    openGraph: {
        title: 'Scientific Calculator | Xenkio Tools',
        description: 'Full-featured scientific calculator with trig, log, power, and factorial functions. Free, instant, no sign-up.',
        type: 'website',
    },
};

export default function ScientificCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Scientific Calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Basic arithmetic operations',
            'Trigonometric functions (sin, cos, tan)',
            'Inverse trigonometric functions',
            'Hyperbolic functions',
            'Logarithms (log, ln, log2)',
            'Powers and roots',
            'Factorial',
            'Constants (π, e)',
            'DEG/RAD angle mode',
            'Expression history',
            'Keyboard support',
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
            <section className="container mx-auto px-4 max-w-5xl pb-16">
                <ScientificCalculatorClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Full Scientific Functions
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Trigonometry:</strong>{' '}
                                    sin, cos, tan and their inverses (arcsin, arccos, arctan).
                                    Switch between degree and radian mode as needed.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Logarithms & Exponents:</strong>{' '}
                                    Common log (log₁₀), natural log (ln), log₂, exponential (eˣ),
                                    and arbitrary powers (xⁿ).
                                </p>
                                <p>
                                    <strong className="text-gray-800">Other Functions:</strong>{' '}
                                    Square root, cube root, factorial (n!), absolute value,
                                    reciprocal (1/x), and hyperbolic functions (sinh, cosh, tanh).
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Keyboard Shortcuts
                            </h2>
                            <div className="space-y-1.5 text-sm text-gray-600">
                                {[
                                    { key: '0–9, .', desc: 'Number input' },
                                    { key: '+ − * /', desc: 'Basic operators' },
                                    { key: '( )', desc: 'Parentheses' },
                                    { key: '^', desc: 'Power' },
                                    { key: '!', desc: 'Factorial' },
                                    { key: 'Enter / =', desc: 'Calculate' },
                                    { key: 'Backspace', desc: 'Delete last character' },
                                    { key: 'Esc / C', desc: 'Clear all' },
                                ].map((s) => (
                                    <div key={s.key} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">{s.key}</code>
                                        <span className="text-gray-500">{s.desc}</span>
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
