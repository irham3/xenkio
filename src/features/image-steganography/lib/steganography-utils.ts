
export interface SteganographyResult {
    dataUrl?: string; // For encoding
    message?: string; // For decoding
    error?: string;
}

const MAGIC_SIGNATURE = "XNK_STEG"; // 8 chars

export async function encodeMessage(imageFile: File, message: string): Promise<SteganographyResult> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Could not get canvas context');

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Prepare binary message: Signature + Length + Message
                    // Signature
                    let binaryMessage = stringToBinary(MAGIC_SIGNATURE);
                    // Length (32 bits)
                    const lengthBin = message.length.toString(2).padStart(32, '0');
                    binaryMessage += lengthBin;
                    // Message
                    binaryMessage += stringToBinary(message);

                    // Check capacity
                    // Each pixel has 4 channels (RGBA), we use R, G, B channels -> 3 bits per pixel
                    const maxBits = (data.length / 4) * 3;
                    if (binaryMessage.length > maxBits) {
                        resolve({ error: `Message too long. Max capacity: ${Math.floor(maxBits / 8)} characters.` });
                        return;
                    }

                    let dataIndex = 0;
                    let msgIndex = 0;

                    while (msgIndex < binaryMessage.length && dataIndex < data.length) {
                        // Skip Alpha channel (every 4th byte: 3, 7, 11...)
                        if ((dataIndex + 1) % 4 === 0) {
                            dataIndex++;
                            continue;
                        }

                        // Modify LSB
                        const bit = binaryMessage[msgIndex];
                        const originalByte = data[dataIndex];

                        // Clear LSB (byte & 254) then OR with bit
                        // 254 is 11111110 binary
                        data[dataIndex] = (originalByte & 0xFE) | parseInt(bit, 10);

                        dataIndex++;
                        msgIndex++;
                    }

                    ctx.putImageData(imageData, 0, 0);
                    resolve({ dataUrl: canvas.toDataURL('image/png') }); // Must be PNG to be lossless
                } catch {
                    resolve({ error: 'Failed to encode message.' });
                }
            };
            img.onerror = () => resolve({ error: 'Failed to load image.' });
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(imageFile);
    });
}

export async function decodeMessage(imageFile: File): Promise<SteganographyResult> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Could not get canvas context');

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // We need to read enough bits for Signature (8 chars * 8 bits = 64) + Length (32 bits) = 96 bits
                    // But we don't know message length yet. We read progressively.

                    // Read header first.

                    const readBits = (count: number, startIndex: number): { bits: string, nextIndex: number } => {
                        let bits = '';
                        let idx = startIndex;
                        let bitsRead = 0;
                        while (bitsRead < count && idx < data.length) {
                            if ((idx + 1) % 4 === 0) {
                                idx++;
                                continue;
                            }
                            // Read LSB
                            bits += (data[idx] & 1).toString();
                            idx++;
                            bitsRead++;
                        }
                        return { bits, nextIndex: idx };
                    };

                    // 1. Read Signature (64 bits)
                    const sigResult = readBits(64, 0);
                    const signature = binaryToString(sigResult.bits);

                    if (signature !== MAGIC_SIGNATURE) {
                        resolve({ error: 'No hidden message found (Invalid signature).' });
                        return;
                    }

                    // 2. Read Length (32 bits)
                    const lenResult = readBits(32, sigResult.nextIndex);
                    const msgLength = parseInt(lenResult.bits, 2);

                    if (msgLength <= 0 || msgLength > 1000000) { // Sanity check
                        resolve({ error: 'Invalid message length detected.' });
                        return;
                    }

                    // 3. Read Message
                    const msgBitsCount = msgLength * 8;
                    const msgResult = readBits(msgBitsCount, lenResult.nextIndex);
                    const message = binaryToString(msgResult.bits);

                    resolve({ message });

                } catch {
                    resolve({ error: 'Failed to decode message.' });
                }
            };
            img.onerror = () => resolve({ error: 'Failed to load image.' });
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(imageFile);
    });
}

function stringToBinary(str: string): string {
    return str.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
}

function binaryToString(bin: string): string {
    return bin.match(/.{1,8}/g)?.map(byte => {
        return String.fromCharCode(parseInt(byte, 2));
    }).join('') || '';
}
