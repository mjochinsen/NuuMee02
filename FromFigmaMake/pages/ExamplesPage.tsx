import { useState } from 'react';
import { Check, X, Sparkles, Play, Clock, Zap, TrendingUp, Star, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';

type FilterType = 'all' | 'social' | 'ecommerce' | 'education' | 'marketing' | 'entertainment';

export default function ExamplesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters = [
    { id: 'all' as FilterType, label: 'All' },
    { id: 'social' as FilterType, label: 'Social Media' },
    { id: 'ecommerce' as FilterType, label: 'E-commerce' },
    { id: 'education' as FilterType, label: 'Education' },
    { id: 'marketing' as FilterType, label: 'Marketing' },
    { id: 'entertainment' as FilterType, label: 'Entertainment' },
  ];

  const goodExamples = [
    {
      title: 'Clear Front-Facing Photo',
      description: 'High-quality reference photo produces excellent results',
      credits: 20,
      time: '1.5 hours',
      badge: 'High quality result',
    },
    {
      title: 'Good Lighting Conditions',
      description: 'Well-lit reference ensures clear face detection',
      credits: 20,
      time: '1.2 hours',
      badge: 'Clear face detection',
    },
    {
      title: 'Simple Background',
      description: 'Clean background prevents artifacts',
      credits: 20,
      time: '1.4 hours',
      badge: 'No occlusion issues',
    },
    {
      title: 'Neutral Expression Match',
      description: 'Similar expressions between photo and video work best',
      credits: 20,
      time: '1.3 hours',
      badge: 'Perfect match',
    },
  ];

  const mistakes = [
    {
      title: 'Side Profile Photo',
      description: 'Side angle photos don\'t work well',
      issue: 'Face not detected',
      reason: 'Face detection requires front-facing view',
    },
    {
      title: 'Poor Lighting',
      description: 'Dark shadows obscure facial features',
      issue: 'Detection fails',
      reason: 'Insufficient lighting prevents accurate face mapping',
    },
    {
      title: 'Sunglasses Covering Face',
      description: 'Obscured facial features reduce accuracy',
      issue: 'Facial features obscured',
      reason: 'Eyes and face structure need to be visible',
    },
    {
      title: 'Multiple People',
      description: 'Multiple faces in frame cause confusion',
      issue: 'Wrong person detected',
      reason: 'AI cannot determine which person to use',
    },
  ];

  const useCases = [
    {
      category: 'Social Media Content',
      title: 'Create viral content without being on camera',
      description: 'Original TikTok dance → Your face dancing',
      user: '@CreatorName',
      followers: '2.3M followers',
      videoLength: '15 seconds',
      credits: 30,
      processingTime: '45 minutes',
      views: '2.3M views',
    },
    {
      category: 'E-commerce Product Demos',
      title: 'Test products with different models instantly',
      description: 'Model wearing product → Your brand ambassador',
      user: 'BrandName',
      followers: '',
      videoLength: '30 seconds',
      credits: 60,
      processingTime: '1.2 hours',
      result: '40% increase in conversions',
    },
    {
      category: 'Educational Content',
      title: 'Localize training videos without re-recording',
      description: 'Generic instructor → Your instructor teaching',
      user: 'EdTech Company',
      followers: '',
      videoLength: '60 seconds',
      credits: 120,
      processingTime: '2.5 hours',
      saved: '$5,000 in production costs',
    },
  ];

  const proTips = [
    {
      number: 1,
      title: 'Test with Safety Checker First',
      description: 'Use the free Safety Checker to verify your reference image will work before spending credits.',
    },
    {
      number: 2,
      title: 'Start with Shorter Videos',
      description: 'Test with 10-15 second clips first to ensure quality before generating longer videos.',
    },
    {
      number: 3,
      title: 'Use High-Resolution Source Files',
      description: 'Better input = better output. Upload 1080p when possible.',
    },
    {
      number: 4,
      title: 'Match Expressions and Angles',
      description: 'Reference photo should have similar expression and angle to the motion video for best results.',
    },
    {
      number: 5,
      title: 'Keep Backgrounds Simple',
      description: 'Complex backgrounds can cause artifacts. Use plain or slightly blurred backgrounds when possible.',
    },
  ];

  const qualityLevels = [
    {
      resolution: '480p',
      credits: 10,
      description: 'Good for testing',
    },
    {
      resolution: '720p',
      credits: 20,
      description: 'Best balance quality/cost',
      recommended: true,
    },
    {
      resolution: '1080p Source\nUpscaled 4K',
      credits: 50,
      description: 'Professional quality',
    },
  ];

  const featuredCreations = [
    {
      quote: 'Created 100 TikToks in one afternoon',
      user: 'Sarah, Content Creator',
      stat: '2.3M views',
    },
    {
      quote: 'Saved $10K in product photography costs',
      user: 'Mike, E-commerce Store Owner',
      stat: '40% conversion increase',
    },
    {
      quote: 'Localized training videos for 12 languages',
      user: 'Alex, Corporate Trainer',
      stat: '80% time savings',
    },
  ];

  return (
    <main className="min-h-screen bg-[#0A0F1E]">
      {/* Hero Section */}
      <section className="border-b border-[#334155]">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-[#00F0D9]" />
              <h1 className="text-[#F1F5F9]">Examples & Gallery</h1>
            </div>
            <p className="text-[#94A3B8] text-xl">
              See what's possible with NewMe.AI
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 mt-8">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-5 py-2.5 rounded-lg transition-all ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white'
                    : 'bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:border-[#00F0D9] hover:text-[#F1F5F9]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12 space-y-16">
        {/* What Works Best */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-[#00F0D9]" />
            </div>
            <h2 className="text-[#F1F5F9]">What Works Best</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {goodExamples.map((example, index) => (
              <div
                key={index}
                className="border border-[#334155] rounded-xl p-6 bg-[#0F172A] hover:border-[#00F0D9] transition-colors group"
              >
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="text-xs text-[#64748B] text-center">Before</div>
                        <div className="w-24 h-24 bg-[#334155] rounded-lg"></div>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-[#00F0D9]" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-xs text-[#64748B] text-center">After</div>
                        <div className="w-24 h-24 bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    className="absolute bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0 text-white"
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                </div>

                <h3 className="text-[#F1F5F9] mb-2">{example.title}</h3>
                <p className="text-[#94A3B8] text-sm mb-4">{example.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    <Check className="w-3 h-3 mr-1" />
                    {example.badge}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-[#64748B]">
                  <span>{example.credits} credits</span>
                  <span>{example.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Mistakes */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-[#F1F5F9]">Common Mistakes to Avoid</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mistakes.map((mistake, index) => (
              <div
                key={index}
                className="border border-[#334155] rounded-xl p-6 bg-[#0F172A]"
              >
                {/* Video Example Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg mb-4 flex items-center justify-center relative">
                  <div className="w-32 h-32 bg-[#334155] rounded-lg flex items-center justify-center">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <Button
                    size="icon"
                    className="absolute bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0 text-white"
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                </div>

                <h3 className="text-[#F1F5F9] mb-2">{mistake.title}</h3>
                <p className="text-[#94A3B8] text-sm mb-4">{mistake.description}</p>

                <div className="mb-4">
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                    <X className="w-3 h-3 mr-1" />
                    {mistake.issue}
                  </Badge>
                </div>

                <div className="text-sm text-[#64748B]">
                  <span className="text-[#94A3B8]">Why it failed:</span> {mistake.reason}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Use Case Examples */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#00F0D9]" />
            </div>
            <h2 className="text-[#F1F5F9]">Use Case Examples</h2>
          </div>

          <div className="space-y-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="border border-[#334155] rounded-xl p-8 bg-[#0F172A]"
              >
                <h3 className="text-[#F1F5F9] mb-6">{useCase.category}</h3>

                {/* Video Comparison */}
                <div className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg mb-6 flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center gap-4 p-8">
                    <div className="flex-1 space-y-3">
                      <div className="text-[#64748B] text-center">Before</div>
                      <div className="aspect-video bg-[#334155] rounded-lg"></div>
                    </div>
                    <div className="flex items-center">
                      <ArrowRight className="w-6 h-6 text-[#00F0D9]" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="text-[#64748B] text-center">After</div>
                      <div className="aspect-video bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 rounded-lg"></div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    className="absolute bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0 text-white z-10"
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                </div>

                <p className="text-[#F1F5F9] text-lg mb-6">{useCase.title}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-[#64748B] text-sm mb-1">Used by</div>
                    <div className="text-[#F1F5F9]">{useCase.user}</div>
                    {useCase.followers && (
                      <div className="text-[#94A3B8] text-sm">{useCase.followers}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-[#64748B] text-sm mb-1">Video length</div>
                    <div className="text-[#F1F5F9]">{useCase.videoLength}</div>
                  </div>
                  <div>
                    <div className="text-[#64748B] text-sm mb-1">Credits used</div>
                    <div className="text-[#F1F5F9]">{useCase.credits}</div>
                  </div>
                  <div>
                    <div className="text-[#64748B] text-sm mb-1">
                      {useCase.result ? 'Result' : useCase.saved ? 'Saved' : 'Processing time'}
                    </div>
                    <div className="text-[#F1F5F9]">
                      {useCase.result || useCase.saved || useCase.processingTime}
                    </div>
                  </div>
                </div>

                <Link to="/create">
                  <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                    Try This Template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}

            <div className="text-center">
              <Link to="/create">
                <Button
                  variant="outline"
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
                  View All Use Cases
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Photo Quality Guide */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#00F0D9]" />
            </div>
            <h2 className="text-[#F1F5F9]">Photo Quality Guide</h2>
          </div>

          <div className="border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Best Results */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Check className="w-5 h-5 text-green-400" />
                  <h3 className="text-[#F1F5F9]">Best Results</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Front-facing', color: 'green' },
                    { label: 'Good lighting', color: 'green' },
                    { label: 'Clear face', color: 'green' },
                    { label: 'Simple background', color: 'green' },
                    { label: 'High resolution', color: 'green' },
                    { label: 'Neutral expression', color: 'green' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg flex items-center justify-center">
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-[#F1F5F9]">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avoid */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <X className="w-5 h-5 text-red-400" />
                  <h3 className="text-[#F1F5F9]">Avoid</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Side profile', color: 'red' },
                    { label: 'Poor lighting', color: 'red' },
                    { label: 'Face obscured', color: 'red' },
                    { label: 'Busy background', color: 'red' },
                    { label: 'Low resolution', color: 'red' },
                    { label: 'Extreme expression', color: 'red' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-lg flex items-center justify-center">
                        <X className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="text-[#F1F5F9]">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Motion Video Guide */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-[#00F0D9]" />
            </div>
            <h2 className="text-[#F1F5F9]">Motion Video Guide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Practices */}
            <div className="border border-[#334155] rounded-xl p-6 bg-[#0F172A]">
              <h3 className="text-[#F1F5F9] mb-4">Best Practices:</h3>
              <div className="space-y-3">
                {[
                  'Clear, centered subject',
                  'Consistent lighting throughout',
                  'Smooth, steady camera movement',
                  'Face visible in most frames',
                  '1080p or higher resolution',
                  '24-60 fps',
                ].map((practice, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">{practice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid */}
            <div className="border border-[#334155] rounded-xl p-6 bg-[#0F172A]">
              <h3 className="text-[#F1F5F9] mb-4">Avoid:</h3>
              <div className="space-y-3">
                {[
                  'Extreme motion blur',
                  'Face covered or obscured',
                  'Rapid lighting changes',
                  'Multiple people in frame',
                  'Very low resolution (< 480p)',
                  'Extreme close-ups or wide shots',
                ].map((avoid, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">{avoid}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pro Tips */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00F0D9]" />
            </div>
            <h2 className="text-[#F1F5F9]">Pro Tips</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proTips.map((tip) => (
              <div
                key={tip.number}
                className="border border-[#334155] rounded-xl p-6 bg-[#0F172A] hover:border-[#00F0D9] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center flex-shrink-0">
                    <span className="text-white">{tip.number}</span>
                  </div>
                  <div>
                    <h3 className="text-[#F1F5F9] mb-2">{tip.title}</h3>
                    <p className="text-[#94A3B8]">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quality Comparison */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#00F0D9]" />
            </div>
            <h2 className="text-[#F1F5F9]">Quality Comparison</h2>
          </div>

          <div className="border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
            <h3 className="text-[#F1F5F9] mb-6">Resolution Impact:</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {qualityLevels.map((level, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-6 ${
                    level.recommended
                      ? 'border-[#00F0D9] bg-gradient-to-br from-[#00F0D9]/5 to-[#3B1FE2]/5'
                      : 'border-[#334155] bg-[#1E293B]'
                  }`}
                >
                  {level.recommended && (
                    <Badge className="mb-4 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-0">
                      Recommended
                    </Badge>
                  )}

                  {/* Video Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg mb-4 flex items-center justify-center relative">
                    <Button
                      size="icon"
                      className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0 text-white"
                    >
                      <Play className="w-5 h-5" />
                    </Button>
                  </div>

                  <h3 className="text-[#F1F5F9] mb-2 whitespace-pre-line">{level.resolution}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-[#00F0D9]" />
                    <span className="text-[#94A3B8]">{level.credits} credits</span>
                  </div>
                  <p className="text-[#64748B] text-sm">{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Creations */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#00F0D9]" />
            </div>
            <h2 className="text-[#F1F5F9]">Featured Creations</h2>
          </div>

          <p className="text-[#94A3B8] mb-6">From our community:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {featuredCreations.map((creation, index) => (
              <div
                key={index}
                className="border border-[#334155] rounded-xl p-6 bg-[#0F172A] hover:border-[#00F0D9] transition-colors"
              >
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg mb-4 flex items-center justify-center relative">
                  <Button
                    size="icon"
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0 text-white"
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                </div>

                <p className="text-[#F1F5F9] mb-3">"{creation.quote}"</p>
                <p className="text-[#94A3B8] text-sm mb-2">— {creation.user}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#00F0D9]" />
                  <span className="text-[#00F0D9]">{creation.stat}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              View More Examples
            </Button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border border-[#334155] rounded-xl p-12 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-center">
          <h2 className="text-[#F1F5F9] mb-4">Ready to Create?</h2>
          <p className="text-[#94A3B8] text-lg mb-8">
            Start with 25 free credits — no credit card required
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/create">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white h-14 px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try NewMe.AI Free
              </Button>
            </Link>
            <Link to="/price">
              <Button
                size="lg"
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] h-14 px-8"
              >
                View Pricing
              </Button>
            </Link>
            <Link to="/documentation">
              <Button
                size="lg"
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] h-14 px-8"
              >
                Read Documentation
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
