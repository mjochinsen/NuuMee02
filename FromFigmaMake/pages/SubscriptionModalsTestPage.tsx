import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { SubscriptionModal } from '../components/SubscriptionModal';

export default function SubscriptionModalsTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'founding'>('subscribe');

  const creatorPlan = {
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
      'All post-processing tools',
      'API access',
      '50% credit rollover',
    ],
    effectiveRate: 0.073,
  };

  const studioPlan = {
    id: 'studio',
    name: 'Studio',
    price: 99,
    annualPrice: 948,
    credits: 1600,
    icon: '💎',
    features: [
      '1,600 credits per month',
      'Up to 8K resolution',
      '24/7 premium support',
      'Priority processing queue',
      'Advanced API access',
      'Custom models',
      'Videos stored 90 days (vs 30)',
    ],
    effectiveRate: 0.062,
  };

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-[#F1F5F9] mb-4">Subscription Modals Test Page</h1>
        <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto">
          Test all 6 subscription modal variations
        </p>
      </div>

      <div className="h-px bg-[#334155] mb-12"></div>

      {/* Modal Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Subscribe Modal */}
        <Card className="p-6 border-[#334155] bg-[#0F172A]">
          <div className="text-4xl mb-3">1️⃣</div>
          <h3 className="text-[#F1F5F9] mb-2">Subscribe to Plan</h3>
          <p className="text-[#94A3B8] text-sm mb-4">
            New user subscribing to Creator or Studio plan
          </p>
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
              onClick={() => openModal('subscribe')}
            >
              Subscribe to Creator
            </Button>
          </div>
        </Card>

        {/* Upgrade Modal */}
        <Card className="p-6 border-[#334155] bg-[#0F172A]">
          <div className="text-4xl mb-3">2️⃣</div>
          <h3 className="text-[#F1F5F9] mb-2">Upgrade Plan</h3>
          <p className="text-[#94A3B8] text-sm mb-4">
            Upgrade from Creator to Studio with prorated billing
          </p>
          <Button
            className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            onClick={() => openModal('upgrade')}
          >
            Upgrade to Studio
          </Button>
        </Card>

        {/* Downgrade Modal */}
        <Card className="p-6 border-[#334155] bg-[#0F172A]">
          <div className="text-4xl mb-3">3️⃣</div>
          <h3 className="text-[#F1F5F9] mb-2">Downgrade Plan</h3>
          <p className="text-[#94A3B8] text-sm mb-4">
            Downgrade from Studio to Creator with warnings
          </p>
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white"
            onClick={() => openModal('downgrade')}
          >
            Downgrade to Creator
          </Button>
        </Card>

        {/* Cancel Subscription Modal */}
        <Card className="p-6 border-[#334155] bg-[#0F172A]">
          <div className="text-4xl mb-3">4️⃣</div>
          <h3 className="text-[#F1F5F9] mb-2">Cancel Subscription</h3>
          <p className="text-[#94A3B8] text-sm mb-4">
            Cancel with feedback form and pause alternative
          </p>
          <Button
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
            onClick={() => openModal('cancel')}
          >
            Cancel Subscription
          </Button>
        </Card>

        {/* Annual Billing Modal */}
        <Card className="p-6 border-[#334155] bg-[#0F172A]">
          <div className="text-4xl mb-3">5️⃣</div>
          <h3 className="text-[#F1F5F9] mb-2">Switch to Annual</h3>
          <p className="text-[#94A3B8] text-sm mb-4">
            Save 20% by switching from monthly to annual billing
          </p>
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white"
            onClick={() => openModal('annual')}
          >
            Switch to Annual
          </Button>
        </Card>

        {/* Founding Member Modal */}
        <Card className="p-6 border-[#334155] bg-[#0F172A]">
          <div className="text-4xl mb-3">6️⃣</div>
          <h3 className="text-[#F1F5F9] mb-2">Founding Member</h3>
          <p className="text-[#94A3B8] text-sm mb-4">
            Exclusive 20% lifetime discount with special perks
          </p>
          <Button
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 text-white"
            onClick={() => openModal('founding')}
          >
            Become Founding Member
          </Button>
        </Card>
      </div>

      {/* Modal Details */}
      <div className="mt-12 border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] mb-4">Modal Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[#00F0D9] mb-3">All Modals Include:</h3>
            <ul className="space-y-2 text-[#94A3B8] text-sm">
              <li>• Dark theme (#0F172A background)</li>
              <li>• Cyan-to-purple gradient accents</li>
              <li>• Payment method selection</li>
              <li>• Billing summary with calculations</li>
              <li>• Smooth transitions and animations</li>
              <li>• Loading states on submit</li>
              <li>• Mobile responsive (max-h-90vh with scroll)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#00F0D9] mb-3">Modal-Specific Features:</h3>
            <ul className="space-y-2 text-[#94A3B8] text-sm">
              <li>• Subscribe: Feature list, payment method</li>
              <li>• Upgrade: Plan comparison, prorated credit</li>
              <li>• Downgrade: Warning, feature loss list</li>
              <li>• Cancel: Feedback form, pause alternative</li>
              <li>• Annual: Savings calculator, comparison</li>
              <li>• Founding: Exclusive benefits, urgency badge</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        currentPlan={creatorPlan}
        selectedPlan={modalType === 'upgrade' ? studioPlan : creatorPlan}
      />
    </main>
  );
}
