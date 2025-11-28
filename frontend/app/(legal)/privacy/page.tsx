'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, Lock, Globe, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'collection', label: 'Data Collection' },
    { id: 'usage', label: 'How We Use Data' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'security', label: 'Data Security' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'contact', label: 'Contact' },
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
            <Shield className="w-6 h-6 text-[#00F0D9]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#F1F5F9]">Privacy Policy</h1>
            <p className="text-[#94A3B8] text-sm">Last updated: November 28, 2025</p>
          </div>
        </div>
        <div className="h-px bg-[#334155]"></div>
      </div>

      {/* Jump Links */}
      <div className="mb-12 border border-[#334155] rounded-xl p-6 bg-[#0F172A]">
        <p className="text-[#94A3B8] mb-4">Jump to:</p>
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
        <section>
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">1.</span> Introduction
          </h2>
          <p className="text-[#94A3B8] leading-relaxed">
            NuuMee ("we," "our," or "us") respects your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you use our AI
            video generation service. By using our service, you agree to the collection and use
            of information in accordance with this policy.
          </p>
        </section>

        <section id="collection">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">2.</span> Information We Collect
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">Account Information:</h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Name and email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Password (encrypted)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Profile information (optional)</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[#F1F5F9] mb-3">Content You Upload:</h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Reference images and motion videos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Generated output videos</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[#F1F5F9] mb-3">Payment Information:</h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Processed by Stripe (we don't store card details)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="usage">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">3.</span> How We Use Your Information
          </h2>
          <ul className="space-y-3 text-[#94A3B8]">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Provide and improve our service</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Process your video generation requests</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Communicate with you (emails, notifications)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Process payments and billing</span>
            </li>
          </ul>
        </section>

        <section id="rights">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">4.</span> Your Rights (GDPR/CCPA)
          </h2>
          <ul className="space-y-3 text-[#94A3B8]">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span><strong className="text-[#F1F5F9]">Access</strong> your personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span><strong className="text-[#F1F5F9]">Correct</strong> inaccurate data</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span><strong className="text-[#F1F5F9]">Delete</strong> your data ("right to be forgotten")</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span><strong className="text-[#F1F5F9]">Export</strong> your data (data portability)</span>
            </li>
          </ul>
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mt-4">
            <p className="text-[#94A3B8] mb-2">To exercise these rights, contact:</p>
            <a href="mailto:privacy@nuumee.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              privacy@nuumee.ai
            </a>
          </div>
        </section>

        <section id="security">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">5.</span> Data Security
          </h2>
          <ul className="space-y-3 text-[#94A3B8] mb-6">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Encryption in transit (HTTPS/TLS)</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Encryption at rest (database encryption)</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Regular security audits</span>
            </li>
          </ul>
        </section>

        <section id="contact">
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">6.</span> Contact Us
          </h2>
          <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Email:</p>
                <a href="mailto:privacy@nuumee.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                  privacy@nuumee.ai
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Address:</p>
                <p className="text-[#F1F5F9]">NuuMee Inc.<br />San Francisco, CA<br />United States</p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#334155]">
              <Link href="/support">
                <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Related Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/terms" className="text-[#00F0D9] hover:text-[#00F0D9]/80">Terms of Service</Link>
        <span className="text-[#334155]">•</span>
        <Link href="/support" className="text-[#00F0D9] hover:text-[#00F0D9]/80">Support Center</Link>
      </div>
    </main>
  );
}
