export interface PdfFile {
    id: string
    file: File
    name: string
    pageCount: number
    size: number
    arrayBuffer: ArrayBuffer
    thumbnailUrl?: string
    rotation: number // 0, 90, 180, 270
}

export type PageSizeMode = "default" | "standard"
export type StandardPageSize = "A4" | "LETTER" | "LEGAL"

export const PAGE_SIZE_OPTIONS: { value: StandardPageSize; label: string }[] = [
    { value: "A4", label: "A4 (210 × 297 mm)" },
    { value: "LETTER", label: "Letter (8.5 × 11 in)" },
    { value: "LEGAL", label: "Legal (8.5 × 14 in)" },
]
