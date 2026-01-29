"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument, PageSizes } from "pdf-lib"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Upload, X, Download, FileText, Settings2, GripVertical, Merge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PdfFile {
  id: string
  file: File
  name: string
  pageCount: number
  size: number
}

type PageSizeMode = "default" | "standard"
type StandardPageSize = "A4" | "LETTER" | "LEGAL"

const PAGE_SIZE_OPTIONS: { value: StandardPageSize; label: string }[] = [
  { value: "A4", label: "A4 (210 × 297 mm)" },
  { value: "LETTER", label: "Letter (8.5 × 11 in)" },
  { value: "LEGAL", label: "Legal (8.5 × 14 in)" },
]

export function PdfMerger() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageMode, setPageMode] = useState<PageSizeMode>("default")
  const [standardSize, setStandardSize] = useState<StandardPageSize>("A4")

  const loadPdfInfo = async (file: File): Promise<PdfFile> => {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    return {
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      pageCount: pdfDoc.getPageCount(),
      size: file.size,
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfPromises = acceptedFiles.map(loadPdfInfo)
    const newPdfs = await Promise.all(pdfPromises)
    setPdfFiles((prev) => [...prev, ...newPdfs])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  })

  const removePdf = (id: string) => {
    setPdfFiles((prev) => prev.filter((pdf) => pdf.id !== id))
  }

  const getPageSize = (size: StandardPageSize): [number, number] => {
    switch (size) {
      case "A4":
        return PageSizes.A4
      case "LETTER":
        return PageSizes.Letter
      case "LEGAL":
        return PageSizes.Legal
      default:
        return PageSizes.A4
    }
  }

  const mergePdfs = async () => {
    if (pdfFiles.length === 0) return
    setIsProcessing(true)

    try {
      const mergedPdf = await PDFDocument.create()
      const targetPageSize = getPageSize(standardSize)

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())

        for (const page of copiedPages) {
          if (pageMode === "standard") {
            // Resize page to standard size
            const [targetWidth, targetHeight] = targetPageSize
            const { width: originalWidth, height: originalHeight } = page.getSize()

            // Calculate scale to fit content
            const scaleX = targetWidth / originalWidth
            const scaleY = targetHeight / originalHeight
            const scale = Math.min(scaleX, scaleY)

            // Create a new page with standard size
            const newPage = mergedPdf.addPage(targetPageSize)
            
            // Embed the original page content
            const embeddedPage = await mergedPdf.embedPage(page)
            
            // Calculate centered position
            const scaledWidth = originalWidth * scale
            const scaledHeight = originalHeight * scale
            const xOffset = (targetWidth - scaledWidth) / 2
            const yOffset = (targetHeight - scaledHeight) / 2

            newPage.drawPage(embeddedPage, {
              x: xOffset,
              y: yOffset,
              width: scaledWidth,
              height: scaledHeight,
            })
          } else {
            // Default mode - preserve original page size
            mergedPdf.addPage(page)
          }
        }
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "merged.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to merge PDFs:", error)
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

  const totalPages = pdfFiles.reduce((sum, pdf) => sum + pdf.pageCount, 0)

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          PDF Merger
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Combine multiple PDF files into one document. Drag to reorder, choose page size mode,
          and download your merged PDF instantly.
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
                  Drop PDF files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Select multiple PDFs to merge
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
            <div className="space-y-3">
              <Label>Page Size Mode</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="pageMode"
                    value="default"
                    checked={pageMode === "default"}
                    onChange={(e) => setPageMode(e.target.value as PageSizeMode)}
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-sm">Keep Original Sizes</p>
                    <p className="text-xs text-gray-500">Preserve each page&apos;s original dimensions</p>
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
                    <p className="font-medium text-sm">Standardize All Pages</p>
                    <p className="text-xs text-gray-500">Resize all pages to a uniform size</p>
                  </div>
                </label>
              </div>
            </div>

            {pageMode === "standard" && (
              <div className="space-y-2">
                <Label>Standard Page Size</Label>
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
            )}
          </div>

          {pdfFiles.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Files:</span>
                <span className="font-medium">{pdfFiles.length}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Pages:</span>
                <span className="font-medium">{totalPages}</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <Button
              className="w-full"
              size="lg"
              onClick={mergePdfs}
              disabled={pdfFiles.length < 2 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Merge className="mr-2 h-4 w-4 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Merge & Download
                </>
              )}
            </Button>
            {pdfFiles.length === 1 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Add at least 2 PDFs to merge
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PDF List */}
      <AnimatePresence mode="popLayout">
        {pdfFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">PDF Files</h3>
              <p className="text-sm text-gray-500">Drag to reorder</p>
            </div>
            <Reorder.Group
              axis="y"
              values={pdfFiles}
              onReorder={setPdfFiles}
              className="space-y-2"
            >
              {pdfFiles.map((pdf, index) => (
                <Reorder.Item
                  key={pdf.id}
                  value={pdf}
                  className="group relative bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-red-50 shrink-0">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-gray-900">
                        {pdf.name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{pdf.pageCount} page{pdf.pageCount !== 1 ? "s" : ""}</span>
                        <span className="text-gray-300">•</span>
                        <span>{formatSize(pdf.size)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePdf(pdf.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove</span>
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
