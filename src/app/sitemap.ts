import { MetadataRoute } from 'next'
import { DUMMY_TOOLS } from '@/data/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xenkio.com'

  const tools = DUMMY_TOOLS.map((tool) => ({
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
    '/tools',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.5,
  }))

  return [...routes, ...tools]
}
