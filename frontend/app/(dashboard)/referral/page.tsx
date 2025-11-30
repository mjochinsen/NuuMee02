'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  Mail,
  Linkedin,
  Share2,
  Gift,
  Users,
  Zap,
  Clock,
  CheckCircle,
  Eye,
  Trophy,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { getReferralCode, ReferralCodeResponse } from '@/lib/api';

interface ReferralActivity {
  name: string;
  status: 'visited' | 'pending' | 'earned';
  date: string;
  action: string;
  credits?: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  referrals: number;
  credits: number;
  isCurrentUser?: boolean;
}

export default function ReferralPage() {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showAllReferrals, setShowAllReferrals] = useState(false);
  const [referralData, setReferralData] = useState<ReferralCodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch referral data from API
  useEffect(() => {
    async function fetchReferralData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getReferralCode();
        setReferralData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch referral data:', err);
        setError('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    }
    fetchReferralData();
  }, [user]);

  // User data from API
  const referralCode = referralData?.referral_code || 'Loading...';
  const referralLink = referralData ? `https://nuumee.ai/ref/${referralData.referral_code}` : 'Loading...';

  // Stats from API
  const stats = {
    invited: referralData?.stats.total_referrals || 0,
    signedUp: referralData?.stats.converted_referrals || 0,
    earned: referralData?.stats.total_credits_earned || 0,
  };

  // Referral activity - mock data for now (would need separate API endpoint)
  const referralActivity: ReferralActivity[] = [
    {
      name: 'Sarah J.',
      status: 'earned',
      date: '2 days ago',
      action: 'Generated first video',
      credits: 5,
    },
    {
      name: 'Mike T.',
      status: 'pending',
      date: 'today',
      action: "Hasn't created video yet",
    },
    {
      name: 'Alex K.',
      status: 'earned',
      date: 'last week',
      action: 'Generated first video',
      credits: 5,
    },
    {
      name: 'Emily R.',
      status: 'pending',
      date: '3 days ago',
      action: "Hasn't created video yet",
    },
    {
      name: 'John D.',
      status: 'visited',
      date: 'yesterday',
      action: "Hasn't signed up yet",
    },
  ];

  // Leaderboard - mock data for now (would need separate API endpoint)
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Sarah K.', referrals: 127, credits: 635 },
    { rank: 2, name: 'Mike J.', referrals: 89, credits: 445 },
    { rank: 3, name: 'Alex M.', referrals: 76, credits: 380 },
    { rank: 4, name: 'You', referrals: stats.signedUp, credits: stats.earned, isCurrentUser: true },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const message = encodeURIComponent(
      `I've been using NuuMee.AI to create AI videos and it's awesome! Sign up with my link for 5 free credits: ${referralLink}`
    );
    const subject = encodeURIComponent('Try NuuMee.AI - Get 5 Free Credits!');
    const emailBody = encodeURIComponent(
      `Hey!\n\nI've been using NuuMee.AI to create AI videos and it's awesome.\n\nSign up with my link and you'll get 5 bonus credits to try it out:\n${referralLink}\n\nCheck it out!`
    );

    let url = '';
    switch (platform) {
      case 'email':
        url = `mailto:?subject=${subject}&body=${emailBody}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${message}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${message}`;
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: 'Try NuuMee.AI',
            text: `Sign up with my link for 5 free credits: ${referralLink}`,
            url: referralLink,
          });
          return;
        }
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'earned':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'visited':
        return <Eye className="w-5 h-5 text-[#94A3B8]" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'earned':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Earned
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending
          </Badge>
        );
      case 'visited':
        return (
          <Badge className="bg-[#334155] text-[#94A3B8] border-[#334155]">
            Visited
          </Badge>
        );
      default:
        return null;
    }
  };

  const displayedReferrals = showAllReferrals
    ? referralActivity
    : referralActivity.slice(0, 3);

  // Show loading state
  if (loading) {
    return (
      <main className="container mx-auto px-6 py-12 max-w-5xl flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#00F0D9] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading referral data...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="text-center border border-red-500/30 rounded-xl p-8 bg-red-500/10">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-[#334155] text-[#F1F5F9]">
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <Gift className="w-10 h-10 text-[#00F0D9]" />
          <h1 className="text-3xl font-bold text-[#F1F5F9]">Refer Friends, Earn Credits</h1>
        </div>
        <div className="h-px bg-[#334155] max-w-2xl mx-auto mb-6"></div>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[#F1F5F9] text-2xl mb-3">Give 5 credits, Get 5 credits</h2>
          <p className="text-[#94A3B8] text-lg">
            Your friends get 5 bonus credits. You get 5 credits when they create their first video.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-[#334155] bg-[#0F172A] p-6 text-center hover:border-[#00F0D9]/30 transition-colors">
          <Users className="w-8 h-8 text-[#00F0D9] mx-auto mb-3" />
          <p className="text-[#94A3B8] mb-2">Invited</p>
          <p className="text-3xl text-[#F1F5F9] mb-1">{stats.invited}</p>
          <p className="text-sm text-[#94A3B8]">friends</p>
        </Card>

        <Card className="border-[#334155] bg-[#0F172A] p-6 text-center hover:border-[#00F0D9]/30 transition-colors">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <p className="text-[#94A3B8] mb-2">Signed Up</p>
          <p className="text-3xl text-[#F1F5F9] mb-1">{stats.signedUp}</p>
          <p className="text-sm text-[#94A3B8]">friends</p>
        </Card>

        <Card className="border-[#334155] bg-[#0F172A] p-6 text-center hover:border-[#00F0D9]/30 transition-colors">
          <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <p className="text-[#94A3B8] mb-2">Earned</p>
          <p className="text-3xl text-[#F1F5F9] mb-1">{stats.earned}</p>
          <p className="text-sm text-[#94A3B8]">credits</p>
        </Card>
      </section>

      {/* Referral Link */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] text-xl font-semibold mb-4">Your Referral Link</h2>
        <div className="flex gap-3">
          <Input
            value={referralLink}
            readOnly
            className="flex-1 bg-[#1E293B] border-[#334155] text-[#F1F5F9] font-mono"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            onClick={handleCopyLink}
            className={`${
              copied
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90'
            } text-white min-w-[120px]`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Share Buttons */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] text-xl font-semibold mb-4">Share via</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleShare('email')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('twitter')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('linkedin')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('whatsapp')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </Button>
          {typeof window !== 'undefined' && 'share' in navigator && (
            <Button
              variant="outline"
              onClick={() => handleShare('native')}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] text-xl font-semibold mb-6">How It Works</h2>

        {/* Visual Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#00F0D9]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#00F0D9] text-2xl font-bold">1</span>
            </div>
            <h3 className="text-[#F1F5F9] font-semibold mb-2">Share Your Link</h3>
            <p className="text-[#94A3B8] text-sm">
              Send your unique referral link to friends
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#00F0D9]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#00F0D9] text-2xl font-bold">2</span>
            </div>
            <h3 className="text-[#F1F5F9] font-semibold mb-2">They Sign Up</h3>
            <p className="text-[#94A3B8] text-sm">
              They create an account and verify their email
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#00F0D9]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#00F0D9] text-2xl font-bold">3</span>
            </div>
            <h3 className="text-[#F1F5F9] font-semibold mb-2">You Both Get Credits</h3>
            <p className="text-[#94A3B8] text-sm">
              Instant rewards for both of you
            </p>
          </div>
        </div>

        {/* Detailed Steps */}
        <div className="space-y-3 text-[#94A3B8]">
          <div className="flex items-start gap-3">
            <span className="text-[#00F0D9] mt-1">1.</span>
            <span>Share your unique referral link</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#00F0D9] mt-1">2.</span>
            <span>Your friend signs up and verifies their email</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#00F0D9] mt-1">3.</span>
            <span>They get 5 bonus credits instantly</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#00F0D9] mt-1">4.</span>
            <span>When they create their first video, you get 5 credits</span>
          </div>
        </div>
      </section>

      {/* Referral Activity */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] text-xl font-semibold mb-6">Referral Activity</h2>

        <div className="space-y-4 mb-6">
          {displayedReferrals.map((referral, idx) => (
            <div
              key={idx}
              className="border border-[#334155] rounded-lg p-4 bg-[#1E293B] hover:border-[#00F0D9]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(referral.status)}
                  <h3 className="text-[#F1F5F9]">{referral.name}</h3>
                </div>
                {getStatusBadge(referral.status)}
              </div>
              <p className="text-[#94A3B8] text-sm mb-1">
                Signed up {referral.date} • {referral.action}
              </p>
              {referral.credits && (
                <p className="text-green-400 text-sm">+{referral.credits} credits</p>
              )}
            </div>
          ))}
        </div>

        {!showAllReferrals && referralActivity.length > 3 && (
          <Button
            variant="outline"
            onClick={() => setShowAllReferrals(true)}
            className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            View All Referrals
          </Button>
        )}
      </section>

      {/* Leaderboard */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9] text-xl font-semibold">Top Referrers This Month</h2>
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-4 rounded-lg ${
                entry.isCurrentUser
                  ? 'bg-[#00F0D9]/10 border border-[#00F0D9]/30'
                  : 'bg-[#1E293B] border border-[#334155]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl min-w-[2rem]">
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                  {entry.rank > 3 && <span className="text-[#94A3B8]">{entry.rank}.</span>}
                </span>
                <div>
                  <p className={entry.isCurrentUser ? 'text-[#00F0D9]' : 'text-[#F1F5F9]'}>
                    {entry.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#F1F5F9]">{entry.referrals} referrals</p>
                <p className="text-[#94A3B8] text-sm">{entry.credits} credits earned</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] text-xl font-semibold mb-4">Terms & Conditions</h2>
        <ul className="space-y-2 text-[#94A3B8] mb-6">
          <li className="flex items-start gap-2">
            <span className="text-[#00F0D9] mt-1">•</span>
            <span>
              Referral credits are awarded after referred user generates their first video
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00F0D9] mt-1">•</span>
            <span>No limit on number of referrals</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00F0D9] mt-1">•</span>
            <span>Credits never expire</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00F0D9] mt-1">•</span>
            <span>Self-referrals are not allowed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00F0D9] mt-1">•</span>
            <span>NuuMee.AI reserves the right to revoke credits for abuse</span>
          </li>
        </ul>
        <Link href="/terms">
          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            Full Terms
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>
    </main>
  );
}
