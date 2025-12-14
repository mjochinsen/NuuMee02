import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the perfect plan for your AI video generation needs. Pay-as-you-go credits or monthly subscriptions starting at $29/month.',
  alternates: {
    canonical: 'https://nuumee.ai/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
