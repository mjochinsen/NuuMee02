'use client';

import { useState } from 'react';
import { X, Check, AlertTriangle, AlertCircle, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PaymentMethodSelectorCompact } from '@/components/PaymentMethodSelector';
import { SuccessModal } from '@/components/SuccessModal';
import { createSubscription, cancelSubscription, upgradeSubscription, switchBillingPeriod, SubscriptionTier, ApiError } from '@/lib/api';
import {
  PlanComparisonCard,
  FeatureList,
  BillingSection,
  InfoBanner,
  ActionButtons,
} from '@/components/subscription-modal';

interface Plan {
  id: string;
  name: string;
  price: number;
  annualPrice?: number;
  credits: number;
  icon: string;
  features: string[];
  effectiveRate?: number;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'monthly' | 'founding';
  currentPlan?: Plan;
  selectedPlan?: Plan;
  isAnnual?: boolean;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  type,
  currentPlan,
  selectedPlan,
  isAnnual = false,
}: SubscriptionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    type: 'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'monthly' | 'founding';
    message?: string;
    creditsAdded?: number;
  } | null>(null);

  const cancelReasons = [
    'Too expensive',
    'Not using enough',
    'Missing features',
    'Found alternative',
    'Technical issues',
    'Other',
  ];

  const nextBillingDate = 'Dec 11, 2025';

  const handlePrimaryAction = async () => {
    setIsProcessing(true);

    try {
      // Determine the target tier based on selectedPlan
      // Handle 'free' specially - it means cancel subscription
      const targetPlanId = selectedPlan?.id || 'creator';

      console.log('[SubscriptionModal] handlePrimaryAction called', { type, targetPlanId, selectedPlan });

      if (targetPlanId === 'free' || type === 'cancel') {
        // Downgrade to Free = Cancel subscription
        console.log('[SubscriptionModal] Calling cancelSubscription...');
        const response = await cancelSubscription();
        console.log('[SubscriptionModal] cancelSubscription response:', response);
        setSuccessData({
          type: 'cancel',
          message: response.message,
        });
        setShowSuccessModal(true);
        setIsProcessing(false);
        return;
      }

      const tier = (targetPlanId === 'studio' ? 'studio' : 'creator') as SubscriptionTier;

      if (type === 'subscribe') {
        // Create new subscription checkout session via Stripe
        // Pass isAnnual to create annual subscription if selected
        const response = await createSubscription(tier, isAnnual);
        // Redirect to Stripe Checkout
        window.location.href = response.checkout_url;
      } else if (type === 'founding') {
        // Founding member - goes through Stripe checkout with 20% lifetime discount
        const response = await createSubscription(tier, false, true);
        // Redirect to Stripe Checkout
        window.location.href = response.checkout_url;
      } else if (type === 'upgrade' || type === 'downgrade') {
        // Upgrade/downgrade existing subscription (pass annual flag for pricing)
        const response = await upgradeSubscription(tier, isAnnual);
        setSuccessData({
          type: type,
          message: response.message,
          creditsAdded: response.credits_added,
        });
        setShowSuccessModal(true);
        setIsProcessing(false);
      } else if (type === 'annual') {
        // Switch existing subscription to annual billing
        console.log('[SubscriptionModal] Calling switchBillingPeriod(true)...');
        const response = await switchBillingPeriod(true);
        console.log('[SubscriptionModal] switchBillingPeriod response:', response);
        setSuccessData({
          type: 'annual',
          message: response.message,
        });
        setShowSuccessModal(true);
        setIsProcessing(false);
        return;
      } else if (type === 'monthly') {
        // Switch existing subscription to monthly billing
        console.log('[SubscriptionModal] Calling switchBillingPeriod(false)...');
        const response = await switchBillingPeriod(false);
        console.log('[SubscriptionModal] switchBillingPeriod response:', response);
        setSuccessData({
          type: 'monthly',
          message: response.message,
        });
        setShowSuccessModal(true);
        setIsProcessing(false);
        return;
      } else {
        onClose();
      }
    } catch (error: unknown) {
      console.error('Subscription action failed:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'An error occurred. Please try again.';
      console.error('[SubscriptionModal] Error message:', errorMessage);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    onClose();
    window.location.reload();
  };

  const renderSubscribeModal = () => (
    <>
      {/* Plan Display */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/30 text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-3xl">{selectedPlan?.icon}</span>
          <h3 className="text-[#F1F5F9] text-xl">{selectedPlan?.name} Plan</h3>
        </div>
        <div className="text-4xl text-[#F1F5F9] mb-2">
          ${selectedPlan?.price} <span className="text-xl text-[#94A3B8]">/ month</span>
        </div>
        <div className="text-[#00F0D9] mb-1">
          {selectedPlan?.credits} credits per month
        </div>
        <div className="text-sm text-[#94A3B8]">
          Effective rate: ${selectedPlan?.effectiveRate || 0.073}/credit
        </div>
      </div>

      <FeatureList features={selectedPlan?.features || []} title="What's included:" />
      <PaymentMethodSelectorCompact />
      <BillingSection
        items={[
          { label: 'First charge today', amount: `$${selectedPlan?.price}.00` },
          { label: `Then $${selectedPlan?.price}/month on ${nextBillingDate}`, amount: `$${selectedPlan?.price}.00` },
        ]}
      />
      <InfoBanner text="You can cancel anytime" variant="amber" />
      <ActionButtons
        primaryLabel="Proceed to Payment"
        onPrimary={handlePrimaryAction}
        onSecondary={onClose}
        isLoading={isProcessing}
      />
    </>
  );

  const renderUpgradeModal = () => (
    <>
      <PlanComparisonCard
        currentPlan={{ name: currentPlan?.name || '', price: currentPlan?.price || 0, credits: currentPlan?.credits || 0 }}
        newPlan={{ name: selectedPlan?.name || '', price: selectedPlan?.price || 0, credits: selectedPlan?.credits || 0 }}
      />
      <FeatureList features={selectedPlan?.features.slice(0, 7) || []} title="Additional benefits:" />
      <PaymentMethodSelectorCompact />
      <BillingSection
        items={[
          { label: `${selectedPlan?.name} Plan`, amount: `$${selectedPlan?.price}.00/mo` },
        ]}
        footerLabel="Stripe will calculate proration automatically"
      />
      <InfoBanner text="Your unused credits will carry over" variant="cyan" />
      <ActionButtons
        primaryLabel="Proceed to Payment"
        onPrimary={handlePrimaryAction}
        onSecondary={onClose}
        isLoading={isProcessing}
      />
    </>
  );

  const renderDowngradeModal = () => {
    // Special handling for downgrade to Free (which is actually cancellation)
    const isDowngradeToFree = selectedPlan?.id === 'free';

    if (isDowngradeToFree) {
      return (
        <>
          {/* Warning */}
          <div className="text-center mb-6">
            <span className="text-5xl mb-3 block">⚠️</span>
            <p className="text-[#F1F5F9] text-lg mb-2">Downgrade to Free Plan</p>
            <p className="text-[#94A3B8]">This will cancel your current subscription</p>
          </div>

          {/* What Happens */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
            <h4 className="text-amber-400 mb-3">What happens next:</h4>
            <div className="space-y-2 text-[#94A3B8] text-sm">
              <p>• Your {currentPlan?.name} plan stays active until {nextBillingDate}</p>
              <p>• You keep your remaining credits</p>
              <p>• After that, you'll be on the Free tier (25 credits)</p>
              <p>• No more monthly charges</p>
            </div>
          </div>

          <FeatureList
            features={[
              `${currentPlan?.credits || 400} credits per month`,
              'Watermark-free videos',
              'Priority processing',
              'Higher resolution options',
            ]}
            title="You will lose:"
            iconType="x"
            iconColor="text-red-500"
          />
          <ActionButtons
            primaryLabel="Confirm Downgrade to Free"
            primaryVariant="amber"
            onPrimary={handlePrimaryAction}
            secondaryLabel="Keep My Plan"
            onSecondary={onClose}
            isLoading={isProcessing}
          />
        </>
      );
    }

    // Regular downgrade (Studio -> Creator)
    return (
      <>
        <InfoBanner text="Are you sure?" variant="amber" />
        <PlanComparisonCard
          currentPlan={{ name: currentPlan?.name || '', price: currentPlan?.price || 0, credits: currentPlan?.credits || 0 }}
          newPlan={{ name: selectedPlan?.name || '', price: selectedPlan?.price || 0, credits: selectedPlan?.credits || 0 }}
          arrowColor="text-amber-500"
        />

        {/* Credit Adjustment Warning */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
          <h4 className="text-amber-400 mb-2">Credit Adjustment</h4>
          <p className="text-[#94A3B8] text-sm">
            Your credits will be capped at {selectedPlan?.credits} to match your new plan.
          </p>
        </div>

        <FeatureList
          features={[
            '1,200 credits per month',
            '8K resolution',
            '24/7 premium support',
            'Priority processing',
            'Custom models',
            'Extended video storage (90 days)',
          ]}
          title="You will lose:"
          iconType="x"
          iconColor="text-red-500"
        />
        <FeatureList features={selectedPlan?.features.slice(0, 5) || []} title="You will keep:" />

        {/* Billing */}
        <div className="border-t border-[#334155] pt-4 mb-6">
          <h4 className="text-[#F1F5F9] mb-3">Billing:</h4>
          <div className="space-y-2 text-[#94A3B8] text-sm">
            <p>Change takes effect: Immediately</p>
            <p>Prorated credit applied to your account.</p>
            <div className="flex justify-between mt-3">
              <span>New monthly charge: ${selectedPlan?.price}.00</span>
            </div>
          </div>
        </div>

        <ActionButtons
          primaryLabel="Confirm Downgrade"
          primaryVariant="amber"
          onPrimary={handlePrimaryAction}
          onSecondary={onClose}
          isLoading={isProcessing}
        />
      </>
    );
  };

  const renderCancelModal = () => (
    <>
      {/* Sad Emoji */}
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">😢</span>
        <p className="text-[#94A3B8]">We're sorry to see you go</p>
      </div>

      {/* Current Plan */}
      <div className="p-6 rounded-xl bg-[#0F172A] border border-[#334155] text-center mb-6">
        <h3 className="text-[#F1F5F9] text-xl mb-2">{currentPlan?.name} Plan</h3>
        <div className="text-2xl text-[#94A3B8] mb-1">${currentPlan?.price} / month</div>
        <div className="text-[#00F0D9]">{currentPlan?.credits} credits per month</div>
      </div>

      {/* What Happens */}
      <div className="mb-6">
        <h4 className="text-[#F1F5F9] mb-3">What happens after cancellation:</h4>
        <div className="space-y-2 text-[#94A3B8] text-sm">
          <p>• Your plan remains active until {nextBillingDate}</p>
          <p>• You can still use your 200 credits</p>
          <p>• No further charges after {nextBillingDate}</p>
          <p>• Account converts to Free tier</p>
          <p>• You can resubscribe anytime</p>
        </div>
      </div>

      {/* Retention offer - downgrade instead of cancel */}
      <div className="p-6 rounded-xl bg-[#00F0D9]/5 border border-[#00F0D9]/30 mb-6">
        <p className="text-[#F1F5F9] mb-3">Before you go, would you consider:</p>
        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
          <p className="text-[#F1F5F9] mb-1">Downgrade to a lower plan?</p>
          <p className="text-[#94A3B8] text-sm mb-3">Keep your account active at a lower price</p>
          <Button
            variant="outline"
            className="w-full border-[#00F0D9] text-[#00F0D9] hover:bg-[#00F0D9]/10"
            onClick={onClose}
          >
            View Other Plans
          </Button>
        </div>
      </div>

      {/* Feedback */}
      <div className="mb-6">
        <h4 className="text-[#F1F5F9] mb-3">Tell us why you're leaving (optional):</h4>
        <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
          <div className="space-y-2">
            {cancelReasons.map((reason) => (
              <div key={reason} className="flex items-center gap-2">
                <RadioGroupItem value={reason} id={reason} />
                <Label htmlFor={reason} className="text-[#94A3B8] cursor-pointer flex-1">
                  {reason}
                </Label>
                {reason === 'Other' && cancelReason === 'Other' && (
                  <Input
                    placeholder="Please specify..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] ml-6"
                  />
                )}
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          className="flex-1 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
          onClick={onClose}
        >
          Keep My Subscription
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
          onClick={handlePrimaryAction}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Cancel Subscription'}
        </Button>
      </div>
    </>
  );

  const renderAnnualModal = () => {
    const monthlyCost = currentPlan?.price || 29;
    const annualCost = currentPlan?.annualPrice || 276;
    const annualSavings = (monthlyCost * 12) - annualCost;

    return (
      <>
        <InfoBanner text="💰 Save 20% with annual billing" variant="cyan" />

        {/* Plan Comparison - billing cycle specific */}
        <div className="p-6 rounded-xl bg-[#0F172A] border border-[#334155] mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <div className="text-sm text-[#94A3B8] mb-1">Monthly</div>
              <div className="text-2xl text-[#F1F5F9] mb-1">${monthlyCost}/month</div>
              <div className="text-sm text-[#94A3B8]">Billed monthly</div>
              <div className="text-sm text-[#94A3B8] mt-1">${monthlyCost * 12}/year</div>
            </div>
            <ArrowRight className="w-6 h-6 text-[#00F0D9] flex-shrink-0" />
            <div className="text-center flex-1">
              <div className="text-sm text-[#94A3B8] mb-1">Annual</div>
              <div className="text-2xl text-[#00F0D9] mb-1">${(annualCost / 12).toFixed(0)}/month</div>
              <div className="text-sm text-[#94A3B8]">Billed annually</div>
              <div className="text-sm text-[#94A3B8] mt-1">${annualCost}/year</div>
            </div>
          </div>
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-0">
              You save: ${annualSavings}/year
            </Badge>
          </div>
        </div>

        <PaymentMethodSelectorCompact />
        <BillingSection
          items={[
            { label: 'Annual billing', amount: `$${annualCost}.00/year` },
          ]}
          footerLabel="Stripe will calculate proration automatically"
        />

        {/* Benefits */}
        <div className="space-y-2 p-4 rounded-lg bg-[#1E293B] border border-[#334155] mb-6">
          <FeatureList features={['Same features, better price', 'Cancel anytime, prorated refund']} />
        </div>

        <ActionButtons
          primaryLabel="Switch to Annual"
          onPrimary={handlePrimaryAction}
          onSecondary={onClose}
          isLoading={isProcessing}
        />
      </>
    );
  };

  const renderMonthlyModal = () => {
    const monthlyCost = currentPlan?.price || 29;
    const annualCost = currentPlan?.annualPrice || 276;

    return (
      <>
        <InfoBanner text="Switching to monthly billing" variant="blue" />

        {/* Plan Comparison - billing cycle specific */}
        <div className="p-6 rounded-xl bg-[#0F172A] border border-[#334155] mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <div className="text-sm text-[#94A3B8] mb-1">Annual (Current)</div>
              <div className="text-2xl text-[#00F0D9] mb-1">${(annualCost / 12).toFixed(0)}/month</div>
              <div className="text-sm text-[#94A3B8]">Billed annually</div>
              <div className="text-sm text-[#94A3B8] mt-1">${annualCost}/year</div>
            </div>
            <ArrowRight className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div className="text-center flex-1">
              <div className="text-sm text-[#94A3B8] mb-1">Monthly</div>
              <div className="text-2xl text-[#F1F5F9] mb-1">${monthlyCost}/month</div>
              <div className="text-sm text-[#94A3B8]">Billed monthly</div>
              <div className="text-sm text-[#94A3B8] mt-1">${monthlyCost * 12}/year</div>
            </div>
          </div>
          <div className="text-center">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              You'll pay ${(monthlyCost * 12) - annualCost} more per year
            </Badge>
          </div>
        </div>

        {/* What happens */}
        <div className="space-y-2 p-4 rounded-lg bg-[#1E293B] border border-[#334155] mb-6">
          <h4 className="text-[#F1F5F9] mb-2">What happens:</h4>
          <FeatureList
            features={[
              'Prorated credit applied for remaining annual period',
              'Switch to monthly billing on next renewal',
              'Same features, just different billing cycle',
              'Can switch back to annual anytime',
            ]}
            iconColor="text-blue-400"
          />
        </div>

        <ActionButtons
          primaryLabel="Switch to Monthly"
          onPrimary={handlePrimaryAction}
          secondaryLabel="Keep Annual"
          onSecondary={onClose}
          isLoading={isProcessing}
        />
      </>
    );
  };

  const renderFoundingModal = () => {
    const regularPrice = 29;
    const foundingPrice = 23.20;
    const spotsLeft = 23;

    return (
      <>
        {/* Founding Member Badge */}
        <div className="text-center mb-6">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-[#94A3B8]">
            Join the first 100 subscribers and unlock exclusive lifetime benefits!
          </p>
        </div>

        {/* Plan Display */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-[#3B1FE2]/10 border border-amber-500/30 text-center mb-6">
          <h3 className="text-[#F1F5F9] text-xl mb-3">{selectedPlan?.name} Plan - Founding Member</h3>
          <div className="text-4xl text-[#F1F5F9] mb-2">
            ${foundingPrice} <span className="text-xl text-[#94A3B8]">/ month</span>
          </div>
          <div className="text-amber-500 mb-1">(20% off forever)</div>
          <div className="text-[#94A3B8] line-through text-sm mb-3">
            ${regularPrice} → ${foundingPrice}
          </div>
          <div className="text-[#00F0D9]">{selectedPlan?.credits} credits per month</div>
        </div>

        {/* Exclusive Benefits - using Sparkles icon */}
        <div className="mb-6">
          <h4 className="text-[#F1F5F9] mb-3">Exclusive Founding Member Benefits:</h4>
          <div className="space-y-2">
            {[
              '20% lifetime discount on all plans',
              'Locked-in pricing forever',
              '100% credit rollover (vs 50%)',
              `Founding Member badge #${100 - spotsLeft + 1}`,
              'Early access to new features',
              'Exclusive Discord channel',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[#94A3B8]">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <FeatureList
          features={selectedPlan?.features.slice(0, 6) || []}
          title={`Plus all ${selectedPlan?.name} Plan features:`}
        />
        <PaymentMethodSelectorCompact />
        <BillingSection
          items={[
            { label: 'First charge today', amount: `$${foundingPrice}` },
            { label: `Then $${foundingPrice}/month forever`, amount: `$${foundingPrice}` },
          ]}
        />
        <InfoBanner text={`⚡ Only ${spotsLeft} Founding Member spots left!`} variant="amber" />
        <ActionButtons
          primaryLabel="Proceed to Payment"
          primaryVariant="amber"
          onPrimary={handlePrimaryAction}
          onSecondary={onClose}
          isLoading={isProcessing}
        />
      </>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'subscribe':
        return 'Confirm Subscription';
      case 'upgrade':
        return `Upgrade to ${selectedPlan?.name} Plan`;
      case 'downgrade':
        return `Downgrade to ${selectedPlan?.name} Plan`;
      case 'cancel':
        return 'Cancel Subscription';
      case 'annual':
        return 'Switch to Annual Billing';
      case 'monthly':
        return 'Switch to Monthly Billing';
      case 'founding':
        return 'Become a Founding Member 🏆';
      default:
        return 'Subscription';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'subscribe':
        return 'Review your subscription and proceed to payment';
      case 'upgrade':
        return 'Unlock more credits and premium features';
      case 'downgrade':
        return 'Review the changes to your subscription';
      case 'cancel':
        return 'We value your feedback';
      case 'annual':
        return 'Save 20% with annual billing';
      case 'monthly':
        return 'Switch back to monthly billing';
      case 'founding':
        return 'Limited time exclusive offer';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'subscribe':
        return renderSubscribeModal();
      case 'upgrade':
        return renderUpgradeModal();
      case 'downgrade':
        return renderDowngradeModal();
      case 'cancel':
        return renderCancelModal();
      case 'annual':
        return renderAnnualModal();
      case 'monthly':
        return renderMonthlyModal();
      case 'founding':
        return renderFoundingModal();
      default:
        return null;
    }
  };

  // Calculate next billing date
  const getNextBillingDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Dialog open={isOpen && !showSuccessModal} onOpenChange={onClose}>
        <DialogContent className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[#F1F5F9] text-2xl">{getTitle()}</DialogTitle>
              <button
                onClick={onClose}
                className="hidden text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DialogDescription className="text-[#94A3B8]">
              {getDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">{renderContent()}</div>
        </DialogContent>
      </Dialog>

      {/* Success Modal with celebration */}
      {successData && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessClose}
          type={successData.type}
          planName={selectedPlan?.name || currentPlan?.name || 'Creator'}
          planIcon={selectedPlan?.icon || currentPlan?.icon || ''}
          credits={selectedPlan?.credits || currentPlan?.credits || 400}
          creditsAdded={successData.creditsAdded || 0}
          price={selectedPlan?.price || currentPlan?.price || 29}
          nextBillingDate={getNextBillingDate()}
          message={successData.message}
        />
      )}
    </>
  );
}
