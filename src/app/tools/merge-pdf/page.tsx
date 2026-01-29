export const runtime = 'edge';

import { MergePdfClient } from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Merge PDF | Xenkio Tools",
  description: "Combine multiple PDF files into one document. Drag to reorder pages, choose page size options, and download your merged PDF instantly.",
}

export default function MergePdfPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <MergePdfClient />
    </div>
  )
}
