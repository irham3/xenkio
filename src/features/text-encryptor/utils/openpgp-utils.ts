import type * as openpgp from 'openpgp';

export interface EncryptionResult {
    text: string;
    error?: string;
}

export type AsymmetricAlgorithm = 'RSA' | 'ECC';
// Using string mainly to avoid heavy enum imports in UI, but mapped internally
export type OpenPGPSymmetricAlgorithm = 'aes128' | 'aes192' | 'aes256' | 'twofish' | 'blowfish' | 'cast5' | '3des' | 'camellia128' | 'camellia192' | 'camellia256';

export interface KeyPairResult {
    privateKey: string;
    publicKey: string;
    revocationCertificate?: string;
}

// Helper to get algo map lazily
const getSymmetricAlgoEnum = async (algo: string): Promise<openpgp.enums.symmetric | undefined> => {
    const pgp = await import('openpgp');
    const map: Record<string, openpgp.enums.symmetric> = {
        'aes128': pgp.enums.symmetric.aes128,
        'aes192': pgp.enums.symmetric.aes192,
        'aes256': pgp.enums.symmetric.aes256,
        'twofish': pgp.enums.symmetric.twofish,
        'blowfish': pgp.enums.symmetric.blowfish,
        'cast5': pgp.enums.symmetric.cast5,
        '3des': pgp.enums.symmetric.tripledes,
        // Camellia might not be exposed in the enum types directly in all versions
        // 'camellia128': pgp.enums.symmetric.camellia128,
    };
    return map[algo.toLowerCase()];
};

export const generateKeyPair = async (
    algorithm: AsymmetricAlgorithm,
    userId: { name: string; email: string },
    passphrase?: string
): Promise<KeyPairResult> => {
    let type: 'rsa' | 'ecc';
    let curve: 'curve25519' | 'ed25519' | 'p256' | 'p384' | 'p521' | 'secp256k1' | 'brainpoolP256r1' | 'brainpoolP384r1' | 'brainpoolP512r1' | undefined;
    let rsaBits: number | undefined;

    switch (algorithm) {
        case 'RSA':
            type = 'rsa';
            rsaBits = 4096;
            break;
        case 'ECC':
            type = 'ecc';
            curve = 'curve25519';
            break;

        default:
            type = 'rsa';
            rsaBits = 2048;
    }

    try {
        const pgp = await import('openpgp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keyOptions: any = {
            userIDs: [userId],
            passphrase,
            type,
            curve,
            rsaBits
        };

        const { privateKey, publicKey, revocationCertificate } = await pgp.generateKey(keyOptions);

        return { privateKey, publicKey, revocationCertificate };
    } catch (error) {
        throw new Error(`Key generation failed: ${(error as Error).message}`);
    }
};

export const encryptWithOpenPGP = async (
    message: string,
    passphrase?: string, // For symmetric encryption or encrypting with password
    publicKeysArmored?: string, // For asymmetric encryption
    options?: {
        symmetricAlgorithm?: string;
    }
): Promise<EncryptionResult> => {
    try {
        const pgp = await import('openpgp');
        const msg = await pgp.createMessage({ text: message });

        // Define options with specific type casting where needed for config
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const encryptionOptions: any = {
            message: msg,
            format: 'armored'
        };

        if (publicKeysArmored) {
            const publicKeys = await pgp.readKey({ armoredKey: publicKeysArmored });
            encryptionOptions.encryptionKeys = publicKeys;
        } else if (passphrase) {
            encryptionOptions.passwords = [passphrase];
        } else {
            return { text: '', error: 'Either public key or passphrase required.' };
        }

        if (options?.symmetricAlgorithm) {
            const algoEnum = await getSymmetricAlgoEnum(options.symmetricAlgorithm);
            if (algoEnum) {
                // Configure preferred algorithm
                encryptionOptions.config = { preferredSymmetricAlgorithm: algoEnum };
            }
        }

        const encrypted = await pgp.encrypt(encryptionOptions);
        return { text: encrypted as string };

    } catch (err) {
        return { text: '', error: (err as Error).message };
    }
};

export const decryptWithOpenPGP = async (
    encryptedMessage: string,
    passphrase?: string,
    privateKeyArmored?: string
): Promise<EncryptionResult> => {
    try {
        const pgp = await import('openpgp');
        const msg = await pgp.readMessage({ armoredMessage: encryptedMessage });

        const decryptionOptions: openpgp.DecryptOptions = {
            message: msg,
            format: 'utf8'
        };

        if (privateKeyArmored) {
            const privateKey = await pgp.readPrivateKey({ armoredKey: privateKeyArmored });
            decryptionOptions.decryptionKeys = privateKey;
        }

        if (passphrase) {
            decryptionOptions.passwords = [passphrase];
        }

        const { data: decrypted } = await pgp.decrypt(decryptionOptions);
        return { text: decrypted as string };
    } catch (err) {
        return { text: '', error: (err as Error).message };
    }
};
