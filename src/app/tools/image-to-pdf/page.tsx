export const runtime = 'edge';

import { ImageToPdfClient } from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Image to PDF Converter | Xenkio Tools",
  description: "Convert images to PDF documents. Choose page size options, combine multiple images into one PDF or create separate files for each image. Supports JPG, PNG, WebP, GIF, and BMP.",
  openGraph: {
    title: "Image to PDF Converter | Xenkio Tools",
    description: "Convert images to PDF documents. Choose page size options, combine multiple images into one PDF or create separate files.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image to PDF Converter | Xenkio Tools",
    description: "Convert images to PDF documents. Choose page size options, combine multiple images into one PDF or create separate files.",
  },
}

export default function ImageToPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Image to PDF Converter",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Convert images to PDF documents. Choose page size options, combine multiple images into one PDF or create separate files for each image.",
    "featureList": [
      "Multiple image format support (JPG, PNG, WebP)",
      "Drag and drop reordering",
      "Page size customization",
      "Single or batch PDF generation",
      "Client-side processing"
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto py-12 px-4">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Image to PDF
          </h1>
          <p className="text-lg text-gray-500">
            Convert your images to PDF documents. Support JPG, PNG, WebP. Drag and drop to reorder.
          </p>
        </div>
        <ImageToPdfClient />
      </div>

    </>
  )
}
