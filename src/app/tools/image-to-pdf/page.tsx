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
  return (
    <div className="container mx-auto py-12 px-4">
      <ImageToPdfClient />
    </div>
  )
}
