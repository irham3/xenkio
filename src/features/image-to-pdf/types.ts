export interface ImageFile {
    id: string
    file: File
    name: string
    size: number
    preview: string
    width: number
    height: number
}

export type PageSizeMode = "original" | "standard"
export type StandardPageSize = "A4" | "LETTER" | "LEGAL"
export type Orientation = "portrait" | "landscape"
export type OutputMode = "single" | "multiple"

export interface ConversionOptions {
    pageMode: PageSizeMode
    standardSize: StandardPageSize
    orientation: Orientation
    outputMode: OutputMode
}
