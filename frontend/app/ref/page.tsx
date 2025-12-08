'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Referral link handler page.
 *
 * When someone visits /ref/{CODE}/, this page:
 * 1. Extracts the referral code from the URL path
 * 2. Stores it in localStorage
 * 3. Redirects to the signup page
 *
 * The signup page will read the code from localStorage and apply it after registration.
 *
 * Note: This uses client-side path parsing because we're using static export.
 * Firebase Hosting rewrites /ref/* to /ref/index.html
 */
export default function ReferralRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    // Parse referral code from URL path: /ref/{CODE}/
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const refIndex = pathParts.indexOf('ref');
    const code = refIndex >= 0 && pathParts.length > refIndex + 1
      ? pathParts[refIndex + 1]
      : null;

    if (code && code.length > 0) {
      // Store referral code in localStorage for later use during signup
      localStorage.setItem('referral_code', code.toUpperCase());
      console.log('[Referral] Stored referral code:', code.toUpperCase());

      // Redirect to signup page (trailing slash required for static export)
      router.replace('/login/?mode=signup');
    } else {
      setError('Invalid referral link. Please check the URL.');
    }
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <h1 className="text-xl text-red-400 mb-2">{error}</h1>
          <button
            onClick={() => router.push('/login/')}
            className="text-[#00F0D9] hover:underline"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#00F0D9] animate-spin mx-auto mb-4" />
        <h1 className="text-xl text-[#F1F5F9] mb-2">Processing your referral...</h1>
        <p className="text-[#94A3B8]">Redirecting you to sign up</p>
      </div>
    </main>
  );
}
