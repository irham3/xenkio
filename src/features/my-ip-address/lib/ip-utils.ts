export function parseOrg(org?: string): { asn: string; isp: string } {
    if (!org) return { asn: '', isp: '' };
    const spaceIndex = org.indexOf(' ');
    if (spaceIndex === -1) return { asn: org, isp: '' };
    return {
        asn: org.substring(0, spaceIndex),
        isp: org.substring(spaceIndex + 1),
    };
}

export function getCountryFlag(countryCode?: string): string {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = [...countryCode.toUpperCase()].map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export function formatCoords(loc?: string): string {
    if (!loc) return '';
    const [lat, lng] = loc.split(',');
    if (!lat || !lng) return '';
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) return '';
    const latDir = latNum >= 0 ? 'N' : 'S';
    const lngDir = lngNum >= 0 ? 'E' : 'W';
    return `${Math.abs(latNum).toFixed(4)}°${latDir}, ${Math.abs(lngNum).toFixed(4)}°${lngDir}`;
}
