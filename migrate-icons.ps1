# PowerShell script to migrate lucide-react imports to @phosphor-icons/react
# This handles all files in src/ that import from 'lucide-react'

$srcDir = "d:\Work\00\xenkio\src"

# Define the mapping from Lucide icon names to Phosphor icon names
$iconMap = @{
    "Activity" = "Activity"
    "AlertCircle" = "WarningCircle"
    "Archive" = "Archive"
    "ArrowDownWideNarrow" = "SortDescending"
    "ArrowLeft" = "ArrowLeft"
    "ArrowLeftRight" = "ArrowsLeftRight"
    "ArrowRight" = "ArrowRight"
    "ArrowUpDown" = "ArrowsDownUp"
    "Banknote" = "Money"
    "BarChart3" = "ChartBar"
    "Barcode" = "Barcode"
    "Binary" = "Binary"
    "Bot" = "Robot"
    "Box" = "Cube"
    "Braces" = "BracketsCurly"
    "Brain" = "Brain"
    "Calculator" = "Calculator"
    "Calendar" = "Calendar"
    "CalendarDays" = "CalendarDots"
    "CalendarRange" = "CalendarBlank"
    "Check" = "Check"
    "CheckCircle2" = "CheckCircle"
    "ChevronDown" = "CaretDown"
    "ChevronLeft" = "CaretLeft"
    "ChevronRight" = "CaretRight"
    "ChevronUp" = "CaretUp"
    "Clock" = "Clock"
    "Code" = "Code"
    "Code2" = "CodeSimple"
    "Coins" = "Coins"
    "Columns2" = "Columns"
    "Contrast" = "CircleHalf"
    "Copy" = "Copy"
    "Cpu" = "Cpu"
    "CreditCard" = "CreditCard"
    "Crop" = "Crop"
    "Diff" = "FileDiffs"
    "DollarSign" = "CurrencyDollar"
    "Download" = "DownloadSimple"
    "Eraser" = "Eraser"
    "ExternalLink" = "ArrowSquareOut"
    "Eye" = "Eye"
    "EyeOff" = "EyeSlash"
    "FileCode" = "FileCode"
    "FileEdit" = "FilePencil"
    "FileImage" = "FileImage"
    "FileJson" = "FileJs"
    "FileOutput" = "FileArrowDown"
    "FilePlus" = "FilePlus"
    "FileSpreadsheet" = "FileXls"
    "FileText" = "FileText"
    "FileVideo" = "FileVideo"
    "Film" = "FilmStrip"
    "Frame" = "FrameCorners"
    "GalleryHorizontal" = "Images"
    "Gauge" = "Gauge"
    "Globe" = "Globe"
    "Globe2" = "GlobeSimple"
    "GraduationCap" = "GraduationCap"
    "Hash" = "Hash"
    "History" = "ClockCounterClockwise"
    "ImageDown" = "ImageSquare"
    "Info" = "Info"
    "Key" = "Key"
    "KeyRound" = "KeyReturn"
    "Layers" = "Stack"
    "LayoutGrid" = "GridFour"
    "LetterText" = "TextAa"
    "Link" = "Link"
    "Link2" = "LinkSimple"
    "ListFilter" = "FunnelSimple"
    "ListOrdered" = "ListNumbers"
    "Loader2" = "SpinnerGap"
    "Lock" = "Lock"
    "LockKeyhole" = "LockKey"
    "LucideIcon" = "Icon"
    "Map" = "MapTrifold"
    "Maximize2" = "ArrowsOut"
    "Menu" = "List"
    "Merge" = "GitMerge"
    "Mic" = "Microphone"
    "Minus" = "Minus"
    "Moon" = "Moon"
    "Network" = "Graph"
    "Paintbrush" = "PaintBrush"
    "Palette" = "Palette"
    "Pause" = "Pause"
    "PenTool" = "PenNib"
    "Percent" = "Percent"
    "Play" = "Play"
    "Plus" = "Plus"
    "QrCode" = "QrCode"
    "Receipt" = "Receipt"
    "Redo" = "ArrowClockwise"
    "RefreshCw" = "ArrowsClockwise"
    "Regex" = "Brackets"
    "RotateCcw" = "ArrowCounterClockwise"
    "ScanLine" = "Scan"
    "Search" = "MagnifyingGlass"
    "Server" = "HardDrives"
    "Settings" = "Gear"
    "Settings2" = "Sliders"
    "Share2" = "ShareNetwork"
    "Shield" = "Shield"
    "ShieldAlert" = "ShieldWarning"
    "ShieldCheck" = "ShieldCheck"
    "Smartphone" = "DeviceMobile"
    "Sparkles" = "Sparkle"
    "Split" = "SplitHorizontal"
    "Square" = "Square"
    "Sun" = "Sun"
    "Terminal" = "Terminal"
    "TextCursor" = "Cursor"
    "Timer" = "Timer"
    "Trash2" = "Trash"
    "TrendingUp" = "TrendUp"
    "Triangle" = "Triangle"
    "Twitter" = "XLogo"
    "Type" = "TextT"
    "Undo" = "ArrowCounterClockwise"
    "Upload" = "UploadSimple"
    "User" = "User"
    "UserMinus" = "UserMinus"
    "UserPlus" = "UserPlus"
    "Users" = "Users"
    "Volume2" = "SpeakerHigh"
    "VolumeX" = "SpeakerSlash"
    "Wand2" = "MagicWand"
    "Wifi" = "WifiHigh"
    "X" = "X"
    "XCircle" = "XCircle"
    "ZoomIn" = "MagnifyingGlassPlus"
    "ZoomOut" = "MagnifyingGlassMinus"
    "Scissors" = "Scissors"
}

# Find all .ts and .tsx files that import from lucide-react
$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.ts","*.tsx" | Where-Object {
    (Get-Content $_.FullName -Raw) -match "from\s+['""]lucide-react['""]"
}

Write-Host "Found $($files.Count) files with lucide-react imports"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Extract the import statement(s) from lucide-react
    # Handle multi-line imports
    $importPattern = "import\s*\{([^}]+)\}\s*from\s*['""]lucide-react['""];?"
    
    $matches_found = [regex]::Matches($content, $importPattern)
    
    foreach ($match in $matches_found) {
        $fullImport = $match.Value
        $importedNames = $match.Groups[1].Value
        
        # Parse individual icon names, handling aliases like "Image as ImageIcon"
        $icons = $importedNames -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
        
        $newIcons = @()
        foreach ($icon in $icons) {
            # Handle "type X" imports
            $isType = $false
            $cleanIcon = $icon
            if ($cleanIcon -match "^\s*type\s+(.+)$") {
                $isType = $true
                $cleanIcon = $Matches[1].Trim()
            }

            # Handle aliases like "Image as ImageIcon" or "File as FileIcon"
            if ($cleanIcon -match "^(\w+)\s+as\s+(\w+)$") {
                $originalName = $Matches[1].Trim()
                $alias = $Matches[2].Trim()
                if ($iconMap.ContainsKey($originalName)) {
                    $phosphorName = $iconMap[$originalName]
                    if ($phosphorName -eq $alias) {
                        $newIcon = $phosphorName
                    } else {
                        $newIcon = "$phosphorName as $alias"
                    }
                } else {
                    Write-Host "  WARNING: No mapping for '$originalName' (aliased as '$alias') in $($file.Name)"
                    $newIcon = $cleanIcon
                }
            } else {
                $iconName = $cleanIcon.Trim()
                if ($iconMap.ContainsKey($iconName)) {
                    $newIcon = $iconMap[$iconName]
                } else {
                    Write-Host "  WARNING: No mapping for '$iconName' in $($file.Name)"
                    $newIcon = $iconName
                }
            }
            
            if ($isType) {
                $newIcons += "type $newIcon"
            } else {
                $newIcons += $newIcon
            }
        }
        
        # Check if original was multi-line
        $isMultiLine = $fullImport -match "`n"
        
        if ($isMultiLine -or $newIcons.Count -gt 4) {
            $newImportList = ($newIcons | ForEach-Object { "    $_" }) -join ",`n"
            $newImport = "import {`n$newImportList`n} from '@phosphor-icons/react';"
        } else {
            $newImportList = $newIcons -join ", "
            $newImport = "import { $newImportList } from '@phosphor-icons/react';"
        }
        
        $content = $content.Replace($fullImport, $newImport)
    }
    
    # Now replace icon names in JSX usage - but be careful not to replace inside strings or comments
    # We need to replace <OldIcon to <NewIcon and </OldIcon to </NewIcon
    foreach ($key in $iconMap.Keys) {
        $value = $iconMap[$key]
        if ($key -ne $value) {
            # Replace JSX usage: <OldIcon (component opening tags)
            $content = $content -replace "<$key(\s)", "<$value`$1"
            $content = $content -replace "<$key(/>)", "<$value`$1"
            $content = $content -replace "<$key(>)", "<$value`$1"
            # Replace JSX closing tags
            $content = $content -replace "</$key>", "</$value>"
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.FullName)"
    }
}

Write-Host "`nMigration complete!"
