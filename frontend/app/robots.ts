import { MetadataRoute } from 'next'

// Required for static export
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin555/', '/billing/', '/account/', '/jobs/', '/api-keys/', '/referral/', '/support/'],
    },
    sitemap: 'https://nuumee.ai/sitemap.xml',
  }
}
