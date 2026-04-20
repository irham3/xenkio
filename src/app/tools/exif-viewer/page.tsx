import { ExifViewerClient } from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "EXIF Viewer | Xenkio Tools",
  description: "View EXIF metadata from photos — camera model, settings, GPS location, date and more. 100% private, processed in your browser.",

  openGraph: {
    title: "EXIF Viewer | Xenkio Tools",
    description: "View EXIF metadata from photos — camera model, settings, GPS location, date and more. 100% private, processed in your browser.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EXIF Viewer | Xenkio Tools",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EXIF Viewer | Xenkio Tools",
    description: "View EXIF metadata from photos — camera model, settings, GPS location, date and more. 100% private, processed in your browser.",
    images: ["/og-image.jpg"],
  },
}

export default function ExifViewerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EXIF Viewer",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "View EXIF metadata from photos — camera model, settings, GPS location, date and more. 100% private, processed in your browser.",
    featureList: [
      "View EXIF metadata",
      "Camera & lens info",
      "GPS location",
      "Capture settings (ISO, aperture, shutter speed)",
      "Export as JSON",
      "Client-side only",
    ],
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExifViewerClient />
    </div>
  )
}
