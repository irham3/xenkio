"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument, PageSizes, degrees } from "pdf-lib"
import { motion } from "framer-motion"
import { Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { PageSizeMode, PdfFile, StandardPageSize } from "@/features/merge-pdf/types"
import { PdfUploader } from "@/features/merge-pdf/components/pdf-uploader"
import { PdfCard } from "@/features/merge-pdf/components/pdf-card"
import { SortablePdfCard } from "@/features/merge-pdf/components/sortable-pdf-card"
import { MergeSettings } from "@/features/merge-pdf/components/merge-settings"


export function MergePdfClient() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageMode, setPageMode] = useState<PageSizeMode>("default")
  const [standardSize, setStandardSize] = useState<StandardPageSize>("A4")
  const [error, setError] = useState<string | null>(null)
  const [outputFilename, setOutputFilename] = useState("merged")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDragWidth, setActiveDragWidth] = useState<number | undefined>(undefined)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadPdfInfo = async (file: File): Promise<PdfFile> => {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    return {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      pageCount: pdfDoc.getPageCount(),
      size: file.size,
      arrayBuffer,
      rotation: 0,
    }
  }

  const updateThumbnail = useCallback((id: string, thumbnailUrl: string) => {
    setPdfFiles(prev => prev.map(pdf =>
      pdf.id === id ? { ...pdf, thumbnailUrl } : pdf
    ))
  }, [])

  const rotatePdf = useCallback((id: string) => {
    setPdfFiles(prev => prev.map(pdf =>
      pdf.id === id ? {
        ...pdf,
        rotation: (pdf.rotation + 90) % 360,
        thumbnailUrl: undefined
      } : pdf
    ))
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    const validPdfs: PdfFile[] = []
    const failedFiles: string[] = []

    for (const file of acceptedFiles) {
      try {
        const pdfInfo = await loadPdfInfo(file)
        validPdfs.push(pdfInfo)
      } catch {
        failedFiles.push(file.name)
      }
    }

    if (failedFiles.length > 0) {
      setError(`Failed to load: ${failedFiles.join(", ")}`)
    }

    if (validPdfs.length > 0) {
      setPdfFiles((prev) => [...prev, ...validPdfs])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    noClick: pdfFiles.length > 0,
  })

  const removePdf = (id: string) => {
    setPdfFiles((prev) => prev.filter((pdf) => pdf.id !== id))
  }

  const clearAll = () => {
    setPdfFiles([])
    setError(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const elem = document.getElementById(event.active.id as string)
    if (elem) {
      const { width } = elem.getBoundingClientRect()
      setActiveDragWidth(width)
    }
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPdfFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
    setActiveId(null)
    setActiveDragWidth(undefined)
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
    setError(null)

    try {
      const mergedPdf = await PDFDocument.create()
      const targetPageSize = getPageSize(standardSize)

      for (const pdfFile of pdfFiles) {
        const pdfDoc = await PDFDocument.load(pdfFile.arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())

        for (const page of copiedPages) {
          if (pdfFile.rotation !== 0) {
            page.setRotation(degrees(pdfFile.rotation))
          }

          if (pageMode === "standard") {
            const [targetWidth, targetHeight] = targetPageSize
            const { width: originalWidth, height: originalHeight } = page.getSize()

            const scaleX = targetWidth / originalWidth
            const scaleY = targetHeight / originalHeight
            const scale = Math.min(scaleX, scaleY)

            const newPage = mergedPdf.addPage(targetPageSize)
            const embeddedPage = await mergedPdf.embedPage(page)

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
            mergedPdf.addPage(page)
          }
        }
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${outputFilename || "merged"}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      setError("Failed to merge PDFs. Please check if all files are valid.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const totalPages = pdfFiles.reduce((sum, pdf) => sum + pdf.pageCount, 0)
  const totalSize = pdfFiles.reduce((sum, pdf) => sum + pdf.size, 0)
  const activePdf = activeId ? pdfFiles.find(p => p.id === activeId) : null

  if (pdfFiles.length === 0) {
    return (
      <PdfUploader
        isDragActive={isDragActive}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
      />
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Top Bar Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{pdfFiles.length}</span>
              <span>file{pdfFiles.length !== 1 ? "s" : ""}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium">{totalPages}</span>
              <span>page{totalPages !== 1 ? "s" : ""}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium">{formatSize(totalSize)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-500 hover:text-red-600 cursor-pointer">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div
            {...getRootProps()}
            className={cn(
              "lg:col-span-3 min-h-[400px] rounded-2xl border-2 border-dashed p-6 transition-colors relative",
              isDragActive ? "border-primary-500 bg-primary-50/50" : "border-transparent bg-gray-50/50"
            )}
          >
            <input {...getInputProps()} />

            <SortableContext items={pdfFiles.map(p => p.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-4">
                {pdfFiles.map((pdf, index) => (
                  <SortablePdfCard
                    key={pdf.id}
                    pdf={pdf}
                    index={index}
                    onRotate={rotatePdf}
                    onRemove={removePdf}
                    updateThumbnail={updateThumbnail}
                  />
                ))}

                {/* Add More Card */}
                <motion.div
                  className="relative w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] bg-white/60 rounded-xl border-2 border-dashed border-gray-200 p-4 cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[200px]"
                  onClick={open}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Add PDF</p>
                </motion.div>
              </div>
            </SortableContext>

            {/* Overlay for smoother drag */}
            <DragOverlay dropAnimation={null}>
              {activePdf ? (
                <PdfCard
                  pdf={activePdf}
                  index={pdfFiles.findIndex(p => p.id === activePdf.id)}
                  updateThumbnail={updateThumbnail}
                  isOverlay
                  dragWidth={activeDragWidth}
                />
              ) : null}
            </DragOverlay>

            {isDragActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary-50/90 rounded-2xl z-20">
                <p className="text-lg font-medium text-primary-600">Drop PDFs here to add</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <MergeSettings
              outputFilename={outputFilename}
              setOutputFilename={setOutputFilename}
              pageMode={pageMode}
              setPageMode={setPageMode}
              standardSize={standardSize}
              setStandardSize={setStandardSize}
              error={error}
              pdfFilesCount={pdfFiles.length}
              isProcessing={isProcessing}
              onMerge={mergePdfs}
            />
          </div>
        </div>
      </div>
    </DndContext>
  )
}
