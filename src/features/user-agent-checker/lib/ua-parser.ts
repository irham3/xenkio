import type { ParsedUserAgent, BrowserInfo, OsInfo, DeviceInfo, EngineInfo, CpuInfo } from '../types';

function parseBrowser(ua: string): BrowserInfo {
    const tests: [RegExp, string][] = [
        [/Edg(?:e|A|iOS)?\/([0-9.]+)/i, 'Microsoft Edge'],
        [/OPR\/([0-9.]+)/i, 'Opera'],
        [/Opera(?:.*Version)?\/([0-9.]+)/i, 'Opera'],
        [/SamsungBrowser\/([0-9.]+)/i, 'Samsung Browser'],
        [/UCBrowser\/([0-9.]+)/i, 'UC Browser'],
        [/YaBrowser\/([0-9.]+)/i, 'Yandex Browser'],
        [/Brave\/([0-9.]+)/i, 'Brave'],
        [/Vivaldi\/([0-9.]+)/i, 'Vivaldi'],
        [/Chrome\/([0-9.]+)/i, 'Chrome'],
        [/CriOS\/([0-9.]+)/i, 'Chrome'],
        [/Firefox\/([0-9.]+)/i, 'Firefox'],
        [/FxiOS\/([0-9.]+)/i, 'Firefox'],
        [/Safari\/([0-9.]+)/i, 'Safari'],
        [/MSIE ([0-9.]+)/i, 'Internet Explorer'],
        [/Trident.*rv:([0-9.]+)/i, 'Internet Explorer'],
    ];

    for (const [regex, name] of tests) {
        const match = ua.match(regex);
        if (match) {
            const version = match[1] ?? '';
            const majorVersion = version.split('.')[0] ?? '';
            return { name, version, majorVersion };
        }
    }

    return { name: 'Unknown', version: '', majorVersion: '' };
}

function parseOs(ua: string): OsInfo {
    if (/Windows Phone ([0-9.]+)/i.test(ua)) {
        return { name: 'Windows Phone', version: ua.match(/Windows Phone ([0-9.]+)/i)?.[1] ?? '' };
    }
    if (/Android ([0-9.]+)/i.test(ua)) {
        return { name: 'Android', version: ua.match(/Android ([0-9.]+)/i)?.[1] ?? '' };
    }
    if (/iPad.*OS ([0-9_]+)/i.test(ua)) {
        const v = ua.match(/iPad.*OS ([0-9_]+)/i)?.[1]?.replace(/_/g, '.') ?? '';
        return { name: 'iPadOS', version: v };
    }
    if (/iPhone.*OS ([0-9_]+)/i.test(ua)) {
        const v = ua.match(/iPhone.*OS ([0-9_]+)/i)?.[1]?.replace(/_/g, '.') ?? '';
        return { name: 'iOS', version: v };
    }
    if (/CPU OS ([0-9_]+)/i.test(ua)) {
        const v = ua.match(/CPU OS ([0-9_]+)/i)?.[1]?.replace(/_/g, '.') ?? '';
        return { name: 'iOS', version: v };
    }
    if (/Mac OS X ([0-9_.]+)/i.test(ua)) {
        const v = ua.match(/Mac OS X ([0-9_.]+)/i)?.[1]?.replace(/_/g, '.') ?? '';
        return { name: 'macOS', version: v };
    }
    const winTests: [RegExp, string][] = [
        [/Windows NT 10\.0/i, '10 / 11'],
        [/Windows NT 6\.3/i, '8.1'],
        [/Windows NT 6\.2/i, '8'],
        [/Windows NT 6\.1/i, '7'],
        [/Windows NT 6\.0/i, 'Vista'],
        [/Windows NT 5\.1/i, 'XP'],
        [/Windows NT 5\.0/i, '2000'],
        [/Windows/i, ''],
    ];
    for (const [regex, version] of winTests) {
        if (regex.test(ua)) {
            return { name: 'Windows', version };
        }
    }
    if (/Linux/i.test(ua)) {
        if (/Ubuntu/i.test(ua)) return { name: 'Ubuntu', version: '' };
        if (/Fedora/i.test(ua)) return { name: 'Fedora', version: '' };
        if (/Debian/i.test(ua)) return { name: 'Debian', version: '' };
        return { name: 'Linux', version: '' };
    }
    if (/CrOS/i.test(ua)) {
        return { name: 'Chrome OS', version: '' };
    }
    return { name: 'Unknown', version: '' };
}

function parseDevice(ua: string): DeviceInfo {
    const botPattern = /bot|crawler|spider|crawling|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Googlebot|bingbot|DuckDuckBot|Baiduspider|YandexBot|Sogou/i;
    if (botPattern.test(ua)) {
        return { type: 'Bot', brand: '', model: '' };
    }

    if (/iPad/i.test(ua)) {
        const model = ua.match(/iPad([A-Za-z0-9,]+)/i)?.[0] ?? 'iPad';
        return { type: 'Tablet', brand: 'Apple', model };
    }
    if (/iPhone/i.test(ua)) {
        return { type: 'Mobile', brand: 'Apple', model: 'iPhone' };
    }
    if (/Android/i.test(ua)) {
        if (/Tablet|SM-T|GT-P|SCH-I|KFOT|KFJW|Kindle|Silk|PlayBook|RIM Tablet/i.test(ua)) {
            const brandModel = ua.match(/\(Linux; Android [0-9.]+; ([^)]+)\)/i)?.[1] ?? '';
            return { type: 'Tablet', brand: '', model: brandModel };
        }
        const brandModel = ua.match(/\(Linux; Android [0-9.]+; ([^)]+)\)/i)?.[1] ?? '';
        return { type: 'Mobile', brand: '', model: brandModel };
    }
    if (/Windows Phone/i.test(ua)) {
        return { type: 'Mobile', brand: 'Microsoft', model: 'Windows Phone' };
    }
    if (/Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        return { type: 'Mobile', brand: '', model: '' };
    }
    return { type: 'Desktop', brand: '', model: '' };
}

function parseEngine(ua: string): EngineInfo {
    if (/Gecko\/([0-9.]+)/i.test(ua) && !/AppleWebKit/i.test(ua)) {
        const version = ua.match(/Gecko\/([0-9.]+)/i)?.[1] ?? '';
        return { name: 'Gecko', version };
    }
    if (/AppleWebKit\/([0-9.]+)/i.test(ua)) {
        const version = ua.match(/AppleWebKit\/([0-9.]+)/i)?.[1] ?? '';
        if (/Chrome/i.test(ua) || /Chromium/i.test(ua)) {
            return { name: 'Blink', version };
        }
        return { name: 'WebKit', version };
    }
    if (/Trident\/([0-9.]+)/i.test(ua)) {
        const version = ua.match(/Trident\/([0-9.]+)/i)?.[1] ?? '';
        return { name: 'Trident', version };
    }
    if (/Presto\/([0-9.]+)/i.test(ua)) {
        const version = ua.match(/Presto\/([0-9.]+)/i)?.[1] ?? '';
        return { name: 'Presto', version };
    }
    return { name: 'Unknown', version: '' };
}

function parseCpu(ua: string): CpuInfo {
    if (/WOW64|Win64|x64|x86_64|AMD64/i.test(ua)) return { architecture: 'amd64' };
    if (/ARM64|aarch64/i.test(ua)) return { architecture: 'arm64' };
    if (/ARM/i.test(ua)) return { architecture: 'arm' };
    if (/i[0-9]86|i86pc|x86/i.test(ua)) return { architecture: 'ia32' };
    if (/sparc64/i.test(ua)) return { architecture: 'sparc64' };
    if (/ia64/i.test(ua)) return { architecture: 'ia64' };
    if (/mips/i.test(ua)) return { architecture: 'mips' };
    return { architecture: 'Unknown' };
}

export function parseUserAgent(ua: string): ParsedUserAgent {
    const browser = parseBrowser(ua);
    const os = parseOs(ua);
    const device = parseDevice(ua);
    const engine = parseEngine(ua);
    const cpu = parseCpu(ua);

    return {
        raw: ua,
        browser,
        os,
        device,
        engine,
        cpu,
        isBot: device.type === 'Bot',
        isMobile: device.type === 'Mobile',
        isTablet: device.type === 'Tablet',
        isDesktop: device.type === 'Desktop',
    };
}

export function getBrowserIcon(name: string): string {
    const icons: Record<string, string> = {
        'Chrome': '🌐',
        'Firefox': '🦊',
        'Safari': '🧭',
        'Microsoft Edge': '🔷',
        'Opera': '🔴',
        'Samsung Browser': '📱',
        'Internet Explorer': '🔵',
        'UC Browser': '⚡',
        'Brave': '🦁',
        'Vivaldi': '🎻',
        'Yandex Browser': '🟡',
        'Bot': '🤖',
    };
    return icons[name] ?? '🌐';
}

export function getOsIcon(name: string): string {
    const icons: Record<string, string> = {
        'Windows': '🪟',
        'macOS': '🍎',
        'Linux': '🐧',
        'Android': '🤖',
        'iOS': '📱',
        'iPadOS': '📱',
        'Ubuntu': '🔶',
        'Chrome OS': '🌐',
    };
    return icons[name] ?? '💻';
}

export function getDeviceIcon(type: string): string {
    const icons: Record<string, string> = {
        'Desktop': '🖥️',
        'Mobile': '📱',
        'Tablet': '📋',
        'Bot': '🤖',
    };
    return icons[type] ?? '❓';
}
