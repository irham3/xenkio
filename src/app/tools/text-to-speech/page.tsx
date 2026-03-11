import { Metadata } from "next";
import TextToSpeechClient from "./client";

export const metadata: Metadata = {
    title: "Free Text to Speech Converter | Online TTS Tool",
    description: "Convert text to natural-sounding speech instantly with our free online text-to-speech tool. Supports multiple languages, adjustable speed and pitch, all processed in your browser.",
    openGraph: {
        title: "Free Text to Speech Converter",
        description: "Convert text to speech instantly. Free, unlimited, and private.",
        type: "website",
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

export default function TextToSpeechPage() {
    return <TextToSpeechClient />;
}
