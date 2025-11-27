import { useState } from 'react';
import {
  CreditCard,
  Zap,
  Check,
  AlertCircle,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Edit,
  Trash2,
  FileText,
  Crown,
  Sparkles,
  Building2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Link } from 'react-router-dom';
import { BuyCreditsModal } from '../components/BuyCreditsModal';
import { SubscriptionModal } from '../components/SubscriptionModal';

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

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  subDescription?: string;
  amount?: number;
  credits?: number;
  status: 'success' | 'pending' | 'failed' | 'refund';
  hasInvoice?: boolean;
}

export default function BillingPage() {
  const [credits] = useState(25);
  const [creditValue] = useState(12.50);
  const [currentPlan] = useState('creator');
  const [nextBillingDate] = useState('Dec 11');
  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [autoRefill, setAutoRefill] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionModalType, setSubscriptionModalType] = useState<'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'founding'>('subscribe');
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<any>(null);

  const creditPackages: CreditPackage[] = [
    { id: 'starter', name: 'Starter', credits: 10, price: 10, pricePerCredit: 1.00 },
    { id: 'popular', name: 'Popular', credits: 50, price: 40, pricePerCredit: 0.80, popular: true },
    { id: 'pro', name: 'Pro', credits: 100, price: 70, pricePerCredit: 0.70 },
    { id: 'bulk', name: 'Bulk', credits: 500, price: 300, pricePerCredit: 0.60 },
  ];

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      credits: 5,
      features: ['5 credits/month', 'Watermarked output', 'Basic speed'],
      icon: '⭐',
    },
    {
      id: 'creator',
      name: 'Creator',
      price: 29,
      credits: 50,
      features: ['50 credits/month', 'No watermarks', 'Standard processing', 'Email support'],
      current: true,
      icon: '🏆',
    },
    {
      id: 'studio',
      name: 'Studio',
      price: 99,
      credits: 200,
      features: ['200 credits/month', 'Priority processing', 'Priority support', 'API access'],
      icon: '💎',
    },
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: '1', brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
    { id: '2', brand: 'Mastercard', last4: '5555', expiry: '03/27', isDefault: false },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      date: 'Nov 11, 2:34 PM',
      description: 'Credit Purchase',
      amount: 40,
      credits: 50,
      status: 'success',
      hasInvoice: true,
    },
    {
      id: '2',
      date: 'Nov 10, 4:22 PM',
      description: 'Video Generation',
      subDescription: '(job-mno-345)',
      credits: -2,
      status: 'success',
    },
    {
      id: '3',
      date: 'Nov 9, 12:00 AM',
      description: 'Subscription Renewal',
      subDescription: 'Creator Plan',
      amount: 29,
      credits: 50,
      status: 'success',
      hasInvoice: true,
    },
    {
      id: '4',
      date: 'Nov 8, 3:15 PM',
      description: 'Refund',
      subDescription: 'Failed job',
      amount: 10,
      credits: 5,
      status: 'refund',
    },
  ];

  const handlePurchaseCredits = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setIsBuyModalOpen(true);
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
    
    // Determine if it's an upgrade or downgrade
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

  const getStatusBadge = (status: Transaction['status']) => {
    const badges = {
      success: '✅',
      pending: '⏳',
      failed: '❌',
      refund: '💚',
    };
    return badges[status];
  };

  const getCardBrandIcon = (brand: string) => {
    return '💳';
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
          <Link to="/payment-success?credits=400">
            <Button
              size="sm"
              variant="outline"
              className="border-[#00F0D9]/30 text-[#00F0D9] hover:bg-[#00F0D9]/10"
            >
              Payment Success
            </Button>
          </Link>
          <Link to="/subscription-success?plan=creator">
            <Button
              size="sm"
              variant="outline"
              className="border-[#00F0D9]/30 text-[#00F0D9] hover:bg-[#00F0D9]/10"
            >
              Subscription Success
            </Button>
          </Link>
          <Link to="/payment-cancelled">
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

      {/* Low Balance Warning */}
      {credits < 10 && showLowBalanceWarning && (
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
                setSelectedPackage(creditPackages[1]); // Popular package
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
            <span className="text-[#F1F5F9] text-4xl">{credits}</span>
            <span className="text-[#94A3B8] text-xl">Credits</span>
          </div>
          <div className="text-[#94A3B8] text-sm mb-6">
            Worth: ${creditValue.toFixed(2)}
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            onClick={() => {
              setSelectedPackage(creditPackages[1]); // Popular package
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
            <span className="text-4xl">🏆</span>
            <span className="text-[#F1F5F9] text-2xl">Creator</span>
          </div>
          <div className="text-[#94A3B8] text-sm mb-1">$29/month</div>
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
                id: 'creator',
                name: 'Creator',
                price: 29,
                credits: 400,
                icon: '🏆',
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
              <Switch checked={autoRefill} onCheckedChange={setAutoRefill} />
              <span className="text-[#F1F5F9]">Auto-refill when balance drops below 10 credits</span>
            </div>
            {autoRefill && (
              <div className="ml-11 flex items-center gap-3">
                <span className="text-[#94A3B8] text-sm">Package:</span>
                <Select defaultValue="popular">
                  <SelectTrigger className="w-48 bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    {creditPackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id} className="text-[#F1F5F9]">
                        {pkg.name} ({pkg.credits} credits)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                  Save Settings
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Payment Methods</h2>
        </div>

        <div className="space-y-4 mb-6">
          {paymentMethods.map((method) => (
            <div key={method.id} className="border border-[#334155] rounded-xl p-4 bg-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getCardBrandIcon(method.brand)}</span>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F1F5F9]">
                      {method.brand} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <Badge className="bg-[#00F0D9]/10 text-[#00F0D9] border-[#00F0D9]/20">
                        DEFAULT
                      </Badge>
                    )}
                  </div>
                  <span className="text-[#94A3B8] text-sm">
                    Expires {method.expiry}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setShowAddCardModal(true)}
          variant="outline"
          className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Transaction History */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Transaction History</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#94A3B8] text-sm mr-2">Filters:</span>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger className="w-40 bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#334155]">
                <SelectItem value="all" className="text-[#F1F5F9]">All</SelectItem>
                <SelectItem value="credits" className="text-[#F1F5F9]">Credits</SelectItem>
                <SelectItem value="subscriptions" className="text-[#F1F5F9]">Subscriptions</SelectItem>
                <SelectItem value="refunds" className="text-[#F1F5F9]">Refunds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#00F0D9]"
              />
            </div>
            <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#334155] rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E293B]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#94A3B8] text-sm">Date</th>
                  <th className="px-4 py-3 text-left text-[#94A3B8] text-sm">Description</th>
                  <th className="px-4 py-3 text-right text-[#94A3B8] text-sm">Amount</th>
                  <th className="px-4 py-3 text-right text-[#94A3B8] text-sm">Credits</th>
                  <th className="px-4 py-3 text-center text-[#94A3B8] text-sm">Status</th>
                  <th className="px-4 py-3 text-center text-[#94A3B8] text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={index !== transactions.length - 1 ? 'border-b border-[#334155]' : ''}
                  >
                    <td className="px-4 py-4 text-[#94A3B8] text-sm whitespace-nowrap">
                      {transaction.date}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[#F1F5F9]">{transaction.description}</div>
                      {transaction.subDescription && (
                        <div className="text-[#94A3B8] text-sm">{transaction.subDescription}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-[#F1F5F9]">
                      {transaction.amount ? `$${transaction.amount}` : '-'}
                    </td>
                    <td className="px-4 py-4 text-right text-[#F1F5F9]">
                      {transaction.credits ? (
                        <span className={transaction.credits > 0 ? 'text-green-500' : 'text-red-400'}>
                          {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-xl">{getStatusBadge(transaction.status)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {transaction.hasInvoice && (
                        <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                          <Download className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-[#94A3B8] text-sm">
            Showing 1-10 of 114
          </span>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-[#94A3B8]">
              Page {currentPage} of 12
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === 12}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
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
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        type={subscriptionModalType}
        currentPlan={{
          id: 'creator',
          name: 'Creator',
          price: 29,
          annualPrice: 276,
          credits: 400,
          icon: '🏆',
          features: [
            '400 credits per month',
            'No watermarks',
            'Up to 4K resolution',
            'Priority support',
            'API access',
          ],
        }}
        selectedPlan={selectedSubscriptionPlan}
      />
    </main>
  );
}
