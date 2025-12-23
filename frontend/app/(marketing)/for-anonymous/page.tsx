'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  EyeOff,
  Lock,
  User,
  X,
  Play,
  ArrowRight,
  Quote,
  TrendingUp,
  MessageCircle,
  GraduationCap,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

export default function ForAnonymousPage() {
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
      {/* Video Demo Section - PRIMARY HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F0D9]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B1FE2]/20 rounded-full blur-3xl" />
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
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                >
                  <source src="/hero-v4.mp4" type="video/mp4" />
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

            <Button
              size="lg"
              onClick={handleCTA}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white text-lg px-10 py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Creating Free
            </Button>

            <p className="text-[#94A3B8] mt-6 text-sm">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Page-Specific Hero Section */}
      <section className="py-24 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="container mx-auto px-6 text-center">
          <Badge className="bg-[#00F0D9]/10 text-[#00F0D9] border-[#00F0D9]/30 mb-6 px-4 py-2">
            <EyeOff className="w-4 h-4 mr-2" />
            For Privacy-Focused Creators
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-[#F1F5F9] mb-6 max-w-4xl mx-auto leading-tight">
            Create Content{' '}
            <span className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-transparent bg-clip-text">
              Without Showing Your Face
            </span>
          </h2>

          <p className="text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto">
            Build a massive following, monetize your ideas, and protect your privacy—all with AI-generated video that doesn't require you on camera.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white text-lg px-10 py-6"
            onClick={handleCTA}
          >
            <Shield className="w-5 h-5 mr-2" />
            Start Creating Anonymously
          </Button>

          <p className="text-[#94A3B8] mt-6 text-sm">
            Your identity stays yours. Always.
          </p>
        </div>
      </section>

      {/* How It Works - Visual */}
      <section className="py-24 bg-[#1E293B]">
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
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold text-[#F1F5F9] mb-6 text-center">
            Privacy Shouldn't Limit Your Reach
          </h2>
          <p className="text-[#94A3B8] text-lg text-center mb-12 max-w-2xl mx-auto">
            You have valuable ideas to share. But there are real reasons you might not want your face attached to your content.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Worried about doxxing, harassment, or unwanted attention',
              'Day job that doesn\'t allow public content creation',
              'Simply prefer to keep your personal and professional lives separate',
              'Love creating but hate being on camera',
            ].map((pain) => (
              <div
                key={pain}
                className="flex items-start gap-4 p-6 rounded-xl bg-[#1E293B]/50 border border-[#334155]"
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
      <section className="py-24 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#F1F5F9] mb-6">
              Your Ideas. A New Face.
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              NuuMee lets you create professional talking-head videos using AI avatars—no personal photos required. Build a brand, grow an audience, and monetize content without ever revealing who you are.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Complete Identity Protection</h3>
              <p className="text-[#94A3B8]">
                Use stock AI avatars. No photos, no facial data, no connection to your real identity.
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-6">
                <Play className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Professional Quality Content</h3>
              <p className="text-[#94A3B8]">
                The same broadcast-quality videos creators use—just without your face attached.
              </p>
            </div>

            <div className="border border-[#334155] rounded-2xl p-8 bg-[#1E293B]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-6">
                <User className="w-8 h-8 text-[#00F0D9]" />
              </div>
              <h3 className="text-[#F1F5F9] text-xl mb-3 font-semibold">Build a Real Brand</h3>
              <p className="text-[#94A3B8]">
                Consistency, recognition, and audience connection—without personal exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-[#1E293B]">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-[#F1F5F9] mb-6 text-center">
            Perfect For
          </h2>
          <p className="text-[#94A3B8] text-lg text-center mb-12 max-w-2xl mx-auto">
            Creators who want to share their expertise while maintaining their privacy.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Finance/Investing',
                description: 'Share insights without regulatory concerns',
              },
              {
                icon: MessageCircle,
                title: 'Commentary/Analysis',
                description: 'Hot takes without personal blowback',
              },
              {
                icon: GraduationCap,
                title: 'Educational Content',
                description: 'Teach without being recognized',
              },
              {
                icon: Briefcase,
                title: 'Side Hustle Protection',
                description: 'Create without risking your day job',
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className="border border-[#334155] rounded-xl p-6 bg-[#0F172A] text-center"
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
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="border border-[#334155] rounded-2xl p-10 bg-[#1E293B] text-center">
            <Quote className="w-12 h-12 text-[#00F0D9]/50 mx-auto mb-6" />
            <blockquote className="text-2xl text-[#F1F5F9] mb-6 leading-relaxed">
              "I've built a 100K subscriber channel and no one knows who I am. NuuMee made it possible."
            </blockquote>
            <p className="text-[#00F0D9] font-semibold">— Anonymous Finance Creator</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#F1F5F9] mb-6">
            Start Creating. Stay Anonymous.
          </h2>
          <p className="text-xl text-[#94A3B8] mb-10">
            Your ideas deserve an audience—without the exposure.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white text-lg px-12 py-6"
            onClick={handleCTA}
          >
            Create Anonymously
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-[#94A3B8] mt-6">
            No photos required. No identity linked.
          </p>
        </div>
      </section>
    </main>
  );
}
