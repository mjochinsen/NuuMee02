import { Metadata } from 'next'

const BASE_URL = 'https://nuumee.ai'
const DEFAULT_OG_IMAGE = '/og/default.png'

interface SEOConfig {
  title: string
  description: string
  path?: string
  ogImage?: string
  noIndex?: boolean
}

export function generateSEO({
  title,
  description,
  path = '',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: SEOConfig): Metadata {
  const url = `${BASE_URL}${path}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}

// JSON-LD for Organization (add to root layout)
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NuuMee',
  url: BASE_URL,
  logo: `${BASE_URL}/logo-512.png`,
  sameAs: [],
}

// JSON-LD for Website
export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NuuMee.AI',
  url: BASE_URL,
  description: 'AI Video Generation Studio',
}
