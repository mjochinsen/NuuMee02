import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Download,
  Mail,
  Lock,
  Globe,
  Cookie,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';

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
            <h1 className="text-[#F1F5F9]">Privacy Policy</h1>
            <p className="text-[#94A3B8] text-sm">
              Last updated: November 11, 2025
            </p>
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
        
        {/* 1. Introduction */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">1.</span> Introduction
          </h2>
          <p className="text-[#94A3B8] leading-relaxed">
            NewMe.AI ("we," "our," or "us") respects your privacy. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you use our AI 
            video generation service. By using our service, you agree to the collection and use 
            of information in accordance with this policy.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section id="collection">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
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
                  <span>Reference images</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Motion videos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Generated output videos</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">Usage Data:</h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Log data (IP address, browser type, pages visited)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Device information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>API usage metrics</span>
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
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Billing address</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Transaction history</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. How We Use Your Information */}
        <section id="usage">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
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
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Detect and prevent fraud or abuse</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Analyze usage to improve features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Send marketing communications (with your consent)</span>
            </li>
          </ul>
        </section>

        {/* 4. Data Sharing and Disclosure */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">4.</span> Data Sharing and Disclosure
          </h2>
          
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mb-6">
            <p className="text-[#00F0D9] flex items-center gap-2">
              <Lock className="w-5 h-5" />
              We do NOT sell your personal data.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-3">We may share data with:</h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Service providers (hosting, payment processing, analytics)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Legal obligations (if required by law)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Business transfers (acquisition, merger)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F1F5F9] mb-3">Third-party services we use:</h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Google Cloud Platform (hosting, storage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Stripe (payment processing)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span>Google Analytics (usage analytics)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Data Retention */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">5.</span> Data Retention
          </h2>
          <ul className="space-y-3 text-[#94A3B8]">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span><strong className="text-[#F1F5F9]">Account data:</strong> Until you delete your account</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span><strong className="text-[#F1F5F9]">Uploaded content:</strong> 30 days after job completion (configurable in settings)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span><strong className="text-[#F1F5F9]">Generated videos:</strong> 2 weeks (download links expire)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span><strong className="text-[#F1F5F9]">Logs and analytics:</strong> 90 days</span>
            </li>
          </ul>
        </section>

        {/* 6. Your Rights (GDPR/CCPA) */}
        <section id="rights">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">6.</span> Your Rights (GDPR/CCPA)
          </h2>
          
          <div className="mb-6">
            <h3 className="text-[#F1F5F9] mb-3">You have the right to:</h3>
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
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                <span><strong className="text-[#F1F5F9]">Opt-out</strong> of marketing communications</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                <span><strong className="text-[#F1F5F9]">Restrict or object</strong> to processing</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
            <p className="text-[#94A3B8] mb-2">To exercise these rights, contact:</p>
            <a 
              href="mailto:privacy@newme.ai" 
              className="text-[#00F0D9] hover:text-[#00F0D9]/80 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              privacy@newme.ai
            </a>
          </div>
        </section>

        {/* 7. Data Security */}
        <section id="security">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">7.</span> Data Security
          </h2>
          
          <p className="text-[#94A3B8] mb-4">
            We implement industry-standard security measures to protect your data:
          </p>

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
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
              <span>Access controls and authentication</span>
            </li>
          </ul>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-amber-200 text-sm">
              However, no system is 100% secure. Please use strong passwords and enable two-factor authentication.
            </p>
          </div>
        </section>

        {/* 8. Cookies and Tracking */}
        <section id="cookies">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">8.</span> Cookies and Tracking
          </h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-[#F1F5F9] mb-2">We use cookies for:</h3>
              <ul className="space-y-2 text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <Cookie className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span><strong className="text-[#F1F5F9]">Essential:</strong> Authentication, security</span>
                </li>
                <li className="flex items-start gap-2">
                  <Cookie className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span><strong className="text-[#F1F5F9]">Analytics:</strong> Usage statistics (Google Analytics)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Cookie className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-1" />
                  <span><strong className="text-[#F1F5F9]">Preferences:</strong> Remember your settings</span>
                </li>
              </ul>
            </div>

            <p className="text-[#94A3B8]">
              You can manage cookie preferences in your browser settings.
            </p>
          </div>

          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          >
            <Cookie className="w-4 h-4 mr-2" />
            Manage Cookie Settings
          </Button>
        </section>

        {/* 9. Children's Privacy */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">9.</span> Children's Privacy
          </h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Our service is not intended for users under 13 years old. We do not knowingly collect 
            personal information from children. If you believe we have collected information from a 
            child, please contact us immediately at privacy@newme.ai.
          </p>
        </section>

        {/* 10. International Data Transfers */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">10.</span> International Data Transfers
          </h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Your data may be transferred to and processed in the United States or other countries 
            where our servers and service providers are located. By using our service, you consent 
            to the transfer of your information to countries outside of your country of residence, 
            which may have different data protection rules.
          </p>
        </section>

        {/* 11. Changes to This Policy */}
        <section>
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">11.</span> Changes to This Policy
          </h2>
          <p className="text-[#94A3B8] leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this page 
            with an updated "Last updated" date. We will notify you of significant changes via email 
            or through a notice on our website. Your continued use of the service after changes are 
            made constitutes acceptance of those changes.
          </p>
        </section>

        {/* 12. Contact Us */}
        <section id="contact">
          <h2 className="text-[#F1F5F9] mb-4 flex items-center gap-2">
            <span className="text-[#00F0D9]">12.</span> Contact Us
          </h2>
          
          <p className="text-[#94A3B8] mb-6">
            If you have questions or concerns about this Privacy Policy, please contact us:
          </p>

          <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Email:</p>
                <a 
                  href="mailto:privacy@newme.ai" 
                  className="text-[#00F0D9] hover:text-[#00F0D9]/80"
                >
                  privacy@newme.ai
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Address:</p>
                <p className="text-[#F1F5F9]">
                  NewMe.AI Inc.<br />
                  123 AI Innovation Drive<br />
                  San Francisco, CA 94102<br />
                  United States
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#334155]">
              <Link to="/support">
                <Button
                  variant="outline"
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
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

      {/* Legal Notice */}
      <div className="mt-8 bg-[#1E293B]/50 border border-[#334155] rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-[#F1F5F9]">Legal Compliance</p>
            <p className="text-[#94A3B8] text-sm">
              This Privacy Policy is designed to comply with GDPR (General Data Protection Regulation), 
              CCPA (California Consumer Privacy Act), and other applicable data protection laws. 
              If you have any concerns about how your data is handled, please contact our privacy team.
            </p>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link to="/terms" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
          Terms of Service
        </Link>
        <span className="text-[#334155]">•</span>
        <Link to="/settings" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
          Privacy Settings
        </Link>
        <span className="text-[#334155]">•</span>
        <Link to="/support" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
          Support Center
        </Link>
      </div>
    </main>
  );
}
