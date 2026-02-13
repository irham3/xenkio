
export const ACCEPTED_IMAGE_TYPES = 'image/*';

export const INITIAL_STATE = {
    result: null,
    imagePreview: null,
    isProcessing: false,
    error: null,
} as const;

export const URL_REGEX = /^https?:\/\//i;

export const NO_QR_CODE_ERROR = 'No QR code found in the image. Please try a clearer image.';
