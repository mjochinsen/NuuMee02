import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

type PageMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';
type ModalType = 'email-sent' | 'email-verified' | 'password-reset' | 'verify-required' | null;

export default function LoginPage() {
  const [mode, setMode] = useState<PageMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  // Form validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[a-z]/.test(pwd) &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^a-zA-Z0-9]/.test(pwd)
    );
  };

  // Social login handlers
  const handleSocialLogin = (provider: 'google' | 'github' | 'apple') => {
    setIsLoading(true);
    toast.loading(`Signing in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`);
    
    // Simulate OAuth flow
    setTimeout(() => {
      setIsLoading(false);
      toast.dismiss();
      toast.success('Successfully signed in!');
      // In real app: window.location.href = `/auth/${provider}`
    }, 2000);
  };

  // Email/Password handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    toast.loading('Signing in...');

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast.dismiss();
      toast.success('Successfully signed in!');
      // In real app: redirect to dashboard
    }, 1500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    toast.loading('Creating your account...');

    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      toast.dismiss();
      setModalType('email-sent');
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    toast.loading('Sending reset link...');

    // Simulate sending reset email
    setTimeout(() => {
      setIsLoading(false);
      toast.dismiss();
      setModalType('password-reset');
    }, 1500);
  };

  const handleResendVerification = () => {
    toast.loading('Resending verification email...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Verification email sent!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center px-6 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F0D9]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B1FE2]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <div className="text-3xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent">
              NuuMee.AI
            </div>
          </Link>
          <p className="text-[#94A3B8]">AI Character Replacement Studio</p>
        </div>

        {/* Main Card */}
        <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]/80 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[#F1F5F9] text-2xl mb-2">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot-password' && 'Reset Your Password'}
              {mode === 'reset-password' && 'Create New Password'}
            </h1>
            <p className="text-[#94A3B8]">
              {mode === 'login' && 'Continue with your preferred method'}
              {mode === 'signup' && 'Sign up with your preferred method'}
              {mode === 'forgot-password' && "Enter your email and we'll send you a reset link"}
              {mode === 'reset-password' && 'Enter your new password'}
            </p>
          </div>

          {/* Social Login Buttons */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="space-y-3 mb-6">
              <Button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 text-[#202124] border border-[#dadce0] h-12 justify-between"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                className="w-full bg-[#24292e] hover:bg-[#1b1f23] text-white h-12 justify-between"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading}
                className="w-full bg-black hover:bg-gray-900 text-white h-12 justify-between"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Continue with Apple
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Divider */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#334155]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0F172A] text-[#94A3B8]">or</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-[#94A3B8]">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-[#94A3B8]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    required
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-[#94A3B8] cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode('forgot-password')}
                  className="text-[#00F0D9] hover:text-[#00F0D9]/80 p-0 h-auto"
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <p className="text-center text-[#94A3B8] text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#00F0D9] hover:text-[#00F0D9]/80"
                >
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-[#94A3B8]">
                  Full Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Chen"
                  required
                  className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-[#94A3B8]">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-[#94A3B8]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    required
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && passwordStrength && (
                  <div className="space-y-1">
                    <Progress
                      value={passwordStrength.score}
                      className="h-1.5"
                      indicatorClassName={passwordStrength.color}
                    />
                    <p className={`text-sm ${
                      passwordStrength.label === 'Strong' ? 'text-green-500' :
                      passwordStrength.label === 'Good' ? 'text-blue-500' :
                      passwordStrength.label === 'Fair' ? 'text-amber-500' :
                      'text-red-500'
                    }`}>
                      Password strength: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#94A3B8]">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    required
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] h-12 pr-12"
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
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-center text-[#94A3B8] text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#00F0D9] hover:text-[#00F0D9]/80"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-[#94A3B8]">
                  Email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={() => setMode('login')}
                className="w-full text-[#00F0D9] hover:text-[#00F0D9]/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </form>
          )}

          {/* Terms */}
          <div className="mt-6 pt-6 border-t border-[#334155]">
            <p className="text-center text-[#94A3B8] text-xs">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-[#94A3B8] text-sm flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-[#00F0D9]" />
            Secure login powered by OAuth 2.0
          </p>
          <p className="text-[#94A3B8] text-sm flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            10,000+ creators trust NuuMee.AI
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-[#00F0D9] hover:text-[#00F0D9]/80 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Help Link */}
        <div className="mt-4 text-center">
          <Link
            to="/support"
            className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm"
          >
            Need help? Contact Support
          </Link>
        </div>
      </div>

      {/* Email Sent Modal */}
      <Dialog open={modalType === 'email-sent'} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Account Created!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#00F0D9]/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#00F0D9]" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-[#F1F5F9]">Verify your email to get started</h3>
              <p className="text-[#94A3B8] text-sm">
                We sent a verification link to:
              </p>
              <p className="text-[#00F0D9]">{email}</p>
            </div>

            <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
              <p className="text-[#94A3B8] text-sm mb-2">Click the link in the email to:</p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  Activate your account
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  Receive your 5 free credits
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  Start creating videos
                </li>
              </ul>
            </div>

            <div className="text-center space-y-2">
              <p className="text-[#94A3B8] text-sm">Didn't receive it?</p>
              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                Resend Verification Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Verified Modal */}
      <Dialog open={modalType === 'email-verified'} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Email Verified!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-center space-y-3">
              <div className="text-4xl">🎉</div>
              <h3 className="text-[#F1F5F9] text-xl">Your account is now active</h3>
              
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-[#94A3B8] mb-2">You've received:</p>
                <p className="text-2xl text-[#00F0D9]">⚡ 5 free credits</p>
              </div>

              <p className="text-[#94A3B8]">Ready to create your first video?</p>
            </div>

            <Link to="/create">
              <Button className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                🎬 Start Creating
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Sent Modal */}
      <Dialog open={modalType === 'password-reset'} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Reset Link Sent
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-center space-y-2">
              <p className="text-[#94A3B8]">Check your email:</p>
              <p className="text-[#00F0D9]">{email}</p>
              
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-left">
                <p className="text-[#94A3B8] text-sm mb-2">
                  Click the link to reset your password.
                </p>
                <p className="text-[#94A3B8] text-sm">
                  The link expires in 1 hour.
                </p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-[#94A3B8] text-sm">Didn't receive it?</p>
              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                Resend Reset Link
              </Button>
            </div>

            <Button
              onClick={() => {
                setModalType(null);
                setMode('login');
              }}
              variant="link"
              className="w-full text-[#00F0D9] hover:text-[#00F0D9]/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Required Modal */}
      <Dialog open={modalType === 'verify-required'} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Email Verification Required
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-[#94A3B8]">
              Please verify your email to start generating videos and receive your free credits.
            </p>

            <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
              <p className="text-[#94A3B8] text-sm mb-2">Check your inbox:</p>
              <p className="text-[#00F0D9]">{email}</p>
            </div>

            <Button
              onClick={handleResendVerification}
              className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Resend Verification Email
            </Button>

            <Button
              onClick={() => setModalType(null)}
              variant="outline"
              className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
