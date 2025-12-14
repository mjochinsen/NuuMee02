import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Learn how to use NuuMee AI video generation. Comprehensive guides, API documentation, and tutorials for character replacement in videos.',
  alternates: {
    canonical: 'https://nuumee.ai/documentation',
  },
};

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
