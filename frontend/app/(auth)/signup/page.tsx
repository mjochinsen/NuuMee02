'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified login page with signup mode
    router.replace('/login?mode=signup');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-[#94A3B8]">Redirecting to sign up...</div>
    </div>
  );
}
