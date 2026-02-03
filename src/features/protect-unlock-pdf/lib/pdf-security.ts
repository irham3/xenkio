import { PDFDocument } from 'pdf-lib';
import { SecurityOptions } from '../types';

export async function processPdfSecurity(
    file: File,
    options: SecurityOptions
): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();

    try {
        let pdfDoc: PDFDocument;

        if (options.action === 'unlock') {
            try {
                pdfDoc = await PDFDocument.load(arrayBuffer, {
                    password: options.password,
                    ignoreEncryption: false
                } as unknown as any); // eslint-disable-line @typescript-eslint/no-explicit-any
            } catch (error) {
                console.error(error);
                throw new Error('Incorrect password. Please try again.');
            }
        } else {
            try {
                pdfDoc = await PDFDocument.load(arrayBuffer);
            } catch (e) {
                console.error(e);
                throw new Error('File might be encrypted. Please unlock it first.');
            }

            await pdfDoc.encrypt({
                userPassword: options.password || '',
                ownerPassword: options.ownerPassword || options.password || '',
                permissions: {
                    printing: options.permissions?.printing ?? true,
                    modifying: options.permissions?.modifying ?? false,
                    copying: options.permissions?.copying ?? false,
                    annotating: options.permissions?.annotating ?? false,
                    fillingForms: options.permissions?.modifying ?? false,
                    contentAccessibility: options.permissions?.copying ?? false,
                    documentAssembly: options.permissions?.modifying ?? false,
                },
            });

        }

        const pdfBytes = await pdfDoc.save();

        return new Blob([pdfBytes as any], { type: 'application/pdf' }); // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (error) {
        console.error('PDF Security Processing Error:', error);
        throw error;
    }
}
