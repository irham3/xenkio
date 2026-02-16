

import { Metadata } from "next";
import { ToolsPageClient } from "./tools-client";

export const metadata: Metadata = {
  title: "Explore All Online Tools",
  description: "Browse our curated collection of free online tools for PDF, image editing, security, and development.",
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
