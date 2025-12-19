'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Zap,
  Target,
  Palette,
  Lock,
  Video,
  Star,
  Check,
  ChevronRight,
  Sparkles,
  Film,
  Laugh,
  Rocket,
  Eye,
  Clock,
  Heart,
  Music,
  Paintbrush,
  Flame,
  TrendingUp,
  MessageCircle,
  Gift,
  Camera,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';

// Content configuration for each angle
const angleContent = {
  creative: {
    heroHeadline: 'Create Stylized Videos Featuring You',
    heroSubheadline: 'Your face. Any scenario. Instant video. No filming required.',
    heroCta: 'Start Creating Free',
    finalCtaHeadline: 'Your Ideas Deserve to Be Seen',
    finalCtaButton: 'Create Your First Video',
    useCases: [
      { icon: Film, title: 'Storytelling', description: 'Bring your narratives to life with you as the star' },
      { icon: Paintbrush, title: 'Art & Expression', description: 'Express yourself in impossible visual styles' },
      { icon: Music, title: 'Music Videos', description: 'Create stunning visuals for your music' },
      { icon: Sparkles, title: 'Fantasy Worlds', description: 'Place yourself in any environment imaginable' },
      { icon: Wand2, title: 'Character Play', description: 'Become any character you can dream up' },
      { icon: Palette, title: 'Creative Expression', description: 'Push the boundaries of visual content' },
    ],
  },
  fun: {
    heroHeadline: 'Create Hilarious, Scroll-Stopping Videos',
    heroSubheadline: 'Comedy. Skits. Parody. Your face in any fictional scenario.',
    heroCta: 'Make Something Wild',
    finalCtaHeadline: 'Boring Content Is Optional',
    finalCtaButton: 'Create Something Fun',
    useCases: [
      { icon: Laugh, title: 'Comedy Skits', description: 'Create hilarious content without a film crew' },
      { icon: Film, title: 'Parody Videos', description: 'Recreate famous scenes with you as the star' },
      { icon: MessageCircle, title: 'Reaction Content', description: 'Make reaction videos that stand out' },
      { icon: Flame, title: 'Meme Creation', description: 'Jump on meme trends instantly' },
      { icon: Sparkles, title: 'Playful Content', description: 'Let your imagination run wild' },
      { icon: Heart, title: 'Pure Humor', description: 'Make your audience laugh out loud' },
    ],
  },
  shorts: {
    heroHeadline: 'Dominate Short-Form Content',
    heroSubheadline: 'Jump on trends instantly. No filming. No delays. Just post.',
    heroCta: 'Create Your First Short',
    finalCtaHeadline: 'While Others Film, You\'re Already Live',
    finalCtaButton: 'Start Creating Shorts',
    useCases: [
      { icon: TrendingUp, title: 'TikTok Trends', description: 'Jump on trends before they expire' },
      { icon: Camera, title: 'Instagram Reels', description: 'Create scroll-stopping content daily' },
      { icon: Video, title: 'YouTube Shorts', description: 'Grow your channel with consistent uploads' },
      { icon: Rocket, title: 'Viral Hooks', description: 'Create attention-grabbing intros' },
      { icon: Clock, title: 'Quick Content', description: 'From idea to post in minutes' },
      { icon: Zap, title: 'Trend Riding', description: 'Never miss a viral moment again' },
    ],
  },
  wow: {
    heroHeadline: 'Create Videos That Stop Scrollers',
    heroSubheadline: 'Cinematic. Stylized. Impossible-looking. Your face in worlds that don\'t exist.',
    heroCta: 'Create Something Impossible',
    finalCtaHeadline: 'Make Them Wonder How You Did It',
    finalCtaButton: 'Create Wow-Factor Content',
    useCases: [
      { icon: Film, title: 'Cinematic Looks', description: 'Hollywood-quality visuals without the budget' },
      { icon: Rocket, title: 'Sci-Fi Worlds', description: 'Place yourself in futuristic environments' },
      { icon: Sparkles, title: 'Fantasy Realms', description: 'Create magical, otherworldly content' },
      { icon: Paintbrush, title: 'Abstract Art', description: 'Turn yourself into living art' },
      { icon: Eye, title: 'Visual Stories', description: 'Tell stories that captivate' },
      { icon: Wand2, title: 'Impossible Scenes', description: 'Create what cameras can\'t capture' },
    ],
  },
  fast: {
    heroHeadline: 'Professional Videos in Minutes',
    heroSubheadline: 'No filming. No editing. No setup. Just results.',
    heroCta: 'Try It Free',
    finalCtaHeadline: 'Stop Spending Hours on Video',
    finalCtaButton: 'Create a Video Now',
    useCases: [
      { icon: Target, title: 'Marketing Videos', description: 'Create promotional content instantly' },
      { icon: Video, title: 'Training Content', description: 'Produce training videos at scale' },
      { icon: MessageCircle, title: 'Quick Updates', description: 'Communicate with your team or audience' },
      { icon: Zap, title: 'Explainer Videos', description: 'Break down complex topics visually' },
      { icon: TrendingUp, title: 'Announcements', description: 'Share news without scheduling shoots' },
      { icon: Clock, title: 'Professional Speed', description: 'From concept to delivery in minutes' },
    ],
  },
  personal: {
    heroHeadline: 'Send Unforgettable Video Messages',
    heroSubheadline: 'Birthdays. Announcements. Moments that matter. Your face, your words, zero filming.',
    heroCta: 'Create a Message',
    finalCtaHeadline: 'Say It in a Way They\'ll Never Forget',
    finalCtaButton: 'Create Your Message',
    useCases: [
      { icon: Gift, title: 'Birthday Wishes', description: 'Create personalized birthday videos' },
      { icon: Heart, title: 'Anniversaries', description: 'Celebrate milestones in a unique way' },
      { icon: Sparkles, title: 'Special Gifts', description: 'Give a video gift they\'ll treasure' },
      { icon: MessageCircle, title: 'Personal Messages', description: 'Say what words alone can\'t express' },
      { icon: Camera, title: 'Memory Making', description: 'Create lasting digital memories' },
      { icon: Heart, title: 'Love Notes', description: 'Express your feelings creatively' },
    ],
  },
};

type AngleKey = keyof typeof angleContent;

function GoPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Get angle from URL params, default to 'creative'
  const angleParam = searchParams.get('angle') || 'creative';
  const angle: AngleKey = (angleParam in angleContent) ? angleParam as AngleKey : 'creative';
  const content = angleContent[angle];

  const handleStartCreating = () => {
    if (user) {
      router.push('/videos/create');
    } else {
      router.push('/login?redirect=/videos/create');
    }
  };

  const testimonials = [
    {
      quote: "This tool saved my content calendar. I can now create variations of my videos in minutes instead of days of reshooting. Game changer.",
      author: "Sarah Chen",
      role: "YouTube (2.3M subscribers)",
      rating: 5,
    },
    {
      quote: "10x faster than traditional methods. The quality is incredible and my clients can't tell the difference.",
      author: "Alex Morgan",
      role: "Video Producer",
      rating: 5,
    },
    {
      quote: "Best tool I've used this year. The AI is mind-blowing and the results speak for themselves.",
      author: "Chris Parker",
      role: "Content Creator",
      rating: 5,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F0D9]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B1FE2]/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-[#F1F5F9] mb-6 text-5xl md:text-6xl lg:text-7xl max-w-5xl mx-auto leading-tight font-bold">
              {content.heroHeadline}
            </h1>

            <p className="text-[#94A3B8] text-lg md:text-xl max-w-3xl mx-auto mb-6">
              {content.heroSubheadline}
            </p>

            {/* Trust line */}
            <p className="text-[#64748B] text-sm max-w-2xl mx-auto mb-10">
              Stylized videos using images you own. Creative expression, not impersonation.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                onClick={handleStartCreating}
                className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8 py-6 text-lg shadow-lg shadow-[#00F0D9]/20"
              >
                {content.heroCta}
              </Button>
              <p className="text-[#94A3B8] text-sm">No credit card required</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-center">
              <div>
                <div className="text-2xl md:text-3xl text-[#F1F5F9] mb-1">1M+</div>
                <div className="text-[#94A3B8] text-sm">Videos Generated</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl text-[#F1F5F9] mb-1 flex items-center justify-center gap-1">
                  ★★★★★
                </div>
                <div className="text-[#94A3B8] text-sm">4.9/5 from 10K+ creators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Grid Section */}
      <section className="py-16 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl md:max-w-[70%] lg:max-w-[65%] mx-auto">
            <div className="relative border-2 border-[#334155] rounded-2xl overflow-hidden bg-[#1E293B]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/hero-comparison-2.mp4" type="video/mp4" />
              </video>

              <div className="absolute top-4 left-4">
                <Badge className="bg-black/50 text-white border-white/20">
                  Original
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-none">
                  AI Generated
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              How It Works
            </h2>
            <p className="text-[#94A3B8] text-lg">Three simple steps to your video</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] text-center h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center mx-auto mb-6 text-2xl text-white font-bold">
                  1
                </div>
                <h3 className="text-[#F1F5F9] text-xl mb-4 font-semibold">Upload Your Photo</h3>
                <div className="mb-4 rounded-xl overflow-hidden aspect-[9/16] max-h-[280px] mx-auto bg-[#1E293B]">
                  <img
                    src="/step1-character.png"
                    alt="Upload your photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[#94A3B8]">
                  Upload a clear photo of yourself or any character
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ChevronRight className="w-8 h-8 text-[#00F0D9]" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] text-center h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center mx-auto mb-6 text-2xl text-white font-bold">
                  2
                </div>
                <h3 className="text-[#F1F5F9] text-xl mb-4 font-semibold">Add Your Script</h3>
                <div className="mb-4 rounded-xl overflow-hidden aspect-[9/16] max-h-[280px] mx-auto bg-[#1E293B]">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    <source src="/step2-video.mp4" type="video/mp4" />
                  </video>
                </div>
                <p className="text-[#94A3B8]">
                  Choose a template or upload your own video
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ChevronRight className="w-8 h-8 text-[#00F0D9]" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center mx-auto mb-6 text-2xl text-white font-bold">
                3
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-4 font-semibold">Get Your Video</h3>
              <div className="mb-4 rounded-xl overflow-hidden aspect-[9/16] max-h-[280px] mx-auto bg-[#1E293B]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source src="/step3-result.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="text-[#94A3B8]">
                Download your AI-generated video in minutes
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={handleStartCreating}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8"
            >
              Try It Now - It&apos;s Free
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases Section - Dynamic by angle */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              Perfect For
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {content.useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <div
                  key={index}
                  className="border border-[#334155] rounded-2xl p-6 bg-[#1E293B] hover:border-[#00F0D9] transition-all hover:shadow-lg hover:shadow-[#00F0D9]/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-[#00F0D9]" />
                  </div>
                  <h3 className="text-[#F1F5F9] text-xl mb-2 font-semibold">{useCase.title}</h3>
                  <p className="text-[#94A3B8]">{useCase.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              Loved by 10,000+ Creators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="border border-[#334155] rounded-2xl p-6 bg-[#1E293B] hover:border-[#00F0D9] transition-colors"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-[#F1F5F9] mb-4">&quot;{testimonial.quote}&quot;</p>
                <p className="text-[#94A3B8] text-sm">
                  — {testimonial.author}<br />
                  {testimonial.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Dynamic by angle */}
      <section className="py-24 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl lg:text-6xl mb-6 font-bold">
              {content.finalCtaHeadline}
            </h2>
            <p className="text-[#94A3B8] text-xl mb-10">
              Join 10,000+ creators making magic with AI
            </p>

            <Button
              size="lg"
              onClick={handleStartCreating}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-12 py-8 text-xl shadow-2xl shadow-[#00F0D9]/20"
            >
              {content.finalCtaButton}
            </Button>

            <p className="text-[#64748B] text-sm mt-6">
              No credit card required • Free to start
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B]">
              <h3 className="text-[#F1F5F9] text-lg font-semibold mb-2">How does it work?</h3>
              <p className="text-[#94A3B8]">
                Upload a photo of yourself and a video template. Our AI replaces the character in the video with your likeness while preserving all the motion and expression.
              </p>
            </div>

            <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B]">
              <h3 className="text-[#F1F5F9] text-lg font-semibold mb-2">How long does it take?</h3>
              <p className="text-[#94A3B8]">
                Most videos are processed in 2-10 minutes, depending on the length and complexity.
              </p>
            </div>

            <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B]">
              <h3 className="text-[#F1F5F9] text-lg font-semibold mb-2">Is it safe to use?</h3>
              <p className="text-[#94A3B8]">
                Yes. Your videos are encrypted and automatically deleted after processing. We never share your content.
              </p>
            </div>

            <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B]">
              <h3 className="text-[#F1F5F9] text-lg font-semibold mb-2">Can I use it commercially?</h3>
              <p className="text-[#94A3B8]">
                Yes, you own full rights to videos created with your own images. Use them for any purpose.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/documentation">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                View All FAQs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main page component with Suspense wrapper for useSearchParams
export default function GoPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-[#94A3B8]">Loading...</div>
      </div>
    }>
      <GoPageContent />
    </Suspense>
  );
}
