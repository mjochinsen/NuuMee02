import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nuumee.ai'),
  title: {
    default: "NuuMee.AI - AI Video Generation Studio",
    template: "%s | NuuMee.AI",
  },
  description: "Transform your videos with AI-powered character replacement. Generate stunning AI videos in minutes.",
  keywords: ["AI video", "video generation", "AI character replacement", "video editing", "AI studio"],
  authors: [{ name: "NuuMee" }],
  creator: "NuuMee",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nuumee.ai",
    siteName: "NuuMee.AI",
    title: "NuuMee.AI - AI Video Generation Studio",
    description: "Transform your videos with AI-powered character replacement. Generate stunning AI videos in minutes.",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "NuuMee.AI - AI Video Generation Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NuuMee.AI - AI Video Generation Studio",
    description: "Transform your videos with AI-powered character replacement.",
    images: ["/og/default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0F172A] text-[#F1F5F9]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        <GoogleAnalytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
