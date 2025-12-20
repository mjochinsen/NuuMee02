'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Book,
  Code,
  Video,
  Image,
  Settings,
  Wrench,
  Sparkles,
  Play,
  Zap,
  Film,
  Heart,
  Rocket,
  Smile,
  ChevronRight,
  Lightbulb,
  Wand2,
  ArrowRight,
  Check,
  HelpCircle,
  Upload,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';

type VibeType = 'cinematic' | 'fun' | 'personal' | 'viral';

const vibes: { id: VibeType; icon: typeof Film; label: string; description: string; color: string }[] = [
  { id: 'cinematic', icon: Film, label: 'Cinematic', description: 'Dramatic, stylized, artistic', color: 'from-purple-500 to-indigo-600' },
  { id: 'fun', icon: Smile, label: 'Fun', description: 'Comedy, memes, playful content', color: 'from-yellow-400 to-orange-500' },
  { id: 'personal', icon: Heart, label: 'Personal', description: 'Messages, greetings, emotional', color: 'from-pink-500 to-rose-500' },
  { id: 'viral', icon: Rocket, label: 'Viral', description: 'Shorts, trends, scroll-stopping', color: 'from-[#00F0D9] to-[#3B1FE2]' },
];

const creativeExamples = [
  { title: 'Comedy Skit', description: 'Quick meme creator flow', vibe: 'fun' as VibeType, thumbnail: '/examples/comedy.jpg' },
  { title: 'Cinematic Scene', description: 'Stylized persona storytelling', vibe: 'cinematic' as VibeType, thumbnail: '/examples/cinematic.jpg' },
  { title: 'Trend Hook Short', description: 'Scroll-stopping viral content', vibe: 'viral' as VibeType, thumbnail: '/examples/viral.jpg' },
  { title: 'Personal Message', description: 'Heartfelt greeting video', vibe: 'personal' as VibeType, thumbnail: '/examples/personal.jpg' },
];

const faqItems = [
  { q: 'What makes a video engaging?', a: 'Great videos combine a clear hook, authentic expression, and a story that resonates. Start with one strong idea and let the visuals amplify your message.' },
  { q: 'How do I choose my vibe?', a: 'Think about your audience and goal. Fun for laughs, Cinematic for impact, Personal for connection, Viral for reach. Your vibe shapes everything.' },
  { q: 'How do I use scripts for storytelling?', a: 'Our templates give you proven structures. Add your unique twist, upload your photo, and watch your story come alive in stylized motion.' },
  { q: 'What file formats are supported?', a: 'Upload photos as JPG, PNG, or WebP. Videos can be MP4, MOV, or WebM. We handle the rest.' },
  { q: 'How long does processing take?', a: 'Most stylized videos are ready in 2-10 minutes, depending on length and resolution. Grab a coffee—your creation will be waiting.' },
  { q: 'How are credits calculated?', a: 'Credits are based on video length and resolution. 480p uses fewer credits than 720p. Check the creator page for real-time estimates.' },
  { q: 'Can I use this for commercial projects?', a: 'Absolutely! Use your own images to create stylized videos for any creative or commercial purpose. Your image, your story, your rights.' },
];

export default function DocumentationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedVibe, setSelectedVibe] = useState<VibeType>('viral');

  const handleStartCreating = () => {
    if (user) {
      router.push('/videos/create');
    } else {
      router.push('/login?redirect=/videos/create');
    }
  };

  const sections = [
    {
      icon: Sparkles,
      title: 'Start Your First Stylized Story',
      description: 'Create your first stylized video in minutes. No camera, no crew—just your photo and imagination.',
      topics: ['Quick Start in 3 Steps', 'Uploading Your Photo', 'Choosing Your Style', 'Understanding Your Creation'],
      cta: 'Try this: upload a photo and write a one-line hook. See what NuuMee makes.',
    },
    {
      icon: Palette,
      title: 'Customize Your Visual Voice',
      description: 'Fine-tune every aspect of your stylized video to match your creative vision.',
      topics: ['Resolution & Quality', 'Style Intensity', 'Motion & Expression', 'Advanced Controls'],
      cta: null,
    },
    {
      icon: Lightbulb,
      title: 'Create Better, Faster, More Wow',
      description: 'Tips from creators who\'ve mastered the art of stylized video storytelling.',
      topics: ['Viral Content Hooks', 'Trend Formats (Shorts/Reels/TikTok)', 'Creative Persona Tips', 'Motion & Lighting for Impact'],
      cta: 'See examples that spark ideas with ready-to-use templates.',
    },
    {
      icon: Wand2,
      title: 'Polish & Amplify Your Vision',
      description: 'Take your creation further with powerful post-processing tools.',
      topics: ['Extend Your Video (+5s, +10s)', '4K Upscaling', 'Sound & Music', 'Auto Captions'],
      cta: null,
    },
    {
      icon: Code,
      title: 'Creativity in Code',
      description: 'Build creativity into your app—generate stylized videos programmatically.',
      topics: ['Authentication & Keys', 'API Endpoints', 'Webhooks & Events', 'Rate Limits & Best Practices'],
      cta: 'Build creativity into your app—generate stylized videos from code.',
    },
    {
      icon: HelpCircle,
      title: 'Answers for Your Imagination Flow',
      description: 'Quick answers to keep your creative momentum going.',
      topics: ['Troubleshooting', 'Credit Questions', 'File Formats', 'Processing Times'],
      cta: null,
    },
  ];

  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F0D9]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B1FE2]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#F1F5F9] mb-6 leading-tight">
              Your image. Your story.
              <span className="block mt-2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent">
                Stylized videos from photo to motion.
              </span>
            </h1>
            <p className="text-[#94A3B8] text-xl mb-8 max-w-2xl mx-auto">
              Infinite ideas, one stylized video tool. Learn how to bring your videos to life.
            </p>
            <Button
              size="lg"
              onClick={handleStartCreating}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8 py-6 text-lg"
            >
              Start Creating Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 border-t border-[#334155]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F1F5F9] mb-4">
              Create your first stylized video in 3 simple steps
            </h2>
            <p className="text-[#94A3B8]">Make your first video in 3 steps—no camera needed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { step: 1, icon: Upload, title: 'Upload Your Photo', description: 'A clear photo of you or your character. This becomes your stylized digital self.' },
              { step: 2, icon: Play, title: 'Choose Motion', description: 'Select a driving video or let AI generate movement that matches your vibe.' },
              { step: 3, icon: Sparkles, title: 'Create Your Video', description: 'Watch as your photo transforms into expressive, stylized motion.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] text-center h-full hover:border-[#00F0D9] transition-colors">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center mx-auto mb-6 text-2xl text-white font-bold">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#1E293B] flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-[#00F0D9]" />
                  </div>
                  <h3 className="text-[#F1F5F9] text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-[#94A3B8]">{item.description}</p>
                </div>
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-[#00F0D9]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-[#64748B] text-sm">
            Creates stylized, expressive video—your image, your story.
          </p>
        </div>
      </section>

      {/* Choose Your Vibe Section */}
      <section className="py-16 bg-[#1E293B]/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F1F5F9] mb-4">Choose Your Vibe</h2>
            <p className="text-[#94A3B8]">Every great video starts with intention. What story do you want to tell?</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {vibes.map((vibe) => (
              <button
                key={vibe.id}
                onClick={() => setSelectedVibe(vibe.id)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  selectedVibe === vibe.id
                    ? 'border-[#00F0D9] bg-[#00F0D9]/10'
                    : 'border-[#334155] bg-[#0F172A] hover:border-[#00F0D9]/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${vibe.color} flex items-center justify-center mx-auto mb-4`}>
                  <vibe.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[#F1F5F9] font-semibold mb-1">{vibe.label}</h3>
                <p className="text-[#94A3B8] text-sm">{vibe.description}</p>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={handleStartCreating}
              className="border-[#00F0D9] text-[#00F0D9] hover:bg-[#00F0D9]/10"
            >
              Start with {vibes.find(v => v.id === selectedVibe)?.label} Vibe
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Creative Examples Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F1F5F9] mb-4">Creative Examples</h2>
            <p className="text-[#94A3B8]">Examples that spark ideas. Click to try a template.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creativeExamples.map((example) => {
              const vibeData = vibes.find(v => v.id === example.vibe);
              return (
                <div
                  key={example.title}
                  className="group border border-[#334155] rounded-2xl overflow-hidden bg-[#0F172A] hover:border-[#00F0D9] transition-all cursor-pointer"
                  onClick={handleStartCreating}
                >
                  <div className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center relative">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${vibeData?.color} flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity`}>
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r ${vibeData?.color} text-white`}>
                        {vibeData?.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[#F1F5F9] font-semibold mb-1 group-hover:text-[#00F0D9] transition-colors">
                      {example.title}
                    </h3>
                    <p className="text-[#94A3B8] text-sm">{example.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[#64748B] text-sm mt-8">
            Using your images only—designed for creative, not deceptive, use.
          </p>
        </div>
      </section>

      {/* Documentation Sections Grid */}
      <section className="py-16 bg-[#1E293B]/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F1F5F9] mb-4">Learn Everything</h2>
            <p className="text-[#94A3B8]">Deep dives into every aspect of stylized video creation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] hover:border-[#00F0D9] transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center mb-4">
                  <section.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-[#F1F5F9] font-semibold mb-2 group-hover:text-[#00F0D9] transition-colors">
                  {section.title}
                </h3>

                <p className="text-[#94A3B8] mb-4 text-sm">
                  {section.description}
                </p>

                <ul className="space-y-2 mb-4">
                  {section.topics.map((topic) => (
                    <li key={topic} className="text-[#94A3B8] text-sm flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00F0D9] flex-shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>

                {section.cta && (
                  <p className="text-[#00F0D9] text-sm italic border-t border-[#334155] pt-4 mt-4">
                    {section.cta}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F1F5F9] mb-4">Answers for Your Imagination Flow</h2>
            <p className="text-[#94A3B8]">Quick answers to keep your creative momentum going.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="border border-[#334155] rounded-xl p-6 bg-[#0F172A] hover:border-[#00F0D9]/50 transition-colors"
              >
                <h3 className="text-[#F1F5F9] font-semibold mb-2 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  {item.q}
                </h3>
                <p className="text-[#94A3B8] pl-8">{item.a}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[#64748B] text-sm mt-8">
            Stylized only—no impersonation or deepfake techniques. Use images you own for creative expression.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-[#1E293B]/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
            <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/api-keys"
                className="flex items-center gap-3 p-4 rounded-lg border border-[#334155] hover:border-[#00F0D9] transition-colors group"
              >
                <Code className="w-5 h-5 text-[#00F0D9]" />
                <div>
                  <div className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">API Documentation</div>
                  <div className="text-[#94A3B8] text-sm">Automate your workflow</div>
                </div>
              </Link>

              <Link
                href="/examples"
                className="flex items-center gap-3 p-4 rounded-lg border border-[#334155] hover:border-[#00F0D9] transition-colors group"
              >
                <Video className="w-5 h-5 text-[#00F0D9]" />
                <div>
                  <div className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">Watch Tutorials</div>
                  <div className="text-[#94A3B8] text-sm">See example videos</div>
                </div>
              </Link>

              <Link
                href="/changelog"
                className="flex items-center gap-3 p-4 rounded-lg border border-[#334155] hover:border-[#00F0D9] transition-colors group"
              >
                <Book className="w-5 h-5 text-[#00F0D9]" />
                <div>
                  <div className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">Changelog</div>
                  <div className="text-[#94A3B8] text-sm">Latest features</div>
                </div>
              </Link>

              <Link
                href="/support"
                className="flex items-center gap-3 p-4 rounded-lg border border-[#334155] hover:border-[#00F0D9] transition-colors group"
              >
                <Wrench className="w-5 h-5 text-[#00F0D9]" />
                <div>
                  <div className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">Support Center</div>
                  <div className="text-[#94A3B8] text-sm">Get help fast</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F1F5F9] mb-6">
            Your vision defines the video.
          </h2>
          <p className="text-[#94A3B8] text-xl mb-8">
            Learn fast, create wild, iterate endlessly.
          </p>
          <Button
            size="lg"
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-12 py-6 text-xl"
          >
            Start Creating Now
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </main>
  );
}
