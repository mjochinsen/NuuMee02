'use client';

import { useState } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verifyAdminPassword } from '@/lib/admin-api';

interface PasswordPromptProps {
  onSuccess: () => void;
}

export function PasswordPrompt({ onSuccess }: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        onSuccess();
      } else {
        setError('Invalid password');
        setPassword('');
      }
    } catch (err) {
      setError('Failed to verify password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#334155]">
            <Lock className="w-8 h-8 text-[#00F0D9]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Admin Panel</h1>
          <p className="text-[#94A3B8]">Enter your admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] h-12"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Access Admin Panel'
            )}
          </Button>
        </form>

        <p className="text-center text-[#64748B] text-sm mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
