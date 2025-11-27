import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Mail,
  AlertTriangle,
  CheckCircle,
  Shield,
  CreditCard,
  Ban,
  Scale,
  Globe,
  HelpCircle,
  Users,
  Lock,
  Zap,
  Coins,
} from 'lucide-react';
import { Button } from '../components/ui/button';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'definitions', label: 'Definitions' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'acceptable-use', label: 'Acceptable Use' },
    { id: 'content', label: 'Content & IP' },
    { id: 'pricing', label: 'Pricing & Payment' },
    { id: 'service', label: 'Service Availability' },
    { id: 'privacy', label: 'Privacy & Data' },
    { id: 'disclaimers', label: 'Disclaimers' },
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
            <h1 className="text-[#F1F5F9]">Terms of Service</h1>
            <p className="text-[#94A3B8] text-sm">
              Last Updated: November 14, 2025
            </p>
          </div>
        </div>
        <div className="h-px bg-[#334155]"></div>
      </div>

      {/* Welcome Message */}
      <div className="mb-8 border border-[#334155] rounded-xl p-6 bg-[#0F172A]">
        <p className="text-[#F1F5F9] leading-relaxed mb-4">
          Welcome to <strong className="text-[#00F0D9]">NewMe.AI</strong> ("we," "us," "our," or "the Service"). 
          These Terms of Service ("Terms") govern your access to and use of NewMe.AI's character replacement 
          video generation service, including our website, APIs, and related services.
        </p>
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
          <p className="text-[#00F0D9] flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>
              <strong>BY USING NewMe.AI, YOU AGREE TO THESE TERMS. IF YOU DO NOT AGREE, DO NOT USE THE SERVICE.</strong>
            </span>
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
        
        {/* 1. DEFINITIONS */}
        <section id="definitions">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">1.</span> DEFINITIONS
          </h2>
          
          <div className="space-y-3">
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2"><strong>1.1 Service</strong></p>
              <p className="text-[#94A3B8] text-sm">
                NewMe.AI's character replacement video generation platform, including all software, APIs, 
                websites, and related services.
              </p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2"><strong>1.2 User Content</strong></p>
              <p className="text-[#94A3B8] text-sm">
                Any images, videos, audio files, text prompts, or other materials you upload, submit, 
                or provide to the Service.
              </p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2"><strong>1.3 Generated Content</strong></p>
              <p className="text-[#94A3B8] text-sm">
                Videos, images, or other outputs created by the Service using your User Content and our AI models.
              </p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2"><strong>1.4 Credits</strong></p>
              <p className="text-[#94A3B8] text-sm">
                The virtual currency used to access certain features of the Service, purchased or earned 
                as described in Section 5.
              </p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2"><strong>1.5 Account</strong></p>
              <p className="text-[#94A3B8] text-sm">
                Your registered user account with NewMe.AI.
              </p>
            </div>
          </div>
        </section>

        {/* 2. ELIGIBILITY & ACCOUNT REGISTRATION */}
        <section id="eligibility">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">2.</span> ELIGIBILITY & ACCOUNT REGISTRATION
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00F0D9]" />
                2.1 Age Requirement
              </h3>
              <p className="text-[#94A3B8] leading-relaxed mb-3">
                You must be at least <strong className="text-[#F1F5F9]">18 years old</strong> (or the age of 
                majority in your jurisdiction) to use the Service. By using the Service, you represent and 
                warrant that you meet this requirement.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">2.2 Account Creation</h3>
              <p className="text-[#94A3B8] mb-3">
                To use certain features, you must create an Account by providing accurate, complete, and 
                current information. You may register using:
              </p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Email and password</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Google authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Other methods we may offer</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#00F0D9]" />
                2.3 Account Security
              </h3>
              <p className="text-[#94A3B8] mb-3">You are responsible for:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Maintaining the confidentiality of your login credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>All activities that occur under your Account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Notifying us immediately of any unauthorized access</span>
                </li>
              </ul>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                <p className="text-amber-200 text-sm">
                  We are not liable for losses arising from unauthorized use of your Account.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">2.4 Account Suspension</h3>
              <p className="text-[#94A3B8]">
                We reserve the right to suspend or terminate Accounts that violate these Terms, engage in 
                fraudulent activity, or misuse the Service.
              </p>
            </div>
          </div>
        </section>

        {/* 3. ACCEPTABLE USE POLICY */}
        <section id="acceptable-use">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">3.</span> ACCEPTABLE USE POLICY
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">3.1 Permitted Uses</h3>
              <p className="text-[#94A3B8] mb-3">You may use the Service to:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Create character replacement videos for personal or commercial use</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Generate content for marketing, entertainment, education, or creative projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Access and download your Generated Content</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">3.2 Prohibited Uses</h3>
              <p className="text-[#94A3B8] mb-4">You may <strong className="text-red-400">NOT</strong> use the Service to:</p>
              
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 mb-2"><strong>a) Create illegal or harmful content:</strong></p>
                  <ul className="space-y-2 text-[#94A3B8] text-sm">
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Child sexual abuse material (CSAM) or content sexualizing minors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Non-consensual intimate images or "deepfakes"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Content that violates any law or regulation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Content promoting violence, terrorism, or illegal activities</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 mb-2"><strong>b) Violate others' rights:</strong></p>
                  <ul className="space-y-2 text-[#94A3B8] text-sm">
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Infringe copyright, trademark, or other intellectual property rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Violate privacy rights or publicity rights of others</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Use images or videos of real people without proper authorization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Impersonate others or create misleading content</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 mb-2"><strong>c) Abuse the Service:</strong></p>
                  <ul className="space-y-2 text-[#94A3B8] text-sm">
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Attempt to reverse engineer, decompile, or hack the Service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Use automated tools (bots, scrapers) without authorization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Resell, redistribute, or create derivative services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Circumvent usage limits or payment requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Share Account credentials with others</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 mb-2"><strong>d) Create harmful content:</strong></p>
                  <ul className="space-y-2 text-[#94A3B8] text-sm">
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Spam, malware, or phishing content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Discriminatory, hateful, or harassing content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Misleading political content or election misinformation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Content that violates platform policies where it will be shared</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">3.3 Enforcement</h3>
              <p className="text-[#94A3B8] mb-3">Violation of this policy may result in:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  <span>Immediate termination of your Account</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  <span>Deletion of your User Content and Generated Content</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  <span>Forfeiture of remaining Credits without refund</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  <span>Legal action if necessary</span>
                </li>
              </ul>
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mt-4">
                <p className="text-[#94A3B8] text-sm">
                  We reserve the right to review User Content and Generated Content to enforce this policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CONTENT & INTELLECTUAL PROPERTY */}
        <section id="content">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">4.</span> CONTENT & INTELLECTUAL PROPERTY
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">4.1 User Content Ownership</h3>
              <p className="text-[#94A3B8] mb-3">
                You retain all ownership rights in your User Content. By uploading User Content, you grant 
                us a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Process, store, and analyze your User Content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Use your User Content to generate outputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Improve our AI models and Service (see Section 4.5)</span>
                </li>
              </ul>
              <p className="text-[#94A3B8] mt-3 text-sm">
                This license terminates when you delete your User Content, except for:
              </p>
              <ul className="space-y-1 text-[#94A3B8] text-sm mt-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0D9]">•</span>
                  <span>Copies retained in backups (deleted within 90 days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0D9]">•</span>
                  <span>Content used to improve models (anonymized and de-identified)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">4.2 Generated Content Ownership</h3>
              <p className="text-[#94A3B8] mb-3">
                Subject to these Terms and full payment of applicable fees:
              </p>
              
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mb-3">
                <p className="text-[#00F0D9] mb-2"><strong>For Paid Users (Creator, Pro, Enterprise tiers):</strong></p>
                <ul className="space-y-2 text-[#94A3B8] text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                    <span>You own the Generated Content you create</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                    <span>We grant you a perpetual, worldwide, royalty-free license to use, modify, distribute, and commercialize your Generated Content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                    <span>No attribution to NewMe.AI is required (though appreciated)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                <p className="text-amber-300 mb-2"><strong>For Free Tier Users:</strong></p>
                <ul className="space-y-2 text-[#94A3B8] text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Generated Content includes a NewMe.AI watermark</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>You may use Generated Content for personal, non-commercial purposes only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Commercial use requires upgrading to a paid tier</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00F0D9]" />
                4.3 Our Intellectual Property
              </h3>
              <p className="text-[#94A3B8] mb-3">NewMe.AI retains all rights to:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>The Service software, APIs, and infrastructure</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>AI models, algorithms, and training data</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Trademarks, logos, and branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Documentation and user interfaces</span>
                </li>
              </ul>
              <p className="text-[#94A3B8] mt-3 text-sm">
                You may not copy, modify, or create derivative works of our intellectual property.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">4.4 Third-Party Content</h3>
              <p className="text-[#94A3B8]">
                Some features may use third-party AI models or services. Your use of such features is 
                subject to the third-party's terms and our agreement with them.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">4.5 Model Training</h3>
              <p className="text-[#94A3B8] mb-3">
                We may use anonymized, de-identified metadata from your usage to improve our AI models, but 
                we will NOT:
              </p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  <span>Use your User Content to train models without explicit consent</span>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  <span>Share your User Content with third parties for training purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  <span>Use Generated Content containing identifiable individuals for public model training</span>
                </li>
              </ul>
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mt-3">
                <p className="text-[#00F0D9] text-sm">
                  You can opt out of model improvement data collection in your Account settings.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">4.6 Copyright Infringement</h3>
              <p className="text-[#94A3B8] mb-3">
                If you believe content on our Service infringes your copyright, contact us at{' '}
                <a href="mailto:copyright@newme.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                  copyright@newme.ai
                </a>{' '}
                with:
              </p>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0D9]">•</span>
                  <span>Description of the copyrighted work</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0D9]">•</span>
                  <span>URL or description of the infringing content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0D9]">•</span>
                  <span>Your contact information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0D9]">•</span>
                  <span>A statement of good faith belief</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0D9]">•</span>
                  <span>A statement under penalty of perjury that you are authorized to act</span>
                </li>
              </ul>
              <p className="text-[#94A3B8] mt-3 text-sm">
                We will respond to valid DMCA notices in accordance with applicable law.
              </p>
            </div>
          </div>
        </section>

        {/* 5. PRICING, CREDITS & PAYMENT */}
        <section id="pricing">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">5.</span> PRICING, CREDITS & PAYMENT
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#00F0D9]" />
                5.1 Credit System
              </h3>
              <p className="text-[#94A3B8] mb-3">NewMe.AI operates on a credit-based system:</p>
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                <ul className="space-y-2 text-[#94A3B8]">
                  <li className="flex items-start gap-2">
                    <Coins className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                    <span><strong className="text-[#F1F5F9]">1 Credit = $0.10</strong> retail value</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Coins className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                    <span>Credits are used to access video generation and post-processing features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Coins className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                    <span>Credits never expire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Coins className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                    <span>Credits are non-transferable and non-refundable except as stated in Section 5.6</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#00F0D9]" />
                5.2 Pricing Tiers
              </h3>
              
              <div className="grid gap-4">
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <p className="text-[#00F0D9] mb-2"><strong>Free Tier:</strong></p>
                  <ul className="space-y-1 text-[#94A3B8] text-sm">
                    <li>• 25 free credits upon signup (one-time)</li>
                    <li>• 480p resolution only</li>
                    <li>• NewMe.AI watermark applied</li>
                    <li>• Generated videos stored for 7 days</li>
                  </ul>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <p className="text-[#00F0D9] mb-2"><strong>Pay-As-You-Go:</strong></p>
                  <ul className="space-y-1 text-[#94A3B8] text-sm">
                    <li>• Purchase credit packages as needed</li>
                    <li>• No monthly commitment</li>
                    <li>• Standard pricing applies</li>
                  </ul>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <p className="text-[#00F0D9] mb-2"><strong>Creator Subscription ($29/month):</strong></p>
                  <ul className="space-y-1 text-[#94A3B8] text-sm">
                    <li>• 400 credits per month</li>
                    <li>• 50% credit rollover allowed</li>
                    <li>• No watermark</li>
                    <li>• 30-day video storage</li>
                    <li>• 15% discount on additional credit purchases</li>
                  </ul>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <p className="text-[#00F0D9] mb-2"><strong>Pro Subscription ($99/month):</strong></p>
                  <ul className="space-y-1 text-[#94A3B8] text-sm">
                    <li>• 1,600 credits per month</li>
                    <li>• 50% credit rollover allowed</li>
                    <li>• Priority processing queue</li>
                    <li>• 90-day video storage</li>
                    <li>• 25% discount on additional credit purchases</li>
                    <li>• API access</li>
                    <li>• Priority support</li>
                  </ul>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <p className="text-[#00F0D9] mb-2"><strong>Enterprise:</strong></p>
                  <p className="text-[#94A3B8] text-sm">Custom pricing and credit allocation. Contact sales for details.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">5.3 Feature Costs</h3>
              
              <div className="space-y-3">
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <p className="text-[#00F0D9] mb-2"><strong>Character Replacement (base service):</strong></p>
                  <ul className="space-y-1 text-[#94A3B8] text-sm">
                    <li>• 480p: 2 credits per second (5-second minimum)</li>
                    <li>• 720p: 4 credits per second (5-second minimum)</li>
                    <li>• Maximum 120 seconds per video</li>
                  </ul>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <p className="text-[#00F0D9] mb-2"><strong>Post-Processing Add-Ons:</strong></p>
                  <ul className="space-y-1 text-[#94A3B8] text-sm">
                    <li>• Video Extender (+5s): 25-75 credits (resolution-dependent)</li>
                    <li>• Video Upscaler (to 2K): 4 credits per second (5-second minimum)</li>
                    <li>• Auto Subtitles: FREE</li>
                    <li>• Audio Mix/Replace (user file): FREE</li>
                    <li>• Format Change (9:16 ↔ 16:9): FREE</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">5.4 Payment Processing</h3>
              <p className="text-[#94A3B8] mb-3">
                Payments are processed securely through Stripe. By providing payment information, you:
              </p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Authorize us to charge your payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Represent that you are authorized to use the payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Agree to Stripe's Terms of Service</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">5.5 Subscription Billing</h3>
              <p className="text-[#94A3B8] mb-3">For monthly subscriptions:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>You are billed monthly on the anniversary of your signup date</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Subscriptions auto-renew unless canceled</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Monthly credit allocations reset on your billing date</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Unused credits may rollover up to 50% of your monthly allocation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>You can cancel anytime; cancellation takes effect at the end of the current billing period</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">5.6 Refunds</h3>
              <p className="text-[#94A3B8] mb-3">We offer refunds in the following circumstances:</p>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-3">
                <p className="text-green-300 mb-2"><strong>Eligible for Refund:</strong></p>
                <ul className="space-y-1 text-[#94A3B8] text-sm">
                  <li>• Service outage lasting more than 24 hours</li>
                  <li>• Technical error preventing job completion (we will retry first)</li>
                  <li>• Duplicate charges due to processing errors</li>
                  <li>• Subscription canceled within 7 days of initial purchase (first-time subscribers only)</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300 mb-2"><strong>NOT Eligible for Refund:</strong></p>
                <ul className="space-y-1 text-[#94A3B8] text-sm">
                  <li>• Credits already spent on completed jobs</li>
                  <li>• Dissatisfaction with Generated Content quality (subjective)</li>
                  <li>• User error (wrong file uploaded, incorrect settings)</li>
                  <li>• Violation of Terms resulting in Account suspension</li>
                  <li>• Credits purchased more than 30 days ago</li>
                </ul>
              </div>

              <p className="text-[#94A3B8] mt-3 text-sm">
                To request a refund, contact{' '}
                <a href="mailto:support@newme.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                  support@newme.ai
                </a>{' '}
                within 7 days of the charge.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">5.7 Price Changes</h3>
              <p className="text-[#94A3B8] mb-3">
                We reserve the right to change pricing with 30 days' notice. Price changes do not affect:
              </p>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
                <li>• Existing subscription prices until renewal</li>
                <li>• Credits already purchased</li>
                <li>• Founding Member or grandfathered pricing tiers</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00F0D9]" />
                5.8 Founding Member Pricing
              </h3>
              <div className="bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/30 rounded-lg p-4">
                <p className="text-[#00F0D9] mb-2"><strong>The first 100 paid subscribers receive "Founding Member" status:</strong></p>
                <ul className="space-y-1 text-[#94A3B8] text-sm">
                  <li>• 20% lifetime discount on all plans</li>
                  <li>• Locked-in pricing (immune to future increases)</li>
                  <li>• 100% credit rollover (vs. 50% standard)</li>
                  <li>• Exclusive badge and benefits</li>
                </ul>
                <p className="text-[#94A3B8] text-sm mt-2">
                  This status is non-transferable and remains valid as long as your Account is in good standing.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">5.9 Negative Credit Balance</h3>
              <p className="text-[#94A3B8]">
                We may allow your credit balance to go slightly negative (up to -100 credits or -$10) to 
                complete jobs in progress. Once negative, you must add credits before starting new jobs.
              </p>
            </div>
          </div>
        </section>

        {/* 6. SERVICE AVAILABILITY & PERFORMANCE */}
        <section id="service">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">6.</span> SERVICE AVAILABILITY & PERFORMANCE
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">6.1 Asynchronous Processing</h3>
              <p className="text-[#94A3B8] mb-3">Video generation is asynchronous. After submitting a job:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>You will receive a job ID immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Processing occurs in the background</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>You can check job status via your Account or receive email notification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Typical processing time: 5-15 minutes (varies by job complexity and queue load)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">6.2 Service Uptime</h3>
              <p className="text-[#94A3B8] mb-3">
                We strive for 99% uptime but do not guarantee uninterrupted access. The Service may be 
                unavailable due to:
              </p>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
                <li>• Scheduled maintenance (announced in advance when possible)</li>
                <li>• Emergency repairs</li>
                <li>• Third-party service outages</li>
                <li>• Force majeure events</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">6.3 Job Failures</h3>
              <p className="text-[#94A3B8] mb-3">Jobs may fail due to:</p>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
                <li>• Invalid or corrupted input files</li>
                <li>• Safety checker rejection</li>
                <li>• Technical errors</li>
                <li>• Third-party service issues</li>
              </ul>
              <p className="text-[#94A3B8] mt-3 mb-2">If a job fails due to our error, we will:</p>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>Retry automatically (up to 3 attempts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>Refund credits if retry fails</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
                  <span>Notify you of the failure reason</span>
                </li>
              </ul>
              <p className="text-amber-200 text-sm mt-3">
                Credits are NOT refunded for failures caused by invalid User Content or policy violations.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">6.4 File Storage</h3>
              <p className="text-[#94A3B8] mb-3">Generated videos are stored according to your tier:</p>
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                <ul className="space-y-1 text-[#94A3B8] text-sm">
                  <li>• Free: 7 days</li>
                  <li>• Creator: 30 days</li>
                  <li>• Pro: 90 days</li>
                  <li>• Enterprise: Custom</li>
                </ul>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-3">
                <p className="text-amber-200 text-sm">
                  After expiration, files are permanently deleted. We recommend downloading your content promptly.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">6.5 Service Modifications</h3>
              <p className="text-[#94A3B8]">
                We may modify, suspend, or discontinue features with reasonable notice. We are not liable 
                for modifications, but will provide reasonable alternatives when feasible.
              </p>
            </div>
          </div>
        </section>

        {/* 7. PRIVACY & DATA USAGE */}
        <section id="privacy">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">7.</span> PRIVACY & DATA USAGE
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">7.1 Privacy Policy</h3>
              <p className="text-[#94A3B8]">
                Your use of the Service is governed by our{' '}
                <Link to="/privacy" className="text-[#00F0D9] hover:text-[#00F0D9]/80 underline">
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your data.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">7.2 Data Processing</h3>
              <p className="text-[#94A3B8] mb-3">We process your data (including User Content) to:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Provide the Service</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Generate outputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Detect policy violations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Improve our models (with your consent)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Comply with legal obligations</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#00F0D9]" />
                7.3 Data Security
              </h3>
              <p className="text-[#94A3B8] mb-3">We implement industry-standard security measures, including:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Encryption in transit (HTTPS/TLS)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Encryption at rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Access controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Regular security audits</span>
                </li>
              </ul>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-3">
                <p className="text-amber-200 text-sm">
                  However, no system is 100% secure. You use the Service at your own risk.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">7.4 Data Retention</h3>
              <p className="text-[#94A3B8] mb-3">We retain your data as follows:</p>
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                <ul className="space-y-1 text-[#94A3B8] text-sm">
                  <li>• <strong className="text-[#F1F5F9]">Account information:</strong> Until Account deletion + 90 days</li>
                  <li>• <strong className="text-[#F1F5F9]">User Content:</strong> Until you delete it + 90 days (backups)</li>
                  <li>• <strong className="text-[#F1F5F9]">Generated Content:</strong> Per your tier's storage period</li>
                  <li>• <strong className="text-[#F1F5F9]">Usage logs:</strong> 2 years for compliance and troubleshooting</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">7.5 Your Rights</h3>
              <p className="text-[#94A3B8] mb-3">You have the right to:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Access your data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Correct inaccurate data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Delete your Account and data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Export your data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Opt out of marketing communications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Opt out of model training data usage</span>
                </li>
              </ul>
              <p className="text-[#94A3B8] mt-3 text-sm">
                Contact{' '}
                <a href="mailto:privacy@newme.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                  privacy@newme.ai
                </a>{' '}
                to exercise these rights.
              </p>
            </div>
          </div>
        </section>

        {/* 8. DISCLAIMERS & LIMITATION OF LIABILITY */}
        <section id="disclaimers">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">8.</span> DISCLAIMERS & LIMITATION OF LIABILITY
          </h2>
          
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h3 className="text-amber-200 mb-3"><strong>8.1 "AS IS" Service</strong></h3>
              <p className="text-[#94A3B8] text-sm mb-3">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• MERCHANTABILITY</li>
                <li>• FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>• NON-INFRINGEMENT</li>
                <li>• ACCURACY OR RELIABILITY OF OUTPUTS</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">8.2 AI-Generated Content</h3>
              <p className="text-[#94A3B8] mb-3">You acknowledge that:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  <span>AI-generated content may contain errors, artifacts, or unexpected results</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  <span>Quality depends on input quality and model capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  <span>We do not guarantee specific output quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  <span>Generated content may not meet your expectations</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">8.3 Your Responsibility</h3>
              <p className="text-[#94A3B8] mb-3">You are solely responsible for:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Verifying you have rights to use User Content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Ensuring Generated Content complies with applicable laws</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>How you use Generated Content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Any claims arising from your use of Generated Content</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">8.4 Third-Party Services</h3>
              <p className="text-[#94A3B8] mb-3">
                We use third-party services (e.g., Google Cloud). We are not responsible for their:
              </p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• Service availability</li>
                <li>• Performance</li>
                <li>• Data practices</li>
                <li>• Terms of Service</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="text-red-300 mb-3"><strong>8.5 Limitation of Liability</strong></h3>
              <p className="text-red-200 text-sm mb-3"><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
              
              <p className="text-[#94A3B8] text-sm mb-2"><strong>WE ARE NOT LIABLE FOR:</strong></p>
              <ul className="space-y-1 text-[#94A3B8] text-sm mb-3">
                <li>• Indirect, incidental, consequential, or punitive damages</li>
                <li>• Lost profits, data, or business opportunities</li>
                <li>• Service interruptions or errors</li>
                <li>• User Content loss or corruption</li>
                <li>• Third-party actions or content</li>
              </ul>

              <p className="text-[#94A3B8] text-sm mb-2"><strong>OUR TOTAL LIABILITY</strong> for all claims is limited to:</p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• The amount you paid us in the 12 months before the claim, OR</li>
                <li>• $100, whichever is greater</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">8.6 Exceptions</h3>
              <p className="text-[#94A3B8] mb-2">The above limitations do not apply to:</p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• Our gross negligence or willful misconduct</li>
                <li>• Death or personal injury caused by us</li>
                <li>• Liability that cannot be excluded by law</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 9. INDEMNIFICATION */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">9.</span> INDEMNIFICATION
          </h2>
          <p className="text-[#94A3B8] leading-relaxed mb-4">
            You agree to indemnify, defend, and hold harmless NewMe.AI, its affiliates, and their respective 
            officers, directors, employees, and agents from any claims, damages, losses, liabilities, and 
            expenses (including attorneys' fees) arising from:
          </p>
          <ul className="space-y-2 text-[#94A3B8]">
            <li className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Your use of the Service</span>
            </li>
            <li className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Your User Content</span>
            </li>
            <li className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Your Generated Content</span>
            </li>
            <li className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Your violation of these Terms</span>
            </li>
            <li className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Your violation of any law or third-party rights</span>
            </li>
            <li className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Misrepresentation of your authorization to use content</span>
            </li>
          </ul>
          <p className="text-[#94A3B8] mt-4 text-sm">
            We reserve the right to assume exclusive defense of any claim at your expense.
          </p>
        </section>

        {/* 10. TERMINATION */}
        <section id="termination">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">10.</span> TERMINATION
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">10.1 By You</h3>
              <p className="text-[#94A3B8] mb-3">You may terminate your Account at any time by:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Canceling your subscription (if applicable)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Deleting your Account in settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Contacting support@newme.ai</span>
                </li>
              </ul>
              <p className="text-[#94A3B8] mt-3 mb-2">Upon termination:</p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• Subscription cancellation takes effect at period end</li>
                <li>• Unused credits are forfeited (no refund)</li>
                <li>• Your data is deleted per Section 7.4</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">10.2 By Us</h3>
              <p className="text-[#94A3B8] mb-3">We may suspend or terminate your Account immediately if:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  <span>You violate these Terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  <span>You engage in fraudulent activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  <span>Your Account is inactive for 24+ months (with notice)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  <span>Required by law or court order</span>
                </li>
              </ul>
              <p className="text-[#94A3B8] mt-3 mb-2">Upon termination by us:</p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• Access is immediately revoked</li>
                <li>• Unused credits are forfeited</li>
                <li>• Generated Content may be deleted</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">10.3 Effect of Termination</h3>
              <p className="text-[#94A3B8] mb-2">Sections that should survive termination remain in effect, including:</p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• Intellectual Property (Section 4)</li>
                <li>• Disclaimers (Section 8)</li>
                <li>• Limitation of Liability (Section 8)</li>
                <li>• Indemnification (Section 9)</li>
                <li>• Dispute Resolution (Section 11)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 11. DISPUTE RESOLUTION */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">11.</span> DISPUTE RESOLUTION
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">11.1 Informal Resolution</h3>
              <p className="text-[#94A3B8]">
                Before filing a claim, you agree to contact us at{' '}
                <a href="mailto:legal@newme.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                  legal@newme.ai
                </a>{' '}
                to resolve disputes informally. We commit to responding within 30 days.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">11.2 Arbitration Agreement</h3>
              <p className="text-[#94A3B8] mb-3">
                If informal resolution fails, you agree to resolve disputes through binding arbitration 
                rather than court, except:
              </p>
              <ul className="space-y-1 text-[#94A3B8] text-sm mb-3">
                <li>• Small claims court (under $10,000)</li>
                <li>• Injunctive relief (e.g., intellectual property disputes)</li>
              </ul>
              
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                <p className="text-[#F1F5F9] mb-2"><strong>Arbitration Rules:</strong></p>
                <ul className="space-y-1 text-[#94A3B8] text-sm">
                  <li>• Governed by American Arbitration Association (AAA) Consumer Arbitration Rules</li>
                  <li>• Conducted via video conference</li>
                  <li>• Single arbitrator chosen per AAA rules</li>
                  <li>• Each party pays their own attorneys' fees unless law provides otherwise</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h3 className="text-amber-200 mb-2"><strong>11.3 Class Action Waiver</strong></h3>
              <p className="text-[#94A3B8] text-sm">
                YOU AGREE TO BRING CLAIMS INDIVIDUALLY, NOT AS PART OF A CLASS ACTION, COLLECTIVE ACTION, 
                OR REPRESENTATIVE PROCEEDING.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">11.4 Governing Law</h3>
              <p className="text-[#94A3B8]">
                These Terms are governed by the laws of <strong className="text-[#F1F5F9]">California</strong>, 
                without regard to conflict of law principles.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">11.5 Opt-Out</h3>
              <p className="text-[#94A3B8]">
                You may opt out of arbitration by emailing{' '}
                <a href="mailto:legal@newme.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                  legal@newme.ai
                </a>{' '}
                within 30 days of first accepting these Terms. Opt-out does not affect other provisions.
              </p>
            </div>
          </div>
        </section>

        {/* 12. GENERAL PROVISIONS */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">12.</span> GENERAL PROVISIONS
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-[#F1F5F9] mb-2">12.1 Entire Agreement</h3>
              <p className="text-[#94A3B8] text-sm">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you 
                and NewMe.AI.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-2">12.2 Amendments</h3>
              <p className="text-[#94A3B8] text-sm mb-2">We may update these Terms by:</p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• Posting revised Terms on our website</li>
                <li>• Notifying you via email or in-app notification</li>
                <li>• Requiring acceptance for material changes</li>
              </ul>
              <p className="text-[#94A3B8] text-sm mt-2">
                Continued use after changes constitutes acceptance.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-2">12.3 Severability</h3>
              <p className="text-[#94A3B8] text-sm">
                If any provision is found invalid, the remaining provisions remain in effect.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-2">12.4 No Waiver</h3>
              <p className="text-[#94A3B8] text-sm">
                Our failure to enforce any right does not waive that right.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-2">12.5 Assignment</h3>
              <p className="text-[#94A3B8] text-sm">
                You may not assign these Terms without our consent. We may assign them to affiliates or 
                in connection with a merger, acquisition, or sale of assets.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-2">12.6 Force Majeure</h3>
              <p className="text-[#94A3B8] text-sm">
                We are not liable for delays or failures due to events beyond our reasonable control 
                (natural disasters, war, pandemics, internet outages, etc.).
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-2">12.7 Export Compliance</h3>
              <p className="text-[#94A3B8] text-sm">
                You agree to comply with all export laws and not to export or re-export the Service to 
                prohibited countries or persons.
              </p>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-2">12.8 Relationship</h3>
              <p className="text-[#94A3B8] text-sm">
                These Terms do not create a partnership, joint venture, employment, or agency relationship.
              </p>
            </div>
          </div>
        </section>

        {/* 13. SPECIFIC PROVISIONS FOR CERTAIN REGIONS */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">13.</span> SPECIFIC PROVISIONS FOR CERTAIN REGIONS
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00F0D9]" />
                13.1 California Residents
              </h3>
              <p className="text-[#94A3B8] mb-2 text-sm">
                Under California Civil Code Section 1789.3, you may contact the Complaint Assistance Unit 
                of the Division of Consumer Services of the California Department of Consumer Affairs:
              </p>
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                <ul className="space-y-1 text-[#94A3B8] text-sm">
                  <li>• <strong className="text-[#F1F5F9]">In writing:</strong> 1625 North Market Blvd., Suite N 112, Sacramento, CA 95834</li>
                  <li>• <strong className="text-[#F1F5F9]">By phone:</strong> (800) 952-5210 or (916) 445-1254</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">13.2 EU/UK Residents</h3>
              <p className="text-[#94A3B8] mb-2">If you are located in the European Union or United Kingdom:</p>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>You have additional rights under GDPR (see Privacy Policy)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>The limitation of liability provisions may not apply to you in full</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>You may file complaints with your local data protection authority</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">13.3 Other Jurisdictions</h3>
              <p className="text-[#94A3B8] text-sm">
                If specific provisions are unenforceable in your jurisdiction, they are modified to the 
                minimum extent necessary to comply with local law.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">14.</span> CONTACT
          </h2>
          
          <p className="text-[#94A3B8] mb-6">For questions about these Terms:</p>

          <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Legal inquiries:</p>
                <a 
                  href="mailto:legal@newme.ai" 
                  className="text-[#00F0D9] hover:text-[#00F0D9]/80"
                >
                  legal@newme.ai
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">General support:</p>
                <a 
                  href="mailto:support@newme.ai" 
                  className="text-[#00F0D9] hover:text-[#00F0D9]/80"
                >
                  support@newme.ai
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-[#334155]">
              <Link to="/support">
                <Button
                  variant="outline"
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
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
          <div className="space-y-2">
            <p className="text-[#00F0D9]">ACKNOWLEDGMENT</p>
            <p className="text-[#F1F5F9]">
              BY CLICKING "I ACCEPT," CREATING AN ACCOUNT, OR USING THE SERVICE, YOU ACKNOWLEDGE THAT 
              YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
            </p>
            <p className="text-[#94A3B8] text-sm mt-2">
              Version 1.0 • Last Updated: November 14, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Download PDF */}
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF Version
        </Button>
      </div>

      {/* Related Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link to="/privacy" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
          Privacy Policy
        </Link>
        <span className="text-[#334155]">•</span>
        <Link to="/price" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
          Pricing Plans
        </Link>
        <span className="text-[#334155]">•</span>
        <Link to="/support" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
          Support Center
        </Link>
        <span className="text-[#334155]">•</span>
        <Link to="/settings" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
          Account Settings
        </Link>
      </div>
    </main>
  );
}
