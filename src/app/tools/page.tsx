

import { Metadata } from "next";
import { ToolsPageClient } from "./tools-client";

export const metadata: Metadata = {
  title: "All Tools | Free & Browser-Based | Xenkio",
  description: "Browse all free tools for PDFs, images, security, and development. Everything runs locally in your browser | no uploads, no limits.",
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
