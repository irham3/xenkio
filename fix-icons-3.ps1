# Fix remaining icon mapping errors
$filesToFix = @(
    "src/features/background-remover/components/background-editor.tsx",
    "src/features/background-remover/components/background-remover.tsx",
    "src/features/background-remover/components/compare-slider.tsx",
    "src/features/border-radius-generator/components/border-radius-generator-tool.tsx",
    "src/features/carousel-generator/components/carousel-image-controls.tsx",
    "src/features/color-picker/components/color-picker.tsx",
    "src/features/contrast-checker/components/contrast-checker-tool.tsx",
    "src/features/css-minifier/components/css-minifier.tsx",
    "src/features/date-calculator/components/date-calculator.tsx",
    "src/features/duplicate-remover/components/duplicate-remover-tool.tsx",
    "src/features/favicon-generator/components/favicon-generator.tsx",
    "src/features/feedback/components/feedback-dialog.tsx",
    "src/features/feedback/components/feedback-popover.tsx",
    "src/features/font-pairing/components/font-pairing-tool.tsx",
    "src/features/gradient-generator/components/gradient-generator-tool.tsx",
    "src/features/hash-generator/components/hash-generate.tsx",
    "src/features/hash-generator/components/hash-verify.tsx",
    "src/features/html-entity-encoder/components/html-entity-encoder.tsx",
    "src/features/html-formatter/components/html-formatter.tsx",
    "src/features/image-cropper/components/image-cropper.tsx",
    "src/features/image-steganography/components/steganography-tool.tsx",
    "src/features/image-to-base64/components/base64-result.tsx",
    "src/features/invoice-generator/components/invoice-form.tsx",
    "src/features/js-minifier/components/js-minifier.tsx",
    "src/features/markdown-editor/components/markdown-header.tsx",
    "src/features/markdown-editor/components/toolbar.tsx",
    "src/features/pdf-compressor/components/pdf-compressor.tsx",
    "src/features/qr-generator/components/qr-customizer.tsx",
    "src/features/regex-tester/components/regex-tester.tsx"
)

$map = @{
    "MoveHorizontal" = "ArrowsLeftRight"
    "Unlink" = "LinkBreak"
    "BringToFront" = "Cards"
    "SendToBack" = "Cards"
    "Pipette" = "Eyedropper"
    "AlertTriangle" = "Warning"
    "Minimize2" = "CornersIn"
    "ArrowLeftRight" = "ArrowsLeftRight"
    "ArrowDownAZ" = "SortAscending"
    "Apple" = "AppleLogo"
    "MessageSquarePlus" = "ChatCircle"
    "LayoutTemplate" = "Layout"
    "ShieldX" = "ShieldSlash"
    "FileCheck" = "CheckCircle"
    "Building2" = "Buildings"
    "StickyNote" = "Note"
    "Upload" = "UploadSimple"
    "Settings" = "Gear"
    "Smartphone" = "DeviceMobile"
    "Columns2" = "Columns"
    "Undo2" = "ArrowCounterClockwise"
    "Redo2" = "ArrowClockwise"
    "TextBolder" = "TextB"
    "BracketsAngleAngle" = "BracketsAngle"
    "Frame" = "FrameCorners"
    "Settings2" = "Sliders"
}

foreach ($f in $filesToFix) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        
        # Replace normal maps
        foreach ($key in $map.Keys) {
            $val = $map[$key]
            # Replace in imports
            if ($c -match "\b$key\b" ) {
                $c = [regex]::Replace($c, "(?<=import\s*\{[^}]*)\b$key\b(?=[^}]*\}\s*from\s*['""]@phosphor-icons/react['""])", $val)
                # Replace tags
                $c = $c -replace "<$key(\s|>|/>)", "<$val`$1"
                $c = $c -replace "</$key>", "</$val>"
                # Replace in object properties like { Smartphone } or Icon_Map
                $c = [regex]::Replace($c, "\b$key\b(?!>|/|['""])", $val)
            }
        }
        
        # Handle 'Image' duplicate by aliasing
        # If both 'import Image from "next/image"' and 'import { ... Image ... } from "@phosphor-icons/react"'
        if ($c -match "from\s*['""]next/image['""]" -and $c -match "(?<=import\s*\{[^}]*)\bImage\b(?=[^}]*\}\s*from\s*['""]@phosphor-icons/react['""])") {
            # replace "Image" inside Phosphor import with "Image as ImageIcon"
            $c = [regex]::Replace($c, "(?<=import\s*\{[^}]*)\bImage\b(?=[^}]*\}\s*from\s*['""]@phosphor-icons/react['""])", "Image as PhosphorImage")
            # replace <Image to <PhosphorImage ONLY IF it's referencing Phosphor.
            # Next.js Image uses `src=` and `width=`. Phosphor uses `size=`, `weight=`, or no special props like src
            # We'll replace <Image ... size= ... or <Image ... weight= ... or <Image className="w-
            $c = [regex]::Replace($c, "<Image([^>]*?(weight|size|className)=)", "<PhosphorImage`$1")
        }

        # Fix typescript boolean to string on Phosphor image in those duplicate files just in case
        # like <Image ... weight="duotone" instead of weight={true}  <- wait, the error was "Type 'boolean' is not assignable to type 'string'" which implies <Image ... unoptimized ... /> NEXT IMAGE used as Phosphor Image.
        # Oh, if Next Image is being parsed as Phosphor, it's because my regex changed `<Image` to Phosphor. If I do alias to PhosphorImage, I'll need to manually ensure Next.js image is `<Image`
        
        # Fix PDF File type:
        if ($f -match "pdf-compressor.tsx") {
            $c = [regex]::Replace($c, "(?<=import\s*\{[^}]*)\bFile\b(?=[^}]*\}\s*from\s*['""]@phosphor-icons/react['""])", "File as PhosphorFile")
            $c = $c -replace "<File(\s|>|/>)", "<PhosphorFile`$1"
            $c = $c -replace "</File>", "</PhosphorFile>"
        }

        # Fix duplicate Code import
        if ($f -match "toolbar.tsx") {
            $c = $c -replace "Code,\s*Code,", "Code,"
            $c = $c -replace "import \{ Code \} from '@phosphor-icons/react';\s*import \{ Code \} from '@phosphor-icons/react';", "import { Code } from '@phosphor-icons/react';"
        }

        Set-Content $f -Value $c -NoNewline
    }
}
