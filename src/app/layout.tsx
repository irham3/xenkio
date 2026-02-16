import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const fontSans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: "Xenkio - All-in-One Online Productivity Tools",
    template: "%s | Xenkio"
  },
  description: "Xenkio offers a comprehensive collection of free, instant online tools for PDF processing, image compression, data format conversion, and more. No signup required, zero cost, 100% secure.",
  keywords: ["online tools", "productivity tools", "developer utilities", "pdf tools", "image tools", "free online utilities", "xenkio", "no signup tools"],
  authors: [{ name: "Altruis" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xenkio.pages.dev",
    title: "Xenkio - All-in-One Online Productivity Tools",
    description: "Access professional tools for free. Fast, secure, and no registration needed.",
    siteName: "Xenkio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xenkio - All-in-One Online Productivity Tools",
    description: "Fast, free, and secure online tools for everyone.",
  },
  robots: {
    index: true,
    follow: true,
  },
  applicationName: "Xenkio",
  appleWebApp: {
    title: "Xenkio",
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} font-sans`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Xenkio",
              "alternateName": ["Xenkio Tools", "Xenkio Online"],
              "url": "https://xenkio.pages.dev",
              "description": "Free online tools for everyone.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://xenkio.pages.dev/tools?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
