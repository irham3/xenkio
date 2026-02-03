import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xenkio.com'

  const routes = [
    '',
    '/tools',
    '/tools/base64-encoder',
    '/tools/color-picker',
    '/tools/diff-checker',
    '/tools/hash-generator',
    '/tools/html-formatter',
    '/tools/image-compressor',
    '/tools/image-resizer',
    '/tools/image-to-pdf',
    '/tools/instagram-carousel',
    '/tools/merge-pdf',
    '/tools/password-generator',
    '/tools/pdf-to-image',
    '/tools/pdf-to-word',
    '/tools/protect-unlock-pdf',
    '/tools/qr-code-generator',
    '/tools/regex-tester',
    '/tools/split-pdf',
    '/tools/timer',
    '/tools/unix-timestamp',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.9,
  }))

  return routes
}
