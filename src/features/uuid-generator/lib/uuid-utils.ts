
import {
    v1 as uuidv1,
    v3 as uuidv3,
    v4 as uuidv4,
    v5 as uuidv5,
    v6 as uuidv6,
    v7 as uuidv7,
    validate
} from 'uuid';
import { UUIDConfig } from '../types';

export const NAMESPACES = {
    DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

export function generateUUID(config: UUIDConfig): string[] {
    const result: string[] = [];
    const { version, count, uppercase, hyphens, namespace, name } = config;

    for (let i = 0; i < count; i++) {
        let val = '';

        try {
            switch (version) {
                case 'v1': val = uuidv1(); break;
                case 'v3': val = uuidv3(name || 'xenkio.pages.dev', namespace || NAMESPACES.DNS); break;
                case 'v4': val = uuidv4(); break;
                case 'v5': val = uuidv5(name || 'xenkio.pages.dev', namespace || NAMESPACES.DNS); break;
                case 'v6': val = uuidv6(); break;
                case 'v7': val = uuidv7(); break;
                default: val = uuidv4();
            }
        } catch (error) {
            console.error('Error generating UUID:', error);
            val = uuidv4(); // Fallback to v4
        }

        if (!hyphens) {
            val = val.replace(/-/g, '');
        }

        if (uppercase) {
            val = val.toUpperCase();
        }

        result.push(val);
    }

    return result;
}

export function isValidUUID(uuid: string): boolean {
    return validate(uuid);
}
