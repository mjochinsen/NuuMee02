'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CreditCard,
  Zap,
  Check,
  AlertCircle,
  X,
  Plus,
  FileText,
  Crown,
  Sparkles,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
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
import { createCheckoutSession, ApiError, getTransactions, CreditTransaction, TransactionType, TransactionStatus, getAutoRefillSettings, updateAutoRefillSettings, AutoRefillSettings, getPaymentMethods, PaymentMethod, createCustomerPortalSession, syncBillingPeriod } from '@/lib/api';
import { BuyCreditsModal } from '@/components/BuyCreditsModal';
import { SubscriptionModal } from '@/components/SubscriptionModal';

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
  const creditValue = (credits ?? 0) * 0.50;
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [autoRefillEnabled, setAutoRefillEnabled] = useState(false);
  const [autoRefillThreshold, setAutoRefillThreshold] = useState(10);
  const [autoRefillPackage, setAutoRefillPackage] = useState('starter');
  const [autoRefillLoading, setAutoRefillLoading] = useState(false);
  const [autoRefillSaving, setAutoRefillSaving] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionModalType, setSubscriptionModalType] = useState<'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'monthly' | 'founding'>('subscribe');
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transaction state
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
  const transactionPageSize = 10;

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

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

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    setTransactionsLoading(true);
    setTransactionsError(null);

    try {
      const response = await getTransactions(transactionPage, transactionPageSize);
      setTransactions(response.transactions);
      setTransactionTotal(response.total);
      setHasMoreTransactions(response.has_more);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      if (error instanceof ApiError) {
        setTransactionsError(error.message);
      } else {
        setTransactionsError('Failed to load transaction history');
      }
    } finally {
      setTransactionsLoading(false);
    }
  }, [user, transactionPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch auto-refill settings
  const fetchAutoRefillSettings = useCallback(async () => {
    if (!user) return;

    setAutoRefillLoading(true);
    try {
      const settings = await getAutoRefillSettings();
      setAutoRefillEnabled(settings.enabled);
      setAutoRefillThreshold(settings.threshold);
      setAutoRefillPackage(settings.package_id);
    } catch (error) {
      console.error('Failed to fetch auto-refill settings:', error);
    } finally {
      setAutoRefillLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAutoRefillSettings();
  }, [fetchAutoRefillSettings]);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!user) return;

    setPaymentMethodsLoading(true);
    try {
      const response = await getPaymentMethods();
      setPaymentMethods(response.payment_methods);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

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

  // Save auto-refill settings
  const handleSaveAutoRefill = async () => {
    setAutoRefillSaving(true);
    try {
      await updateAutoRefillSettings({
        enabled: autoRefillEnabled,
        threshold: autoRefillThreshold,
        package_id: autoRefillPackage,
      });
    } catch (error) {
      console.error('Failed to save auto-refill settings:', error);
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      }
    } finally {
      setAutoRefillSaving(false);
    }
  };

  // Helper to format transaction type for display
  const getTransactionTypeLabel = (type: TransactionType | string): string => {
    const labels: Record<string, string> = {
      purchase: 'Credit Purchase',
      subscription: 'Subscription Credits',
      subscription_renewal: 'Subscription Renewal',
      subscription_upgrade: 'Plan Upgrade',
      subscription_downgrade: 'Plan Downgrade',
      subscription_cancel: 'Plan Canceled',
      billing_switch_annual: 'Switched to Annual',
      billing_switch_monthly: 'Switched to Monthly',
      referral: 'Referral Bonus',
      job_usage: 'Job Usage',
      refund: 'Refund',
      bonus: 'Bonus Credits',
    };
    return labels[type] || type;
  };

  // Helper to get transaction type badge color
  const getTransactionBadgeColor = (type: TransactionType | string): string => {
    const colors: Record<string, string> = {
      purchase: 'bg-blue-500/20 text-blue-400',
      subscription: 'bg-purple-500/20 text-purple-400',
      subscription_renewal: 'bg-purple-500/20 text-purple-400',
      subscription_upgrade: 'bg-green-500/20 text-green-400',
      subscription_downgrade: 'bg-amber-500/20 text-amber-400',
      subscription_cancel: 'bg-red-500/20 text-red-400',
      billing_switch_annual: 'bg-green-500/20 text-green-400',
      billing_switch_monthly: 'bg-blue-500/20 text-blue-400',
      referral: 'bg-green-500/20 text-green-400',
      job_usage: 'bg-orange-500/20 text-orange-400',
      refund: 'bg-amber-500/20 text-amber-400',
      bonus: 'bg-cyan-500/20 text-cyan-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  // Helper to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to format date with time for table
  const formatDateWithTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to get status badge color
  const getStatusBadgeColor = (status: TransactionStatus | string): string => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // Helper to format status label
  const getStatusLabel = (status: TransactionStatus | string): string => {
    const labels: Record<string, string> = {
      completed: 'Success',
      pending: 'Pending',
      failed: 'Failed',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  };

  // Helper to format dollar amount
  const formatAmount = (amountCents: number | null): string => {
    if (amountCents === null || amountCents === undefined) return '-';
    return `$${(amountCents / 100).toFixed(2)}`;
  };


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
    if (currentPlan === 'free') {
      // If user selected annual billing, use 'annual' type for new subscription
      setSubscriptionModalType(billingCycle === 'annually' ? 'annual' : 'subscribe');
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

      {/* Test Links for Payment Pages */}
      <div className="border border-[#00F0D9]/30 bg-[#00F0D9]/5 rounded-lg p-4 mb-6">
        <p className="text-[#F1F5F9] mb-3 text-sm">🧪 Test Payment Pages:</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/payment/success?credits=400">
            <Button
              size="sm"
              variant="outline"
              className="border-[#00F0D9]/30 text-[#00F0D9] hover:bg-[#00F0D9]/10"
            >
              Payment Success
            </Button>
          </Link>
          <Link href="/subscription/success?plan=creator">
            <Button
              size="sm"
              variant="outline"
              className="border-[#00F0D9]/30 text-[#00F0D9] hover:bg-[#00F0D9]/10"
            >
              Subscription Success
            </Button>
          </Link>
          <Link href="/payment/cancelled">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              Payment Cancelled
            </Button>
          </Link>
        </div>
      </div>

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
        {/* Current Balance */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <h3 className="text-[#94A3B8] mb-4">Current Balance</h3>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-[#00F0D9]" />
            <span className="text-[#F1F5F9] text-4xl">{credits === null ? '...' : credits}</span>
            <span className="text-[#94A3B8] text-xl">Credits</span>
          </div>
          <div className="text-[#94A3B8] text-sm mb-6">
            Worth: ${creditValue.toFixed(2)}
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            onClick={() => {
              setSelectedPackage(creditPackages[1]);
              setIsBuyModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Buy Credits
          </Button>
        </div>

        {/* Active Plan */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <h3 className="text-[#94A3B8] mb-4">Active Plan</h3>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{currentPlan === 'studio' ? '💎' : currentPlan === 'creator' ? '🏆' : '⭐'}</span>
            <span className="text-[#F1F5F9] text-2xl capitalize">{currentPlan}</span>
          </div>
          <div className="text-[#94A3B8] text-sm mb-1">
            {currentPlan === 'free' ? 'Free' : currentPlan === 'creator' ? '$29/month' : '$99/month'}
          </div>
          <div className="text-[#94A3B8] text-sm mb-6">
            Next billing: {nextBillingDate}
          </div>
          {/* Only show Upgrade button if not already on Studio (highest plan) */}
          {currentPlan !== 'studio' && (
            <Button
              variant="outline"
              className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              onClick={() => {
                // Determine upgrade target based on current plan
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
            >
              {currentPlan === 'free' ? 'Subscribe to Creator' : 'Upgrade to Studio'}
            </Button>
          )}
          {/* Show "Highest Plan" badge for Studio users */}
          {currentPlan === 'studio' && (
            <div className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/30">
              <span className="text-[#00F0D9] text-sm">You're on the highest plan</span>
            </div>
          )}
          {/* Only show cancel for paid plans */}
          {currentPlan !== 'free' && (
            <button
              className="text-[#94A3B8] text-sm hover:text-[#F1F5F9] mt-3 w-full text-center"
              onClick={() => {
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
            >
              Cancel Subscription
            </button>
          )}
        </div>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#00F0D9]" />
            <h2 className="text-[#F1F5F9]">Subscription Plans</h2>
          </div>
          {/* Billing Cycle Toggle */}
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annually')} className="inline-block">
            <TabsList className="bg-[#1E293B] border border-[#334155]">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-[#334155] text-sm">Monthly</TabsTrigger>
              <TabsTrigger value="annually" className="data-[state=active]:bg-[#334155] text-sm">
                Annually
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">Save 20%</Badge>
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
                  <Badge className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-0 mb-2">
                    CURRENT
                  </Badge>
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

              <Button
                onClick={() => !plan.current && handleUpgradePlan(plan)}
                disabled={plan.current}
                className={plan.current
                  ? 'w-full border-[#334155] text-[#94A3B8]'
                  : 'w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white'
                }
                variant={plan.current ? 'outline' : 'default'}
              >
                {plan.current ? 'Active' : plan.price > 29 ? 'Upgrade' : 'Select'}
              </Button>
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
                    'Up to 4K resolution',
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
              onClick={handleSaveAutoRefill}
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

      {/* Payment Methods */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#00F0D9]" />
            <h2 className="text-[#F1F5F9]">Payment Methods</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPaymentMethods}
              disabled={paymentMethodsLoading}
              className="text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${paymentMethodsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManagePaymentMethods}
              className="border-[#00F0D9]/50 text-[#00F0D9] hover:bg-[#00F0D9]/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage in Stripe
            </Button>
          </div>
        </div>

        {/* Info Notice */}
        <div className="border border-[#334155] bg-[#1E293B] rounded-xl p-4 mb-6">
          <p className="text-[#94A3B8] text-sm text-center">
            Payment methods are saved automatically. Click "Manage in Stripe" to add, remove, or update cards.
          </p>
        </div>

        {/* Loading State */}
        {paymentMethodsLoading && paymentMethods.length === 0 && (
          <div className="text-center text-[#94A3B8] py-8">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
            <p>Loading payment methods...</p>
          </div>
        )}

        {/* Empty State */}
        {!paymentMethodsLoading && paymentMethods.length === 0 && (
          <div className="text-center text-[#94A3B8] py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No saved payment methods</p>
            <p className="text-sm mt-1">Your payment methods will appear here after your first purchase</p>
          </div>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length > 0 && (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  method.is_default
                    ? 'border-[#00F0D9]/50 bg-[#00F0D9]/5'
                    : 'border-[#334155] bg-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Card Brand Icon */}
                  <div className="w-12 h-8 rounded bg-white flex items-center justify-center">
                    {method.card?.brand === 'visa' && (
                      <span className="text-blue-600 font-bold text-sm">VISA</span>
                    )}
                    {method.card?.brand === 'mastercard' && (
                      <span className="text-red-500 font-bold text-sm">MC</span>
                    )}
                    {method.card?.brand === 'amex' && (
                      <span className="text-blue-500 font-bold text-sm">AMEX</span>
                    )}
                    {method.card?.brand === 'discover' && (
                      <span className="text-orange-500 font-bold text-sm">DISC</span>
                    )}
                    {!['visa', 'mastercard', 'amex', 'discover'].includes(method.card?.brand || '') && (
                      <CreditCard className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-[#F1F5F9]">
                      {method.card?.brand?.charAt(0).toUpperCase()}{method.card?.brand?.slice(1)} •••• {method.card?.last4}
                    </p>
                    <p className="text-[#94A3B8] text-sm">
                      Expires {method.card?.exp_month}/{method.card?.exp_year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.is_default && (
                    <Badge className="bg-[#00F0D9]/20 text-[#00F0D9] border-[#00F0D9]/30">
                      Default
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00F0D9]" />
            <h2 className="text-[#F1F5F9]">Transaction History</h2>
            {transactionTotal > 0 && (
              <Badge variant="outline" className="border-[#334155] text-[#94A3B8]">
                {transactionTotal} total
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTransactions}
            disabled={transactionsLoading}
            className="text-[#94A3B8] hover:text-[#F1F5F9]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${transactionsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {transactionsError && (
          <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm text-center">{transactionsError}</p>
          </div>
        )}

        {/* Loading State */}
        {transactionsLoading && transactions.length === 0 && (
          <div className="text-center text-[#94A3B8] py-8">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
            <p>Loading transactions...</p>
          </div>
        )}

        {/* Empty State */}
        {!transactionsLoading && transactions.length === 0 && !transactionsError && (
          <div className="text-center text-[#94A3B8] py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Your purchase and usage history will appear here</p>
          </div>
        )}

        {/* Transaction List - Table Format */}
        {transactions.length > 0 && (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-[#94A3B8] border-b border-[#334155]">
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Credits</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#334155]">
              {transactions.map((txn) => (
                <div
                  key={txn.transaction_id}
                  className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-[#1E293B]/50 transition-colors"
                >
                  {/* Date */}
                  <div className="col-span-2 text-[#94A3B8] text-sm">
                    {formatDateWithTime(txn.created_at)}
                  </div>

                  {/* Description */}
                  <div className="col-span-3">
                    <div className="text-[#F1F5F9] text-sm font-medium truncate">
                      {txn.description || getTransactionTypeLabel(txn.type)}
                    </div>
                    <Badge className={`text-xs mt-1 ${getTransactionBadgeColor(txn.type)}`}>
                      {getTransactionTypeLabel(txn.type)}
                    </Badge>
                  </div>

                  {/* Amount (Dollar) */}
                  <div className="col-span-2 text-right text-[#F1F5F9] text-sm">
                    {formatAmount(txn.amount_cents)}
                  </div>

                  {/* Credits */}
                  <div className={`col-span-2 text-right text-sm font-semibold ${txn.amount >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                    {txn.amount >= 0 ? '+' : ''}{txn.amount}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-center">
                    <Badge className={`text-xs border ${getStatusBadgeColor(txn.status || 'completed')}`}>
                      {getStatusLabel(txn.status || 'completed')}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 text-center">
                    {txn.receipt_url ? (
                      <a
                        href={txn.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#00F0D9] hover:bg-[#00F0D9]/10 transition-colors"
                        title="View Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[#64748B]">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {(transactionPage > 1 || hasMoreTransactions) && (
              <div className="flex items-center justify-between pt-4 border-t border-[#334155]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                  disabled={transactionPage === 1 || transactionsLoading}
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-[#94A3B8] text-sm">
                  Page {transactionPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransactionPage(p => p + 1)}
                  disabled={!hasMoreTransactions || transactionsLoading}
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

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
            'Up to 4K resolution',
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
