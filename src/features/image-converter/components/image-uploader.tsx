"use client"

import { ImageUploader } from "@/features/image-to-pdf/components/image-uploader"

// Reusing ImageUploader from image-to-pdf since it is generic enough for now.
// It accepts common image formats which matches our requirement: "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]
// If we need different props later, we can duplicate and modify.
export { ImageUploader }
