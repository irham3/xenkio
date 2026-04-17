"use client"

import { useState, useCallback, useRef } from "react"
import exifr from "exifr"
import Image from "next/image"
import {
  Upload,
  X,
  Camera,
  MapPin,
  Calendar,
  Settings,
  Info,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExifSection {
  id: string
  label: string
  icon: React.ReactNode
  fields: ExifField[]
}

interface ExifField {
  key: string
  label: string
  value: string | number | null | undefined
}

interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function formatGPS(value: number | undefined, type: "lat" | "lng"): string {
  if (value == null) return "—"
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const minFull = (abs - deg) * 60
  const min = Math.floor(minFull)
  const sec = ((minFull - min) * 60).toFixed(2)
  const dir = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W"
  return `${deg}° ${min}' ${sec}" ${dir}`
}

function formatExposure(val: number | undefined): string {
  if (val == null) return "—"
  if (val < 1) return `1/${Math.round(1 / val)}s`
  return `${val}s`
}

function formatAperture(val: number | undefined): string {
  if (val == null) return "—"
  return `f/${val}`
}

function formatFocalLength(val: number | undefined): string {
  if (val == null) return "—"
  return `${val}mm`
}

function formatISO(val: number | undefined): string {
  if (val == null) return "—"
  return `ISO ${val}`
}

function formatDate(val: Date | string | undefined): string {
  if (val == null) return "—"
  try {
    const d = typeof val === "string" ? new Date(val) : val
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return String(val)
  }
}

function stringifyValue(val: unknown): string {
  if (val == null) return "—"
  if (val instanceof Date) return formatDate(val)
  if (typeof val === "number") return String(val)
  if (typeof val === "boolean") return val ? "Yes" : "No"
  if (Array.isArray(val)) return val.map(stringifyValue).join(", ")
  return String(val)
}

type ExifData = Record<string, unknown>

function buildSections(exif: ExifData, fileInfo: FileInfo): ExifSection[] {
  return [
    {
      id: "file",
      label: "File Info",
      icon: <Info className="w-4 h-4" />,
      fields: [
        { key: "fileName", label: "File Name", value: fileInfo.name },
        { key: "fileSize", label: "File Size", value: formatFileSize(fileInfo.size) },
        { key: "fileType", label: "File Type", value: fileInfo.type || "—" },
        { key: "ExifImageWidth", label: "Width", value: exif.ExifImageWidth ? `${exif.ExifImageWidth}px` : exif.ImageWidth ? `${exif.ImageWidth}px` : "—" },
        { key: "ExifImageHeight", label: "Height", value: exif.ExifImageHeight ? `${exif.ExifImageHeight}px` : exif.ImageLength ? `${exif.ImageLength}px` : "—" },
        { key: "ColorSpace", label: "Color Space", value: stringifyValue(exif.ColorSpace) },
        { key: "Orientation", label: "Orientation", value: stringifyValue(exif.Orientation) },
      ].filter((f) => f.value !== "—"),
    },
    {
      id: "camera",
      label: "Camera",
      icon: <Camera className="w-4 h-4" />,
      fields: [
        { key: "Make", label: "Make", value: stringifyValue(exif.Make) },
        { key: "Model", label: "Model", value: stringifyValue(exif.Model) },
        { key: "LensModel", label: "Lens", value: stringifyValue(exif.LensModel) },
        { key: "LensMake", label: "Lens Make", value: stringifyValue(exif.LensMake) },
        { key: "Software", label: "Software", value: stringifyValue(exif.Software) },
      ].filter((f) => f.value !== "—"),
    },
    {
      id: "settings",
      label: "Capture Settings",
      icon: <Settings className="w-4 h-4" />,
      fields: [
        { key: "ExposureTime", label: "Shutter Speed", value: exif.ExposureTime != null ? formatExposure(exif.ExposureTime as number) : "—" },
        { key: "FNumber", label: "Aperture", value: exif.FNumber != null ? formatAperture(exif.FNumber as number) : "—" },
        { key: "ISO", label: "ISO", value: exif.ISO != null ? formatISO(exif.ISO as number) : "—" },
        { key: "FocalLength", label: "Focal Length", value: exif.FocalLength != null ? formatFocalLength(exif.FocalLength as number) : "—" },
        { key: "FocalLengthIn35mmFormat", label: "35mm Equivalent", value: exif.FocalLengthIn35mmFormat != null ? `${exif.FocalLengthIn35mmFormat}mm` : "—" },
        { key: "ExposureMode", label: "Exposure Mode", value: stringifyValue(exif.ExposureMode) },
        { key: "ExposureProgram", label: "Exposure Program", value: stringifyValue(exif.ExposureProgram) },
        { key: "MeteringMode", label: "Metering Mode", value: stringifyValue(exif.MeteringMode) },
        { key: "Flash", label: "Flash", value: stringifyValue(exif.Flash) },
        { key: "WhiteBalance", label: "White Balance", value: stringifyValue(exif.WhiteBalance) },
        { key: "BrightnessValue", label: "Brightness", value: exif.BrightnessValue != null ? String((exif.BrightnessValue as number).toFixed(2)) : "—" },
        { key: "ExposureCompensation", label: "Exposure Compensation", value: exif.ExposureCompensation != null ? `${exif.ExposureCompensation} EV` : "—" },
      ].filter((f) => f.value !== "—"),
    },
    {
      id: "datetime",
      label: "Date & Time",
      icon: <Calendar className="w-4 h-4" />,
      fields: [
        { key: "DateTimeOriginal", label: "Date Taken", value: exif.DateTimeOriginal ? formatDate(exif.DateTimeOriginal as Date) : "—" },
        { key: "CreateDate", label: "Create Date", value: exif.CreateDate ? formatDate(exif.CreateDate as Date) : "—" },
        { key: "ModifyDate", label: "Last Modified", value: exif.ModifyDate ? formatDate(exif.ModifyDate as Date) : "—" },
      ].filter((f) => f.value !== "—"),
    },
    {
      id: "gps",
      label: "GPS Location",
      icon: <MapPin className="w-4 h-4" />,
      fields: [
        { key: "latitude", label: "Latitude", value: exif.latitude != null ? formatGPS(exif.latitude as number, "lat") : "—" },
        { key: "longitude", label: "Longitude", value: exif.longitude != null ? formatGPS(exif.longitude as number, "lng") : "—" },
        { key: "GPSAltitude", label: "Altitude", value: exif.GPSAltitude != null ? `${(exif.GPSAltitude as number).toFixed(1)}m` : "—" },
        { key: "GPSSpeed", label: "Speed", value: exif.GPSSpeed != null ? `${exif.GPSSpeed} km/h` : "—" },
      ].filter((f) => f.value !== "—"),
    },
  ].filter((section) => section.fields.length > 0)
}

export function ExifViewer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [exifData, setExifData] = useState<ExifData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["file", "camera", "settings", "datetime", "gps"]))
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, JPEG, TIFF, HEIC, PNG).")
      return
    }

    setLoading(true)
    setError(null)
    setExifData(null)

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    })

    try {
      const data = await exifr.parse(file, {
        tiff: true,
        xmp: false,
        icc: false,
        iptc: false,
        jfif: false,
        ihdr: true,
        gps: true,
        reviveValues: true,
        sanitize: true,
        mergeOutput: true,
        translateKeys: true,
        translateValues: true,
      }) as ExifData | null | undefined

      setExifData(data ?? {})
    } catch {
      setExifData({})
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleClear = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setFileInfo(null)
    setExifData(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [imageUrl])

  const handleCopy = useCallback(async () => {
    if (!exifData || !fileInfo) return
    const text = JSON.stringify({ file: fileInfo, exif: exifData }, null, 2)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [exifData, fileInfo])

  const handleExport = useCallback(() => {
    if (!exifData || !fileInfo) return
    const text = JSON.stringify({ file: fileInfo, exif: exifData }, null, 2)
    const blob = new Blob([text], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileInfo.name.replace(/\.[^/.]+$/, "")}-exif.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [exifData, fileInfo])

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const sections = exifData && fileInfo ? buildSections(exifData, fileInfo) : []

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          EXIF Viewer
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-base">
          View embedded metadata from photos — camera settings, GPS location, date and more.
          100% private, processed entirely in your browser.
        </p>
      </div>

      {!imageUrl ? (
        /* Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative border-2 border-dashed rounded-2xl p-16 transition-all duration-200 cursor-pointer overflow-hidden bg-white",
            isDragOver
              ? "border-primary-500 bg-primary-50 scale-[1.01]"
              : "border-gray-200 hover:border-primary-400 hover:bg-gray-50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center text-center space-y-5">
            <div className={cn(
              "p-5 rounded-full bg-primary-50 text-primary-600 transition-all duration-200 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md",
              isDragOver && "bg-white shadow-md scale-110"
            )}>
              <Upload className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xl font-semibold text-gray-900">
                {isDragOver ? "Drop image here" : "Click to upload or drag & drop"}
              </p>
              <p className="text-sm text-gray-500">JPEG, TIFF, HEIC, PNG supported</p>
            </div>
          </div>
        </div>
      ) : (
        /* Results Layout */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Left: Image Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="relative bg-gray-50 aspect-square flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={fileInfo?.name ?? "Uploaded image"}
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>
              {fileInfo && (
                <div className="p-4 border-t border-gray-100 space-y-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{fileInfo.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(fileInfo.size)} · {fileInfo.type}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex-1 gap-2 rounded-xl border-gray-200 hover:border-error-500 hover:text-error-600 hover:bg-error-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!exifData}
                className="flex-1 gap-2 rounded-xl border-gray-200 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-success-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy JSON"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!exifData}
                className="flex-1 gap-2 rounded-xl border-gray-200 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            {/* GPS Map Link */}
            {exifData?.latitude != null && exifData?.longitude != null && (
              <a
                href={`https://www.google.com/maps?q=${exifData.latitude},${exifData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>View on Google Maps</span>
              </a>
            )}
          </div>

          {/* Right: EXIF Data */}
          <div className="lg:col-span-3 space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && sections.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-2">
                <Info className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-gray-600 font-medium">No EXIF metadata found</p>
                <p className="text-sm text-gray-400">This image may not contain embedded EXIF data.</p>
              </div>
            )}

            {!loading && sections.map((section) => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-gray-800 font-semibold text-sm">
                    <span className="text-primary-600">{section.icon}</span>
                    {section.label}
                    <span className="ml-1 text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      {section.fields.length}
                    </span>
                  </div>
                  {expandedSections.has(section.id)
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {expandedSections.has(section.id) && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {section.fields.map((field) => (
                      <div key={field.key} className="flex items-start justify-between px-5 py-2.5 gap-4">
                        <span className="text-xs text-gray-500 shrink-0 pt-0.5 w-36">{field.label}</span>
                        <span className="text-xs text-gray-900 font-medium text-right break-words">{String(field.value ?? "—")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
          <Info className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
