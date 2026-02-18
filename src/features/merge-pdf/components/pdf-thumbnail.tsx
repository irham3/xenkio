"use client"

import { useState, useEffect, useRef } from "react"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface PdfThumbnailProps {
    arrayBuffer: ArrayBuffer
    onLoad: (url: string) => void
    rotation: number
}

export function PdfThumbnail({ arrayBuffer, onLoad, rotation }: PdfThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const onLoadRef = useRef(onLoad)

    useEffect(() => {
        onLoadRef.current = onLoad
    }, [onLoad])

    useEffect(() => {
        let isCancelled = false

        const renderThumbnail = async () => {
            if (!canvasRef.current) return

            // Cancel any existing render task
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel()
                renderTaskRef.current = null
            }

            try {
                const pdfjsLib = await import("pdfjs-dist")
                const version = pdfjsLib.version || '5.4.624';
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

                const bufferCopy = arrayBuffer.slice(0)
                const pdf = await pdfjsLib.getDocument({ data: bufferCopy }).promise

                if (isCancelled) return

                const page = await pdf.getPage(1)

                const canvas = canvasRef.current
                if (!canvas || isCancelled) return
                const context = canvas.getContext("2d")
                if (!context) return

                const viewport = page.getViewport({ scale: 1, rotation })
                const targetWidth = 200
                const scale = targetWidth / viewport.width
                const scaledViewport = page.getViewport({ scale, rotation })

                canvas.width = scaledViewport.width
                canvas.height = scaledViewport.height

                const renderTask = page.render({
                    canvasContext: context,
                    viewport: scaledViewport,
                    canvas: canvas,
                })

                renderTaskRef.current = renderTask

                await renderTask.promise

                if (!isCancelled) {
                    const url = canvas.toDataURL("image/jpeg", 0.8)
                    if (onLoadRef.current) {
                        onLoadRef.current(url)
                    }
                    setIsLoading(false)
                }
            } catch (error) {
                if (error instanceof Error && error.message.includes("Rendering cancelled")) {
                    return
                }
                console.error("Failed to render PDF thumbnail:", error)
                if (!isCancelled) {
                    setIsLoading(false)
                    setHasError(true)
                }
            }
        }

        renderThumbnail()

        return () => {
            isCancelled = true
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel()
                renderTaskRef.current = null
            }
        }
    }, [arrayBuffer, rotation])

    if (hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50">
                <FileText className="w-10 h-10 text-red-300" />
            </div>
        )
    }

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                "w-full h-full object-cover rounded-lg",
                isLoading && "opacity-0"
            )}
        />
    )
}
