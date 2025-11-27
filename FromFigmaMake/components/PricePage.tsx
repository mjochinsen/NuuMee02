import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Zap,
  X,
  Star,
  Calculator,
  MessageSquare,
  Mail,
  Trophy,
  DollarSign,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Slider } from '../components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { BuyCreditsModal } from '../components/BuyCreditsModal';
import { SubscriptionModal } from '../components/SubscriptionModal';

export default function PricePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [calculatorVideos, setCalculatorVideos] = useState(25);
  const [calculatorDuration, setCalculatorDuration] = useState('30');
  const [calculatorResolution, setCalculatorResolution] = useState('720p');
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<any>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionModalType, setSubscriptionModalType] = useState<'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'founding'>('subscribe');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Calculate recommended plan
  const creditsPerVideo = calculatorDuration === '10' ? 20 : calculatorDuration === '30' ? 60 : 120;
  const totalCreditsNeeded = calculatorVideos * creditsPerVideo;

  const getRecommendedPlan = () => {
    if (totalCreditsNeeded <= 400) return 'Creator';
    if (totalCreditsNeeded <= 1600) return 'Studio';
    return 'Enterprise';
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      credits: 25,
      creditsLabel: '25 credits (one-time)',
      features: [
        '25 credits total',
        '720p resolution',
        'Watermarked output',
        'Basic support',
        'Safety checker included',
      ],
    },
    {
      name: 'Creator',
      price: billingCycle === 'monthly' ? 29 : 23,
      originalPrice: billingCycle === 'annually' ? 29 : null,
      billedAnnually: billingCycle === 'annually' ? 276 : null,
      period: 'per month',
      credits: 400,
      creditsLabel: '400 credits/month',
      featured: true,
      features: [
        '400 credits/month',
        'Up to 4K resolution',
        'No watermarks',
        'Priority support',
        'All post-processing tools',
        'API access',
        '50% credit rollover',
      ],
    },
    {
      name: 'Studio',
      price: billingCycle === 'monthly' ? 99 : 79,
      originalPrice: billingCycle === 'annually' ? 99 : null,
      billedAnnually: billingCycle === 'annually' ? 948 : null,
      period: 'per month',
      credits: 1600,
      creditsLabel: '1,600 credits/month',
      features: [
        '1,600 credits/month',
        'Up to 8K resolution',
        'No watermarks',
        '24/7 premium support',
        'All post-processing tools',
        'Advanced API access',
        '50% credit rollover',
        'Priority processing',
        'Custom models',
      ],
    },
  ];

  const creditPackages = [
    {
      name: 'Starter',
      price: 10,
      credits: 120,
      pricePerCredit: 0.083,
      bonus: null,
    },
    {
      name: 'Popular',
      price: 30,
      credits: 400,
      pricePerCredit: 0.075,
      bonus: '+10%',
      featured: true,
    },
    {
      name: 'Pro',
      price: 75,
      credits: 1100,
      pricePerCredit: 0.068,
      bonus: '+20%',
    },
    {
      name: 'Mega',
      price: 150,
      credits: 2500,
      pricePerCredit: 0.06,
      bonus: '+28%',
    },
  ];

  const creditCosts = [
    { duration: '10 seconds', resolution: '480p', credits: 10, cost: 0.83 },
    { duration: '10 seconds', resolution: '720p', credits: 20, cost: 1.67 },
    { duration: '30 seconds', resolution: '720p', credits: 60, cost: 5.0 },
    { duration: '60 seconds', resolution: '720p', credits: 120, cost: 10.0 },
  ];

  const postProcessingCosts = [
    { name: 'Video Extender', credits: 50 },
    { name: 'Upscaler 4K', credits: 30 },
    { name: 'AI Audio Generation', credits: 5 },
    { name: 'Subtitles', credits: 'FREE' },
    { name: 'Format change (16:9)', credits: 'FREE' },
    { name: 'Mix music/audio', credits: 'FREE' },
  ];

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-[#F1F5F9] mb-4">Simple, Transparent Pricing</h1>
        <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto mb-8">
          Choose the plan that fits your needs. All plans include access to our AI character
          replacement technology.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <Tabs
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'annually')}
            className="inline-block"
          >
            <TabsList className="bg-[#1E293B] border border-[#334155]">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-[#334155]">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="annually" className="data-[state=active]:bg-[#334155]">
                Annually
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                  Save 20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-2xl p-8 bg-[#0F172A] relative ${
              plan.featured
                ? 'border-[#00F0D9] shadow-lg shadow-[#00F0D9]/20'
                : 'border-[#334155]'
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white px-4 py-1 rounded-full text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                Most Popular
              </div>
            )}

            <h3 className="text-[#F1F5F9] mb-2">{plan.name}</h3>
            <div className="mb-1">
              <span className="text-[#F1F5F9] text-5xl">${plan.price}</span>
              <span className="text-[#94A3B8] ml-2">/{plan.period}</span>
            </div>
            {plan.originalPrice && (
              <div className="mb-2">
                <span className="text-[#94A3B8] line-through text-sm">
                  ${plan.originalPrice}/month
                </span>
              </div>
            )}
            {plan.billedAnnually && (
              <div className="mb-4">
                <span className="text-[#94A3B8] text-sm">
                  Billed ${plan.billedAnnually}/year
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6 text-[#00F0D9]">
              <Zap className="w-5 h-5" />
              <span>{plan.creditsLabel}</span>
            </div>

            <Button
              className={`w-full mb-6 ${
                plan.featured
                  ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white'
                  : 'border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'
              }`}
              variant={plan.featured ? 'default' : 'outline'}
              onClick={() => {
                if (plan.name !== 'Free') {
                  setSelectedPlan({
                    id: plan.name.toLowerCase(),
                    name: plan.name,
                    price: plan.price,
                    annualPrice: plan.billedAnnually,
                    credits: plan.credits,
                    icon: plan.name === 'Creator' ? '🏆' : plan.name === 'Studio' ? '💎' : '⭐',
                    features: plan.features,
                    effectiveRate: 0.073,
                  });
                  setSubscriptionModalType('subscribe');
                  setIsSubscriptionModalOpen(true);
                }
              }}
            >
              Get Started
            </Button>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#334155] mb-12"></div>

      {/* Credit Packages */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] mb-2">Need More Credits?</h2>
        <p className="text-[#94A3B8] mb-8">
          Purchase additional credits at any time. Credits never expire and can be used across all
          features.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.name}
              className={`p-6 text-center ${
                pkg.featured
                  ? 'border-[#00F0D9] bg-[#00F0D9]/5'
                  : 'border-[#334155] bg-[#1E293B]'
              }`}
            >
              <div className="mb-3">
                <h3 className="text-[#F1F5F9] mb-1">{pkg.name}</h3>
                {pkg.bonus && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Star className="w-3 h-3 mr-1" />
                    {pkg.bonus}
                  </Badge>
                )}
              </div>
              <div className="mb-4">
                <span className="text-[#F1F5F9] text-3xl">${pkg.price}</span>
              </div>
              <div className="mb-4">
                <span className="text-[#00F0D9] text-xl">{pkg.credits} credits</span>
              </div>
              <div className="mb-6 text-[#94A3B8] text-sm">
                ${pkg.pricePerCredit.toFixed(3)}/credit
              </div>
              <Button
                className={
                  pkg.featured
                    ? 'w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white'
                    : 'w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]'
                }
                variant={pkg.featured ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedCreditPackage(pkg);
                  setIsBuyModalOpen(true);
                }}
              >
                Buy
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            onClick={() => {
              // Open modal with the popular package by default
              setSelectedCreditPackage(creditPackages[1]);
              setIsBuyModalOpen(true);
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Buy Credits
          </Button>
        </div>
      </section>

      {/* Understanding Credits */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">💡</span>
          <h2 className="text-[#F1F5F9]">Understanding Credits</h2>
        </div>

        <p className="text-[#94A3B8] mb-6">Credits are our simple, transparent pricing unit:</p>

        {/* Video Generation Costs */}
        <div className="mb-8">
          <h3 className="text-[#F1F5F9] mb-4">Video Generation Costs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-4 text-[#94A3B8]">Video Length</th>
                  <th className="text-left py-3 px-4 text-[#94A3B8]">Resolution</th>
                  <th className="text-left py-3 px-4 text-[#94A3B8]">Credits Needed</th>
                </tr>
              </thead>
              <tbody>
                {creditCosts.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#334155]/50">
                    <td className="py-3 px-4 text-[#F1F5F9]">{row.duration}</td>
                    <td className="py-3 px-4 text-[#F1F5F9]">{row.resolution}</td>
                    <td className="py-3 px-4 text-[#00F0D9]">
                      {row.credits} credits (~${row.cost.toFixed(2)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Post-Processing Costs */}
        <div className="mb-6">
          <h3 className="text-[#F1F5F9] mb-4">Post-Processing Costs</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {postProcessingCosts.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg bg-[#1E293B] border border-[#334155]"
              >
                <span className="text-[#94A3B8]">• {item.name}</span>
                <span
                  className={
                    item.credits === 'FREE' ? 'text-green-400' : 'text-[#00F0D9]'
                  }
                >
                  {item.credits === 'FREE' ? item.credits : `${item.credits} credits`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Credit Calculator
        </Button>
      </section>

      {/* Plan Comparison Table */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">📊</span>
          <h2 className="text-[#F1F5F9]">Plan Comparison</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-4 text-[#94A3B8]">Feature</th>
                <th className="text-center py-3 px-4 text-[#94A3B8]">Free</th>
                <th className="text-center py-3 px-4 text-[#94A3B8]">Creator</th>
                <th className="text-center py-3 px-4 text-[#94A3B8]">Studio</th>
                <th className="text-center py-3 px-4 text-[#94A3B8]">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Credits/month</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">25</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">400</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">1,600</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Custom</td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Resolution</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">720p</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">4K</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">8K</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Custom</td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Watermark</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Yes</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">No</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">No</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">No</td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Credit rollover</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">-</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">50%</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">50%</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">100%</td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Processing</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Standard</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Priority</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Priority</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Dedicated</td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">API access</td>
                <td className="text-center py-3 px-4">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Support</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Email</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Priority</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">24/7</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Dedicated</td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Video storage</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">7 days</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">30 days</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">90 days</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Custom</td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Negative balance</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">-</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">-100</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">-100</td>
                <td className="text-center py-3 px-4 text-[#94A3B8]">Custom</td>
              </tr>
              <tr className="border-b border-[#334155]/50">
                <td className="py-3 px-4 text-[#F1F5F9]">Custom models</td>
                <td className="text-center py-3 px-4">
                  <X className="w-5 h-5 text-red-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <X className="w-5 h-5 text-red-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Special Offers - Founding Members */}
      <section className="mb-12 border border-[#00F0D9]/30 rounded-2xl p-8 bg-gradient-to-br from-[#00F0D9]/10 to-[#3B1FE2]/10">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-8 h-8 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">🎁 Special Offers</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00F0D9]" />
            Founding Members (First 100 subscribers)
          </h3>
          <ul className="space-y-2 mb-6">
            {[
              '20% lifetime discount on all plans',
              'Exclusive "Founding Member" badge',
              '100% credit rollover (vs 50% standard)',
              'Locked-in pricing forever',
              'Early access to new features',
              'Exclusive Discord channel',
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-[#94A3B8]">
                <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-4">
            Only 23 spots remaining!
          </Badge>
          <div>
            <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
              Become a Founding Member
            </Button>
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-6 h-6 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">🧮 Cost Calculator</h2>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-[#F1F5F9] mb-3">
              How many videos do you create per month?
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[calculatorVideos]}
                onValueChange={(value) => setCalculatorVideos(value[0])}
                min={1}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-[#00F0D9] min-w-[3rem] text-right">{calculatorVideos}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#F1F5F9] mb-2">Video duration</label>
              <Select value={calculatorDuration} onValueChange={setCalculatorDuration}>
                <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="10" className="text-[#F1F5F9]">
                    10 seconds
                  </SelectItem>
                  <SelectItem value="30" className="text-[#F1F5F9]">
                    30 seconds
                  </SelectItem>
                  <SelectItem value="60" className="text-[#F1F5F9]">
                    60 seconds
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[#F1F5F9] mb-2">Resolution</label>
              <Select value={calculatorResolution} onValueChange={setCalculatorResolution}>
                <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="720p" className="text-[#F1F5F9]">
                    720p
                  </SelectItem>
                  <SelectItem value="4k" className="text-[#F1F5F9]">
                    4K
                  </SelectItem>
                  <SelectItem value="8k" className="text-[#F1F5F9]">
                    8K
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-[#1E293B] border border-[#334155] mb-6">
          <p className="text-[#94A3B8] mb-4">
            Total credits needed:{' '}
            <span className="text-[#00F0D9] text-xl">{totalCreditsNeeded} credits/month</span>
          </p>

          <div className="mb-4">
            <p className="text-[#F1F5F9] mb-2">Best option for you:</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <span className="text-[#00F0D9] text-xl">
                {getRecommendedPlan()} Plan
                {getRecommendedPlan() === 'Creator' && ' ($29/mo)'}
                {getRecommendedPlan() === 'Studio' && ' ($99/mo)'}
              </span>
            </div>
            {getRecommendedPlan() !== 'Enterprise' && (
              <>
                <p className="text-[#94A3B8] text-sm mb-1">
                  Includes:{' '}
                  {getRecommendedPlan() === 'Creator' ? '400' : '1,600'} credits (
                  {totalCreditsNeeded <=
                  (getRecommendedPlan() === 'Creator' ? 400 : 1600)
                    ? 'enough for your needs'
                    : 'you may need more credits'}
                  )
                </p>
                <p className="text-green-400 text-sm">
                  Saves: ~$
                  {(
                    totalCreditsNeeded * 0.075 -
                    (getRecommendedPlan() === 'Creator' ? 29 : 99)
                  ).toFixed(0)}
                  /mo vs pay-as-you-go
                </p>
              </>
            )}
          </div>

          {getRecommendedPlan() !== 'Enterprise' && (
            <div>
              <p className="text-[#94A3B8] text-sm mb-2">Alternative:</p>
              <p className="text-[#94A3B8] text-sm">
                Pay-as-you-go: ~${(totalCreditsNeeded * 0.075).toFixed(0)}/mo (buy
                credits as needed)
              </p>
            </div>
          )}
        </div>

        <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
          Start with {getRecommendedPlan()} Plan
        </Button>
      </section>

      {/* FAQ */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">❓</span>
          <h2 className="text-[#F1F5F9]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          {[
            {
              q: 'Do credits expire?',
              a: 'Pay-as-you-go credits never expire. Subscription credits roll over 50% each month.',
            },
            {
              q: 'Can I upgrade or downgrade my plan?',
              a: 'Yes! Change plans anytime. Unused credits carry over.',
            },
            {
              q: 'What happens if I run out of credits?',
              a: 'You can buy more anytime. Subscriptions allow up to -100 credits negative balance so you never get stuck mid-project.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes! Sign up for the Free plan and get 25 credits to test (no credit card required).',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes, no long-term contracts. Cancel anytime.',
            },
            {
              q: 'Do you offer student/educational discounts?',
              a: 'Yes! Email support@nuumee.ai with proof of enrollment for 50% off Creator or Studio plans.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept credit/debit cards, Google Pay, Apple Pay, and PayPal via Stripe secure checkout.',
            },
          ].map((faq, idx) => (
            <div key={idx}>
              <p className="text-[#F1F5F9] mb-2">Q: {faq.q}</p>
              <p className="text-[#94A3B8]">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise */}
      <section className="mb-12 border border-[#334155] rounded-2xl p-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex-1 min-w-[300px]">
            <h2 className="text-[#F1F5F9] mb-2">Enterprise</h2>
            <p className="text-[#94A3B8] mb-6">
              Custom pricing for large teams and organizations
            </p>
            <ul className="space-y-3 mb-6">
              {[
                'Custom credit allocation',
                'White-label options',
                'Dedicated support & account manager',
                'SLA guarantees',
                'Volume discounts',
                'Custom integrations',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center">
            <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <div className="text-center">
        <p className="text-[#94A3B8] mb-4">Still have questions?</p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Sales
          </Button>
          <Link to="/support">
            <Button
              variant="outline"
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with Support
            </Button>
          </Link>
        </div>
      </div>

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        selectedPackage={selectedCreditPackage}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        type={subscriptionModalType}
        selectedPlan={selectedPlan}
        isAnnual={billingCycle === 'annually'}
      />
    </main>
  );
}