import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Default metadata for marketing pages (applies to home page)
export const metadata: Metadata = {
  title: 'AI Video Generation Studio',
  description: 'Transform your videos with AI-powered character replacement. Replace any character in any video with stunning, natural-looking results in minutes.',
  alternates: {
    canonical: 'https://nuumee.ai',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
