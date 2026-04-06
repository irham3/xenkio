import { ImageUpscalerClient } from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Image Upscaler | Xenkio Tools",
    description:
        "Upscale images up to 8× without losing quality. 100% browser-based — no uploads, no servers, fully private.",
    openGraph: {
        title: "Image Upscaler | Xenkio Tools",
        description:
            "Upscale images up to 8× without losing quality. 100% browser-based — no uploads, no servers, fully private.",
        type: "website",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Image Upscaler | Xenkio Tools",
                type: "image/jpeg",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Image Upscaler | Xenkio Tools",
        description:
            "Upscale images up to 8× without losing quality. 100% browser-based — no uploads, no servers, fully private.",
        images: ["/og-image.jpg"],
    },
}

export default function ImageUpscalerPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Image Upscaler",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        description:
            "Upscale images up to 8× without losing quality. 100% browser-based — no uploads, no servers, fully private.",
        featureList: [
            "2×, 3×, 4×, 8× AI upscaling",
            "ESRGAN super-resolution — sharper edges, reconstructed textures",
            "Before/after comparison slider",
            "JPG & PNG output",
            "Client-side only — fully private, no uploads",
        ],
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ImageUpscalerClient />
        </div>
    )
}
