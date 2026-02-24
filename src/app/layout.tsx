import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";

const fontSans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL("https://xenkio.com"),
  title: {
    default: "Xenkio | Free Browser-Based Tools. No Uploads, No Limits.",
    template: "%s | Xenkio"
  },
  description: "Free online tools for PDFs, images, and developer utilities | everything runs locally in your browser. Your files never leave your device. No sign-up, no limits. GDPR compliant by design.",
  keywords: ["browser-based tools", "local processing", "privacy tools", "pdf tools", "image compressor", "no upload", "free online tools", "offline tools", "xenkio", "GDPR compliant tools", "client-side processing", "no server upload", "data protection"],
  authors: [{ name: "Altruis" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xenkio.com",
    title: "Xenkio | Free Browser-Based Tools. No Uploads, No Limits.",
    description: "Process files locally in your browser. No uploads to servers, no file size limits, no sign-up. GDPR compliant by design | your files never leave your device.",
    siteName: "Xenkio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Xenkio | Free Browser-Based Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xenkio | Free Browser-Based Tools",
    description: "Your files never leave your device. Free tools for PDFs, images, and more | processed 100% in your browser.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://xenkio.com",
  },
  applicationName: "Xenkio",
  category: "technology",
  creator: "Altruis",
  publisher: "Altruis",
  appleWebApp: {
    title: "Xenkio",
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "6c523b0480756dda",
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://static.cloudflareinsights.com" />
      </head>
      <body className={`${fontSans.variable} font-sans`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Xenkio",
              "alternateName": ["Xenkio Tools", "Xenkio Online"],
              "url": "https://xenkio.com",
              "description": "Free browser-based tools for PDFs, images, and developer utilities. Everything runs locally | your files never leave your device.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://xenkio.com/tools?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Providers>
          {children}
          <PwaRegister />
        </Providers>
      </body>
    </html>
  );
}
