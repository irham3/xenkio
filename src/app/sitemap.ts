import { MetadataRoute } from 'next'
import { TOOLS } from '@/data/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xenkio.com'

  const staticRoutes = [
    '',
    '/tools',
  ]

  const toolRoutes = TOOLS.map((tool) => tool.href)

  const allRoutes = [...staticRoutes, ...toolRoutes]

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.9,
  }))
}
