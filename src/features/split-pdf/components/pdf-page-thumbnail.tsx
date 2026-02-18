"use client"

import { useState, useEffect, useRef } from "react"
import { FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface PdfPageThumbnailProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDocument?: any
    arrayBuffer: ArrayBuffer
    pageNumber: number
    scale?: number
}

export function PdfPageThumbnail({ pdfDocument, arrayBuffer, pageNumber, scale = 1 }: PdfPageThumbnailProps) {
    return (
        <HoverCard openDelay={300} closeDelay={0}>
            <HoverCardTrigger asChild>
                <div className="w-full h-full">
                    <PdfCanvas
                        pdfDocument={pdfDocument}
                        arrayBuffer={arrayBuffer}
                        pageNumber={pageNumber}
                        scale={scale}
                    />
                </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="center" className="w-[600px] p-2 bg-white rounded-xl shadow-2xl border-gray-200 z-50">
                <div className="w-full aspect-3/4 bg-gray-50 rounded-lg overflow-hidden relative">
                    <PdfCanvas
                        pdfDocument={pdfDocument}
                        arrayBuffer={arrayBuffer}
                        pageNumber={pageNumber}
                        scale={2}
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        Page {pageNumber}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}

interface PdfCanvasProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDocument?: any
    arrayBuffer: ArrayBuffer
    pageNumber: number
    scale: number
    priority?: boolean
}

function PdfCanvas({ pdfDocument, arrayBuffer, pageNumber, scale }: PdfCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        let isCancelled = false

        const render = async () => {
            if (!canvasRef.current) return

            // Cancel any existing render task
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel()
                renderTaskRef.current = null
            }

            try {
                let pdf = pdfDocument;

                if (!pdf) {
                    const pdfjsLib = await import("pdfjs-dist")
                    const version = pdfjsLib.version || '5.4.624';
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
                    const bufferCopy = arrayBuffer.slice(0) // Fallback: slow copy
                    pdf = await pdfjsLib.getDocument({ data: bufferCopy }).promise
                }

                if (isCancelled) return

                const page = await pdf.getPage(pageNumber)

                const canvas = canvasRef.current
                if (!canvas || isCancelled) return
                const context = canvas.getContext("2d")
                if (!context) return

                const viewport = page.getViewport({ scale })

                canvas.width = viewport.width
                canvas.height = viewport.height

                const renderTask = page.render({
                    canvasContext: context,
                    viewport,
                    canvas,
                })

                renderTaskRef.current = renderTask

                await renderTask.promise

                if (!isCancelled) {
                    setIsLoading(false)
                }
            } catch (error) {
                if (error instanceof Error && error.message.includes("Rendering cancelled")) {
                    return
                }
                console.error(`Failed to render PDF page ${pageNumber}:`, error)
                if (!isCancelled) {
                    setIsLoading(false)
                    setHasError(true)
                }
            }
        }

        render()

        return () => {
            isCancelled = true
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel()
                renderTaskRef.current = null
            }
        }
    }, [pdfDocument, arrayBuffer, pageNumber, scale])

    if (hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
                <FileText className="w-10 h-10 text-red-300" />
            </div>
        )
    }

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={cn(
                    "w-full h-full object-contain rounded-lg bg-white shadow-sm transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
            />
        </div>
    )
}
