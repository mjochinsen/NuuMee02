'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PageCard {
  name: string;
  path: string;
  description: string;
  responsive?: boolean;
}

interface Section {
  title: string;
  icon: string;
  pages: PageCard[];
}

export default function SitemapPage() {
  const sections: Section[] = [
    {
      title: 'Public Pages',
      icon: '🌐',
      pages: [
        { name: 'Home', path: '/', description: 'Landing page with hero, features, and CTA', responsive: true },
        { name: 'Login / Sign Up', path: '/login', description: 'User authentication with social login options', responsive: true },
        { name: 'Pricing', path: '/pricing', description: 'Plans, credit packages, calculator, and FAQs', responsive: true },
        { name: 'Documentation', path: '/documentation', description: 'API docs, guides, and tutorials', responsive: true },
        { name: 'Testimonials', path: '/testimonials', description: 'User reviews and success stories', responsive: true },
        { name: 'Comparison', path: '/comparison', description: 'NuuMee.AI vs competitors feature comparison', responsive: true },
        { name: 'Status', path: '/status', description: 'System status and uptime monitoring', responsive: true },
      ],
    },
    {
      title: 'Authenticated Pages',
      icon: '🔒',
      pages: [
        { name: 'Create Videos', path: '/videos/create', description: 'Main video creation interface with dual view modes', responsive: true },
        { name: 'Jobs', path: '/jobs', description: 'Video generation history and job management', responsive: true },
        { name: 'Billing', path: '/billing', description: 'Credits, subscriptions, and payment methods', responsive: true },
        { name: 'Account Settings', path: '/account', description: 'User profile and preferences', responsive: true },
        { name: 'API Keys', path: '/api-keys', description: 'API key management and usage tracking', responsive: true },
      ],
    },
    {
      title: 'Payment Flows',
      icon: '💳',
      pages: [
        { name: 'Payment Success', path: '/payment/success?credits=400', description: 'Credit purchase confirmation with receipt', responsive: true },
        { name: 'Subscription Success', path: '/subscription/success?plan=creator', description: 'Plan activation confirmation with details', responsive: true },
        { name: 'Payment Cancelled', path: '/payment/cancelled', description: 'Cancelled payment flow with help options', responsive: true },
      ],
    },
    {
      title: 'Programs',
      icon: '🎁',
      pages: [
        { name: 'Referral Program', path: '/referral', description: 'Earn credits by referring friends', responsive: true },
        { name: 'Affiliate Program', path: '/affiliate', description: 'Partner program with 20% commission', responsive: true },
      ],
    },
    {
      title: 'Support & Legal',
      icon: '📄',
      pages: [
        { name: 'Support & Help Center', path: '/support', description: 'FAQ, contact forms, and knowledge base', responsive: true },
        { name: 'Careers', path: '/careers', description: 'Open positions, benefits, and company culture', responsive: true },
        { name: 'Privacy Policy', path: '/privacy', description: 'Data collection, usage, and user rights', responsive: true },
        { name: 'Terms of Service', path: '/terms', description: 'Usage terms, pricing, credits, and legal provisions', responsive: true },
      ],
    },
    {
      title: 'Design System & Testing',
      icon: '🧪',
      pages: [
        { name: 'Examples', path: '/examples', description: 'Gallery showcasing use cases, best practices, and quality guides', responsive: true },
        { name: 'Changelog / Product Updates', path: '/changelog', description: 'Product updates and release notes', responsive: true },
        { name: 'Component Library', path: '/dev/components', description: 'Showcase of all reusable UI components and patterns', responsive: true },
        { name: 'Component States', path: '/dev/states', description: 'All component states (hover, active, disabled) for Figma handoff', responsive: true },
        { name: 'Subscription Modals', path: '/dev/modals', description: 'Test all subscription modal variations', responsive: true },
        { name: 'Sitemap', path: '/dev', description: 'Complete navigation map of all pages (this page)', responsive: true },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#0F172A] py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <span className="text-6xl">🎨</span>
          </div>
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-4">NuuMee.AI Design System</h1>
          <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto mb-6">
            Complete navigation and sitemap for all pages and flows
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-lg bg-[#00F0D9]/10 border border-[#00F0D9]/30 text-[#00F0D9] text-sm">
              {sections.reduce((acc, section) => acc + section.pages.length, 0)} Total Pages
            </div>
            <div className="px-4 py-2 rounded-lg bg-[#3B1FE2]/10 border border-[#3B1FE2]/30 text-[#94A3B8] text-sm">
              Desktop • Mobile Responsive
            </div>
          </div>
        </div>

        <div className="h-px bg-[#334155] mb-12"></div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, sectionIdx) => (
            <section key={sectionIdx}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{section.icon}</span>
                <h2 className="text-xl font-semibold text-[#F1F5F9]">{section.title}</h2>
                <span className="text-[#94A3B8] text-sm">({section.pages.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.pages.map((page, pageIdx) => (
                  <Link key={pageIdx} href={page.path}>
                    <Card className="h-[120px] p-5 border-[#334155] bg-[#1E293B] hover:border-[#00F0D9] hover:shadow-lg hover:shadow-[#00F0D9]/20 transition-all duration-200 hover:-translate-y-1 group cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-[#F1F5F9] font-medium group-hover:text-[#00F0D9] transition-colors">
                          {page.name}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-[#94A3B8] group-hover:text-[#00F0D9] transition-colors" />
                      </div>
                      <p className="text-[#94A3B8] text-sm mb-3 line-clamp-2">{page.description}</p>
                      {page.responsive && (
                        <div className="text-xs text-[#00F0D9]/60">Desktop • Mobile</div>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="h-px bg-[#334155] mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="p-6 border-[#334155] bg-[#0F172A]">
              <div className="text-3xl mb-2">🎨</div>
              <p className="text-[#F1F5F9] font-medium mb-1">Design System</p>
              <p className="text-[#94A3B8] text-sm">Dark futuristic theme</p>
            </Card>
            <Card className="p-6 border-[#334155] bg-[#0F172A]">
              <div className="text-3xl mb-2">🌈</div>
              <p className="text-[#F1F5F9] font-medium mb-1">Brand Colors</p>
              <p className="text-[#94A3B8] text-sm">Cyan (#00F0D9) to Purple (#3B1FE2)</p>
            </Card>
            <Card className="p-6 border-[#334155] bg-[#0F172A]">
              <div className="text-3xl mb-2">📱</div>
              <p className="text-[#F1F5F9] font-medium mb-1">Responsive</p>
              <p className="text-[#94A3B8] text-sm">Desktop, Tablet, Mobile</p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
