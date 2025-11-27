import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Check,
  Mail,
  Linkedin,
  Share2,
  Gift,
  Users,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  Trophy,
  ExternalLink,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

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
  const [copied, setCopied] = useState(false);
  const [showAllReferrals, setShowAllReferrals] = useState(false);

  // Mock user data
  const userName = 'Alex Chen';
  const referralCode = 'alex-chen-abc123';
  const referralLink = `https://newme.ai/ref/${referralCode}`;

  // Stats
  const stats = {
    invited: 24,
    signedUp: 18,
    earned: 15,
  };

  // Referral activity
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

  // Leaderboard
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Sarah K.', referrals: 127, credits: 635 },
    { rank: 2, name: 'Mike J.', referrals: 89, credits: 445 },
    { rank: 3, name: 'Alex M.', referrals: 76, credits: 380 },
    { rank: 4, name: 'You', referrals: 18, credits: 90, isCurrentUser: true },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const message = encodeURIComponent(
      `I've been using NewMe.AI to create AI videos and it's awesome! Sign up with my link for 5 free credits: ${referralLink}`
    );
    const subject = encodeURIComponent('Try NewMe.AI - Get 5 Free Credits!');
    const emailBody = encodeURIComponent(
      `Hey!\n\nI've been using NewMe.AI to create AI videos and it's awesome.\n\nSign up with my link and you'll get 5 bonus credits to try it out:\n${referralLink}\n\nCheck it out!`
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
            title: 'Try NewMe.AI',
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
            ✅ Earned
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            ⏳ Pending
          </Badge>
        );
      case 'visited':
        return (
          <Badge className="bg-[#334155] text-[#94A3B8] border-[#334155]">
            👀 Visited
          </Badge>
        );
      default:
        return null;
    }
  };

  const displayedReferrals = showAllReferrals
    ? referralActivity
    : referralActivity.slice(0, 3);

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <Gift className="w-10 h-10 text-[#00F0D9]" />
          <h1 className="text-[#F1F5F9]">Refer Friends, Earn Credits</h1>
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
        <h2 className="text-[#F1F5F9] mb-4">Your Referral Link</h2>
        <div className="flex gap-3">
          <Input
            value={referralLink}
            readOnly
            className="flex-1 bg-[#1E293B] border-[#334155] text-[#F1F5F9] font-mono"
            onClick={(e) => e.currentTarget.select()}
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
        <h2 className="text-[#F1F5F9] mb-4">Share via</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleShare('email')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('twitter')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            <Twitter className="w-4 h-4 mr-2" />
            Twitter
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('linkedin')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('whatsapp')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          {navigator.share && (
            <Button
              variant="outline"
              onClick={() => handleShare('native')}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] mb-6">How It Works</h2>

        {/* Visual Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#00F0D9]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#00F0D9] text-2xl">1</span>
            </div>
            <h3 className="text-[#F1F5F9] mb-2">Share Your Link</h3>
            <p className="text-[#94A3B8] text-sm">
              Send your unique referral link to friends
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#00F0D9]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#00F0D9] text-2xl">2</span>
            </div>
            <h3 className="text-[#F1F5F9] mb-2">They Sign Up</h3>
            <p className="text-[#94A3B8] text-sm">
              They create an account and verify their email
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#00F0D9]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#00F0D9] text-2xl">3</span>
            </div>
            <h3 className="text-[#F1F5F9] mb-2">You Both Get Credits</h3>
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
        <h2 className="text-[#F1F5F9] mb-6">Referral Activity</h2>

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
          <h2 className="text-[#F1F5F9]">🏆 Top Referrers This Month</h2>
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
        <h2 className="text-[#F1F5F9] mb-4">Terms & Conditions</h2>
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
            <span>NewMe.AI reserves the right to revoke credits for abuse</span>
          </li>
        </ul>
        <Link to="/terms">
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
