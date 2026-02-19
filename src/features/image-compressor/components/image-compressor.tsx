"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import imageCompression from "browser-image-compression"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Upload, X, Download, Settings2, RefreshCw, Archive } from "lucide-react"
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    noClick: true, // We handle clicks manually to allow specific buttons
  })

  // Cleanup previews
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.originalPreview))
    }
  }, [images])

  const compressImage = async (image: CompressedImage) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      initialQuality: quality,
      fileType: image.originalFile.type === "image/png" ? "image/png" : "image/jpeg",
    }

    try {
      setImages((prev) =>
        prev.map((img) => (img.id === image.id ? { ...img, status: "compressing" } : img))
      )

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
    <div className="w-full max-w-6xl mx-auto space-y-8" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Header */}
      <div className="text-center space-y-4 mb-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Image Compressor
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Reduce file size while maintaining quality.
        </p>
      </div>

      {images.length === 0 ? (
        /* Empty State - Dropzone */
        <div
          onClick={open}
          className={cn(
            "group relative border-2 border-dashed rounded-3xl p-20 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden bg-white hover:border-primary-500 hover:bg-gray-50",
            isDragActive ? "border-primary-500 bg-primary-50 scale-[1.01]" : "border-gray-200"
          )}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className={cn(
              "p-6 rounded-full bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md",
              isDragActive && "bg-white shadow-md scale-110"
            )}>
              <Upload className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-semibold text-gray-900">
                {isDragActive ? "Drop images now" : "Click to upload or drag and drop"}
              </p>
              <p className="text-gray-500">
                JPG, PNG, WEBP, or GIF (Max 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active State - File List */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: List */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <Button onClick={open} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Add More Images
              </Button>

              <span className="text-sm text-gray-500">
                {images.filter(img => img.status === 'done').length} / {images.length} Compressed
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6 overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Preview */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                      <Image
                        src={img.originalPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                      <h4 className="font-medium truncate text-gray-900">
                        {img.originalFile.name}
                      </h4>
                      <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                          {formatSize(img.originalFile.size)}
                        </span>
                        {img.compressedFile && (
                          <>
                            <span className="text-gray-300">→</span>
                            <span className="text-primary-700 font-medium">
                              {formatSize(img.compressedFile.size)}
                            </span>
                            <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded-full">
                              -{Math.round((1 - (img.compressedFile.size / img.originalFile.size)) * 100)}%
                            </span>
                          </>
                        )}
                      </div>
                      <div className="pt-1">
                        {img.status === "error" && <span className="text-red-500 text-xs">Failed</span>}
                        {img.status === "compressing" && <span className="text-primary-500 text-xs animate-pulse">Compressing...</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {img.status === "idle" && (
                        <Button size="sm" variant="secondary" onClick={() => compressImage(img)}>
                          Compress
                        </Button>
                      )}

                      {img.status === "done" && (
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => downloadImage(img)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar */}
          <div className="col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 sticky top-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Settings2 className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Compression Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-gray-700">Quality</Label>
                    <span className="text-sm font-medium text-primary-600">{Math.round(quality * 100)}%</span>
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
                  <p className="text-xs text-gray-400">Lower quality = smaller file size</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-gray-700">Max Width</Label>
                    <span className="text-sm font-medium text-primary-600">{maxWidth}px</span>
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
                  <p className="text-xs text-gray-400">Resizes images larger than this width</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <Button
                  className="w-full h-12 text-base font-medium shadow-primary-500/20 shadow-lg hover:shadow-primary-500/30 transition-all"
                  size="lg"
                  onClick={handleCompressAll}
                  disabled={images.length === 0 || isCompressingAll}
                >
                  {isCompressingAll ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Compress All Images
                    </>
                  )}
                </Button>

                {images.some(i => i.status === "done") && (
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={downloadAllZip}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Download All (ZIP)
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
