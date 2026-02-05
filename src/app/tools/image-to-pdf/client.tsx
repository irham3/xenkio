"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument, PageSizes } from "pdf-lib"
import { Plus, Trash2 } from "lucide-react"
import JSZip from "jszip"
import { Button } from "@/components/ui/button"
import { ConversionOptions, ImageFile, StandardPageSize, Orientation } from "@/features/image-to-pdf/types"
import { ImageUploader } from "@/features/image-to-pdf/components/image-uploader"
import { ImageGrid } from "@/features/image-to-pdf/components/image-grid"
import { ImageSettings } from "@/features/image-to-pdf/components/image-settings"

export function ImageToPdfClient() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [options, setOptions] = useState<ConversionOptions>({
    pageMode: "original",
    standardSize: "A4",
    orientation: "portrait",
    outputMode: "single"
  })

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

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"],
    },
    noClick: images.length > 0, // Disable click on container when images exist (to allow button click)
    noKeyboard: true
  })

  // Cleanup previews
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  const removeImage = (id: string) => {
    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== id)
      // Cleanup preview provided it's not being used anymore (though strict mode might double invoke, usually safe to let useEffect handle or do it here)
      const removed = prev.find(img => img.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      return newImages
    })
  }

  const handleReset = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setOptions({
      pageMode: "original",
      standardSize: "A4",
      orientation: "portrait",
      outputMode: "single"
    });
    setError(null);
  }

  const getPageSize = (size: StandardPageSize, orient: Orientation): [number, number] => {
    let dimensions: [number, number]
    switch (size) {
      case "A4": dimensions = PageSizes.A4; break;
      case "LETTER": dimensions = PageSizes.Letter; break;
      case "LEGAL": dimensions = PageSizes.Legal; break;
      default: dimensions = PageSizes.A4;
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
      const imageBytes = await imageFile.file.arrayBuffer()
      let embeddedImage
      const mimeType = imageFile.file.type.toLowerCase()

      try {
        if (mimeType === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes)
        } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(imageBytes)
        } else {
          // Fallback via canvas
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
        console.warn(`Direct image embedding failed, using canvas fallback:`, embedError)
        // Canvas fallback logic again if direct embed failed
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

      if (options.pageMode === "original") {
        const page = pdfDoc.addPage([imgWidth, imgHeight])
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        })
      } else {
        const [pageWidth, pageHeight] = getPageSize(options.standardSize, options.orientation)
        const page = pdfDoc.addPage([pageWidth, pageHeight])

        const scaleX = pageWidth / imgWidth
        const scaleY = pageHeight / imgHeight
        const scale = Math.min(scaleX, scaleY)

        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale

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
      if (options.outputMode === "single") {
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
        if (images.length === 1) {
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
          const zip = new JSZip()
          // const folder = zip.folder("pdfs") // put directly in root or folder? SplitPdf uses root.

          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const pdfBytes = await createPdfFromImages([image])
            // Ensure unique names if needed, but for now just use original name + index if needed?
            // SplitPdf uses "part-{index}.pdf". Here we can use original names.
            const fileName = `${image.name.replace(/\.[^/.]+$/, "")}.pdf`
            zip.file(fileName, pdfBytes) // Handle duplicate names? JSZip overwrites. Better safe than sorry?
            // Maybe append index if duplicate? Leaving as is for now matching previous logic
          }

          const content = await zip.generateAsync({ type: "blob" })
          const url = URL.createObjectURL(content)
          const link = document.createElement("a")
          link.href = url
          link.download = "converted_images.zip"
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

  if (images.length === 0) {
    return (

      <div className="py-12">
        <ImageUploader
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
        />

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 text-center">
          <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Easy to Use</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Drag & drop your images, reorder them as needed, and convert them to PDF in seconds.
            </p>
          </div>
          <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="18" x="3" y="3" rx="1" /><path d="M7 3v18" /><rect width="8" height="18" x="13" y="3" rx="1" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Custom Formatting</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Choose between standard page sizes (A4, Letter) or keep original image dimensions.
            </p>
          </div>
          <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Secure & Private</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              File processing happens entirely in your browser. No files are uploaded to any server.
            </p>
          </div>
        </div>
      </div>
    )
  }


  // Active Workspace View
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left: Preview Grid */}
      <div className="space-y-4 lg:col-span-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Preview & Reorder
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={openFileDialog} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add Images
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <ImageGrid
          images={images}
          onReorder={setImages}
          onRemove={removeImage}
        />

        {/* Helper text */}
        <p className="text-sm text-center text-gray-400 mt-2">
          Drag and drop images to reorder.
        </p>

        {/* Hidden Input for generic add button usage if needed, but openFileDialog handles it via useDropzone context */}
        <input {...getInputProps()} className="hidden" />
      </div>

      {/* Right: Settings Panel */}
      <ImageSettings
        images={images}
        options={options}
        onOptionsChange={setOptions}
        onReset={handleReset}
        onConvert={convertToPdf}
        isProcessing={isProcessing}
      />

      {/* Error Toast/Alert */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 text-red-600 p-4 rounded-lg shadow-lg border border-red-200 z-50 animate-in slide-in-from-bottom-5">
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-6 w-6 p-0 rounded-full hover:bg-red-100"
            onClick={() => setError(null)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
