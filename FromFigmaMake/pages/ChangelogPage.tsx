import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Rocket,
  Bug,
  BookOpen,
  AlertTriangle,
  Shield,
  Rss,
  Bell,
  Twitter,
  ArrowRight,
  ChevronDown,
  Mail,
  Calendar,
  Filter,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

type ChangeType = 'feature' | 'improvement' | 'bugfix' | 'documentation' | 'breaking' | 'security';

interface ChangelogEntry {
  date: string;
  dateLabel: string;
  badges?: string[];
  majorTitle?: string;
  majorDescription?: string;
  majorCTA?: { text: string; link: string };
  features?: string[];
  improvements?: string[];
  bugfixes?: string[];
  documentation?: string[];
  breaking?: { title: string; description: string; actions: string[]; guide?: string };
  security?: string[];
}

export default function ChangelogPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [visibleEntries, setVisibleEntries] = useState(5);

  const changelogEntries: ChangelogEntry[] = [
    {
      date: '2025-11-11',
      dateLabel: 'November 11, 2025',
      badges: ['NEW'],
      features: [
        'Video Extender: Extend your videos with AI continuation',
        'Batch Upload: Upload multiple videos at once',
      ],
      improvements: [
        '40% faster video processing',
        'Better character detection in low-light videos',
        'Improved mobile upload experience',
      ],
      bugfixes: [
        'Fixed issue where some PNG uploads were corrupted',
        'Resolved Safari video player controls not showing',
      ],
    },
    {
      date: '2025-11-01',
      dateLabel: 'November 1, 2025',
      badges: ['POPULAR'],
      features: [
        'Auto Subtitles: Automatically generate subtitles for videos',
        '16:9 Format Conversion: Convert vertical videos to horizontal',
      ],
      improvements: [
        'Email notifications now show video thumbnails',
        'API response time improved by 25%',
      ],
    },
    {
      date: '2025-10-20',
      dateLabel: 'October 20, 2025',
      badges: ['BREAKING'],
      breaking: {
        title: 'API v2 Released',
        description:
          "We've released API v2 with improved performance and new features. API v1 will be deprecated on December 1, 2025.",
        actions: [
          'Update your API endpoint from /v1/ to /v2/',
          'Review the migration guide',
          'Test your integration',
        ],
        guide: '/documentation#api-v2',
      },
    },
    {
      date: '2025-10-15',
      dateLabel: 'October 15, 2025',
      features: [
        'API Keys Management: Create and manage multiple API keys',
        'Safety Checker: Preview character detection before processing',
      ],
      improvements: [
        'Billing page redesigned for better clarity',
        'Increased max video length to 120 seconds',
      ],
      bugfixes: [
        'Fixed credit calculation error for failed jobs',
        'Resolved timezone issues in job timestamps',
      ],
    },
    {
      date: '2025-11-05',
      dateLabel: 'November 5, 2025',
      bugfixes: [
        'Fixed video download links expiring too early',
        'Resolved character detection issues with side profiles',
        'Fixed Safari browser upload progress not showing',
        'Corrected credit deduction for failed Safety Checker runs',
        'Fixed email notification duplicates',
      ],
    },
    {
      date: '2025-10-01',
      dateLabel: 'October 1, 2025',
      badges: ['POPULAR'],
      majorTitle: 'NewMe.AI Public Beta Launch',
      majorDescription: '🎉 Major Release',
      features: [
        'Free tier with 5 credits',
        'Creator and Studio subscription plans',
        'Full API access',
        '720p video generation',
        'Email support',
      ],
    },
  ];

  const comingSoonFeatures = [
    '4K resolution output',
    'Longer video support (up to 5 minutes)',
    'Real-time preview',
    'Mobile app (iOS & Android)',
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribing:', subscribeEmail);
    setSubscribeEmail('');
  };

  const getFilteredEntries = () => {
    if (filterType === 'all') return changelogEntries;

    return changelogEntries.filter((entry) => {
      switch (filterType) {
        case 'features':
          return entry.features && entry.features.length > 0;
        case 'improvements':
          return entry.improvements && entry.improvements.length > 0;
        case 'bugfixes':
          return entry.bugfixes && entry.bugfixes.length > 0;
        case 'breaking':
          return entry.breaking !== undefined;
        default:
          return true;
      }
    });
  };

  const filteredEntries = getFilteredEntries();
  const displayedEntries = filteredEntries.slice(0, visibleEntries);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-5 h-5 text-[#00F0D9]" />;
      case 'improvement':
        return <Rocket className="w-5 h-5 text-purple-400" />;
      case 'bugfix':
        return <Bug className="w-5 h-5 text-orange-400" />;
      case 'documentation':
        return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'breaking':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'security':
        return <Shield className="w-5 h-5 text-green-400" />;
      default:
        return null;
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'NEW':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'POPULAR':
        return 'bg-[#00F0D9]/20 text-[#00F0D9] border-[#00F0D9]/30';
      case 'BREAKING':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-[#334155] text-[#94A3B8] border-[#334155]';
    }
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-8 h-8 text-[#00F0D9]" />
          <h1 className="text-[#F1F5F9]">Changelog</h1>
        </div>
        <p className="text-[#94A3B8] text-lg mb-6">What's new with NewMe.AI</p>
        <div className="h-px bg-[#334155]"></div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Button
          variant="outline"
          className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          onClick={() => {
            const subscribeSection = document.getElementById('subscribe');
            subscribeSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Bell className="w-4 h-4 mr-2" />
          Subscribe to Updates
        </Button>
        <Button
          variant="outline"
          className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
        >
          <Rss className="w-4 h-4 mr-2" />
          RSS Feed
        </Button>
        <div className="ml-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px] bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-[#334155]">
              <SelectItem value="all" className="text-[#F1F5F9]">
                All Updates
              </SelectItem>
              <SelectItem value="features" className="text-[#F1F5F9]">
                New Features
              </SelectItem>
              <SelectItem value="improvements" className="text-[#F1F5F9]">
                Improvements
              </SelectItem>
              <SelectItem value="bugfixes" className="text-[#F1F5F9]">
                Bug Fixes
              </SelectItem>
              <SelectItem value="breaking" className="text-[#F1F5F9]">
                Breaking Changes
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-8 mb-8">
        {displayedEntries.map((entry, idx) => (
          <section
            key={entry.date}
            className="border border-[#334155] rounded-xl p-8 bg-[#0F172A] hover:border-[#00F0D9]/30 transition-colors"
          >
            {/* Date Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#00F0D9]" />
                <h2 className="text-[#F1F5F9] text-xl">{entry.dateLabel}</h2>
              </div>
              <div className="flex gap-2">
                {entry.badges?.map((badge) => (
                  <Badge key={badge} className={getBadgeStyle(badge)}>
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Major Release Section */}
            {entry.majorTitle && (
              <div className="mb-6 p-6 rounded-lg bg-gradient-to-br from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/20">
                {entry.majorDescription && (
                  <p className="text-[#00F0D9] mb-2">{entry.majorDescription}</p>
                )}
                <h3 className="text-[#F1F5F9] text-lg mb-4">{entry.majorTitle}</h3>
                {entry.majorCTA && (
                  <Link to={entry.majorCTA.link}>
                    <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                      {entry.majorCTA.text}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Breaking Changes Section */}
            {entry.breaking && (
              <div className="mb-6 p-6 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon('breaking')}
                  <h3 className="text-red-400">{entry.breaking.title}</h3>
                </div>
                <p className="text-[#94A3B8] mb-4">{entry.breaking.description}</p>
                {entry.breaking.actions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[#F1F5F9] mb-2">What you need to do:</p>
                    <ul className="space-y-2">
                      {entry.breaking.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[#94A3B8]">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {entry.breaking.guide && (
                  <Link to={entry.breaking.guide}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      View Migration Guide
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-6">
              {/* New Features */}
              {entry.features && entry.features.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon('feature')}
                    <h3 className="text-[#00F0D9]">✨ New Features</h3>
                  </div>
                  <ul className="space-y-2">
                    {entry.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#94A3B8]">
                        <span className="text-[#00F0D9] mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {entry.improvements && entry.improvements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon('improvement')}
                    <h3 className="text-purple-400">🚀 Improvements</h3>
                  </div>
                  <ul className="space-y-2">
                    {entry.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#94A3B8]">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bug Fixes */}
              {entry.bugfixes && entry.bugfixes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon('bugfix')}
                    <h3 className="text-orange-400">🐛 Bug Fixes</h3>
                  </div>
                  <ul className="space-y-2">
                    {entry.bugfixes.map((bugfix, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#94A3B8]">
                        <span className="text-orange-400 mt-1">•</span>
                        <span>{bugfix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documentation */}
              {entry.documentation && entry.documentation.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon('documentation')}
                    <h3 className="text-blue-400">📖 Documentation</h3>
                  </div>
                  <ul className="space-y-2">
                    {entry.documentation.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#94A3B8]">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Security */}
              {entry.security && entry.security.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon('security')}
                    <h3 className="text-green-400">🔒 Security</h3>
                  </div>
                  <ul className="space-y-2">
                    {entry.security.map((security, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#94A3B8]">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{security}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Load More Button */}
      {visibleEntries < filteredEntries.length && (
        <div className="text-center mb-8">
          <Button
            variant="outline"
            onClick={() => setVisibleEntries((prev) => prev + 5)}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            Load Older Updates
          </Button>
        </div>
      )}

      {/* Coming Soon Section */}
      <section className="border border-[#334155] rounded-xl p-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B] mb-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">🔮</span>
          <h2 className="text-[#F1F5F9] text-xl">Coming Soon</h2>
        </div>
        <p className="text-[#94A3B8] mb-4">Features we're working on:</p>
        <ul className="space-y-3 mb-6">
          {comingSoonFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[#94A3B8]">
              <span className="text-[#00F0D9] mt-1">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link to="/support">
          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
          >
            Want to request a feature? Submit Idea
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Subscribe Section */}
      <section
        id="subscribe"
        className="border border-[#334155] rounded-xl p-8 bg-[#0F172A]"
      >
        <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
          <Mail className="w-6 h-6 text-[#00F0D9]" />
          Get Update Notifications
        </h2>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
              required
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Subscribe
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
            <span>Or subscribe via:</span>
            <button
              type="button"
              className="flex items-center gap-2 hover:text-[#00F0D9] transition-colors"
            >
              <Rss className="w-4 h-4" />
              RSS Feed
            </button>
            <button
              type="button"
              className="flex items-center gap-2 hover:text-[#00F0D9] transition-colors"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
