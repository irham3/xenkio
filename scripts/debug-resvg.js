import fs from 'fs';
import path from 'path';

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                scanDir(fullPath);
            }
        } else {
            try {
                const content = fs.readFileSync(fullPath);
                if (content.includes(Buffer.from('resvg'))) {
                    console.log(`FOUND 'resvg' in ${fullPath}`);
                    // Print context
                    const index = content.indexOf(Buffer.from('resvg'));
                    const start = Math.max(0, index - 100);
                    const end = Math.min(content.length, index + 100);
                    console.log(`Context: ${content.slice(start, end).toString('ascii').replace(/[^\x20-\x7E]/g, '.')}`);
                }
            } catch (e) {
                // Skip files we can't read
            }
        }
    }
}

console.log('--- SCANNING .open-next ---');
scanDir('.open-next');
console.log('--- SCANNING src ---');
scanDir('src');
console.log('--- DONE ---');
