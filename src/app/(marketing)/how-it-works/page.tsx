import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import dynamic from "next/dynamic";
import { HowItWorksClient } from "./client";

const Footer = dynamic(() => import("@/components/layout/footer").then(mod => mod.Footer), {
    ssr: true,
});

export const metadata: Metadata = {
    title: "How Xenkio Works — 100% Browser-Based, Zero Uploads, GDPR Compliant",
    description: "Unlike other tools, Xenkio processes everything in your browser using JavaScript and WebAssembly. Your files never leave your device — no uploads, no servers, no limits. Inherently GDPR compliant by design.",
    keywords: [
        "browser-based tools",
        "local file processing",
        "GDPR compliant tools",
        "no upload file tools",
        "privacy-first tools",
        "offline tools",
        "WebAssembly tools",
        "client-side processing",
        "data protection by design",
        "HIPAA compliant",
        "enterprise file tools",
    ],
    openGraph: {
        title: "How Xenkio Works — Your Files Never Leave Your Device",
        description: "Process files locally in your browser with JavaScript and WebAssembly. No uploads, no server processing, no limits. Inherently GDPR compliant.",
        url: "https://xenkio.com/how-it-works",
        siteName: "Xenkio",
        locale: "en_US",
        type: "website",
    },
    alternates: {
        canonical: "https://xenkio.com/how-it-works",
    },
};

export default function HowItWorksPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How does Xenkio process files without uploading them?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Xenkio uses modern browser technologies like JavaScript and WebAssembly (WASM) to process files entirely on your device. When you select a file, it's read through the browser's File API and processed in memory — the data never leaves your browser."
                }
            },
            {
                "@type": "Question",
                "name": "Is Xenkio GDPR compliant?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Xenkio is inherently GDPR compliant because your files never leave your browser. Since no personal data is collected, transmitted, or stored on our servers, there's no data processing to regulate."
                }
            },
            {
                "@type": "Question",
                "name": "Can I use Xenkio offline?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Once you load Xenkio, the Progressive Web App caches the tool code on your device. You can continue using tools even without an internet connection — the strongest possible proof that no data is sent to any server."
                }
            },
            {
                "@type": "Question",
                "name": "Are there file size limits on Xenkio?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Since there's no server processing cost, there are no artificial limits. Your device's RAM is the only practical limit. Xenkio will display a device capacity estimate when applicable."
                }
            }
        ]
    };

    return (
        <main className="min-h-screen bg-white flex flex-col font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />
            <HowItWorksClient />
            <Footer />
        </main>
    );
}
