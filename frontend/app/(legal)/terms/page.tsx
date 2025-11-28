'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Mail, AlertTriangle, CheckCircle, Shield, Lock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'definitions', label: 'Definitions' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'acceptable-use', label: 'Acceptable Use' },
    { id: 'content', label: 'Content & IP' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'termination', label: 'Termination' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-[#00F0D9]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#F1F5F9]">Terms of Service</h1>
            <p className="text-[#94A3B8] text-sm">Last Updated: November 28, 2025</p>
          </div>
        </div>
        <div className="h-px bg-[#334155]"></div>
      </div>

      {/* Welcome Message */}
      <div className="mb-8 border border-[#334155] rounded-xl p-6 bg-[#0F172A]">
        <p className="text-[#F1F5F9] leading-relaxed mb-4">
          Welcome to <strong className="text-[#00F0D9]">NuuMee</strong> ("we," "us," "our," or "the Service").
          These Terms of Service ("Terms") govern your access to and use of NuuMee's AI video generation service.
        </p>
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
          <p className="text-[#00F0D9] flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span><strong>BY USING NUUMEE, YOU AGREE TO THESE TERMS.</strong></span>
          </p>
        </div>
      </div>

      {/* Jump Links */}
      <div className="mb-12 border border-[#334155] rounded-xl p-6 bg-[#0F172A]">
        <p className="text-[#94A3B8] mb-4">Jump to section:</p>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="px-4 py-2 rounded-lg border border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] transition-colors text-sm"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] space-y-12">

        <section id="definitions">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">1.</span> Definitions
          </h2>
          <div className="space-y-3">
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2"><strong>Service</strong></p>
              <p className="text-[#94A3B8] text-sm">NuuMee's AI video generation platform, including all software, APIs, websites, and related services.</p>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2"><strong>User Content</strong></p>
              <p className="text-[#94A3B8] text-sm">Any images, videos, audio files, text prompts, or other materials you upload to the Service.</p>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2"><strong>Credits</strong></p>
              <p className="text-[#94A3B8] text-sm">The virtual currency used to access certain features of the Service.</p>
            </div>
          </div>
        </section>

        <section id="eligibility">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">2.</span> Eligibility & Account
          </h2>
          <div className="space-y-4">
            <p className="text-[#94A3B8]">You must be at least <strong className="text-[#F1F5F9]">18 years old</strong> to use the Service.</p>
            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#00F0D9]" />
                Account Security
              </h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Maintain the confidentiality of your login credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Responsible for all activities under your Account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Notify us immediately of unauthorized access</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="acceptable-use">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">3.</span> Acceptable Use Policy
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">Permitted Uses</h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Create videos for personal or commercial use</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Generate content for marketing, entertainment, education</span>
                </li>
              </ul>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-300 mb-2"><strong>Prohibited Uses</strong></p>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
                <li>• Content that violates any law or regulation</li>
                <li>• Non-consensual intimate images or "deepfakes"</li>
                <li>• Impersonation or misleading content</li>
                <li>• Hate speech or harassment</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="content">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">4.</span> Content & Intellectual Property
          </h2>
          <div className="space-y-4">
            <p className="text-[#94A3B8]">You retain ownership of your User Content. For paid users, you own your Generated Content.</p>
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#00F0D9] mb-2"><strong>For Paid Users:</strong></p>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>You own the Generated Content you create</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>Full commercial rights to use, modify, distribute</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="pricing">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">5.</span> Pricing & Credits
          </h2>
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
            <ul className="space-y-2 text-[#94A3B8]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                <span>Credits are used to access video generation features</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                <span>Credits never expire</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                <span>Credits are non-transferable</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="termination">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">6.</span> Termination
          </h2>
          <p className="text-[#94A3B8] mb-4">You may terminate your Account at any time. We may suspend or terminate accounts that violate these Terms.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">7.</span> Contact
          </h2>
          <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Legal inquiries:</p>
                <a href="mailto:legal@nuumee.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80">legal@nuumee.ai</a>
              </div>
            </div>
            <div className="pt-4 border-t border-[#334155]">
              <Link href="/support">
                <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Visit Support Center
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Acknowledgment */}
      <div className="mt-8 bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-[#00F0D9] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#00F0D9]">ACKNOWLEDGMENT</p>
            <p className="text-[#F1F5F9] mt-2">
              By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/privacy" className="text-[#00F0D9] hover:text-[#00F0D9]/80">Privacy Policy</Link>
        <span className="text-[#334155]">•</span>
        <Link href="/pricing" className="text-[#00F0D9] hover:text-[#00F0D9]/80">Pricing Plans</Link>
        <span className="text-[#334155]">•</span>
        <Link href="/support" className="text-[#00F0D9] hover:text-[#00F0D9]/80">Support Center</Link>
      </div>
    </main>
  );
}
