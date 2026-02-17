
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import PasswordStrengthClient from './client';

export const metadata: Metadata = {
    title: 'Password Strength Checker - Test Security & Crack Time',
    description: 'Analyze your password security instantly. Check entropy, crack time estimation, and get actionable tips to improve your password strength.',
    openGraph: {
        title: 'Password Strength Checker | Xenkio',
        description: 'Test your password security with our advanced strength analyzer.',
    }
};

export default function PasswordStrengthPage() {
    const tool = TOOLS.find(t => t.slug === 'password-strength');

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Password Strength Checker",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Entropy calculation",
            "Crack time estimation",
            "Security tips",
            "Instant analysis"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    Security Tools
                </div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150 relative z-10">
                    Password Strength Check
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 font-medium">
                    Analyze your password security instantly. We check entropy, complexity, and estimate crack time using advanced algorithms.
                </p>
            </div>

            <PasswordStrengthClient />
        </div>
    );
}
