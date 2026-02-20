'use server';

import { z } from 'zod';

const FeedbackSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
    feedback: z.string().min(1, { message: 'Feedback cannot be empty' }),
});

export type FeedbackState = {
    success: boolean;
    message: string;
    errors?: {
        email?: string[];
        feedback?: string[];
    };
};

export async function submitFeedback(prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
    const validatedFields = FeedbackSchema.safeParse({
        email: formData.get('email'),
        feedback: formData.get('feedback'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Invalid fields. Failed to submit feedback.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, feedback } = validatedFields.data;
    const feedbackApiUrl = process.env.NEXT_PUBLIC_FEEDBACK_API_URL || "https://script.google.com/macros/s/AKfycbzdmM5hqbYkIJGCZWSrZJ6iQE-rDguR4RZdfPetELEUzSZYVVtVS-d0lKPqKob1FMI9/exec";

    if (!feedbackApiUrl) {
        console.error('NEXT_PUBLIC_FEEDBACK_API_URL is not defined');
        return {
            success: false,
            message: 'System configuration error. Please try again later.',
        };
    }

    try {
        const response = await fetch(feedbackApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script requires text/plain to avoid CORS preflight issues sometimes, or to handle it simply
            },
            body: JSON.stringify({ email, feedback }),
        });

        if (!response.ok) {
            // sometimes GAS returns 302 redirect which fetch follows, but if it returns 200 it's fine.
            // If it fails with CORS it might throw.
            // Let's assume standard fetch behavior.
            // Actually, for creating a robust request to GAS, ensuring no-cors might be needed if we don't care about response, 
            // but we want to know if it succeeded.
            // The GAS script returns JSON, so we should be able to parse it if CORS is set up correctly (which the simple script usually handles).
            // However, standard `fetch` from Server Action (Node.js environment) doesn't have CORS issues like browser.
            // So standard POST is fine.
        }

        return {
            success: true,
            message: 'Thank you for your feedback!',
        };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return {
            success: false,
            message: 'Failed to submit feedback. Please try again later.',
        };
    }
}
