import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import dynamic from "next/dynamic";
import { HowItWorksClient } from "./client";

const Footer = dynamic(() => import("@/components/layout/footer").then(mod => mod.Footer), {
    ssr: true,
});

export const metadata: Metadata = {
    title: "How Xenkio Works — 100% Browser-Based, Zero Uploads",
    description: "Unlike other tools, Xenkio processes everything in your browser. Your files never leave your device — no uploads, no servers, no limits.",
    openGraph: {
        title: "How Xenkio Works",
        description: "Your files never leave your device. See how Xenkio processes everything locally in your browser.",
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
    return (
        <main className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />
            <HowItWorksClient />
            <Footer />
        </main>
    );
}
