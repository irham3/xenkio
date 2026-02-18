
export interface ConvertOptions {
    delimiter: string;
    flatten: boolean;
}

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Flattens a nested object into a single-level object with dot notation keys.
 */
function flattenObject(obj: unknown, prefix = '', result: JsonObject = {}): JsonObject {
    if (!isJsonObject(obj)) return result;

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (isJsonObject(value)) {
                flattenObject(value, newKey, result);
            } else {
                result[newKey] = value;
            }
        }
    }
    return result;
}

/**
 * Generates structured CSV data (headers and rows) from JSON.
 * Returns raw values for cells, not fully escaped CSV string yet.
 */
export function generateCsvData(json: string | unknown[] | object, options: ConvertOptions): { headers: string[], rows: string[][] } {
    let data: unknown[];

    try {
        if (typeof json === 'string') {
            const parsed = JSON.parse(json);
            data = Array.isArray(parsed) ? parsed : [parsed];
        } else if (Array.isArray(json)) {
            data = json;
        } else {
            data = [json];
        }
    } catch {
        throw new Error('Invalid JSON format');
    }

    if (data.length === 0) {
        return { headers: [], rows: [] };
    }

    // Process data based on options
    // If flatten is true, we flatten each object.
    const processedData = options.flatten
        ? data.map(item => flattenObject(item))
        : data as JsonObject[];

    // Collect all unique headers efficiently
    const uniqueHeaders = new Set<string>();
    processedData.forEach((item) => {
        if (isJsonObject(item)) {
            Object.keys(item).forEach(key => uniqueHeaders.add(key));
        }
    });

    const headers = Array.from(uniqueHeaders);

    if (headers.length === 0) {
        // Even if no headers found (empty objects), return empty structure
        return { headers: [], rows: [] };
    }

    const rows = processedData.map((row) => {
        // If row is not an object (e.g. primitive array), handle gracefully or skip
        if (!isJsonObject(row)) return headers.map(() => '');

        return headers.map(header => {
            if (!Object.prototype.hasOwnProperty.call(row, header)) {
                return '';
            }

            const value = row[header];

            if (value === null || value === undefined) {
                return '';
            }

            // Convert objects/arrays to string representation
            return typeof value === 'object'
                ? JSON.stringify(value)
                : String(value);
        });
    });

    return { headers, rows };
}

/**
 * Converts a JSON string or object to CSV string.
 */
export function jsonToCsv(json: string | unknown[] | object, options: ConvertOptions): string {
    const { headers, rows } = generateCsvData(json, options);

    if (headers.length === 0) return '';

    const delimiter = options.delimiter === '\\t' ? '\t' : options.delimiter;

    const csvRows = [
        headers.join(delimiter),
        ...rows.map(row => {
            return row.map(cell => {
                // Escape logic for CSV string
                const needsQuotes = cell.includes(delimiter) || cell.includes('"') || cell.includes('\n');
                if (needsQuotes) {
                    return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(delimiter);
        })
    ];

    return csvRows.join('\n');
}
