"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument, PageSizes } from "pdf-lib"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import Image from "next/image"
import { Upload, X, FileImage, Settings2, GripVertical, Loader2, Archive, FileText } from "lucide-react"
import JSZip from "jszip"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ImageFile {
  id: string
  file: File
  name: string
  size: number
  preview: string
  width: number
  height: number
}

type PageSizeMode = "original" | "standard"
type StandardPageSize = "A4" | "LETTER" | "LEGAL"
type Orientation = "portrait" | "landscape"
type ConversionMode = "single" | "individual"

const PAGE_SIZE_OPTIONS: { value: StandardPageSize; label: string }[] = [
  { value: "A4", label: "A4 (210 × 297 mm)" },
  { value: "LETTER", label: "Letter (8.5 × 11 in)" },
  { value: "LEGAL", label: "Legal (8.5 × 14 in)" },
]

export function ImageToPdfConverter() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageSizeMode, setPageSizeMode] = useState<PageSizeMode>("original")
  const [standardSize, setStandardSize] = useState<StandardPageSize>("A4")
  const [orientation, setOrientation] = useState<Orientation>("portrait")
  const [conversionMode, setConversionMode] = useState<ConversionMode>("single")
  const [error, setError] = useState<string | null>(null)

  const loadImageInfo = async (file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img")
      const tempUrl = URL.createObjectURL(file)
      img.onload = () => {
        resolve({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          preview: tempUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }
      img.onerror = () => {
        URL.revokeObjectURL(tempUrl)
        reject(new Error("Failed to load image"))
      }
      img.src = tempUrl
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    const validImages: ImageFile[] = []
    const failedFiles: string[] = []

    for (const file of acceptedFiles) {
      try {
        const imageInfo = await loadImageInfo(file)
        validImages.push(imageInfo)
      } catch {
        failedFiles.push(file.name)
      }
    }

    if (failedFiles.length > 0) {
      setError(`Failed to load: ${failedFiles.join(", ")}`)
    }

    if (validImages.length > 0) {
      setImages((prev) => [...prev, ...validImages])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"],
    },
  })

  // Cleanup previews
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  const removeImage = (id: string) => {
    const image = images.find((img) => img.id === id)
    if (image) {
      URL.revokeObjectURL(image.preview)
    }
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const getPageSize = (size: StandardPageSize, orient: Orientation): [number, number] => {
    let dimensions: [number, number]
    switch (size) {
      case "A4":
        dimensions = PageSizes.A4
        break
      case "LETTER":
        dimensions = PageSizes.Letter
        break
      case "LEGAL":
        dimensions = PageSizes.Legal
        break
      default:
        dimensions = PageSizes.A4
    }
    // PageSizes are in portrait orientation by default (width < height)
    if (orient === "landscape") {
      return [dimensions[1], dimensions[0]]
    }
    return dimensions
  }

  const embedImageIntoPdf = async (
    pdfDoc: PDFDocument,
    imageFile: ImageFile
  ): Promise<void> => {
    const imageBytes = await imageFile.file.arrayBuffer()
    let image
    
    const fileType = imageFile.file.type
    if (fileType === "image/png") {
      image = await pdfDoc.embedPng(imageBytes)
    } else if (fileType === "image/jpeg") {
      image = await pdfDoc.embedJpg(imageBytes)
    } else {
      // For other formats (webp, gif, bmp), convert to PNG via canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = document.createElement("img")
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("Failed to load image for conversion"))
        img.src = imageFile.preview
      })
      
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx?.drawImage(img, 0, 0)
      
      const pngDataUrl = canvas.toDataURL("image/png")
      const parts = pngDataUrl.split(",")
      if (parts.length < 2 || !parts[1]) {
        throw new Error("Failed to convert image to PNG format")
      }
      const pngBase64 = parts[1]
      const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0))
      image = await pdfDoc.embedPng(pngBytes)
    }

    if (pageSizeMode === "original") {
      // Create page with image's original dimensions
      const page = pdfDoc.addPage([imageFile.width, imageFile.height])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: imageFile.width,
        height: imageFile.height,
      })
    } else {
      // Create page with standard size
      const [pageWidth, pageHeight] = getPageSize(standardSize, orientation)
      const page = pdfDoc.addPage([pageWidth, pageHeight])
      
      // Calculate scale to fit image while maintaining aspect ratio
      const imgAspect = imageFile.width / imageFile.height
      const pageAspect = pageWidth / pageHeight
      
      let drawWidth: number
      let drawHeight: number
      
      if (imgAspect > pageAspect) {
        // Image is wider than page
        drawWidth = pageWidth * 0.9 // 90% of page width for margin
        drawHeight = drawWidth / imgAspect
      } else {
        // Image is taller than page
        drawHeight = pageHeight * 0.9 // 90% of page height for margin
        drawWidth = drawHeight * imgAspect
      }
      
      // Center the image on the page
      const x = (pageWidth - drawWidth) / 2
      const y = (pageHeight - drawHeight) / 2
      
      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      })
    }
  }

  const createSinglePdf = async (): Promise<void> => {
    const pdfDoc = await PDFDocument.create()
    
    for (const imageFile of images) {
      await embedImageIntoPdf(pdfDoc, imageFile)
    }
    
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
    downloadBlob(blob, "images.pdf")
  }

  const createIndividualPdfs = async (): Promise<void> => {
    if (images.length === 1) {
      // Single image - just download directly
      const pdfDoc = await PDFDocument.create()
      await embedImageIntoPdf(pdfDoc, images[0])
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      const filename = images[0].name.replace(/\.[^/.]+$/, "") + ".pdf"
      downloadBlob(blob, filename)
      return
    }
    
    // Multiple images - create a zip file
    const zip = new JSZip()
    
    for (const imageFile of images) {
      const pdfDoc = await PDFDocument.create()
      await embedImageIntoPdf(pdfDoc, imageFile)
      const pdfBytes = await pdfDoc.save()
      const filename = imageFile.name.replace(/\.[^/.]+$/, "") + ".pdf"
      zip.file(filename, new Uint8Array(pdfBytes))
    }
    
    const content = await zip.generateAsync({ type: "blob" })
    downloadBlob(content, "pdfs.zip")
  }

  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleConvert = async (): Promise<void> => {
    if (images.length === 0) return
    setIsProcessing(true)
    setError(null)

    try {
      if (conversionMode === "single") {
        await createSinglePdf()
      } else {
        await createIndividualPdfs()
      }
    } catch (err) {
      console.error("Conversion failed:", err)
      setError("Failed to convert images to PDF. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatSize = (bytes: number): string => {
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
          Image to PDF Converter
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Convert your images to PDF documents. Combine multiple images into one PDF or create individual PDFs for each image.
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
                  Supports JPG, PNG, WebP, GIF, BMP
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
            {/* Page Size Mode */}
            <div className="space-y-3">
              <Label>Page Size</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="pageSizeMode"
                    value="original"
                    checked={pageSizeMode === "original"}
                    onChange={(e) => setPageSizeMode(e.target.value as PageSizeMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Original Image Size</p>
                    <p className="text-xs text-gray-500">PDF matches image dimensions</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="pageSizeMode"
                    value="standard"
                    checked={pageSizeMode === "standard"}
                    onChange={(e) => setPageSizeMode(e.target.value as PageSizeMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Standard Page Size</p>
                    <p className="text-xs text-gray-500">Fit images to standard paper size</p>
                  </div>
                </label>
              </div>
            </div>

            {pageSizeMode === "standard" && (
              <>
                {/* Standard Size Selection */}
                <div className="space-y-2">
                  <Label>Paper Size</Label>
                  <select
                    value={standardSize}
                    onChange={(e) => setStandardSize(e.target.value as StandardPageSize)}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Orientation Selection */}
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                      orientation === "portrait" 
                        ? "border-primary-600 bg-primary-50 text-primary-600" 
                        : "border-gray-200 hover:bg-gray-50"
                    )}>
                      <input
                        type="radio"
                        name="orientation"
                        value="portrait"
                        checked={orientation === "portrait"}
                        onChange={(e) => setOrientation(e.target.value as Orientation)}
                        className="sr-only"
                      />
                      <div className="w-4 h-6 border-2 border-current rounded-sm" />
                      <span className="text-sm font-medium">Portrait</span>
                    </label>
                    <label className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                      orientation === "landscape" 
                        ? "border-primary-600 bg-primary-50 text-primary-600" 
                        : "border-gray-200 hover:bg-gray-50"
                    )}>
                      <input
                        type="radio"
                        name="orientation"
                        value="landscape"
                        checked={orientation === "landscape"}
                        onChange={(e) => setOrientation(e.target.value as Orientation)}
                        className="sr-only"
                      />
                      <div className="w-6 h-4 border-2 border-current rounded-sm" />
                      <span className="text-sm font-medium">Landscape</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Conversion Mode */}
            <div className="space-y-3 pt-2">
              <Label>Output Mode</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="conversionMode"
                    value="single"
                    checked={conversionMode === "single"}
                    onChange={(e) => setConversionMode(e.target.value as ConversionMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Single PDF</p>
                    <p className="text-xs text-gray-500">Merge all images into one PDF</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="conversionMode"
                    value="individual"
                    checked={conversionMode === "individual"}
                    onChange={(e) => setConversionMode(e.target.value as ConversionMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Individual PDFs</p>
                    <p className="text-xs text-gray-500">One PDF per image (ZIP if multiple)</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Images:</span>
                <span className="font-medium">{images.length}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <Button
              className="w-full"
              size="lg"
              onClick={handleConvert}
              disabled={images.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : conversionMode === "single" ? (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Convert to PDF
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Convert to PDFs
                </>
              )}
            </Button>
            {images.length === 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Add images to convert
              </p>
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
            className="space-y-2 mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Images</h3>
              {conversionMode === "single" && images.length > 1 && (
                <p className="text-sm text-gray-500">Drag to reorder</p>
              )}
            </div>
            <Reorder.Group
              axis="y"
              values={images}
              onReorder={setImages}
              className="space-y-2"
            >
              {images.map((image, index) => (
                <Reorder.Item
                  key={image.id}
                  value={image}
                  className="group relative bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                    </div>

                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <Image
                        src={image.preview}
                        alt={image.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-gray-900">
                        {image.name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileImage className="w-3.5 h-3.5" />
                          {image.width} × {image.height}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>{formatSize(image.size)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(image.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${image.name}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
