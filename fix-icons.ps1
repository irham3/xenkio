# Fix remaining unmapped icons
$srcDir = "d:\Work\00\xenkio\src"

# Additional mappings that were missed
$fixMap = @{
    "Bold" = "TextBolder"
    "Italic" = "TextItalic"
    "Underline" = "TextUnderline" 
    "Strikethrough" = "TextStrikethrough"
    "Heading1" = "TextHOne"
    "Heading2" = "TextHTwo"
    "Heading3" = "TextHThree"
    "Heading4" = "TextHFour"
    "Heading5" = "TextHFive"
    "Heading6" = "TextHSix"
    "CheckSquare" = "CheckSquare"
    "Quote" = "Quotes"
    "SquareCode" = "Code"
    "MoreHorizontal" = "DotsThree"
    "RotateCw" = "ArrowClockwise"
    "GripVertical" = "DotsSixVertical"
    "FileDown" = "FileArrowDown"
    "Unlock" = "LockOpen"
    "Camera" = "Camera"
    "CameraOff" = "CameraSlash"
    "Zap" = "Lightning"
    "ArrowRightLeft" = "ArrowsLeftRight"
    "Ruler" = "Ruler"
    "Weight" = "Scales"
    "Thermometer" = "Thermometer"
    "Droplet" = "Drop"
    "ArrowDown" = "ArrowDown"
    "Battery" = "Battery"
    "HardDrive" = "HardDrive"
    "RefreshCcw" = "ArrowsCounterClockwise"
    "Files" = "Files"
    "MicOff" = "MicrophoneSlash"
    "Image" = "Image"
    "ImageIcon" = "Image"
    "File" = "File"
    "FileIcon" = "File"
    "FileArchive" = "FileArchive"
    "Folder" = "Folder"
    "Table" = "Table"
    "TableIcon" = "Table"
    "List" = "ListBullets"
}

# Get all files that import from @phosphor-icons/react
$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.ts","*.tsx" | Where-Object {
    (Get-Content $_.FullName -Raw) -match "from\s+['""]@phosphor-icons/react['""]"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($key in $fixMap.Keys) {
        $value = $fixMap[$key]
        
        # Check if this unmapped icon name exists in an import
        # Match icon name in import statement (as a whole word in import context)
        if ($content -match "import\s*\{[^}]*\b$key\b[^}]*\}\s*from\s*['""]@phosphor-icons/react['""]") {
            # Replace in imports - need to be careful with word boundaries
            $importPattern = "(?<=import\s*\{[^}]*)\b$key\b(?=[^}]*\}\s*from\s*['""]@phosphor-icons/react['""])"
            $content = [regex]::Replace($content, $importPattern, $value)
            
            # Replace in JSX usage
            if ($key -ne $value) {
                $content = $content -replace "<$key(\s)", "<$value`$1"
                $content = $content -replace "<$key(/>)", "<$value`$1"
                $content = $content -replace "<$key(>)", "<$value`$1"
                $content = $content -replace "</$key>", "</$value>"
            }
            
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nFix complete!"
