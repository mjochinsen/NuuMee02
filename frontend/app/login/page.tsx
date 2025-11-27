'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithGoogle, signInWithGithub, signInWithEmail, resetPassword } from '@/lib/firebase';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetSent, setResetSent] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      await loginUser(idToken);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGithubLogin() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGithub();
      const idToken = await result.user.getIdToken();
      await loginUser(idToken);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'GitHub sign-in failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithEmail(email, password);
      const idToken = await result.user.getIdToken();
      await loginUser(idToken);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center px-6 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F0D9]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B1FE2]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="text-3xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent font-bold">
              NuuMee.AI
            </div>
          </Link>
          <p className="text-[#94A3B8]">AI Character Replacement Studio</p>
        </div>

        {/* Main Card */}
        <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]/80 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-[#F1F5F9] text-2xl mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
            </h1>
            <p className="text-[#94A3B8]">
              {mode === 'login'
                ? 'Continue with your preferred method'
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <>
              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between bg-white hover:bg-gray-50 text-[#202124] h-12 px-4 rounded-lg disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </span>
                  <span className="text-gray-400">→</span>
                </button>

                <button
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between bg-[#24292e] hover:bg-[#1b1f23] text-white h-12 px-4 rounded-lg disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </span>
                  <span>→</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#334155]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#0F172A] text-[#94A3B8]">or</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-[#94A3B8] text-sm mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full h-12 px-4 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#00F0D9]"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-[#94A3B8] text-sm mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-12 px-4 pr-12 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#00F0D9]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[#00F0D9] hover:text-[#00F0D9]/80 text-sm"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-[#94A3B8] text-sm mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                  Create one
                </Link>
              </p>
            </>
          ) : (
            /* Forgot Password Mode */
            <>
              {resetSent ? (
                <div className="text-center space-y-4">
                  <div className="text-4xl">✉️</div>
                  <h3 className="text-[#F1F5F9]">Check your email</h3>
                  <p className="text-[#94A3B8]">
                    We sent a password reset link to <span className="text-[#00F0D9]">{email}</span>
                  </p>
                  <button
                    onClick={() => {
                      setMode('login');
                      setResetSent(false);
                    }}
                    className="text-[#00F0D9] hover:text-[#00F0D9]/80 flex items-center gap-2 mx-auto"
                  >
                    ← Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-[#94A3B8] text-sm mb-2">
                      Email
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full h-12 px-4 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#00F0D9]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-[#00F0D9] hover:text-[#00F0D9]/80 flex items-center gap-2 justify-center"
                  >
                    ← Back to Login
                  </button>
                </form>
              )}
            </>
          )}

          {/* Terms */}
          <div className="mt-6 pt-6 border-t border-[#334155]">
            <p className="text-center text-[#94A3B8] text-xs">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#00F0D9] hover:text-[#00F0D9]/80 inline-flex items-center gap-2">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
