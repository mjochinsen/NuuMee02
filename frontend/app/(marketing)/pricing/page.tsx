'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Zap, Star, Calculator, MessageSquare, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCheckoutSession } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [calculatorVideos, setCalculatorVideos] = useState([25]);
  const [calculatorDuration, setCalculatorDuration] = useState('30');
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  const handleBuyCredits = async (packageId: string) => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setLoadingPackage(packageId);
    try {
      const { checkout_url } = await createCheckoutSession(packageId);
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to start checkout: ${errorMessage}`);
    } finally {
      setLoadingPackage(null);
    }
  };

  const plans = [
    { name: 'Free', price: 0, period: 'forever', credits: 25, creditsLabel: '25 credits (one-time)', features: ['25 credits total', '480p resolution', 'Watermarked output', 'Basic support'] },
    { name: 'Creator', price: billingCycle === 'monthly' ? 29 : 23, period: 'per month', credits: 400, creditsLabel: '400 credits/month', featured: true, features: ['400 credits/month', 'Up to 1080p resolution', 'No watermarks', 'Priority support', 'API access', '50% credit rollover'] },
    { name: 'Studio', price: billingCycle === 'monthly' ? 99 : 79, period: 'per month', credits: 1600, creditsLabel: '1,600 credits/month', features: ['1,600 credits/month', 'Up to 1080p resolution', 'No watermarks', '24/7 premium support', 'Priority processing'] },
  ];

  const creditPackages = [
    { id: 'starter', name: 'Starter', price: 10, credits: 120, bonus: null },
    { id: 'popular', name: 'Popular', price: 30, credits: 400, bonus: '+10%', featured: true },
    { id: 'pro', name: 'Pro', price: 75, credits: 1100, bonus: '+20%' },
    { id: 'mega', name: 'Mega', price: 150, credits: 2500, bonus: '+28%' },
  ];

  // Credits per video based on duration
  const creditsPerVideo = calculatorDuration === '10' ? 20 : calculatorDuration === '30' ? 60 : 120;
  const creditsNeeded = calculatorVideos[0] * creditsPerVideo;

  // Dynamic slider max based on duration
  // Studio (~1600 credits) should be at ~1/3, Enterprise at ~2/3
  // Max = ~4800 credits worth of videos
  const getSliderMax = (duration: string) => {
    switch (duration) {
      case '10': return 240; // 4800 / 20 = 240 videos
      case '30': return 80;  // 4800 / 60 = 80 videos
      case '60': return 40;  // 4800 / 120 = 40 videos
      default: return 100;
    }
  };
  const sliderMax = getSliderMax(calculatorDuration);

  // Adjust videos if current value exceeds new max when duration changes
  useEffect(() => {
    const max = getSliderMax(calculatorDuration);
    if (calculatorVideos[0] > max) {
      setCalculatorVideos([max]);
    }
  }, [calculatorDuration]);

  const getRecommendedPlan = () => creditsNeeded <= 400 ? 'Creator' : creditsNeeded <= 1600 ? 'Studio' : 'Enterprise';

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-[#F1F5F9] mb-4">Simple, Transparent Pricing</h1>
        <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto mb-8">Choose the plan that fits your needs. All plans include access to our AI character replacement technology.</p>
        <div className="flex justify-center mb-8">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annually')} className="inline-block">
            <TabsList className="bg-[#1E293B] border border-[#334155]">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-[#334155]">Monthly</TabsTrigger>
              <TabsTrigger value="annually" className="data-[state=active]:bg-[#334155]">Annually<Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">Save 20%</Badge></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div key={plan.name} className={`border rounded-2xl p-8 bg-[#0F172A] relative ${plan.featured ? 'border-[#00F0D9] shadow-lg shadow-[#00F0D9]/20' : 'border-[#334155]'}`}>
            {plan.featured && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white px-4 py-1 rounded-full text-sm flex items-center gap-1"><Star className="w-4 h-4" />Most Popular</div>}
            <h3 className="text-[#F1F5F9] mb-2">{plan.name}</h3>
            <div className="mb-1"><span className="text-[#F1F5F9] text-5xl">${plan.price}</span><span className="text-[#94A3B8] ml-2">/{plan.period}</span></div>
            <div className="flex items-center gap-2 mb-6 text-[#00F0D9]"><Zap className="w-5 h-5" /><span>{plan.creditsLabel}</span></div>
            <Button
              onClick={() => {
                if (plan.name === 'Free') {
                  router.push('/signup');
                } else if (!user) {
                  router.push('/login?redirect=/pricing');
                } else {
                  // For paid subscriptions, redirect to billing
                  // Full subscription checkout will be Phase 7
                  router.push('/billing');
                }
              }}
              className={`w-full mb-6 ${plan.featured ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white' : 'border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'}`}
              variant={plan.featured ? 'default' : 'outline'}
            >
              Get Started
            </Button>
            <ul className="space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-[#94A3B8]"><Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" /><span>{feature}</span></li>)}</ul>
          </div>
        ))}
      </div>

      <div className="h-px bg-[#334155] mb-12"></div>

      {/* Credit Packages */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] mb-2">Need More Credits?</h2>
        <p className="text-[#94A3B8] mb-8">Purchase additional credits at any time. Credits never expire.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {creditPackages.map((pkg) => (
            <Card key={pkg.name} className={`p-6 text-center ${pkg.featured ? 'border-[#00F0D9] bg-[#00F0D9]/5' : 'border-[#334155] bg-[#1E293B]'}`}>
              <div className="mb-3">
                <h3 className="text-[#F1F5F9] mb-1">{pkg.name}</h3>
                {pkg.bonus && <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><Star className="w-3 h-3 mr-1" />{pkg.bonus}</Badge>}
              </div>
              <div className="mb-4"><span className="text-[#F1F5F9] text-3xl">${pkg.price}</span></div>
              <div className="mb-4"><span className="text-[#00F0D9] text-xl">{pkg.credits} credits</span></div>
              <Button
                onClick={() => handleBuyCredits(pkg.id)}
                disabled={loadingPackage === pkg.id}
                className={pkg.featured ? 'w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white' : 'w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]'}
                variant={pkg.featured ? 'default' : 'outline'}
              >
                {loadingPackage === pkg.id ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : 'Buy'}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <div className="flex items-center gap-2 mb-6"><Calculator className="w-6 h-6 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">🧮 Cost Calculator</h2></div>
        <div className="space-y-6 mb-6">
          <div>
            <label id="videos-label" className="block text-[#F1F5F9] mb-3">How many videos do you create per month?</label>
            <div className="flex items-center gap-4">
              <Slider value={calculatorVideos} onValueChange={setCalculatorVideos} min={1} max={sliderMax} step={1} className="flex-1" aria-labelledby="videos-label" />
              <span className="text-[#00F0D9] min-w-[3rem] text-right" aria-live="polite">{calculatorVideos[0]}</span>
            </div>
          </div>
          <div>
            <label id="duration-label" className="block text-[#F1F5F9] mb-2">Video duration</label>
            <Select value={calculatorDuration} onValueChange={setCalculatorDuration}>
              <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" aria-labelledby="duration-label"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#334155]">
                <SelectItem value="10" className="text-[#F1F5F9]">10 seconds</SelectItem>
                <SelectItem value="30" className="text-[#F1F5F9]">30 seconds</SelectItem>
                <SelectItem value="60" className="text-[#F1F5F9]">60 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-6 rounded-lg bg-[#1E293B] border border-[#334155] mb-6">
          <p className="text-[#94A3B8] mb-4">Total credits needed: <span className="text-[#00F0D9] text-xl">{creditsNeeded} credits/month</span></p>

          {/* Plan thresholds visualization */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[#94A3B8] mb-2">
              <span>Creator (400)</span>
              <span>Studio (1,600)</span>
              <span>Enterprise (3,200+)</span>
            </div>
            <div className="h-3 bg-[#0F172A] rounded-full overflow-hidden relative">
              {/* Background segments */}
              <div className="absolute inset-y-0 left-0 w-[8.3%] bg-green-500/20 border-r border-[#334155]" />
              <div className="absolute inset-y-0 left-[8.3%] w-[25%] bg-blue-500/20 border-r border-[#334155]" />
              <div className="absolute inset-y-0 left-[33.3%] w-[33.4%] bg-purple-500/20 border-r border-[#334155]" />
              <div className="absolute inset-y-0 left-[66.7%] w-[33.3%] bg-amber-500/20" />
              {/* Current position indicator */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] transition-all duration-300"
                style={{ width: `${Math.min((creditsNeeded / 4800) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#64748B] mt-1">
              <span>0</span>
              <span>|</span>
              <span>|</span>
              <span>{Math.round(4800 / creditsPerVideo)}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[#F1F5F9] mb-2">Best option for you:</p>
            <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🎯</span><span className="text-[#00F0D9] text-xl">{getRecommendedPlan()} Plan</span></div>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Start with {getRecommendedPlan()} Plan</Button>
      </section>

      {/* FAQ */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <div className="flex items-center gap-2 mb-6"><span className="text-3xl">❓</span><h2 className="text-[#F1F5F9]">Frequently Asked Questions</h2></div>
        <div className="space-y-6">
          {[
            { q: 'Do credits expire?', a: 'Pay-as-you-go credits never expire. Subscription credits roll over 50% each month.' },
            { q: 'Can I upgrade or downgrade my plan?', a: 'Yes! Change plans anytime. Unused credits carry over.' },
            { q: 'Is there a free trial?', a: 'Yes! Sign up for the Free plan and get 25 credits to test (no credit card required).' },
            { q: 'Can I cancel anytime?', a: 'Yes, no long-term contracts. Cancel anytime.' },
          ].map((faq, idx) => (
            <div key={idx}>
              <p className="text-[#F1F5F9] mb-2">Q: {faq.q}</p>
              <p className="text-[#94A3B8]">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <div className="text-center">
        <p className="text-[#94A3B8] mb-4">Still have questions?</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"><Mail className="w-4 h-4 mr-2" />Contact Sales</Button>
          <Link href="/support"><Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"><MessageSquare className="w-4 h-4 mr-2" />Chat with Support</Button></Link>
        </div>
      </div>
    </main>
  );
}
