# Phase 11.4: SEO Implementation Plan

> **Status:** IN PROGRESS
> **Created:** 2025-12-14
> **Last Updated:** 2025-12-14
> **Parent:** docs/TASK_TRACKER.md (Phase 11.4)

---

## Quick Resume Guide

**If resuming after interruption:**
1. Check the Progress Summary table below
2. Find the first incomplete (⬜) task
3. Follow the implementation steps for that task
4. Mark as ✅ when complete
5. Run `/remember seo: Completed {task_id}` after each task

**Slash Commands:**
- `/typecheck` - Verify no TypeScript errors after changes
- `/deploy frontend` - Deploy after completing a section
- Playwright MCP tools for verification

---

## Design Decisions (User Approved 2025-12-14)

| Question | Decision | Rationale |
|----------|----------|-----------|
| JSON-LD Depth | **Minimal** - Organization + Website only | Simple MVP, expand later if needed |
| Video Page SEO | **Defer** - Focus on static pages first | Dynamic video pages are Phase 12+ |
| Implementation Order | **Sitemap first** - Then per-page metadata | Foundation before details |
| Testing Approach | **Manual** - Browser DevTools + social card validators | Quick verification, no automated tests |

---

## Progress Summary

| Task ID | Task | Status | Time Est | Notes |
|---------|------|--------|----------|-------|
| 11.4.0 | Logo & Favicon | ✅ DONE | 15 min | NuuMeeLogoWithoutPNG.svg → logo.svg, favicon.ico, apple-touch-icon.png, logo-512.png |
| 11.4.1 | Sitemap + Robots | ✅ DONE | 30 min | sitemap.ts, robots.ts (with force-static for export) |
| 11.4.2 | OG Image | ✅ DONE | 10 min | public/og/default.png (1200x630) - logo on brand gradient |
| 11.4.3 | Root Metadata | ✅ DONE | 10 min | layout.tsx with metadataBase + JSON-LD |
| 11.4.4 | SEO Utility | ✅ DONE | 15 min | lib/seo.ts helper function + JSON-LD exports |
| 11.4.5 | High-Priority Pages | ✅ DONE | 60 min | Home (marketing layout), Pricing, Documentation |
| 11.4.6 | Remaining Pages | ✅ DONE | 30 min | Auth layout with noIndex |
| 11.4.7 | Verification | ⬜ TODO | 15 min | Test all pages, social validators |

**Completion: 7/8 tasks (87.5%)**

---

## Task 11.4.1: Sitemap + Robots

### 11.4.1a: Create sitemap.ts
- **Status:** ⬜ TODO
- **File:** `frontend/app/sitemap.ts`
- **Implementation:**

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nuumee.ai'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/videos/create`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/documentation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
```

### 11.4.1b: Create robots.ts
- **Status:** ⬜ TODO
- **File:** `frontend/app/robots.ts`
- **Implementation:**

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin555/', '/billing/', '/account/', '/jobs/', '/api-keys/'],
    },
    sitemap: 'https://nuumee.ai/sitemap.xml',
  }
}
```

### 11.4.1c: Verification
- **Command:** `/deploy frontend` then verify:
  - https://nuumee.ai/sitemap.xml returns XML
  - https://nuumee.ai/robots.txt returns proper rules

---

## Task 11.4.4: SEO Utility Function

### 11.4.4a: Create lib/seo.ts
- **Status:** ⬜ TODO
- **File:** `frontend/lib/seo.ts`
- **Implementation:**

```typescript
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
```

---

## Task 11.4.5: High-Priority Pages

### 11.4.5a: Home Page (/)
- **Status:** ⬜ TODO
- **File:** `frontend/app/page.tsx`
- **Add:**

```typescript
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'AI Video Generation Studio',
  description: 'Transform your videos with AI-powered character replacement. Generate stunning AI videos in minutes with NuuMee.',
  path: '/',
})
```

### 11.4.5b: Pricing Page (/pricing)
- **Status:** ⬜ TODO
- **File:** `frontend/app/pricing/page.tsx`
- **Add:**

```typescript
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'Pricing',
  description: 'Choose the perfect plan for your AI video generation needs. Pay-as-you-go credits or monthly subscriptions.',
  path: '/pricing',
})
```

### 11.4.5c: Create Videos Page (/videos/create)
- **Status:** ⬜ TODO
- **File:** `frontend/app/videos/create/page.tsx`
- **Add:**

```typescript
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'Create AI Videos',
  description: 'Upload your video and reference image to generate AI-powered character replacement videos.',
  path: '/videos/create',
})
```

### 11.4.5d: Add JSON-LD to Root Layout
- **Status:** ⬜ TODO
- **File:** `frontend/app/layout.tsx`
- **Add Script tag:**

```typescript
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'

// In the <body> tag:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
  }}
/>
```

---

## Task 11.4.6: Remaining Pages

### 11.4.6a: Login Page (/login)
- **Status:** ⬜ TODO
- **File:** `frontend/app/login/page.tsx`
- **Add:** metadata with noIndex: true (don't index login pages)

### 11.4.6b: Documentation Page (/documentation)
- **Status:** ⬜ TODO
- **File:** `frontend/app/documentation/page.tsx`
- **Add:** metadata for docs

### 11.4.6c: Dashboard Pages (billing, jobs, account)
- **Status:** ⬜ TODO
- **Files:** `frontend/app/(dashboard)/*/page.tsx`
- **Add:** metadata with noIndex: true for all dashboard pages

---

## Task 11.4.7: Verification

### 11.4.7a: TypeScript Check
- **Command:** `/typecheck`
- **Expected:** No errors

### 11.4.7b: Build Check
- **Command:** `pnpm build` in frontend/
- **Expected:** Successful static export

### 11.4.7c: Deploy and Verify
- **Command:** `/deploy frontend`
- **Verify URLs:**
  - https://nuumee.ai/sitemap.xml
  - https://nuumee.ai/robots.txt

### 11.4.7d: Social Card Testing
- **Test URLs (manual):**
  - https://cards-dev.twitter.com/validator (Twitter)
  - https://developers.facebook.com/tools/debug/ (Facebook)
  - LinkedIn Post Inspector

### 11.4.7e: Lighthouse SEO Audit
- **Steps:**
  1. Open Chrome DevTools
  2. Lighthouse tab → Check only "SEO"
  3. Run on: /, /pricing, /videos/create
  4. Target: 90+ score on each

---

## Checkpoint Commands

After completing each task section, run:

```bash
# After 11.4.1 (Sitemap + Robots)
/remember seo: Completed 11.4.1 - sitemap.ts and robots.ts created

# After 11.4.4 (SEO Utility)
/remember seo: Completed 11.4.4 - lib/seo.ts created with generateSEO helper

# After 11.4.5 (High-Priority Pages)
/remember seo: Completed 11.4.5 - Home, Pricing, Create Videos metadata + JSON-LD

# After 11.4.6 (Remaining Pages)
/remember seo: Completed 11.4.6 - Login, Docs, Dashboard pages metadata

# After 11.4.7 (Verification)
/remember seo: Phase 11.4 SEO COMPLETE - all pages verified
```

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `frontend/app/sitemap.ts` | NEW - Dynamic sitemap |
| `frontend/app/robots.ts` | NEW - Robots.txt rules |
| `frontend/lib/seo.ts` | NEW - SEO utility + JSON-LD |
| `frontend/app/page.tsx` | ADD - generateSEO metadata |
| `frontend/app/pricing/page.tsx` | ADD - generateSEO metadata |
| `frontend/app/videos/create/page.tsx` | ADD - generateSEO metadata |
| `frontend/app/login/page.tsx` | ADD - generateSEO metadata (noIndex) |
| `frontend/app/documentation/page.tsx` | ADD - generateSEO metadata |
| `frontend/app/(dashboard)/*/page.tsx` | ADD - generateSEO metadata (noIndex) |
| `frontend/app/layout.tsx` | ADD - JSON-LD script tag |

---

## Completion Criteria

Phase 11.4 is complete when:
- [ ] sitemap.xml accessible at https://nuumee.ai/sitemap.xml
- [ ] robots.txt accessible at https://nuumee.ai/robots.txt
- [ ] All public pages have unique title/description
- [ ] All public pages have og:image
- [ ] Dashboard pages have noIndex
- [ ] JSON-LD Organization + Website in root layout
- [ ] Lighthouse SEO score 90+ on public pages

---

*Last checkpoint: 2025-12-14 - Logo, OG image, and root metadata complete*
