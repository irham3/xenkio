import { VerificationRow, VerificationState } from '../types';

export function parsePastedData(text: string): { headers: string[], rows: Record<string, string>[], error?: string } {
    text = text.trim();
    if (!text) return { headers: [], rows: [] };

    // Support mix of tab, comma, semicolon
    const lines = text.split(/\r?\n/);
    if (lines.length < 1) return { headers: [], rows: [], error: 'Data must include at least one row.' };

    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(',') ? ',' : (firstLine.includes(';') ? ';' : '\t'));

    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, '')).filter(h => h);
    if (headers.length === 0) return { headers: [], rows: [], error: 'No valid headers found.' };

    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Handle basic quoted-csv values if needed, but for excel copy-paste split is fine
        const values = line.split(delimiter);
        const rowData: Record<string, string> = {};

        let hasData = false;
        headers.forEach((header, index) => {
            let val = values[index] ? values[index].trim() : '';
            val = val.replace(/^"|"$/g, '').replace(/""/g, '"'); // Unquote
            rowData[header] = val;
            if (val) hasData = true;
        });

        if (hasData) {
            rows.push(rowData);
        }
    }

    return { headers, rows };
}

function exactMatch(s1: string, s2: string): boolean {
    return s1.toLowerCase() === s2.toLowerCase();
}

function containsMatch(sTarget: string, sSource: string): boolean {
    if (!sTarget) return false;
    const cleanT = sTarget.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanS = sSource.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanS.includes(cleanT) || cleanT.includes(cleanS);
}

function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    if (s1 === s2) return 1.0;

    const track = Array(s2.length + 1).fill(null).map(() =>
        Array(s1.length + 1).fill(null)
    );
    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }
    const distance = track[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) return 1.0;
    return (maxLength - distance) / maxLength;
}

export function compareData(state: Omit<VerificationState, 'results' | 'auditLog'>): VerificationRow[] {
    const { targetRaw, sources, columnMappings, checkDuplicates, duplicateKey } = state;

    const results: VerificationRow[] = [];
    const seenMap = new Map<string, number>();

    const sourceMaps = new Map<string, Map<string, Record<string, string>>>();
    sources.forEach(src => {
        const keyMap = new Map<string, Record<string, string>>();
        src.rows.forEach(r => {
            const kv = r[src.sourceKey];
            if (kv) keyMap.set(String(kv).toLowerCase(), r);
        });
        sourceMaps.set(src.id, keyMap);
    });

    targetRaw.forEach((tRow, idx) => {
        const _id = `v-row-${idx + 1}`;
        let status: VerificationRow['status'] = 'identical';
        const mismatchedColumns: string[] = [];
        const partialColumns: string[] = [];
        const sourceDataMap: Record<string, Record<string, string>> = {};

        let isDuplicate = false;
        if (checkDuplicates && duplicateKey && tRow[duplicateKey]) {
            const dk = String(tRow[duplicateKey]).toLowerCase();
            const count = seenMap.get(dk) || 0;
            if (count > 0) isDuplicate = true;
            seenMap.set(dk, count + 1);
        }

        columnMappings.forEach(mapping => {
            const source = sources.find(s => s.id === mapping.sourceId);
            if (!source) return;

            const tKeyVal = String(tRow[source.targetKey] || '').toLowerCase();
            const sMap = sourceMaps.get(source.id);
            const sRow = sMap?.get(tKeyVal);

            if (!sRow) {
                if (status === 'identical' || status === 'partial') status = 'mismatch';
                mismatchedColumns.push(mapping.targetColumn);
                return;
            }

            sourceDataMap[source.id] = sRow;
            const sVal = sRow[mapping.sourceColumn] || '';
            const tVal = tRow[mapping.targetColumn] || '';

            if (sVal !== tVal) {
                let isMatch = false;
                let isPartial = false;

                if (mapping.matchType === 'exact') {
                    isMatch = exactMatch(sVal, tVal);
                } else if (mapping.matchType === 'contains') {
                    if (exactMatch(sVal, tVal)) isMatch = true;
                    else if (containsMatch(tVal, sVal)) isPartial = true;
                } else if (mapping.matchType === 'fuzzy') {
                    if (exactMatch(sVal, tVal)) isMatch = true;
                    else if (calculateSimilarity(sVal, tVal) >= 0.75) isPartial = true;
                }

                if (!isMatch) {
                    if (isPartial) {
                        partialColumns.push(mapping.targetColumn);
                        if (status === 'identical') status = 'partial';
                    } else {
                        mismatchedColumns.push(mapping.targetColumn);
                        status = 'mismatch';
                    }
                }
            }
        });

        let finalStatus: VerificationRow['status'] = status;
        if (mismatchedColumns.length === columnMappings.length && columnMappings.length > 0) {
            const allMissingSource = columnMappings.every(m => {
                const src = sources.find(s => s.id === m.sourceId);
                const tKeyVal = String(tRow[src?.targetKey || '']).toLowerCase();
                return !sourceMaps.get(src?.id || '')?.has(tKeyVal);
            });
            if (allMissingSource) {
                finalStatus = 'missing_in_source';
            }
        }

        // Prioritize mismatch/partial/missing over duplicate status for display
        const resultStatus = (isDuplicate && finalStatus === 'identical') ? 'duplicate' : finalStatus;

        results.push({
            _id,
            sourceData: sourceDataMap,
            targetData: tRow,
            originalTargetData: { ...tRow }, // Store initial snapshot
            status: resultStatus,
            mismatchedColumns,
            partialColumns,
            isDuplicate
        });
    });

    return results;
}
