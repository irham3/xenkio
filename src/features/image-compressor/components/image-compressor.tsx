"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import imageCompression from "browser-image-compression"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Upload, X, Download, FileImage, Settings2, RefreshCw, Archive } from "lucide-react"
import JSZip from "jszip"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface CompressedImage {
  id: string
  originalFile: File
  compressedFile: File | null
  status: "idle" | "compressing" | "done" | "error"
  originalPreview: string
}

export function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([])
  const [quality, setQuality] = useState(0.8)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [isCompressingAll, setIsCompressingAll] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      originalFile: file,
      compressedFile: null,
      status: "idle" as const,
      originalPreview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImages])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
  })

  // Cleanup previews
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.originalPreview))
    }
  }, [images])

  const compressImage = async (image: CompressedImage) => {
    const options = {
      maxSizeMB: 1, // Start with a default, but we use strict quality mostly
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      initialQuality: quality,
      fileType: image.originalFile.type === "image/png" ? "image/png" : "image/jpeg", // Keep PNG logs transparency
    }

    try {
      // Update status to compressing
      setImages((prev) =>
        prev.map((img) => (img.id === image.id ? { ...img, status: "compressing" } : img))
      )

      // Since browser-image-compression might convert PNG to JPG by default if not careful,
      // usually it handles types well, but explicit fileType helps.
      const compressedFile = await imageCompression(image.originalFile, options)

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: "done", compressedFile } : img
        )
      )
    } catch (error) {
      console.error("Compression failed:", error)
      setImages((prev) =>
        prev.map((img) => (img.id === image.id ? { ...img, status: "error" } : img))
      )
    }
  }

  const handleCompressAll = async () => {
    setIsCompressingAll(true)
    // Process sequentially or parallel - parallel is fine for a few images
    await Promise.all(images.filter(i => i.status !== "done").map((img) => compressImage(img)))
    setIsCompressingAll(false)
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const downloadImage = (image: CompressedImage) => {
    if (!image.compressedFile) return
    const url = URL.createObjectURL(image.compressedFile)
    const link = document.createElement("a")
    link.href = url
    link.download = `compressed-${image.originalFile.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadAllZip = async () => {
    const zip = new JSZip()
    const folder = zip.folder("compressed-images")

    images.forEach((img) => {
      if (img.compressedFile && folder) {
        folder.file(`compressed-${img.originalFile.name}`, img.compressedFile)
      }
    })

    const content = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(content)
    const link = document.createElement("a")
    link.href = url
    link.download = "images.zip"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Smart Image Compressor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Optimize your images with intelligent compression. High quality, low file size,
          processed entirely in your browser.
        </p>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "relative group border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
              isDragActive
                ? "border-primary-600 bg-primary-50 scale-[1.01]"
                : "border-gray-200 hover:border-primary-600/50 hover:bg-gray-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className={cn(
                "p-4 rounded-full bg-gray-100 transition-transform duration-300 group-hover:scale-110",
                isDragActive && "bg-white"
              )}>
                <Upload className="w-8 h-8 text-gray-900" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-gray-900">
                  Drop images here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WEBP
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-2xl p-6 space-y-6 h-fit sticky top-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <Settings2 className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-lg">Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Quality Level</Label>
                <span className="text-sm text-gray-500">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Max Width</Label>
                <span className="text-sm text-gray-500">{maxWidth}px</span>
              </div>
              <input
                type="range"
                min="500"
                max="3840"
                step="100"
                value={maxWidth}
                onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCompressAll}
              disabled={images.length === 0 || isCompressingAll}
            >
              {isCompressingAll ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Compress All
                </>
              )}
            </Button>

            {images.some(i => i.status === "done") && (
              <Button
                variant="outline"
                className="w-full"
                onClick={downloadAllZip}
              >
                <Archive className="mr-2 h-4 w-4" />
                Download All (ZIP)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Image List */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-4 mt-8"
          >
            {images.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 overflow-hidden"
              >
                {/* Preview */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <Image
                    src={img.originalPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {img.status === "done" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{Math.round((1 - (img.compressedFile!.size / img.originalFile.size)) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                  <h4 className="font-medium truncate max-w-[200px] sm:max-w-md mx-auto sm:mx-0">
                    {img.originalFile.name}
                  </h4>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FileImage className="w-4 h-4" />
                      Original: {formatSize(img.originalFile.size)}
                    </div>
                    {img.compressedFile && (
                      <div className="flex items-center gap-1.5 text-primary-600 font-medium">
                        <span className="text-gray-400">→</span>
                        {formatSize(img.compressedFile.size)}
                      </div>
                    )}
                  </div>
                  <div className="pt-2 text-xs">
                    {img.status === "idle" && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-500">
                        Ready to compress
                      </span>
                    )}
                    {img.status === "compressing" && (
                      <span className="text-primary-600 animate-pulse">
                        Compressing...
                      </span>
                    )}
                    {img.status === "done" && (
                      <span className="text-green-600 font-medium">
                        Compression Complete
                      </span>
                    )}
                    {img.status === "error" && (
                      <span className="text-red-600 font-medium">
                        Failed to compress
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(img.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 sm:static sm:opacity-100"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove</span>
                  </Button>

                  {img.status === "done" && (
                    <Button
                      size="sm"
                      onClick={() => downloadImage(img)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                  )}

                  {img.status === "idle" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => compressImage(img)}
                    >
                      Compress
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
