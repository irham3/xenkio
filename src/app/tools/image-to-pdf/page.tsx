export const runtime = 'edge';

import { ImageToPdfClient } from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Image to PDF Converter | Xenkio Tools",
  description: "Convert images to PDF documents. Combine multiple images into one PDF or create individual PDFs. Choose between original size or standard paper sizes like A4, Letter, or Legal.",
}

export default function ImageToPdfPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <ImageToPdfClient />
    </div>
  )
}
