'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">Check Your Email</h1>
            <p className="text-[#94A3B8]">
              We&apos;ve sent a password reset link to <span className="text-[#00F0D9]">{email}</span>
            </p>
          </div>

          <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] mb-6">
            <p className="text-[#94A3B8] text-sm mb-4">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
            >
              Try Again
            </Button>
          </div>

          <Link href="/login" className="text-[#00F0D9] hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 mx-auto mb-6 flex items-center justify-center">
            <Mail className="w-8 h-8 text-[#00F0D9]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">Forgot Password?</h1>
          <p className="text-[#94A3B8]">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#94A3B8]">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-[#00F0D9] hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
