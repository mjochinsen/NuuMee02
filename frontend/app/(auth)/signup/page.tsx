'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check } from 'lucide-react';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 15;

    let label = 'Weak';
    let color = 'bg-red-500';

    if (score >= 75) {
      label = 'Strong';
      color = 'bg-green-500';
    } else if (score >= 50) {
      label = 'Good';
      color = 'bg-blue-500';
    } else if (score >= 25) {
      label = 'Fair';
      color = 'bg-amber-500';
    }

    return { score, label, color };
  };

  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
    { met: /[^a-zA-Z0-9]/.test(password), text: 'One special character' },
  ];

  const handleSocialSignup = async (provider: typeof googleProvider | typeof githubProvider, name: string) => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithPopup(auth, provider);
      router.push('/jobs');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Failed to sign up with ${name}`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every(r => r.met)) {
      setError('Password does not meet all requirements');
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      router.push('/jobs');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]/80 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-[#F1F5F9] text-xl font-semibold">NuuMee.AI</span>
        </Link>
        <h1 className="text-[#F1F5F9] text-2xl font-bold mb-2">Create your account</h1>
        <p className="text-[#94A3B8]">Start creating AI videos today</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Social Signup */}
      <div className="space-y-3 mb-6">
        <Button
          type="button"
          variant="outline"
          className="w-full border-[#334155] bg-[#0F172A] text-[#F1F5F9] hover:bg-[#334155] hover:border-[#00F0D9]"
          onClick={() => handleSocialSignup(googleProvider, 'Google')}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full border-[#334155] bg-[#0F172A] text-[#F1F5F9] hover:bg-[#334155] hover:border-[#00F0D9]"
          onClick={() => handleSocialSignup(githubProvider, 'GitHub')}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          Continue with GitHub
        </Button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#334155]"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#1E293B] px-2 text-[#94A3B8]">or sign up with email</span>
        </div>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-[#F1F5F9]">Full Name</Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="pl-10 bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] focus:border-[#00F0D9]"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-[#F1F5F9]">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-10 bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] focus:border-[#00F0D9]"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-[#F1F5F9]">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10 bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] focus:border-[#00F0D9]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength */}
          {password && passwordStrength && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#94A3B8]">Password strength</span>
                <span className={`${passwordStrength.score >= 75 ? 'text-green-400' : passwordStrength.score >= 50 ? 'text-blue-400' : passwordStrength.score >= 25 ? 'text-amber-400' : 'text-red-400'}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <Progress value={passwordStrength.score} className="h-1" />
            </div>
          )}

          {/* Password Requirements */}
          {password && (
            <div className="mt-3 space-y-1">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Check className={`w-3 h-3 ${req.met ? 'text-green-400' : 'text-[#64748B]'}`} />
                  <span className={req.met ? 'text-[#94A3B8]' : 'text-[#64748B]'}>{req.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-[#F1F5F9]">Confirm Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10 bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] focus:border-[#00F0D9]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      {/* Terms */}
      <p className="mt-4 text-center text-xs text-[#64748B]">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-[#00F0D9] hover:underline">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-[#00F0D9] hover:underline">Privacy Policy</Link>
      </p>

      {/* Login Link */}
      <p className="mt-6 text-center text-[#94A3B8]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#00F0D9] hover:text-[#00F0D9]/80 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
