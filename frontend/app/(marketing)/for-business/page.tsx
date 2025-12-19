'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Clock,
  RefreshCw,
  Building2,
  X,
  Play,
  ArrowRight,
  Quote,
  Globe,
  Presentation,
  MessageSquare,
  Megaphone,
  ChevronRight,
} from 'lucide-react';

export default function ForBusinessPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      router.push('/videos/create');
    } else {
      router.push('/signup');
    }
  };

  return (
    <main className="bg-[#0F172A]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F0D9]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B1FE2]/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center py-20">
          <Badge className="bg-[#00F0D9]/10 text-[#00F0D9] border-[#00F0D9]/30 mb-6 px-4 py-2">
            <Building2 className="w-4 h-4 mr-2" />
            Trusted by marketing teams at 500+ companies
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-[#F1F5F9] mb-6 max-w-5xl mx-auto leading-tight">
            Professional Video at Scale.{' '}
            <span className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-transparent bg-clip-text">
              Without the Production Cost.
            </span>
          </h1>

          <p className="text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto">
            NuuMee helps marketing teams create personalized, on-brand video content 10x faster than traditional production—at a fraction of the cost.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white text-lg px-10 py-6"
            onClick={handleCTA}
          >
            <Play className="w-5 h-5 mr-2" />
            See It In Action
          </Button>

          <p className="text-[#94A3B8] mt-6 text-sm">
            Start free. No contracts.
          </p>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[#F1F5F9] text-4xl md:text-5xl mb-4 font-bold">
              Replace Any Character in Any Video
              <span className="block mt-2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent">
                With AI-Powered Precision
              </span>
            </h2>
            <p className="text-[#94A3B8] text-lg md:text-xl max-w-3xl mx-auto mt-6">
              Transform your videos in minutes with cutting-edge AI. No reshoots, no expensive equipment,
              just stunning results that can look completely natural, or not. Your choice.
            </p>
          </div>

          {/* Split-screen video comparison */}
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

      {/* How It Works - Visual */}
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
              onClick={handleCTA}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8"
            >
              Try It Now - It&apos;s Free
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-[#1E293B]">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold text-[#F1F5F9] mb-6 text-center">
            Video Works. But It's Expensive.
          </h2>
          <p className="text-[#94A3B8] text-lg text-center mb-12 max-w-2xl mx-auto">
            Traditional video production doesn't scale. You know video converts—but the cost and complexity hold your team back.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              '$5,000+ per polished brand video',
              'Weeks of turnaround for simple updates',
              'Talent scheduling nightmares',
              'Content that\'s outdated before it launches',
            ].map((pain) => (
              <div
                key={pain}
                className="flex items-start gap-4 p-6 rounded-xl bg-[#0F172A]/50 border border-[#334155]"
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-[#94A3B8]">{pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#F1F5F9] mb-6">
              Your Brand Voice. Unlimited Videos.
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              Create spokesperson videos, explainers, and personalized outreach—without booking studios, hiring talent, or managing post-production.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Cut Production Costs 90%</h3>
              <p className="text-[#94A3B8]">
                No studios, no crews, no reshoots. Professional video at predictable prices.
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Launch Campaigns in Hours</h3>
              <p className="text-[#94A3B8]">
                React to market changes instantly. Update messaging without re-filming.
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-6">
                <RefreshCw className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Scale Personalization</h3>
              <p className="text-[#94A3B8]">
                Generate hundreds of personalized videos for ABM, sales outreach, or regional campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-[#F1F5F9] mb-6 text-center">
            Built for Marketing Teams
          </h2>
          <p className="text-[#94A3B8] text-lg text-center mb-12 max-w-2xl mx-auto">
            From product launches to sales enablement, NuuMee powers video across your organization.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Presentation,
                title: 'Product Demos',
                description: 'Consistent presentations for every prospect',
              },
              {
                icon: MessageSquare,
                title: 'Internal Comms',
                description: 'CEO updates without scheduling nightmares',
              },
              {
                icon: Megaphone,
                title: 'Sales Enablement',
                description: 'Personalized videos for every account',
              },
              {
                icon: Globe,
                title: 'Localized Content',
                description: 'Same message, different languages',
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mx-auto mb-4">
                  <useCase.icon className="w-6 h-6 text-[#00F0D9]" />
                </div>
                <h3 className="text-[#F1F5F9] font-semibold mb-2">{useCase.title}</h3>
                <p className="text-[#94A3B8] text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="border border-[#334155] rounded-2xl p-10 bg-[#1E293B] text-center">
            <Quote className="w-12 h-12 text-[#00F0D9]/50 mx-auto mb-6" />
            <blockquote className="text-2xl text-[#F1F5F9] mb-6 leading-relaxed">
              "We replaced a $50,000 video production budget with NuuMee. Same quality, 20x more content."
            </blockquote>
            <p className="text-[#00F0D9] font-semibold">— Marketing Director, SaaS Company</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#F1F5F9] mb-6">
            Scale Your Video Marketing
          </h2>
          <p className="text-xl text-[#94A3B8] mb-10">
            See why marketing teams are switching to AI-powered video.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white text-lg px-12 py-6"
            onClick={handleCTA}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-[#94A3B8] mt-6">
            Enterprise plans available. Contact sales for custom solutions.
          </p>
        </div>
      </section>
    </main>
  );
}
