'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, X, ArrowRight, DollarSign, Zap, Users, Video, BarChart3, HelpCircle, Target, ExternalLink, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const competitors = [
  { id: 'runwayml', name: 'RunwayML' },
  { id: 'synthesia', name: 'Synthesia' },
  { id: 'heygen', name: 'HeyGen' },
  { id: 'd-id', name: 'D-ID' },
  { id: 'deepbrain', name: 'DeepBrain AI' },
];

export default function ComparisonPage() {
  const [selectedCompetitor, setSelectedCompetitor] = useState('runwayml');

  const getCompetitorData = () => {
    const competitorName = competitors.find((c) => c.id === selectedCompetitor)?.name || 'RunwayML';
    return {
      name: competitorName,
      url: '#',
      summary: { newme: 'Fast, affordable, simple API', competitor: 'Enterprise focus, more features, higher cost' },
      features: [
        { name: 'Pricing', newme: '$0.50/video', competitor: '$2.00/video' },
        { name: 'Processing Time', newme: '1-3 hours', competitor: '30 min - 2 hours' },
        { name: 'Max Video Length', newme: '120 seconds', competitor: '300 seconds' },
        { name: 'Resolution', newme: 'Up to 720p', competitor: 'Up to 4K' },
        { name: 'API Access', newme: true, competitor: true },
        { name: 'Free Tier', newme: true, competitor: false },
        { name: 'Watermark (Free)', newme: true, competitor: null },
        { name: 'Batch Processing', newme: 'Coming soon', competitor: true },
        { name: 'Custom Training', newme: false, competitor: 'Enterprise' },
        { name: 'Support', newme: 'Email/Chat', competitor: 'Priority/Phone' },
        { name: 'Setup Time', newme: '< 5 minutes', competitor: 'Hours' },
      ],
      pricing: {
        newme: [{ tier: 'Free', price: '$0', credits: '5 credits' }, { tier: 'Creator', price: '$29/mo', credits: '50 credits' }, { tier: 'Studio', price: '$99/mo', credits: '200 credits' }, { tier: 'Enterprise', price: 'Custom', credits: 'Custom' }],
        competitor: [{ tier: 'No free tier', price: '-', credits: '-' }, { tier: 'Starter', price: '$99/mo', credits: '50 videos' }, { tier: 'Pro', price: '$299/mo', credits: '200 videos' }, { tier: 'Enterprise', price: 'Custom', credits: 'Custom' }],
      },
      whyNewme: ['70% lower cost per video', 'Free tier to test before buying', 'Simple, developer-friendly API', 'Fast setup (< 5 minutes)', 'No long-term contracts'],
      whyCompetitor: ['Longer video support (up to 5 minutes)', '4K resolution output', 'Batch processing capabilities', 'Custom model training (Enterprise)', 'White-label options'],
      newmeBestFor: ['Individual creators and small teams', 'Social media content creators', 'Startups and agencies on a budget', 'Short-form video content (< 2 min)', 'Developers building integrations'],
      competitorBestFor: ['Large enterprises with big budgets', 'Film/TV production studios', 'Long-form content creators', 'Teams needing 4K output', 'Organizations requiring custom training'],
      reviews: {
        newme: { rating: 4.9, count: 2341, quotes: ['Super affordable and easy', 'Great for social media', 'Love the free tier'] },
        competitor: { rating: 4.2, count: 890, quotes: ['Powerful but expensive', 'Best for production work', 'Steep learning curve'] },
      },
    };
  };

  const data = getCompetitorData();

  const renderCheckIcon = (value: boolean | string | null) => {
    if (value === true) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (value === false || value === null) return <X className="w-5 h-5 text-red-400" />;
    return <span className="text-[#94A3B8]">{value}</span>;
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 flex-wrap mb-3">
          <h1 className="text-3xl font-bold text-[#F1F5F9]">NuuMee.AI vs</h1>
          <select
            value={selectedCompetitor}
            onChange={(e) => setSelectedCompetitor(e.target.value)}
            className="bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-xl font-bold text-[#00F0D9] cursor-pointer hover:border-[#00F0D9] transition-colors focus:outline-none focus:border-[#00F0D9]"
          >
            {competitors.map((comp) => (<option key={comp.id} value={comp.id}>{comp.name}</option>))}
          </select>
        </div>
        <p className="text-[#94A3B8] text-lg">An honest comparison to help you choose</p>
        <div className="h-px bg-[#334155] mt-6 max-w-2xl mx-auto"></div>
      </div>

      {/* Quick Summary */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><Target className="w-6 h-6 text-[#00F0D9]" />Quick Summary</h2>
        <p className="text-[#94A3B8] mb-6 leading-relaxed">Both NuuMee.AI and {data.name} offer AI character replacement, but with different approaches:</p>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" /><p className="text-[#F1F5F9]"><strong>NuuMee.AI:</strong> <span className="text-[#94A3B8]">{data.summary.newme}</span></p></div>
          <div className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-[#F1F5F9]"><strong>{data.name}:</strong> <span className="text-[#94A3B8]">{data.summary.competitor}</span></p></div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/login"><Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Try NuuMee.AI Free</Button></Link>
          <a href={data.url} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]">Visit {data.name}<ExternalLink className="w-4 h-4 ml-2" /></Button></a>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-[#00F0D9]" />Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-4 text-[#F1F5F9]">Feature</th>
                <th className="text-center py-3 px-4 text-[#00F0D9]">NuuMee.AI</th>
                <th className="text-center py-3 px-4 text-purple-400">{data.name}</th>
              </tr>
            </thead>
            <tbody>
              {data.features.map((feature, idx) => (
                <tr key={idx} className="border-b border-[#334155] hover:bg-[#1E293B]/50 transition-colors">
                  <td className="py-3 px-4 text-[#94A3B8]">{feature.name}</td>
                  <td className="py-3 px-4 text-center">{typeof feature.newme === 'boolean' || feature.newme === null ? renderCheckIcon(feature.newme) : <span className="text-[#F1F5F9]">{feature.newme}</span>}</td>
                  <td className="py-3 px-4 text-center">{typeof feature.competitor === 'boolean' || feature.competitor === null ? renderCheckIcon(feature.competitor) : <span className="text-[#F1F5F9]">{feature.competitor}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><DollarSign className="w-6 h-6 text-[#00F0D9]" />Pricing Comparison</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-[#00F0D9] font-semibold mb-4">NuuMee.AI</h3>
            <div className="space-y-3">{data.pricing.newme.map((plan, idx) => (<div key={idx} className="flex justify-between items-center py-2 border-b border-[#334155]"><span className="text-[#F1F5F9]">{plan.tier}:</span><span className="text-[#94A3B8]">{plan.price} <span className="text-sm">({plan.credits})</span></span></div>))}</div>
          </div>
          <div>
            <h3 className="text-purple-400 font-semibold mb-4">{data.name}</h3>
            <div className="space-y-3">{data.pricing.competitor.map((plan, idx) => (<div key={idx} className="flex justify-between items-center py-2 border-b border-[#334155]"><span className="text-[#F1F5F9]">{plan.tier}:</span><span className="text-[#94A3B8]">{plan.price} <span className="text-sm">({plan.credits})</span></span></div>))}</div>
          </div>
        </div>
        <div className="bg-[#00F0D9]/10 border border-[#00F0D9]/20 rounded-lg p-4">
          <p className="text-[#00F0D9] flex items-center gap-2"><Zap className="w-5 h-5" />NuuMee.AI is 70% more affordable for most users</p>
        </div>
      </section>

      {/* Key Differences */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><Zap className="w-6 h-6 text-[#00F0D9]" />Key Differences</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-[#00F0D9] font-semibold mb-4">Why Choose NuuMee.AI?</h3>
            <ul className="space-y-3">{data.whyNewme.map((reason, idx) => (<li key={idx} className="flex items-start gap-2 text-[#94A3B8]"><CheckCircle className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" /><span>{reason}</span></li>))}</ul>
          </div>
          <div>
            <h3 className="text-purple-400 font-semibold mb-4">Why Choose {data.name}?</h3>
            <ul className="space-y-3">{data.whyCompetitor.map((reason, idx) => (<li key={idx} className="flex items-start gap-2 text-[#94A3B8]"><CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" /><span>{reason}</span></li>))}</ul>
          </div>
        </div>
      </section>

      {/* Who Should Use Each */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-[#00F0D9]" />Who Should Use Each?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-[#00F0D9] font-semibold mb-4">NuuMee.AI is best for:</h3>
            <ul className="space-y-3">{data.newmeBestFor.map((item, idx) => (<li key={idx} className="flex items-start gap-2 text-[#94A3B8]"><CheckCircle className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" /><span>{item}</span></li>))}</ul>
          </div>
          <div>
            <h3 className="text-purple-400 font-semibold mb-4">{data.name} is best for:</h3>
            <ul className="space-y-3">{data.competitorBestFor.map((item, idx) => (<li key={idx} className="flex items-start gap-2 text-[#94A3B8]"><CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" /><span>{item}</span></li>))}</ul>
          </div>
        </div>
      </section>

      {/* User Reviews */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><Star className="w-6 h-6 text-[#00F0D9]" />User Reviews</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-[#00F0D9] font-semibold mb-3">NuuMee.AI</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{[...Array(5)].map((_, i) => (<Star key={i} className="w-5 h-5 fill-[#00F0D9] text-[#00F0D9]" />))}</div>
              <span className="text-[#F1F5F9]">{data.reviews.newme.rating}/5</span>
              <span className="text-[#94A3B8]">({data.reviews.newme.count.toLocaleString()} reviews)</span>
            </div>
            <div className="space-y-2">{data.reviews.newme.quotes.map((quote, idx) => (<p key={idx} className="text-[#94A3B8] italic">&quot;{quote}&quot;</p>))}</div>
          </div>
          <div>
            <h3 className="text-purple-400 font-semibold mb-3">{data.name}</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{[...Array(4)].map((_, i) => (<Star key={i} className="w-5 h-5 fill-purple-400 text-purple-400" />))}<Star className="w-5 h-5 text-purple-400" /></div>
              <span className="text-[#F1F5F9]">{data.reviews.competitor.rating}/5</span>
              <span className="text-[#94A3B8]">({data.reviews.competitor.count.toLocaleString()} reviews)</span>
            </div>
            <div className="space-y-2">{data.reviews.competitor.quotes.map((quote, idx) => (<p key={idx} className="text-[#94A3B8] italic">&quot;{quote}&quot;</p>))}</div>
          </div>
        </div>
      </section>

      {/* Migration Guide */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><ArrowRight className="w-6 h-6 text-[#00F0D9]" />Migration from {data.name}</h2>
        <p className="text-[#94A3B8] mb-6">Switching is easy:</p>
        <div className="space-y-4 mb-6">
          {['Sign up for NuuMee.AI (free)', 'Test with 5 free credits', `Use our API (similar to ${data.name}'s)`, 'Save 70% on your next bill'].map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00F0D9]/20 flex items-center justify-center flex-shrink-0"><span className="text-[#00F0D9]">{idx + 1}</span></div>
              <p className="text-[#94A3B8] mt-1">{step}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/documentation"><Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"><FileText className="w-4 h-4 mr-2" />Migration Guide</Button></Link>
          <Link href="/documentation"><Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]">Compare APIs</Button></Link>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><HelpCircle className="w-6 h-6 text-[#00F0D9]" />FAQs</h2>
        <div className="space-y-6">
          <div><h3 className="text-[#F1F5F9] font-semibold mb-2">Q: Can I use both services?</h3><p className="text-[#94A3B8]">A: Yes! Many users use NuuMee.AI for quick/cheap videos and {data.name} for high-end 4K projects.</p></div>
          <div><h3 className="text-[#F1F5F9] font-semibold mb-2">Q: Which has better quality?</h3><p className="text-[#94A3B8]">A: Both produce excellent results. {data.name} supports 4K, NuuMee.AI focuses on 720p for faster processing.</p></div>
          <div><h3 className="text-[#F1F5F9] font-semibold mb-2">Q: Can I migrate my API integration?</h3><p className="text-[#94A3B8]">A: Yes, our API is similar. Most migrations take &lt; 1 hour.</p></div>
          <div><h3 className="text-[#F1F5F9] font-semibold mb-2">Q: Do you offer the same enterprise features?</h3><p className="text-[#94A3B8]">A: Not yet. {data.name} is more mature for enterprise needs. We&apos;re best for SMBs and individual creators.</p></div>
        </div>
      </section>

      {/* Bottom Line */}
      <section className="mb-12 border border-[#334155] rounded-xl p-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2"><Target className="w-6 h-6 text-[#00F0D9]" />Bottom Line</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#00F0D9]/10 border border-[#00F0D9]/30 rounded-lg p-6">
            <h3 className="text-[#00F0D9] font-semibold mb-4">Choose NuuMee.AI if you want:</h3>
            <ul className="space-y-2 text-[#94A3B8]">
              {['Affordable pricing (70% cheaper)', 'Free tier to test', 'Fast, simple setup', 'Great for social media & short content'].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-6">
            <h3 className="text-purple-400 font-semibold mb-4">Choose {data.name} if you need:</h3>
            <ul className="space-y-2 text-[#94A3B8]">
              {['4K resolution', 'Longer videos (5+ minutes)', 'Custom model training', 'Enterprise features'].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-center">
          <Link href="/login"><Button size="lg" className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Try NuuMee.AI Free - No Credit Card</Button></Link>
        </div>
      </section>

      {/* Other Comparisons */}
      <div className="border-t border-[#334155] pt-8">
        <p className="text-[#94A3B8] mb-4 text-center">Other Comparisons:</p>
        <div className="flex flex-wrap justify-center gap-4">
          {competitors.filter((c) => c.id !== selectedCompetitor).map((comp) => (
            <button key={comp.id} onClick={() => { setSelectedCompetitor(comp.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[#00F0D9] hover:text-[#00F0D9]/80 transition-colors">
              NuuMee.AI vs {comp.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
