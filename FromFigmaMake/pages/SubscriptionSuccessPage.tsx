import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Zap, ArrowRight, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'creator';
  
  const planDetails = {
    creator: {
      name: 'Creator',
      price: '$29',
      credits: 400,
      features: [
        '400 credits per month',
        'No watermarks',
        'Up to 4K resolution',
        'Priority support',
        'All post-processing tools',
        'API access',
        '50% credit rollover',
      ],
    },
    studio: {
      name: 'Studio',
      price: '$99',
      credits: 1600,
      features: [
        '1,600 credits per month',
        'No watermarks',
        'Up to 8K resolution',
        '24/7 premium support',
        'All post-processing tools',
        'Advanced API access',
        '50% credit rollover',
        'Priority processing',
        'Custom models',
      ],
    },
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.creator;
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return (
    <main className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center">
        {/* Success Icon with Confetti */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
            <span className="text-6xl">🎉</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#F1F5F9] mb-4">Welcome to {currentPlan.name} Plan!</h1>

        {/* Subheading */}
        <p className="text-[#94A3B8] text-lg mb-12">Your subscription is now active</p>

        {/* Subscription Details Card */}
        <Card className="max-w-md mx-auto border-[#334155] bg-[#1E293B] p-8 mb-8">
          <p className="text-[#94A3B8] mb-6">Subscription Details</p>
          <div className="space-y-4 text-left mb-6">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Plan:</span>
              <span className="text-[#F1F5F9]">{currentPlan.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Price:</span>
              <span className="text-[#F1F5F9]">{currentPlan.price}/month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Credits:</span>
              <span className="text-[#F1F5F9]">{currentPlan.credits}/month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Next billing:</span>
              <span className="text-[#F1F5F9]">
                {nextBillingDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
          <div className="h-px bg-[#334155] mb-6"></div>
          <div className="flex items-center justify-center gap-3">
            <Zap className="w-6 h-6 text-[#00F0D9]" />
            <span className="text-[#94A3B8]">Current balance:</span>
            <span className="text-[#00F0D9] text-2xl">{currentPlan.credits} credits</span>
          </div>
        </Card>

        {/* What's Included Card */}
        <Card className="max-w-md mx-auto border-[#334155] bg-[#0F172A] p-8 mb-10 text-left">
          <h2 className="text-[#F1F5F9] text-xl mb-6">What's Included:</h2>
          <ul className="space-y-3">
            {currentPlan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[#94A3B8]">
                <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Primary CTA */}
        <Link to="/create">
          <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-12 py-6 text-lg mb-6">
            🎬 Start Creating Videos
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>

        {/* Secondary Links */}
        <div className="flex justify-center gap-6">
          <Link to="/billing" className="text-[#00F0D9] hover:underline flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Manage Subscription
          </Link>
          <Link to="/jobs" className="text-[#00F0D9] hover:underline">
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
