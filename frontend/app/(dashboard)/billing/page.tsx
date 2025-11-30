'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useAuth } from '@/components/AuthProvider';
import { createCheckoutSession, ApiError, getTransactions, CreditTransaction, TransactionType } from '@/lib/api';
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
  const { profile, user, loading } = useAuth();
  const router = useRouter();
  const credits = loading ? null : (profile?.credits_balance ?? 0);
  const creditValue = (credits ?? 0) * 0.50;
  const currentPlan = profile?.subscription_tier || 'free';
  const nextBillingDate = 'Dec 11';

  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [autoRefill, setAutoRefill] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionModalType, setSubscriptionModalType] = useState<'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'founding'>('subscribe');
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

  const creditPackages: CreditPackage[] = [
    { id: 'starter', name: 'Starter', credits: 120, price: 10, pricePerCredit: 0.083 },
    { id: 'popular', name: 'Popular', credits: 400, price: 30, pricePerCredit: 0.075, popular: true },
    { id: 'pro', name: 'Pro', credits: 1100, price: 75, pricePerCredit: 0.068 },
    { id: 'mega', name: 'Mega', credits: 2500, price: 150, pricePerCredit: 0.060 },
  ];

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
      price: 29,
      credits: 400,
      features: ['400 credits/month', 'No watermarks', 'Standard processing', 'Email support', '100% rollover (up to 800)'],
      current: currentPlan === 'creator',
      icon: '🏆',
    },
    {
      id: 'studio',
      name: 'Studio',
      price: 99,
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

  // Helper to format transaction type for display
  const getTransactionTypeLabel = (type: TransactionType): string => {
    const labels: Record<TransactionType, string> = {
      purchase: 'Credit Purchase',
      subscription: 'Subscription Credits',
      subscription_renewal: 'Subscription Renewal',
      referral: 'Referral Bonus',
      job_usage: 'Job Usage',
      refund: 'Refund',
      bonus: 'Bonus Credits',
    };
    return labels[type] || type;
  };

  // Helper to get transaction type badge color
  const getTransactionBadgeColor = (type: TransactionType): string => {
    const colors: Record<TransactionType, string> = {
      purchase: 'bg-blue-500/20 text-blue-400',
      subscription: 'bg-purple-500/20 text-purple-400',
      subscription_renewal: 'bg-purple-500/20 text-purple-400',
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
    setSelectedSubscriptionPlan({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      credits: plan.credits,
      icon: plan.icon,
      features: plan.features,
      effectiveRate: 0.073,
    });

    const currentPlanIndex = subscriptionPlans.findIndex(p => p.current);
    const newPlanIndex = subscriptionPlans.findIndex(p => p.id === plan.id);

    if (newPlanIndex > currentPlanIndex) {
      setSubscriptionModalType('upgrade');
    } else if (newPlanIndex < currentPlanIndex) {
      setSubscriptionModalType('downgrade');
    } else {
      setSubscriptionModalType('subscribe');
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
          <Button
            variant="outline"
            className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            onClick={() => {
              setSelectedSubscriptionPlan({
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
              });
              setSubscriptionModalType('upgrade');
              setIsSubscriptionModalOpen(true);
            }}
          >
            Upgrade Plan
          </Button>
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
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Subscription Plans</h2>
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
                  {plan.price === 0 ? 'forever' : 'per month'}
                </div>
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
          {/* Annual Billing */}
          <div className="border border-green-500/30 rounded-xl p-6 bg-gradient-to-br from-green-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              <h3 className="text-[#F1F5F9]">Save 20% with Annual Billing</h3>
            </div>
            <p className="text-[#94A3B8] text-sm mb-4">
              Switch to annual billing and save $72/year
            </p>
            <Button
              onClick={() => {
                setSubscriptionModalType('annual');
                setIsSubscriptionModalOpen(true);
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white"
            >
              Switch to Annual
            </Button>
          </div>

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
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Switch checked={autoRefill} onCheckedChange={setAutoRefill} disabled />
              <span className="text-[#F1F5F9]">Auto-refill when balance drops below 10 credits</span>
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">Coming Soon</Badge>
            </div>
            <p className="text-[#94A3B8] text-sm ml-11">
              Automatic credit top-ups will be available soon. You'll be able to set a threshold and automatically purchase credits when your balance runs low.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Payment Methods</h2>
        </div>

        {/* Coming Soon Notice */}
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 mb-6">
          <p className="text-amber-400 text-sm text-center">
            Payment methods are managed by Stripe. During checkout, you can save your card for future purchases.
          </p>
        </div>

        <div className="text-center text-[#94A3B8] py-8">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No saved payment methods</p>
          <p className="text-sm mt-1">Your payment methods will appear here after your first purchase</p>
        </div>
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

        {/* Transaction List */}
        {transactions.length > 0 && (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div
                key={txn.transaction_id}
                className="flex items-center justify-between p-4 border border-[#334155] rounded-xl bg-[#1E293B] hover:border-[#00F0D9]/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${txn.amount >= 0 ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                    {txn.amount >= 0 ? (
                      <ArrowDownRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#F1F5F9] font-medium">
                        {txn.description || getTransactionTypeLabel(txn.type)}
                      </span>
                      <Badge className={`text-xs ${getTransactionBadgeColor(txn.type)}`}>
                        {getTransactionTypeLabel(txn.type)}
                      </Badge>
                    </div>
                    <div className="text-[#94A3B8] text-sm">
                      {formatDate(txn.created_at)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${txn.amount >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                    {txn.amount >= 0 ? '+' : ''}{txn.amount} credits
                  </div>
                  {txn.balance_after !== null && (
                    <div className="text-[#94A3B8] text-sm">
                      Balance: {txn.balance_after}
                    </div>
                  )}
                </div>
              </div>
            ))}

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
      />
    </main>
  );
}
