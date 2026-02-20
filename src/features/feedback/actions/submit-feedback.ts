'use server';

import { z } from 'zod';

const FeedbackSchema = z.object({
    email: z.string().trim().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
    feedback: z.string().trim().min(2, { message: 'Feedback is too short' }).max(2000, { message: 'Feedback is too long (max 2000 characters)' }),
    honeypot: z.string().max(0).optional(), // Must be empty
});

export type FeedbackState = {
    success: boolean;
    message: string;
    errors?: {
        email?: string[];
        feedback?: string[];
        honeypot?: string[];
    };
};

export async function submitFeedback(prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
    // Basic rate limit check could go here if using a KV store, 
    // for now we stick to schema and honeypot.

    const validatedFields = FeedbackSchema.safeParse({
        email: formData.get('email'),
        feedback: formData.get('feedback'),
        honeypot: formData.get('hp_field'), // Check the honeypot field
    });

    if (!validatedFields.success) {
        // If honeypot is filled, we just pretend it succeeded or return a generic error without helping the bot
        if (validatedFields.error.flatten().fieldErrors.honeypot) {
            return {
                success: true,
                message: 'Thank you for your feedback!',
            };
        }

        return {
            success: false,
            message: 'Please check your inputs and try again.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, feedback } = validatedFields.data;
    const feedbackApiUrl = process.env.FEEDBACK_API_URL || process.env.NEXT_PUBLIC_FEEDBACK_API_URL;

    if (!feedbackApiUrl) {
        console.error('Feedback API URL is not defined');
        return {
            success: false,
            message: 'Service is temporarily unavailable.',
        };
    }

    try {
        const response = await fetch(feedbackApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                email,
                feedback,
                timestamp: new Date().toISOString(),
                source: 'xenkio_web'
            }),
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        return {
            success: true,
            message: 'Thank you! Your feedback has been sent.',
        };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return {
            success: false,
            message: 'Failed to send feedback. Please try again later.',
        };
    }
}
