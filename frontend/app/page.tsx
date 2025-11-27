import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent">
              AI Character Replacement
            </span>
            <br />
            <span className="text-[#F1F5F9]">Made Simple</span>
          </h1>
          <p className="text-xl text-[#94A3B8] mb-8 max-w-2xl mx-auto">
            Transform your videos with AI-powered character replacement.
            Upload, customize, and create stunning content in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              Get Started Free
            </Link>
            <Link
              href="/examples"
              className="px-8 py-4 border border-[#334155] text-[#F1F5F9] rounded-lg hover:border-[#00F0D9] transition-colors font-semibold"
            >
              View Examples
            </Link>
          </div>
          <p className="text-[#64748B] mt-4 text-sm">
            25 free credits on signup. No credit card required.
          </p>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-[#1E293B] border border-[#334155]">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🎬</span>
            </div>
            <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">Easy Upload</h3>
            <p className="text-[#94A3B8]">
              Drag and drop your videos. We support all major formats.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#1E293B] border border-[#334155]">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">AI Powered</h3>
            <p className="text-[#94A3B8]">
              State-of-the-art AI for seamless character replacement.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#1E293B] border border-[#334155]">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">Fast Results</h3>
            <p className="text-[#94A3B8]">
              Get your transformed videos in minutes, not hours.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
