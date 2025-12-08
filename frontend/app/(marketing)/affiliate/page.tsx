'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, DollarSign, TrendingUp, CheckCircle, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { applyForAffiliate, AffiliateApplyRequest } from '@/lib/api';

export default function AffiliatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', website: '', platformType: '', audienceSize: '', niche: '', promotionPlan: '', paypalEmail: '', agreedToTerms: false });

  const handleInputChange = (field: string, value: string | boolean) => { setFormData((prev) => ({ ...prev, [field]: value })); };

  // Convert audience size string to number
  const audienceSizeToNumber = (size: string): number => {
    switch (size) {
      case 'under1k': return 500;
      case '1k-10k': return 5000;
      case '10k-50k': return 25000;
      case '50k-100k': return 75000;
      case '100k+': return 100000;
      default: return 0;
    }
  };

  // Map platform types - linkedin and podcast map to 'other'
  const mapPlatformType = (type: string): 'youtube' | 'blog' | 'twitter' | 'instagram' | 'tiktok' | 'other' => {
    const validTypes = ['youtube', 'blog', 'twitter', 'instagram', 'tiktok'];
    return validTypes.includes(type) ? type as 'youtube' | 'blog' | 'twitter' | 'instagram' | 'tiktok' : 'other';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const request: AffiliateApplyRequest = {
        name: formData.fullName,
        email: formData.email,
        platform_url: formData.website,
        platform_type: mapPlatformType(formData.platformType),
        audience_size: audienceSizeToNumber(formData.audienceSize),
        promotion_plan: `[Niche: ${formData.niche}] ${formData.promotionPlan}`,
        paypal_email: formData.paypalEmail,
      };

      await applyForAffiliate(request);
      setSubmitted(true);
    } catch (err) {
      console.error('Affiliate application error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="border border-green-500/30 rounded-xl p-8 bg-green-500/10 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-4">Application Received!</h1>
          <div className="h-px bg-[#334155] mb-6"></div>
          <p className="text-[#94A3B8] mb-6">Thanks for applying to the NuuMee.AI affiliate program!</p>
          <div className="text-left max-w-md mx-auto mb-8">
            <p className="text-[#F1F5F9] font-semibold mb-3">What happens next:</p>
            <ol className="space-y-2 text-[#94A3B8]">
              <li className="flex items-start gap-2"><span className="text-[#00F0D9]">1.</span><span>We&apos;ll review your application (2-3 days)</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00F0D9]">2.</span><span>If approved, you&apos;ll receive your unique link</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00F0D9]">3.</span><span>Start promoting and earning!</span></li>
            </ol>
          </div>
          <p className="text-[#94A3B8] mb-6">We&apos;ve sent a confirmation to: <span className="text-[#00F0D9]">{formData.email}</span></p>
          <Link href="/"><Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Back to Home</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4"><Briefcase className="w-10 h-10 text-[#00F0D9]" /><h1 className="text-3xl font-bold text-[#F1F5F9]">Affiliate Program</h1></div>
        <p className="text-[#94A3B8] text-lg mb-6">Partner with NuuMee.AI and earn commissions</p>
        <div className="h-px bg-[#334155] max-w-2xl mx-auto"></div>
      </div>

      {/* Hero */}
      <section className="mb-8 border border-[#00F0D9]/30 rounded-xl p-8 bg-gradient-to-br from-[#00F0D9]/10 to-[#3B1FE2]/10">
        <div className="flex items-start gap-4 mb-6">
          <DollarSign className="w-12 h-12 text-[#00F0D9] flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-3">Earn 30% Commission</h2>
            <p className="text-[#94A3B8] mb-4">Promote NuuMee.AI and earn 30% of each referred customer&apos;s first purchase.</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-[#F1F5F9] font-semibold mb-3">Perfect for:</p>
          <ul className="grid md:grid-cols-2 gap-3">
            {['YouTube creators', 'Tech reviewers', 'Content marketing agencies', 'Social media influencers', 'AI/tech bloggers'].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-[#94A3B8]"><CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0" /><span>{item}</span></li>
            ))}
          </ul>
        </div>
        <button onClick={() => { document.getElementById('affiliate-form')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-6 py-3 rounded-lg transition-opacity">Apply Now<ArrowRight className="w-4 h-4 inline-block ml-2" /></button>
      </section>

      {/* How It Works */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[{ num: '1', title: 'Apply & Get Code', desc: 'Submit application and get approved' }, { num: '2', title: 'Share Your Link', desc: 'Promote to your audience' }, { num: '3', title: 'Earn 30% Per Customer', desc: 'Get paid monthly via PayPal' }].map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#00F0D9]/20 flex items-center justify-center mx-auto mb-4"><span className="text-[#00F0D9] text-2xl font-bold">{step.num}</span></div>
              <h3 className="text-[#F1F5F9] font-semibold mb-2">{step.title}</h3>
              <p className="text-[#94A3B8] text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission Structure */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Commission Structure</h2>
        <p className="text-[#94A3B8] mb-6">You earn 30% of first purchase only</p>
        <div className="space-y-4 mb-8">
          <p className="text-[#F1F5F9] font-semibold">Examples:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-[#334155] bg-[#1E293B] p-4"><p className="text-[#94A3B8] text-sm mb-2">Customer buys $10 credits</p><p className="text-[#00F0D9] text-xl font-bold">You earn $3</p></Card>
            <Card className="border-[#334155] bg-[#1E293B] p-4"><p className="text-[#94A3B8] text-sm mb-2">Customer buys $30 plan</p><p className="text-[#00F0D9] text-xl font-bold">You earn $9</p></Card>
            <Card className="border-[#334155] bg-[#1E293B] p-4"><p className="text-[#94A3B8] text-sm mb-2">Customer buys $99 plan</p><p className="text-[#00F0D9] text-xl font-bold">You earn $29.70</p></Card>
          </div>
        </div>
        <div className="space-y-3 text-[#94A3B8]">
          <div className="flex items-center gap-3"><DollarSign className="w-5 h-5 text-green-400" /><span>Minimum payout: $100</span></div>
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-purple-400" /><span>Payment schedule: Monthly (via PayPal)</span></div>
          <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-[#00F0D9]" /><span>Cookie duration: 30 days</span></div>
        </div>
      </section>

      {/* What You Get */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">What You Get</h2>
        <ul className="space-y-3">
          {['Unique tracking link (nuumee.ai/?a=yourcode)', 'Monthly commission reports', 'Marketing materials and banners', 'Dedicated affiliate support', 'Early access to new features', 'Creator plan discount (optional)'].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-[#94A3B8]"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" /><span>{item}</span></li>
          ))}
        </ul>
      </section>

      {/* Requirements */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Requirements</h2>
        <div className="mb-6">
          <p className="text-[#F1F5F9] font-semibold mb-3">We&apos;re looking for partners with:</p>
          <ul className="space-y-2">
            {['Active audience (1,000+ followers/subscribers)', 'Content related to AI, video, or content creation', 'Engaged community', 'Professional online presence'].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[#94A3B8]"><span className="text-[#00F0D9] mt-1">•</span><span>{item}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[#F1F5F9] font-semibold mb-3">Not required but helpful:</p>
          <ul className="space-y-2">
            {['Experience with affiliate marketing', 'YouTube channel or blog', 'Tech/creator audience'].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[#94A3B8]"><span className="text-[#94A3B8] mt-1">•</span><span>{item}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Application Form */}
      <section id="affiliate-form" className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Apply to Become an Affiliate</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="block text-[#F1F5F9] mb-2">Full Name</label><Input value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder="Alex Chen" className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" required /></div>
          <div><label className="block text-[#F1F5F9] mb-2">Email</label><Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="alex@example.com" className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" required /></div>
          <div><label className="block text-[#F1F5F9] mb-2">Website/Platform</label><Input type="url" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="https://youtube.com/yourhandle" className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" required /></div>
          <div><label className="block text-[#F1F5F9] mb-2">Platform Type</label><Select value={formData.platformType} onValueChange={(value) => handleInputChange('platformType', value)}><SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"><SelectValue placeholder="Select platform" /></SelectTrigger><SelectContent className="bg-[#1E293B] border-[#334155]"><SelectItem value="youtube" className="text-[#F1F5F9]">YouTube</SelectItem><SelectItem value="blog" className="text-[#F1F5F9]">Blog</SelectItem><SelectItem value="twitter" className="text-[#F1F5F9]">Twitter/X</SelectItem><SelectItem value="instagram" className="text-[#F1F5F9]">Instagram</SelectItem><SelectItem value="tiktok" className="text-[#F1F5F9]">TikTok</SelectItem><SelectItem value="linkedin" className="text-[#F1F5F9]">LinkedIn</SelectItem><SelectItem value="podcast" className="text-[#F1F5F9]">Podcast</SelectItem><SelectItem value="other" className="text-[#F1F5F9]">Other</SelectItem></SelectContent></Select></div>
          <div><label className="block text-[#F1F5F9] mb-2">Audience Size</label><Select value={formData.audienceSize} onValueChange={(value) => handleInputChange('audienceSize', value)}><SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"><SelectValue placeholder="Select audience size" /></SelectTrigger><SelectContent className="bg-[#1E293B] border-[#334155]"><SelectItem value="under1k" className="text-[#F1F5F9]">&lt;1,000</SelectItem><SelectItem value="1k-10k" className="text-[#F1F5F9]">1,000-10,000</SelectItem><SelectItem value="10k-50k" className="text-[#F1F5F9]">10,000-50,000</SelectItem><SelectItem value="50k-100k" className="text-[#F1F5F9]">50,000-100,000</SelectItem><SelectItem value="100k+" className="text-[#F1F5F9]">100,000+</SelectItem></SelectContent></Select></div>
          <div><label className="block text-[#F1F5F9] mb-2">Niche/Focus</label><Input value={formData.niche} onChange={(e) => handleInputChange('niche', e.target.value)} placeholder="AI Tools & Tech Reviews" className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" required /></div>
          <div><label className="block text-[#F1F5F9] mb-2">How will you promote NuuMee.AI?</label><Textarea value={formData.promotionPlan} onChange={(e) => handleInputChange('promotionPlan', e.target.value)} placeholder="I create weekly AI tool review videos on YouTube with 25K subscribers. I'd feature NuuMee.AI in a dedicated tutorial video and include the affiliate link in the description." className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] min-h-[120px]" required /></div>
          <div><label className="block text-[#F1F5F9] mb-2">PayPal Email (for payments)</label><Input type="email" value={formData.paypalEmail} onChange={(e) => handleInputChange('paypalEmail', e.target.value)} placeholder="paypal@example.com" className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" required /></div>
          <div className="flex items-start gap-3"><Checkbox id="terms" checked={formData.agreedToTerms} onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked as boolean)} className="mt-1" /><label htmlFor="terms" className="text-[#94A3B8] cursor-pointer">I agree to the <Link href="/terms" className="text-[#00F0D9] hover:underline">Affiliate Terms & Conditions</Link></label></div>
          {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}
          <Button type="submit" disabled={!formData.agreedToTerms || submitting} className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin inline" />Submitting...</>) : 'Submit Application'}
          </Button>
        </form>
      </section>

      {/* FAQ */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">FAQ</h2>
        <div className="space-y-6">
          {[
            { q: 'How long does approval take?', a: 'Usually 2-3 business days. We review each application manually to ensure good fit.' },
            { q: 'When do I get paid?', a: 'Monthly, via PayPal, once you reach $100 minimum.' },
            { q: 'Can I promote on multiple platforms?', a: 'Yes! Use your unique link everywhere.' },
            { q: 'Do I need a lot of followers?', a: 'We prefer 1,000+ but will consider smaller accounts with highly engaged audiences.' },
            { q: "What if my audience doesn't buy anything?", a: "No worries! There's no cost to join. You only earn when someone purchases." },
            { q: 'Can I see my stats?', a: "Yes, we'll send monthly reports showing clicks, signups, and commissions earned." },
          ].map((faq, idx) => (<div key={idx}><p className="text-[#F1F5F9] font-semibold mb-2">Q: {faq.q}</p><p className="text-[#94A3B8]">A: {faq.a}</p></div>))}
        </div>
      </section>

      <div className="text-center text-[#94A3B8]"><p>Questions? Email <a href="mailto:affiliates@nuumee.ai" className="text-[#00F0D9] hover:underline">affiliates@nuumee.ai</a></p></div>
    </main>
  );
}
