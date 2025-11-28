'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ModalType = 'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'founding';

interface ModalConfig {
  type: ModalType;
  title: string;
  description: string;
  cardDescription: string;
  primaryAction: string;
  primaryColor: string;
}

const modalConfigs: ModalConfig[] = [
  {
    type: 'subscribe',
    title: 'Subscribe to NuuMee',
    description: 'Start creating AI-generated videos with our flexible plans.',
    cardDescription: 'Initial subscription flow',
    primaryAction: 'Subscribe Now',
    primaryColor: 'bg-[#00F0D9] hover:bg-[#00F0D9]/90 text-[#0F172A]',
  },
  {
    type: 'upgrade',
    title: 'Upgrade Your Plan',
    description: 'Get more credits and unlock advanced features.',
    cardDescription: 'Upgrade to higher tier',
    primaryAction: 'Upgrade Plan',
    primaryColor: 'bg-[#3B1FE2] hover:bg-[#3B1FE2]/90 text-white',
  },
  {
    type: 'downgrade',
    title: 'Downgrade Plan',
    description: 'Switch to a lower tier plan that better fits your needs.',
    cardDescription: 'Downgrade to lower tier',
    primaryAction: 'Confirm Downgrade',
    primaryColor: 'bg-[#334155] hover:bg-[#334155]/90 text-white',
  },
  {
    type: 'cancel',
    title: 'Cancel Subscription',
    description: 'Are you sure you want to cancel your subscription? You will lose access to all premium features.',
    cardDescription: 'Cancel current subscription',
    primaryAction: 'Cancel Subscription',
    primaryColor: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    type: 'annual',
    title: 'Switch to Annual Billing',
    description: 'Save 20% by switching to annual billing. Lock in your current rate.',
    cardDescription: 'Switch to annual billing',
    primaryAction: 'Switch to Annual',
    primaryColor: 'bg-[#00F0D9] hover:bg-[#00F0D9]/90 text-[#0F172A]',
  },
  {
    type: 'founding',
    title: 'Founding Member',
    description: 'Join as a founding member and get lifetime benefits with special pricing.',
    cardDescription: 'Limited founding member offer',
    primaryAction: 'Become a Founder',
    primaryColor: 'bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] hover:opacity-90 text-white',
  },
];

export default function SubscriptionModalsTestPage() {
  const [openModal, setOpenModal] = useState<ModalType | null>(null);

  const handleOpenModal = (type: ModalType) => {
    setOpenModal(type);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const currentConfig = modalConfigs.find((config) => config.type === openModal);

  return (
    <div className="min-h-screen bg-[#0F172A] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Subscription Modal Variations
          </h1>
          <p className="text-[#94A3B8]">
            Test harness for different subscription modal types
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modalConfigs.map((config) => (
            <Card
              key={config.type}
              className="bg-[#1E293B] border-[#334155] hover:border-[#00F0D9]/50 transition-colors"
            >
              <CardHeader>
                <CardTitle className="text-white capitalize">
                  {config.type} Modal
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  {config.cardDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOpenModal(config.type)}
                  className="w-full bg-[#3B1FE2] hover:bg-[#3B1FE2]/90 text-white"
                >
                  Open {config.type} Modal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal Dialog */}
        <Dialog open={openModal !== null} onOpenChange={handleCloseModal}>
          <DialogContent className="bg-[#1E293B] border-[#334155] text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {currentConfig?.title}
              </DialogTitle>
              <DialogDescription className="text-[#94A3B8]">
                {currentConfig?.description}
              </DialogDescription>
            </DialogHeader>

            {/* Modal Content Placeholder */}
            <div className="py-6">
              <div className="rounded-lg bg-[#0F172A] border border-[#334155] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Plan:</span>
                  <span className="font-semibold text-white">
                    {currentConfig?.type === 'founding' ? 'Founding Member' : 'Premium'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Billing:</span>
                  <span className="font-semibold text-white">
                    {currentConfig?.type === 'annual' ? 'Annual' : 'Monthly'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Price:</span>
                  <span className="font-semibold text-[#00F0D9]">
                    {currentConfig?.type === 'founding' ? '$49/mo' : '$29/mo'}
                  </span>
                </div>
                {currentConfig?.type === 'annual' && (
                  <div className="pt-2 border-t border-[#334155]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#94A3B8]">Annual Savings:</span>
                      <span className="font-semibold text-green-400">-20% ($70/year)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-4 text-sm text-[#94A3B8]">
                <p>
                  This is a placeholder modal. The actual SubscriptionModal component
                  will include:
                </p>
                <ul className="mt-2 ml-4 space-y-1 list-disc">
                  <li>Detailed plan comparison</li>
                  <li>Stripe payment integration</li>
                  <li>Credit allocation details</li>
                  <li>Terms and conditions</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="bg-transparent border-[#334155] text-[#94A3B8] hover:bg-[#334155] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert(`${currentConfig?.primaryAction} clicked!`);
                  handleCloseModal();
                }}
                className={currentConfig?.primaryColor}
              >
                {currentConfig?.primaryAction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
