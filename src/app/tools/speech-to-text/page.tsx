import { Metadata } from "next";
import SpeechToTextClient from "./client";

export const metadata: Metadata = {
    title: "Free Speech to Text Converter | Online Dictation Tool",
    description: "Convert voice to text instantly with our free online speech recognition tool. Support multiple languages, unlimited dictation, and privacy-focused processing.",
    openGraph: {
        title: "Free Speech to Text Converter",
        description: "Convert voice to text instantly. Free, unlimited, and private.",
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

export default function SpeechToTextPage() {
    return <SpeechToTextClient />;
}
