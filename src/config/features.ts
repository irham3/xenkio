// Feature flags configuration
// Use this to enable/disable features across the application

export const featureFlags = {
  // Feature toggles
  enablePremiumTools: false,
  enableBlogSection: false,
  enableAnalytics: true,
  enableNewsletter: false,
  
  // Tool-specific flags
  enableQrGenerator: true,
  enableCarouselGenerator: true,
  enableImageCompressor: false,
  
  // Experimental features
  enableDarkMode: true,
  enablePWA: false,
};

export type FeatureFlags = typeof featureFlags;

// Helper function to check if a feature is enabled
export function isFeatureEnabled<T extends keyof FeatureFlags>(feature: T): boolean {
  return featureFlags[feature];
}
