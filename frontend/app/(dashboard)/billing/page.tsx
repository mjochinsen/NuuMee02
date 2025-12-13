'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CreditCard,
  Zap,
  Check,
  AlertCircle,
  X,
  Crown,
  Sparkles,
  Building2,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { createCheckoutSession, ApiError, createCustomerPortalSession, syncBillingPeriod } from '@/lib/api';
import { BuyCreditsModal } from '@/components/BuyCreditsModal';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { useTransactions, useAutoRefill } from './hooks';
import { BalanceCard, ActivePlanCard, TransactionHistorySection } from './components';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  current?: boolean;
  icon: string;
}


export default function BillingPage() {
  const { profile, user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const credits = loading ? null : (profile?.credits_balance ?? 0);
  const creditValue = (credits ?? 0) * 0.10;
  const currentPlan = profile?.subscription_tier || 'free';
  const billingPeriod = profile?.billing_period;  // "month", "year", or null
  // For paid subscribers with missing billing_period, default to monthly display
  // but show sync button and sync before billing operations
  const hasMissingBillingPeriod = currentPlan !== 'free' && !billingPeriod;
  const isAnnual = billingPeriod === 'year';
  const nextBillingDate = 'Dec 11';

  // State for billing period sync
  const [isSyncingBillingPeriod, setIsSyncingBillingPeriod] = useState(false);

  // Billing cycle toggle state (monthly vs annually)
  // Initialize to user's current billing period, or 'monthly' for free users
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  // Sync toggle state with user's actual billing period when profile loads
  useEffect(() => {
    if (billingPeriod === 'year') {
      setBillingCycle('annually');
    } else if (billingPeriod === 'month') {
      setBillingCycle('monthly');
    }
    // For free users or unknown, keep the default 'monthly'
  }, [billingPeriod]);

  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionModalType, setSubscriptionModalType] = useState<'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'monthly' | 'founding'>('subscribe');
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transaction state (from hook)
  const {
    transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
    page: transactionPage,
    setPage: setTransactionPage,
    total: transactionTotal,
    hasMore: hasMoreTransactions,
    refresh: fetchTransactions,
  } = useTransactions(user?.uid);

  // Auto-refill state (from hook)
  const {
    enabled: autoRefillEnabled,
    setEnabled: setAutoRefillEnabled,
    threshold: autoRefillThreshold,
    setThreshold: setAutoRefillThreshold,
    packageId: autoRefillPackage,
    setPackageId: setAutoRefillPackage,
    isLoading: autoRefillLoading,
    isSaving: autoRefillSaving,
    save: handleSaveAutoRefill,
  } = useAutoRefill(user?.uid);

  const creditPackages: CreditPackage[] = [
    { id: 'starter', name: 'Starter', credits: 120, price: 10, pricePerCredit: 0.083 },
    { id: 'popular', name: 'Popular', credits: 400, price: 30, pricePerCredit: 0.075, popular: true },
    { id: 'pro', name: 'Pro', credits: 1100, price: 75, pricePerCredit: 0.068 },
    { id: 'mega', name: 'Mega', credits: 2500, price: 150, pricePerCredit: 0.060 },
  ];

  // Dynamic pricing based on billing cycle (20% savings for annual)
  const getMonthlyPrice = (basePrice: number): number => basePrice;
  const getAnnualPrice = (basePrice: number): number => Math.round(basePrice * 0.8); // 20% off

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      credits: 25,
      features: ['25 credits (one-time)', 'Watermarked output', 'Basic speed'],
      icon: '⭐',
      current: currentPlan === 'free',
    },
    {
      id: 'creator',
      name: 'Creator',
      price: billingCycle === 'monthly' ? 29 : getAnnualPrice(29),
      credits: 400,
      features: ['400 credits/month', 'No watermarks', 'Standard processing', 'Email support', '100% rollover (up to 800)'],
      current: currentPlan === 'creator',
      icon: '🏆',
    },
    {
      id: 'studio',
      name: 'Studio',
      price: billingCycle === 'monthly' ? 99 : getAnnualPrice(99),
      credits: 1600,
      features: ['1,600 credits/month', 'Priority processing', 'Priority support', 'API access', '100% rollover (up to 3,200)'],
      icon: '💎',
      current: currentPlan === 'studio',
    },
  ];

  // Helper to determine button label and action based on context
  // Handles: same plan different billing, upgrades, downgrades, new subscriptions
  const getButtonConfig = (plan: SubscriptionPlan): {
    label: string;
    disabled: boolean;
    action: 'none' | 'switch-annual' | 'switch-monthly' | 'upgrade' | 'downgrade' | 'subscribe';
    variant: 'active' | 'primary' | 'switch';
  } => {
    const selectedIsAnnual = billingCycle === 'annually';
    const userIsAnnual = isAnnual;
    const isSamePlan = plan.current;
    const isFreeUser = currentPlan === 'free';

    // Free plan card - show "Current" for free users, hide button for paid users
    // Paid users should use "Cancel Subscription" instead of downgrading to free
    if (plan.id === 'free') {
      if (isFreeUser) {
        return { label: 'Current Plan', disabled: true, action: 'none', variant: 'active' };
      }
      // Hide button for paid users - they use Cancel Subscription instead
      return { label: '', disabled: true, action: 'none', variant: 'active' };
    }

    // Current plan - check if billing cycle switch is needed
    if (isSamePlan) {
      // User is on this plan - check if they want to switch billing cycle
      if (selectedIsAnnual && !userIsAnnual) {
        // User is monthly, toggle shows annual → offer switch to annual
        return { label: 'Switch to Annual (Save 20%)', disabled: false, action: 'switch-annual', variant: 'switch' };
      }
      if (!selectedIsAnnual && userIsAnnual) {
        // User is annual, toggle shows monthly → offer switch to monthly
        return { label: 'Switch to Monthly', disabled: false, action: 'switch-monthly', variant: 'switch' };
      }
      // Same plan, same billing cycle
      return { label: 'Current Plan', disabled: true, action: 'none', variant: 'active' };
    }

    // Different plan - determine upgrade vs downgrade
    const planTiers = { free: 0, creator: 1, studio: 2 };
    const currentTier = planTiers[currentPlan as keyof typeof planTiers] ?? 0;
    const targetTier = planTiers[plan.id as keyof typeof planTiers] ?? 0;

    // FREE users don't have a subscription to upgrade - they need to subscribe (create new)
    if (isFreeUser) {
      return { label: 'Get Started', disabled: false, action: 'subscribe', variant: 'primary' };
    }

    // PAID users can upgrade or downgrade their existing subscription
    if (targetTier > currentTier) {
      return { label: 'Upgrade', disabled: false, action: 'upgrade', variant: 'primary' };
    }
    if (targetTier < currentTier) {
      return { label: 'Downgrade', disabled: false, action: 'downgrade', variant: 'primary' };
    }

    // Fallback
    return { label: 'Get Started', disabled: false, action: 'subscribe', variant: 'primary' };
  };

  // Handle plan button click based on computed action
  const handlePlanButtonClick = (plan: SubscriptionPlan) => {
    const config = getButtonConfig(plan);

    if (config.disabled || config.action === 'none') return;

    // Calculate prices for the modal
    const basePrice = plan.id === 'studio' ? 99 : plan.id === 'creator' ? 29 : 0;
    const monthlyPrice = basePrice;
    const annualPrice = Math.round(basePrice * 0.8 * 12);

    const planForModal = {
      id: plan.id,
      name: plan.name,
      price: billingCycle === 'monthly' ? monthlyPrice : Math.round(basePrice * 0.8),
      annualPrice: annualPrice,
      credits: plan.credits,
      icon: plan.icon,
      features: plan.features,
      effectiveRate: 0.073,
      billingCycle: billingCycle,
    };

    setSelectedSubscriptionPlan(planForModal);

    switch (config.action) {
      case 'switch-annual':
        setSubscriptionModalType('annual');
        break;
      case 'switch-monthly':
        setSubscriptionModalType('monthly');
        break;
      case 'upgrade':
        setSubscriptionModalType('upgrade');
        break;
      case 'downgrade':
        setSubscriptionModalType('downgrade');
        break;
      case 'subscribe':
        // For new subscriptions, always use 'subscribe' type
        // The annual flag is passed via isAnnual prop to the modal
        setSubscriptionModalType('subscribe');
        break;
    }

    setIsSubscriptionModalOpen(true);
  };

  // Open Stripe Customer Portal
  const handleManagePaymentMethods = async () => {
    try {
      const response = await createCustomerPortalSession();
      window.location.href = response.url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to open payment portal. Please try again.');
      }
    }
  };

  // Sync billing period from Stripe (for legacy users with missing data)
  const handleSyncBillingPeriod = async (): Promise<string | null> => {
    setIsSyncingBillingPeriod(true);
    try {
      const response = await syncBillingPeriod();
      if (response.billing_period) {
        toast.success(`Billing period synced: ${response.billing_period === 'year' ? 'Annual' : 'Monthly'}`);
        // Refresh profile to get updated billing_period
        if (refreshProfile) {
          await refreshProfile();
        }
        return response.billing_period;
      }
      return null;
    } catch (error) {
      console.error('Failed to sync billing period:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sync billing period. Please try again.');
      }
      return null;
    } finally {
      setIsSyncingBillingPeriod(false);
    }
  };

  // Auto-sync billing period if missing for paid subscribers
  useEffect(() => {
    if (hasMissingBillingPeriod && !isSyncingBillingPeriod) {
      console.log('Detected missing billing_period for paid subscriber, syncing from Stripe...');
      handleSyncBillingPeriod();
    }
  }, [hasMissingBillingPeriod]);

  const handlePurchaseCredits = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setIsBuyModalOpen(true);
  };

  const handleProceedToCheckout = async (packageId: string) => {
    setErrorMessage(null);
    if (!user) {
      setErrorMessage('Please log in to purchase credits.');
      setIsBuyModalOpen(false);
      setTimeout(() => router.push('/login?redirect=/billing'), 2000);
      return;
    }

    setIsLoading(true);
    try {
      const { checkout_url } = await createCheckoutSession(packageId);
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      setIsBuyModalOpen(false);
      if (error instanceof ApiError) {
        setErrorMessage(`Checkout failed: ${error.message}`);
      } else {
        setErrorMessage('Unable to start checkout. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradePlan = (plan: SubscriptionPlan) => {
    // Calculate monthly and annual prices based on base price (29 for creator, 99 for studio)
    const basePrice = plan.id === 'studio' ? 99 : plan.id === 'creator' ? 29 : 0;
    const monthlyPrice = basePrice;
    const annualPrice = Math.round(basePrice * 0.8 * 12); // 20% off for annual

    setSelectedSubscriptionPlan({
      id: plan.id,
      name: plan.name,
      price: billingCycle === 'monthly' ? monthlyPrice : Math.round(basePrice * 0.8),
      annualPrice: annualPrice,
      credits: plan.credits,
      icon: plan.icon,
      features: plan.features,
      effectiveRate: 0.073,
      billingCycle: billingCycle, // Pass the selected billing cycle
    });

    // Users on Free tier need 'subscribe', not 'upgrade' (they don't have a subscription yet)
    // Note: 'annual' type is for SWITCHING existing subscriptions, not for new ones
    // Free users always use 'subscribe' - the annual flag is passed via isAnnual prop
    if (currentPlan === 'free') {
      setSubscriptionModalType('subscribe');
    } else {
      const currentPlanIndex = subscriptionPlans.findIndex(p => p.current);
      const newPlanIndex = subscriptionPlans.findIndex(p => p.id === plan.id);

      if (newPlanIndex > currentPlanIndex) {
        setSubscriptionModalType('upgrade');
      } else if (newPlanIndex < currentPlanIndex) {
        setSubscriptionModalType('downgrade');
      } else {
        setSubscriptionModalType('subscribe');
      }
    }

    setIsSubscriptionModalOpen(true);
  };


  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-6 h-6 text-[#00F0D9]" />
          <h1 className="text-[#F1F5F9]">Billing & Credits</h1>
        </div>
      </div>

      <div className="h-px bg-[#334155] mb-8"></div>

      {/* Error Message */}
      {errorMessage && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Low Balance Warning */}
      {credits !== null && credits < 10 && showLowBalanceWarning && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="text-amber-500">
              Low balance: You have {credits} credits remaining.
            </span>
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
              onClick={() => {
                setSelectedPackage(creditPackages[1]);
                setIsBuyModalOpen(true);
              }}
            >
              Buy Credits
            </Button>
          </div>
          <button
            onClick={() => setShowLowBalanceWarning(false)}
            className="text-amber-500 hover:text-amber-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Balance and Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <BalanceCard
          credits={credits}
          creditValue={creditValue}
          onBuyCredits={() => {
            setSelectedPackage(creditPackages[1]);
            setIsBuyModalOpen(true);
          }}
        />
        <ActivePlanCard
          currentPlan={currentPlan}
          nextBillingDate={nextBillingDate}
          isAnnual={isAnnual}
          onUpgrade={() => {
            const isOnFree = currentPlan === 'free';
            const targetPlan = isOnFree ? {
              id: 'creator',
              name: 'Creator',
              price: 29,
              credits: 400,
              icon: '🏆',
              features: [
                '400 credits per month',
                'No watermarks',
                'Standard processing',
                'Email support',
                '100% rollover (up to 800)',
              ],
              effectiveRate: 0.073,
            } : {
              id: 'studio',
              name: 'Studio',
              price: 99,
              credits: 1600,
              icon: '💎',
              features: [
                '1,200 more credits per month',
                'Up to 8K resolution',
                '24/7 premium support',
                'Priority processing queue',
                'Advanced API access',
                'Custom models',
                'Videos stored 90 days (vs 30)',
              ],
              effectiveRate: 0.062,
            };
            setSelectedSubscriptionPlan(targetPlan);
            setSubscriptionModalType(isOnFree ? 'subscribe' : 'upgrade');
            setIsSubscriptionModalOpen(true);
          }}
          onCancel={() => {
            setSelectedSubscriptionPlan({
              id: currentPlan,
              name: currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1),
              price: currentPlan === 'creator' ? 29 : currentPlan === 'studio' ? 99 : 0,
              credits: currentPlan === 'creator' ? 400 : currentPlan === 'studio' ? 1600 : 25,
              icon: currentPlan === 'studio' ? '💎' : currentPlan === 'creator' ? '🏆' : '⭐',
              features: [],
            });
            setSubscriptionModalType('cancel');
            setIsSubscriptionModalOpen(true);
          }}
        />
      </div>

      {/* Buy Credits Section */}
      <div id="buy-credits" className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Buy Credits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative border rounded-2xl p-6 bg-[#0F172A] hover:border-[#00F0D9] transition-all hover:transform hover:scale-105 ${
                pkg.popular ? 'border-[#00F0D9] shadow-lg shadow-[#00F0D9]/20' : 'border-[#334155]'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white px-4 py-1 rounded-full text-sm">
                  ⭐ BEST VALUE
                </div>
              )}

              <div className="text-center">
                <h3 className="text-[#F1F5F9] mb-3">{pkg.name}</h3>
                <div className="text-[#F1F5F9] text-3xl mb-1">{pkg.credits}</div>
                <div className="text-[#94A3B8] text-sm mb-4">Credits</div>
                <div className="text-[#F1F5F9] text-2xl mb-1">${pkg.price}</div>
                <div className="text-[#94A3B8] text-sm mb-6">
                  ${pkg.pricePerCredit.toFixed(2)}/credit
                </div>
                <Button
                  onClick={() => handlePurchaseCredits(pkg)}
                  disabled={isLoading}
                  className={pkg.popular
                    ? 'w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white'
                    : 'w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'
                  }
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Subscription Plans</h2>
        </div>

        {/* Billing Cycle Toggle - Centered */}
        <div className="flex justify-center mb-8">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annually')} className="inline-block">
            <TabsList className="bg-[#1E293B] border border-[#334155] h-12 p-1">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-[#334155] px-6 py-2 text-base">Monthly</TabsTrigger>
              <TabsTrigger value="annually" className="data-[state=active]:bg-[#334155] px-6 py-2 text-base">
                Annually
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30 text-sm">Save 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-2xl p-6 bg-[#0F172A] ${
                plan.current ? 'border-[#00F0D9]' : 'border-[#334155]'
              }`}
            >
              <div className="text-center mb-4">
                <span className="text-4xl mb-2 block">{plan.icon}</span>
                <h3 className="text-[#F1F5F9] mb-1">{plan.name}</h3>
                {plan.current && (
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Badge className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-0">
                      CURRENT
                    </Badge>
                    {/* Show billing period for paid plans */}
                    {plan.id !== 'free' && billingPeriod && (
                      <Badge className={isAnnual
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }>
                        {isAnnual ? 'Annual' : 'Monthly'}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="text-[#F1F5F9] text-3xl mb-1">
                  ${plan.price}
                </div>
                <div className="text-[#94A3B8] text-sm">
                  {plan.price === 0 ? 'forever' : billingCycle === 'annually' ? '/mo (billed annually)' : 'per month'}
                </div>
                {billingCycle === 'annually' && plan.price > 0 && (
                  <div className="text-green-400 text-xs mt-1">
                    Save ${Math.round((plan.id === 'studio' ? 99 : 29) * 0.2 * 12)}/year
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-[#94A3B8] text-sm">
                    <Check className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {(() => {
                const config = getButtonConfig(plan);
                // Don't render button if label is empty (e.g., Free plan for paid users)
                if (!config.label) return null;
                return (
                  <Button
                    onClick={() => handlePlanButtonClick(plan)}
                    disabled={config.disabled}
                    className={
                      config.variant === 'active'
                        ? 'w-full border-[#334155] text-[#94A3B8]'
                        : config.variant === 'switch'
                          ? 'w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white'
                          : 'w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white'
                    }
                    variant={config.variant === 'active' ? 'outline' : 'default'}
                  >
                    {config.label}
                  </Button>
                );
              })()}
            </div>
          ))}
        </div>

        {/* Special Offers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Current Billing Status - Only show for paid subscribers */}
          {currentPlan !== 'free' && (
            <div className={`border rounded-xl p-6 bg-gradient-to-br ${isAnnual ? 'border-[#00F0D9]/30 from-[#00F0D9]/5' : 'border-blue-500/30 from-blue-500/5'} to-transparent`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={`w-5 h-5 ${isAnnual ? 'text-[#00F0D9]' : 'text-blue-400'}`} />
                <h3 className="text-[#F1F5F9]">
                  {isAnnual ? 'Annual Billing Active' : 'Monthly Billing Active'}
                </h3>
              </div>
              <p className="text-[#94A3B8] text-sm mb-4">
                {isAnnual
                  ? 'You\'re saving 20% with annual billing!'
                  : 'Switch to annual using the toggle above to save 20%'}
              </p>
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                <Check className="w-4 h-4 text-[#00F0D9]" />
                <span>Next billing: {nextBillingDate}</span>
              </div>
            </div>
          )}

          {/* Founding Member */}
          <div className="border border-amber-500/30 rounded-xl p-6 bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-[#F1F5F9]">Become a Founding Member 🏆</h3>
            </div>
            <p className="text-[#94A3B8] text-sm mb-4">
              20% lifetime discount • Only 23 spots left!
            </p>
            <Button
              onClick={() => {
                setSelectedSubscriptionPlan({
                  id: 'creator',
                  name: 'Creator',
                  price: 29,
                  credits: 400,
                  icon: '🏆',
                  features: [
                    '400 credits per month',
                    'No watermarks',
                    'Up to 1080p resolution',
                    'Priority support',
                    'All post-processing tools',
                    'API access',
                  ],
                });
                setSubscriptionModalType('founding');
                setIsSubscriptionModalOpen(true);
              }}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 text-white"
            >
              Claim Your Spot
            </Button>
          </div>
        </div>

        {/* Enterprise Option */}
        <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Building2 className="w-8 h-8 text-[#00F0D9]" />
            <div>
              <h3 className="text-[#F1F5F9] mb-1">Enterprise</h3>
              <p className="text-[#94A3B8] text-sm">
                Custom pricing • Unlimited credits • Dedicated support • SLA
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
            Contact Sales
          </Button>
        </div>
      </div>

      {/* Auto-Refill Option */}
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Auto-Refill</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={autoRefillEnabled}
              onCheckedChange={setAutoRefillEnabled}
              disabled={autoRefillLoading}
            />
            <span className="text-[#F1F5F9]">Enable auto-refill</span>
          </div>

          {autoRefillEnabled && (
            <div className="ml-11 space-y-4 border-l-2 border-[#334155] pl-4">
              <div className="space-y-2">
                <Label className="text-[#94A3B8]">Refill when balance drops below</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={100}
                    value={autoRefillThreshold}
                    onChange={(e) => setAutoRefillThreshold(Number(e.target.value))}
                    className="w-24 bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                  />
                  <span className="text-[#94A3B8]">credits</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#94A3B8]">Package to purchase</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {creditPackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setAutoRefillPackage(pkg.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        autoRefillPackage === pkg.id
                          ? 'border-[#00F0D9] bg-[#00F0D9]/10'
                          : 'border-[#334155] hover:border-[#00F0D9]/50'
                      }`}
                    >
                      <p className="text-[#F1F5F9] font-medium">{pkg.name}</p>
                      <p className="text-[#94A3B8] text-sm">{pkg.credits} credits</p>
                      <p className="text-[#00F0D9] text-sm">${pkg.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={async () => {
                try {
                  await handleSaveAutoRefill();
                  toast.success('Auto-refill settings saved successfully');
                } catch (err) {
                  if (err instanceof ApiError) {
                    toast.error(err.message);
                  } else {
                    toast.error('Failed to save auto-refill settings');
                  }
                }
              }}
              disabled={autoRefillSaving || autoRefillLoading}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              {autoRefillSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            <p className="text-[#94A3B8] text-sm">
              {autoRefillEnabled
                ? `Credits will be purchased automatically when your balance drops below ${autoRefillThreshold} credits.`
                : 'Enable auto-refill to never run out of credits.'}
            </p>
          </div>
        </div>
      </div>

      {/* Manage Billing in Stripe - Only show for paid users */}
      {currentPlan !== 'free' && (
        <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#3B1FE2]/20 flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#3B1FE2]" />
              </div>
              <div>
                <h2 className="text-[#F1F5F9] text-lg font-medium">Manage Subscription</h2>
                <p className="text-[#94A3B8] text-sm">
                  Update payment methods, view invoices, or cancel your subscription
                </p>
              </div>
            </div>
            <Button
              onClick={handleManagePaymentMethods}
              size="lg"
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8 py-6 text-lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open Stripe Portal
            </Button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <TransactionHistorySection
        transactions={transactions}
        isLoading={transactionsLoading}
        error={transactionsError}
        page={transactionPage}
        total={transactionTotal}
        hasMore={hasMoreTransactions}
        onPageChange={setTransactionPage}
        onRefresh={fetchTransactions}
      />

      {/* Purchase Credits Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9]">Confirm Purchase</DialogTitle>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-[#94A3B8] mb-2">{selectedPackage.name} Package</div>
                <div className="text-[#F1F5F9] text-3xl">{selectedPackage.credits} Credits</div>
              </div>

              <div className="border border-[#334155] rounded-lg p-4 bg-[#0F172A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#94A3B8]">Payment Method:</span>
                  <Button variant="link" className="text-[#00F0D9] p-0 h-auto">
                    Change
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-[#F1F5F9]">
                  <span className="text-2xl">💳</span>
                  <span>Visa •••• 4242</span>
                </div>
              </div>

              <div className="h-px bg-[#334155]"></div>

              <div className="flex items-center justify-between text-xl">
                <span className="text-[#94A3B8]">Total:</span>
                <span className="text-[#F1F5F9]">${selectedPackage.price.toFixed(2)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPurchaseModal(false)}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowPurchaseModal(false)}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9]">
              Upgrade to {selectedPlan?.name} Plan
            </DialogTitle>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Current:</span>
                  <span className="text-[#F1F5F9]">Creator ($29/mo)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">New:</span>
                  <span className="text-[#F1F5F9]">{selectedPlan.name} (${selectedPlan.price}/mo)</span>
                </div>
              </div>

              <div className="border border-[#334155] rounded-lg p-4 bg-[#0F172A]">
                <div className="text-[#94A3B8] mb-3">Benefits:</div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#F1F5F9] text-sm">
                    <Check className="w-4 h-4 text-[#00F0D9]" />
                    +{selectedPlan.credits - 50} credits/month
                  </li>
                  <li className="flex items-center gap-2 text-[#F1F5F9] text-sm">
                    <Check className="w-4 h-4 text-[#00F0D9]" />
                    Priority processing
                  </li>
                  <li className="flex items-center gap-2 text-[#F1F5F9] text-sm">
                    <Check className="w-4 h-4 text-[#00F0D9]" />
                    API access
                  </li>
                </ul>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Prorated credit:</span>
                  <span className="text-[#F1F5F9]">$15.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">First charge:</span>
                  <span className="text-[#F1F5F9]">$83.50 (Dec 11)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Then:</span>
                  <span className="text-[#F1F5F9]">${selectedPlan.price}/mo starting Jan 11</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowUpgradeModal(false)}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Modal */}
      <Dialog open={showAddCardModal} onOpenChange={setShowAddCardModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9]">Add Payment Method</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number" className="text-[#94A3B8]">Card Number</Label>
              <div className="relative">
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">💳</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-[#94A3B8]">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM / YY"
                  className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-[#94A3B8]">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip" className="text-[#94A3B8]">Billing ZIP</Label>
              <Input
                id="zip"
                placeholder="12345"
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch id="default-payment" />
              <Label htmlFor="default-payment" className="text-[#F1F5F9] cursor-pointer">
                Set as default payment method
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddCardModal(false)}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowAddCardModal(false)}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        selectedPackage={selectedPackage}
        onProceed={handleProceedToCheckout}
        isProcessing={isLoading}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        type={subscriptionModalType}
        currentPlan={{
          id: currentPlan,
          name: currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1),
          price: currentPlan === 'creator' ? 29 : currentPlan === 'studio' ? 99 : 0,
          annualPrice: currentPlan === 'creator' ? 276 : currentPlan === 'studio' ? 948 : 0,
          credits: currentPlan === 'creator' ? 400 : currentPlan === 'studio' ? 1600 : 25,
          icon: currentPlan === 'studio' ? '💎' : currentPlan === 'creator' ? '🏆' : '⭐',
          features: currentPlan === 'creator' ? [
            '400 credits per month',
            'No watermarks',
            'Up to 1080p resolution',
            'Priority support',
            'API access',
          ] : [],
        }}
        selectedPlan={selectedSubscriptionPlan}
        isAnnual={billingCycle === 'annually'}
      />
    </main>
  );
}
