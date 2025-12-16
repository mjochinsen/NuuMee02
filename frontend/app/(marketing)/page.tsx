'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Zap,
  Target,
  Palette,
  Lock,
  Video,
  DollarSign,
  Star,
  Check,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleStartCreating = () => {
    if (user) {
      router.push('/videos/create');
    } else {
      router.push('/login?redirect=/videos/create');
    }
  };

  const handlePricingClick = () => {
    if (user) {
      router.push('/billing');
    } else {
      router.push('/login?redirect=/billing');
    }
  };

  const useCases = [
    {
      category: 'marketing',
      title: 'Product Demo',
      metric: 'Increased conversions by 340%',
      image: 'business product demo',
    },
    {
      category: 'entertainment',
      title: 'Virtual Try-On',
      metric: '10x engagement',
      image: 'fashion model virtual',
    },
    {
      category: 'entertainment',
      title: 'Actor Replace',
      metric: 'Saved $50K on reshoots',
      image: 'film production actor',
    },
    {
      category: 'education',
      title: 'E-learning',
      metric: 'Better student retention',
      image: 'teacher online education',
    },
    {
      category: 'social',
      title: 'Social Content',
      metric: 'Viral reach achieved',
      image: 'social media content creator',
    },
    {
      category: 'marketing',
      title: 'Promo Videos',
      metric: 'ROI increased 5x',
      image: 'marketing promotional video',
    },
  ];

  const filteredUseCases = selectedCategory === 'all'
    ? useCases
    : useCases.filter(uc => uc.category === selectedCategory);

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
            <Badge className="mb-6 bg-[#00F0D9]/10 text-[#00F0D9] border-[#00F0D9]/20 px-4 py-2">
              ✨ Trusted by 10,000+ creators worldwide
            </Badge>

            <h1 className="text-[#F1F5F9] mb-6 text-5xl md:text-6xl lg:text-7xl max-w-5xl mx-auto leading-tight font-bold">
              Replace Any Character in Any Video
              <span className="block mt-2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent">
                With AI-Powered Precision
              </span>
            </h1>

            <p className="text-[#94A3B8] text-lg md:text-xl max-w-3xl mx-auto mb-10">
              Transform your videos in minutes with cutting-edge AI. No reshoots, no expensive equipment,
              just stunning results that can look completely natural, or not. Your choice.
            </p>

            {/* Split-screen video comparison */}
            <div className="max-w-5xl md:max-w-[70%] lg:max-w-[65%] mx-auto mb-10">
              <div className="relative border-2 border-[#334155] rounded-2xl overflow-hidden bg-[#1E293B]">
                {/* Video element */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                >
                  <source src="/hero-comparison-2.mp4" type="video/mp4" />
                </video>

                {/* Overlay badges */}
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

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                onClick={handleStartCreating}
                className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8 py-6 text-lg shadow-lg shadow-[#00F0D9]/20"
              >
                🎬 Start Creating Free
              </Button>
              <p className="text-[#94A3B8] text-sm">No credit card required</p>
            </div>

            <Button
              variant="link"
              className="text-[#00F0D9] hover:text-[#00F0D9]/80"
            >
              Watch Demo <Play className="w-4 h-4 ml-2" />
            </Button>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-center">
              <div>
                <div className="text-2xl md:text-3xl text-[#F1F5F9] mb-1">⚡ 1M+</div>
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

      {/* Trusted By Section */}
      <section className="py-16 border-y border-[#334155] bg-[#0F172A]/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-[#94A3B8] mb-8">Trusted by creators from</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            <div className="text-[#F1F5F9] text-2xl font-semibold">YouTube</div>
            <div className="text-[#F1F5F9] text-2xl font-semibold">TikTok</div>
            <div className="text-[#F1F5F9] text-2xl font-semibold">Instagram</div>
            <div className="text-[#F1F5F9] text-2xl font-semibold">LinkedIn</div>
            <div className="text-[#F1F5F9] text-2xl font-semibold">Studios</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              See the magic in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] text-center h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center mx-auto mb-6 text-2xl text-white font-bold">
                  1
                </div>
                <h3 className="text-[#F1F5F9] text-xl mb-4 font-semibold">Upload Character</h3>
                <div className="mb-4 rounded-xl overflow-hidden aspect-[9/16] max-h-[280px] mx-auto bg-[#1E293B]">
                  <img
                    src="/step1-character.png"
                    alt="Upload character reference"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[#94A3B8]">
                  Upload a clear reference image of the character you want to use
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
                <h3 className="text-[#F1F5F9] text-xl mb-4 font-semibold">Upload Video</h3>
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
                  Upload the video where you want to replace the character
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
              <h3 className="text-[#F1F5F9] text-xl mb-4 font-semibold">Generate Magic</h3>
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
                Our AI works its magic and delivers a perfect transformation
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

      {/* Use Cases Showcase */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              Endless Possibilities, Real Results
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-12">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full max-w-2xl">
              <TabsList className="grid grid-cols-5 w-full bg-[#1E293B] border border-[#334155]">
                <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00F0D9] data-[state=active]:to-[#3B1FE2] data-[state=active]:text-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="marketing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00F0D9] data-[state=active]:to-[#3B1FE2] data-[state=active]:text-white">
                  Marketing
                </TabsTrigger>
                <TabsTrigger value="entertainment" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00F0D9] data-[state=active]:to-[#3B1FE2] data-[state=active]:text-white">
                  Entertainment
                </TabsTrigger>
                <TabsTrigger value="education" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00F0D9] data-[state=active]:to-[#3B1FE2] data-[state=active]:text-white">
                  Education
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00F0D9] data-[state=active]:to-[#3B1FE2] data-[state=active]:text-white">
                  Social
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Use Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
            {filteredUseCases.map((useCase, index) => (
              <div
                key={index}
                className="group border border-[#334155] rounded-2xl overflow-hidden bg-[#1E293B] hover:border-[#00F0D9] transition-all hover:shadow-lg hover:shadow-[#00F0D9]/10 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={`https://images.unsplash.com/photo-${index % 2 === 0 ? '1557804506-669a67965ba0' : '1551434678-e076c223a692'}?w=600&h=400&fit=crop`}
                    alt={useCase.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  <Badge className="absolute top-4 left-4 bg-[#00F0D9]/90 text-white border-none">
                    {useCase.category}
                  </Badge>
                </div>

                <div className="p-6">
                  <h3 className="text-[#F1F5F9] text-xl mb-2 font-semibold">{useCase.title}</h3>
                  <p className="text-[#00F0D9] text-sm">&quot;{useCase.metric}&quot;</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/testimonials">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] mb-8"
              >
                See More Examples
              </Button>
            </Link>

            <div className="mt-12">
              <p className="text-[#94A3B8] mb-6">Ready to create your own success story?</p>
              <Button
                size="lg"
                onClick={handleStartCreating}
                className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8"
              >
                Start Generating Videos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              Loved by 10,000+ Creators Worldwide
            </h2>
          </div>

          {/* Featured Testimonial */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="border border-[#334155] rounded-2xl overflow-hidden bg-[#1E293B]">
              <div className="relative aspect-video">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=675&fit=crop"
                  alt="Video testimonial"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-[#F1F5F9] text-lg mb-4">
                  &quot;This tool saved my content calendar. I can now create variations of my videos in minutes
                  instead of days of reshooting. Game changer.&quot;
                </p>
                <p className="text-[#94A3B8]">
                  — Sarah Chen, YouTube (2.3M subscribers)
                </p>
              </div>
            </div>
          </div>

          {/* More Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {testimonials.slice(1).map((testimonial, index) => (
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

          <div className="text-center">
            <Link href="/testimonials">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] mb-8"
              >
                Read All Testimonials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              Powerful Features, Simple to Use
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Pixel-Perfect Replacement</h3>
              <p className="text-[#94A3B8]">
                Preserves lighting & shadows for seamless, natural-looking results
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Lightning Fast</h3>
              <p className="text-[#94A3B8]">
                2 to 10 minutes processing for most videos
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Full Motion Preservation</h3>
              <p className="text-[#94A3B8]">
                Body, face, and expressions stay perfect throughout the video
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Secure & Private</h3>
              <p className="text-[#94A3B8]">
                Your videos stay yours - encrypted storage and automatic deletion
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mx-auto mb-6">
                <Video className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Pro Quality Output</h3>
              <p className="text-[#94A3B8]">
                Up to 720p output (4K coming soon) with cinematic quality
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Affordable Pricing</h3>
              <p className="text-[#94A3B8]">
                From $0.50 per video - 100x cheaper than traditional reshoots
              </p>
            </div>
          </div>

          <div className="text-center mt-12 flex gap-4 justify-center flex-wrap">
            <Link href="/documentation">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                See All Features
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={handleStartCreating}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8"
            >
              Start Creating
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#94A3B8] text-lg">Pay only for what you use</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]">
              <h3 className="text-[#F1F5F9] text-2xl mb-2 font-bold">Free</h3>
              <div className="mb-6">
                <span className="text-4xl text-[#F1F5F9] font-bold">$0</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>5 credits</span>
                </li>
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>Watermark included</span>
                </li>
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>720p quality</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Creator Plan */}
            <div className="border-2 border-[#00F0D9] rounded-2xl p-8 bg-[#1E293B] relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-none">
                ⭐ Popular
              </Badge>
              <h3 className="text-[#F1F5F9] text-2xl mb-2 font-bold">Creator</h3>
              <div className="mb-6">
                <span className="text-4xl text-[#F1F5F9] font-bold">$29</span>
                <span className="text-[#94A3B8]">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>50 credits</span>
                </li>
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>No watermark</span>
                </li>
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>720p quality</span>
                </li>
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button
                onClick={handlePricingClick}
                className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
              >
                Start Now
              </Button>
            </div>

            {/* Studio Plan */}
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]">
              <h3 className="text-[#F1F5F9] text-2xl mb-2 font-bold">Studio</h3>
              <div className="mb-6">
                <span className="text-4xl text-[#F1F5F9] font-bold">$99</span>
                <span className="text-[#94A3B8]">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>200 credits</span>
                </li>
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>No watermark</span>
                </li>
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>Priority fast queue</span>
                </li>
                <li className="flex items-start gap-2 text-[#94A3B8]">
                  <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Button
                onClick={handlePricingClick}
                variant="outline"
                className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                Start Now
              </Button>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing">
              <Button
                variant="link"
                className="text-[#00F0D9] hover:text-[#00F0D9]/80"
              >
                View Full Pricing <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl lg:text-6xl mb-6 font-bold">
              Ready to Transform Your Videos?
            </h2>
            <p className="text-[#94A3B8] text-xl mb-10">
              Join 10,000+ creators making magic with AI
            </p>

            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-12 py-8 text-xl shadow-2xl shadow-[#00F0D9]/20"
              >
                🎬 Start Creating Free - No Credit Card
              </Button>
            </Link>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-[#94A3B8]">
              <Link href="/pricing" className="hover:text-[#00F0D9] transition-colors">
                View Pricing
              </Link>
              <span>|</span>
              <button className="hover:text-[#00F0D9] transition-colors">
                Watch Demo
              </button>
              <span>|</span>
              <Link href="/support" className="hover:text-[#00F0D9] transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
