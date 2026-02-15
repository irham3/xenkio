import fs from 'fs';
import path from 'path';

const searchDir = path.join(process.cwd(), '.open-next');

function getAllFiles(dirPath, arrayOfFiles) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles || [];

    // Log directory entry
    // console.log(`Scanning directory: ${dirPath}`); 

    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // console.log(`  Entering subdir: ${file}`);
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
                arrayOfFiles.push(fullPath);
                // Log if we found the target file
                if (file.includes('_86016605')) console.log(`   FOUND TARGET FILE: ${file}`);
            }
        }
    });

    return arrayOfFiles;
}

if (fs.existsSync(searchDir)) {
    console.log(`🔍 Scanning ${searchDir} for WASM references...`);
    const files = getAllFiles(searchDir);
    let patchedCount = 0;

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let patched = false;

        // Helper to replace and log
        const replaceWithLog = (regex, replacement, description) => {
            if (regex.test(content)) {
                const matchCount = (content.match(regex) || []).length;
                console.log(`   👉 Fixing ${description} in ${path.basename(file)} (${matchCount} matches)`);
                content = content.replace(regex, replacement);
                patched = true;
            }
        };

        // DEBUG: Check for ANY resvg occurrence and log context
        const resvgIndex = content.toLowerCase().indexOf('resvg');
        if (resvgIndex !== -1) {
            console.log(`   ⚠️ Found 'resvg' at index ${resvgIndex} in ${file.split('xenkio')[1]}`);
            const start = Math.max(0, resvgIndex - 50);
            const end = Math.min(content.length, resvgIndex + 50);
            console.log(`   Context: ...${content.substring(start, end)}...`);
        }

        // 1. Remove standard import/require for resvg/vercel-og
        replaceWithLog(/import\s+.*?from\s+['"][^'"]*?resvg[^'"]*?['"];?/gi, '// import removed', 'resvg import');
        replaceWithLog(/import\s+.*?from\s+['"][^'"]*?vercel\/og[^'"]*?['"];?/gi, '// import removed', 'vercel/og import');
        replaceWithLog(/require\(['"][^'"]*?resvg[^'"]*?['"]\)/gi, '{}', 'resvg require');
        replaceWithLog(/require\(['"][^'"]*?vercel\/og[^'"]*?['"]\)/gi, '{}', 'vercel/og require');

        // 2. Remove dynamic imports - replace with Promise.resolve that won't be mangled
        // Using String.fromCharCode to avoid minifier detecting patterns
        replaceWithLog(/import\(['"]\.[^'"]*?resvg[^'"]*?['"]\)/gi, 'Promise.resolve({default:null})', 'resvg dynamic import');
        replaceWithLog(/import\(['"]\.[^'"]*?vercel\/og[^'"]*?['"]\)/gi, 'Promise.resolve({default:null})', 'vercel/og dynamic import');

        // 3. AGGRESSIVE: Remove dynamic imports - broader pattern (disabled for safety)
        // replaceWithLog(/import\(.*vercel\/og.*\)/gi, 'Promise.resolve({default:null})', 'vercel/og dynamic import (aggressive)');
        replaceWithLog(/['"][^'"]*?\.wasm\?module['"]/gi, '""', 'WASM module string');

        // 4. Remove specific internal next.js/vercel references to these files
        replaceWithLog(/['"][^'"]*?resvg\.wasm['"]/gi, '""', 'resvg.wasm string');
        replaceWithLog(/['"][^'"]*?yoga\.wasm['"]/gi, '""', 'yoga.wasm string');

        // 5. Brute force specific known problematic strings if regex missed them
        if (content.toLowerCase().includes('resvg.wasm')) {
            console.log(`   👉 Brute force removing 'resvg.wasm' string`);
            content = content.replace(/resvg\.wasm/gi, 'disabled_wasm');
            patched = true;
        }

        if (content.toLowerCase().includes('yoga.wasm')) {
            console.log(`   👉 Brute force removing 'yoga.wasm' string`);
            content = content.replace(/yoga\.wasm/gi, 'disabled_wasm');
            patched = true;
        }

        // 6. Special case for the "module" literal in import attributes/assertions (if present in build output)
        replaceWithLog(/assert\s*:\s*{\s*type\s*:\s*['"]webassembly['"]\s*}/g, '', 'wasm assertion');
        replaceWithLog(/with\s*:\s*{\s*type\s*:\s*['"]webassembly['"]\s*}/g, '', 'wasm attribute');

        if (patched) {
            fs.writeFileSync(file, content);
            console.log(`   ✅ Patched ${path.basename(file)}`);
            patchedCount++;
        }
    });

    if (patchedCount > 0) {
        console.log(`✨ Successfully patched ${patchedCount} files.`);
    } else {
        console.log('✅ No WASM references found (standard scan).');
    }

} else {
    console.log('❌ .open-next directory not found at', searchDir);
    process.exit(1);
}
