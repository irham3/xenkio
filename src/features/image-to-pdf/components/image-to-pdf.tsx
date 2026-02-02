"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument, PageSizes } from "pdf-lib"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import Image from "next/image"
import { Upload, X, Download, FileImage, Settings2, GripVertical, Loader2, Archive } from "lucide-react"
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
type OutputMode = "single" | "multiple"

const PAGE_SIZE_OPTIONS: { value: StandardPageSize; label: string }[] = [
  { value: "A4", label: "A4 (210 × 297 mm)" },
  { value: "LETTER", label: "Letter (8.5 × 11 in)" },
  { value: "LEGAL", label: "Legal (8.5 × 14 in)" },
]

export function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageMode, setPageMode] = useState<PageSizeMode>("original")
  const [standardSize, setStandardSize] = useState<StandardPageSize>("A4")
  const [orientation, setOrientation] = useState<Orientation>("portrait")
  const [outputMode, setOutputMode] = useState<OutputMode>("single")
  const [error, setError] = useState<string | null>(null)

  const loadImageInfo = async (file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img")
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        resolve({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          preview: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error(`Failed to load image: ${file.name}`))
      }
      
      img.src = url
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
      } catch (err) {
        // Collect failed files to show in error message
        console.warn(`Failed to load image: ${file.name}`, err)
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
    const imageToRemove = images.find((img) => img.id === id)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview)
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
    
    // PageSizes are in portrait mode by default (width < height)
    if (orient === "landscape") {
      return [dimensions[1], dimensions[0]]
    }
    return dimensions
  }

  const createPdfFromImages = async (imagesToConvert: ImageFile[]): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create()

    for (const imageFile of imagesToConvert) {
      // Read the image file as bytes
      const imageBytes = await imageFile.file.arrayBuffer()
      
      // Determine image type and embed accordingly
      let embeddedImage
      const mimeType = imageFile.file.type.toLowerCase()
      
      try {
        if (mimeType === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes)
        } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(imageBytes)
        } else {
          // For other formats (webp, gif, bmp), convert to PNG via canvas
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Could not get canvas context")
          
          const img = document.createElement("img")
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject(new Error("Failed to load image"))
            img.src = imageFile.preview
          })
          
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          ctx.drawImage(img, 0, 0)
          
          const pngDataUrl = canvas.toDataURL("image/png")
          const pngBase64 = pngDataUrl.split(",")[1]
          const pngBytes = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0))
          embeddedImage = await pdfDoc.embedPng(pngBytes)
        }
      } catch (embedError) {
        // Direct embedding failed (unsupported format or corrupted data)
        // Fallback: convert image to JPEG via canvas for maximum compatibility
        console.warn(`Direct image embedding failed, using canvas fallback:`, embedError)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Could not get canvas context")
        
        const img = document.createElement("img")
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("Failed to load image"))
          img.src = imageFile.preview
        })
        
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
        
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95)
        const jpegBase64 = jpegDataUrl.split(",")[1]
        const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0))
        embeddedImage = await pdfDoc.embedJpg(jpegBytes)
      }

      const imgWidth = embeddedImage.width
      const imgHeight = embeddedImage.height

      if (pageMode === "original") {
        // Create page with image dimensions
        const page = pdfDoc.addPage([imgWidth, imgHeight])
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        })
      } else {
        // Create page with standard size
        const [pageWidth, pageHeight] = getPageSize(standardSize, orientation)
        const page = pdfDoc.addPage([pageWidth, pageHeight])

        // Calculate scale to fit image within page while maintaining aspect ratio
        const scaleX = pageWidth / imgWidth
        const scaleY = pageHeight / imgHeight
        const scale = Math.min(scaleX, scaleY)

        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale

        // Center the image on the page
        const xOffset = (pageWidth - scaledWidth) / 2
        const yOffset = (pageHeight - scaledHeight) / 2

        page.drawImage(embeddedImage, {
          x: xOffset,
          y: yOffset,
          width: scaledWidth,
          height: scaledHeight,
        })
      }
    }

    return await pdfDoc.save()
  }

  const convertToPdf = async () => {
    if (images.length === 0) return
    setIsProcessing(true)
    setError(null)

    try {
      if (outputMode === "single") {
        // Combine all images into a single PDF
        const pdfBytes = await createPdfFromImages(images)
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "images.pdf"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // Create separate PDF for each image
        if (images.length === 1) {
          // Single image, just download directly
          const pdfBytes = await createPdfFromImages([images[0]])
          const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${images[0].name.replace(/\.[^/.]+$/, "")}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else {
          // Multiple images, create a ZIP file
          const zip = new JSZip()
          const folder = zip.folder("pdfs")

          for (const image of images) {
            const pdfBytes = await createPdfFromImages([image])
            const fileName = `${image.name.replace(/\.[^/.]+$/, "")}.pdf`
            folder?.file(fileName, pdfBytes)
          }

          const content = await zip.generateAsync({ type: "blob" })
          const url = URL.createObjectURL(content)
          const link = document.createElement("a")
          link.href = url
          link.download = "images-pdfs.zip"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }
    } catch (err) {
      console.error("Conversion failed:", err)
      setError("Failed to convert images to PDF. Please check if all files are valid.")
    } finally {
      setIsProcessing(false)
    }
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
          Image to PDF
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Convert images to PDF documents. Choose page size options, combine multiple images
          into one PDF or create separate files for each image.
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
                    name="pageMode"
                    value="original"
                    checked={pageMode === "original"}
                    onChange={(e) => setPageMode(e.target.value as PageSizeMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Match Image Size</p>
                    <p className="text-xs text-gray-500">PDF page matches original image dimensions</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="pageMode"
                    value="standard"
                    checked={pageMode === "standard"}
                    onChange={(e) => setPageMode(e.target.value as PageSizeMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Standard Paper Size</p>
                    <p className="text-xs text-gray-500">Fit images to a standard paper size</p>
                  </div>
                </label>
              </div>
            </div>

            {pageMode === "standard" && (
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

                {/* Orientation */}
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                      orientation === "portrait"
                        ? "border-primary-600 bg-primary-50"
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
                        ? "border-primary-600 bg-primary-50"
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

            {/* Output Mode */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Label>Output Mode</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="outputMode"
                    value="single"
                    checked={outputMode === "single"}
                    onChange={(e) => setOutputMode(e.target.value as OutputMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Single PDF</p>
                    <p className="text-xs text-gray-500">Combine all images into one PDF file</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="outputMode"
                    value="multiple"
                    checked={outputMode === "multiple"}
                    onChange={(e) => setOutputMode(e.target.value as OutputMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Separate PDFs</p>
                    <p className="text-xs text-gray-500">Create individual PDF for each image</p>
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
              <div className="flex justify-between text-sm text-gray-600">
                <span>Output:</span>
                <span className="font-medium">
                  {outputMode === "single" 
                    ? "1 PDF file" 
                    : `${images.length} PDF file${images.length > 1 ? "s" : ""}`}
                </span>
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
              onClick={convertToPdf}
              disabled={images.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  {outputMode === "single" ? (
                    <Download className="mr-2 h-4 w-4" />
                  ) : (
                    <Archive className="mr-2 h-4 w-4" />
                  )}
                  Convert & Download
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
              {outputMode === "single" && images.length > 1 && (
                <p className="text-sm text-gray-500">Drag to reorder pages</p>
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
                      {outputMode === "single" && images.length > 1 && (
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                    </div>

                    {/* Preview */}
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
