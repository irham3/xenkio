export const runtime = 'edge';

import { ImageCompressorClient } from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Image Compressor | Xenkio Tools",
  description: "Compress your images securely in the browser. Reduce file size without losing quality for better web performance and SEO.",
}

export default function ImageCompressorPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <ImageCompressorClient />
    </div>
  )
}
