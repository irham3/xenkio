

import { Metadata } from "next";
import { ToolsPageClient } from "./tools-client";

export const metadata: Metadata = {
  title: "All Tools | Free & Browser-Based | Xenkio",
  description: "Browse all free tools for PDFs, images, security, and development. Everything runs locally in your browser | no uploads, no limits.",
  openGraph: {
    title: "All Tools | Free & Browser-Based | Xenkio",
    description: "Browse all free tools for PDFs, images, security, and development. Everything runs locally in your browser.",
    url: "https://xenkio.com/tools",
    siteName: "Xenkio",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Xenkio | Free Browser-Based Tools",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Tools | Free & Browser-Based | Xenkio",
    description: "Browse all free tools for PDFs, images, security, and development. Everything runs locally in your browser.",
    images: ["/og-image.jpg"],
  },
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
