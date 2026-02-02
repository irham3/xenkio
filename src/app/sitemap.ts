import { MetadataRoute } from 'next'
import { TOOLS } from '@/data/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xenkio.com'

  const tools = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: tool.featured ? 0.8 : 0.5,
  }))

  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/sign-up',
    '/tools',
    '/tools/image-compressor',
    '/tools/instagram-carousel',
    '/tools/password-generator',
    '/tools/qr-code-generator',
    '/tools/hash-generator',
    '/tools/html-formatter',
    '/tools/unix-timestamp',
    '/tools/pdf-to-word'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.9,
  }))

  return [...routes, ...tools]
}
