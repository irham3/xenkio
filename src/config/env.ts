// Environment variables configuration
// Use this file to access and validate environment variables

export const env = {
  // Public environment variables (client-safe)
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Server-only environment variables
  // Add your server-side env vars here
  // DATABASE_URL: process.env.DATABASE_URL,
  // RESEND_API_KEY: process.env.RESEND_API_KEY,
};

// Type-safe getters for environment variables
export function getEnv<T extends keyof typeof env>(key: T): (typeof env)[T] {
  return env[key];
}
