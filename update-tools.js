import fs from 'fs';
import path from 'path';

const toolsPath = path.join(process.cwd(), 'src/data/tools.ts');
const content = fs.readFileSync(toolsPath, 'utf8');

// List of implemented tool IDs (folders exist)
const implementedIds = new Set([
    // PDF & Documents
    '1', '2', '3', '4', '5', '6', '7', '58', '59', '62',
    // Image
    '63', '8', '9', '11', '12', '13', '15', '66',
    // QR & Barcode
    '16', '17', '18',
    // Security & Privacy
    '19', '20', '21', '22', '23', '24', '70', '93',
    // Developer
    '28', '33', '57', '61', '31', '32', '34',
    // Design
    '36',
    // Text
    '60'
]);

// Helper to check if a tool block is implemented
// We look for "id: 'X'" and see if X is in implementedIds
// If not, we add isComingSoon: true

const toolBlockRegex = /\{\s*[\t ]*\r?\n\s*id:\s*'([0-9]+)',[\s\S]*?\}/g;

const updatedContent = content.replace(toolBlockRegex, (match, id) => {
    // If ID is implemented, return as is
    if (implementedIds.has(id)) {
        return match;
    }

    // If already marked, return as is
    if (match.includes('isComingSoon:')) {
        return match;
    }

    // Inject isComingSoon before categoryId
    // We assume strict formatting: categoryId: '...'
    if (match.includes('categoryId:')) {
        return match.replace(/(\s+)(categoryId:)/, '$1isComingSoon: true,$1$2');
    }

    return match;
});

fs.writeFileSync(toolsPath, updatedContent, 'utf8');
console.log('Updated tools.ts with isComingSoon flags.');
