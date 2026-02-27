

import { ImageCompressorClient } from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Image Compressor | Xenkio Tools",
  description: "Compress your images securely in the browser. Reduce file size without losing quality for better web performance and SEO.",

  openGraph: {
    title: 'Image Compressor | Xenkio Tools',
    description: 'Compress your images securely in the browser. Reduce file size without losing quality for better web performance and SEO.',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Image Compressor | Xenkio Tools',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Compressor | Xenkio Tools',
    description: 'Compress your images securely in the browser. Reduce file size without losing quality for better web performance and SEO.',
    images: ['/og-image.jpg'],
  },

}

export default function ImageCompressorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Image Compressor",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Compress your images securely in the browser. Reduce file size without losing quality for better web performance and SEO.",
    "featureList": [
      "Compress JPG/PNG/WebP",
      "Reduce file size up to 80%",
      "Batch processing",
      "Client-side only"
    ]
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ImageCompressorClient />
    </div>
  )
}
