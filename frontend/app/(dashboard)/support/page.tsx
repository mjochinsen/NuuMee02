'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageCircle,
  BookOpen,
  Mail,
  ChevronDown,
  Play,
  Paperclip,
  Check,
  AlertCircle,
  Video,
  Send,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { submitSupportTicket } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function SupportPage() {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [jobId, setJobId] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  // Pre-fill email from auth
  useEffect(() => {
    if (profile?.email && !email) {
      setEmail(profile.email);
    }
  }, [profile?.email, email]);

  const popularSearches = ['Getting Started', 'Video Quality', 'Credits', 'API Issues'];

  const faqCategories = [
    {
      title: 'Getting Started',
      questions: [
        {
          question: 'How do I create my first video?',
          answer: '1. Upload a reference character image\n2. Upload a motion source video\n3. Click "Generate Video"\n4. Wait 1-3 hours for processing\n5. Download your result',
        },
        {
          question: 'What image formats are supported?',
          answer: 'We support JPG, PNG, and WebP formats. For best results, use high-resolution images (300+ DPI) with clear character visibility.',
        },
        {
          question: 'What video formats can I upload?',
          answer: 'Supported formats include MP4, MOV, and AVI. Maximum video length is 120 seconds. We recommend 720p or higher resolution.',
        },
        {
          question: 'How long does processing take?',
          answer: 'Most videos process in 1-3 hours. Complex videos with longer duration may take up to 6 hours. You\'ll receive an email notification when complete.',
        },
      ],
    },
    {
      title: 'Credits & Billing',
      questions: [
        {
          question: 'How do credits work?',
          answer: 'Each video generation costs credits based on resolution: 5 credits for 480p, 10 credits for 720p. Post-processing add-ons like Video Extender or Upscaler cost additional credits.',
        },
        {
          question: 'How much does each video cost?',
          answer: 'Pricing varies by resolution: 5 credits for 480p, 10 credits for 720p. 1 credit = $0.10 at retail value. Subscription plans offer better rates.',
        },
        {
          question: 'Can I get a refund if my video fails?',
          answer: 'Yes! If your video generation fails due to a system error, credits are automatically refunded. If it fails due to invalid input, please contact support for assistance.',
        },
        {
          question: 'How do I upgrade my plan?',
          answer: 'Go to the Billing page and select your desired plan. Upgrades take effect immediately and you\'ll be prorated for the remaining billing period.',
        },
      ],
    },
    {
      title: 'Video Quality',
      questions: [
        {
          question: 'How can I improve my results?',
          answer: 'Use high-resolution source videos (720p minimum), ensure good lighting in both the reference image and video, enable the Safety Checker, and match character sizes between image and video.',
        },
        {
          question: "Why doesn't my character look right?",
          answer: 'Common causes: low-quality reference image, mismatched character sizes, poor lighting, or complex backgrounds. Try using a clearer reference image with the character facing forward.',
        },
        {
          question: 'What resolution should I use?',
          answer: 'We recommend 720p for the best balance of quality and processing speed. After generation, you can use the Upscaler to enhance your video to 1080p.',
        },
        {
          question: 'Can I upscale my video?',
          answer: 'Yes! After your video is generated, use the Upscaler post-processing option to enhance to 1080p. This costs 100% of your base video cost (doubles the total).',
        },
      ],
    },
    {
      title: 'Technical Issues',
      questions: [
        {
          question: 'My video generation failed - what happened?',
          answer: 'Common reasons: character not detected in source video, unsupported format, video too long, or insufficient credits. Check the error message in your Jobs page for specific details.',
        },
        {
          question: 'Upload is stuck, what should I do?',
          answer: 'Try refreshing the page and uploading again. Ensure your internet connection is stable. For large files, consider compressing your video first. Maximum file size is 500MB.',
        },
        {
          question: "I can't download my video",
          answer: 'Download links expire after 14 days. If your link has expired, go to the Jobs page and regenerate the download link. If the issue persists, contact support.',
        },
        {
          question: 'API errors and troubleshooting',
          answer: 'Check your API key is valid, ensure proper authentication headers, verify request format matches documentation, and check the system status page for any ongoing issues.',
        },
      ],
    },
    {
      title: 'Account & Security',
      questions: [
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox. Links expire after 1 hour.',
        },
        {
          question: 'How do I delete my account?',
          answer: 'Go to Account Settings > Delete Account. Type your email to confirm. Note: This permanently deletes all your data and cannot be undone.',
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes. We use bank-level encryption for all uploads, store files securely on encrypted servers, and automatically delete files after 30 days (configurable in Privacy settings).',
        },
        {
          question: 'How do I enable 2FA?',
          answer: 'Go to Account Settings > Security > Two-Factor Authentication. Scan the QR code with your authenticator app and enter the verification code. Save your backup codes securely.',
        },
      ],
    },
  ];

  const commonIssues = [
    {
      issue: 'Video generation failed',
      cause: 'Character not detected in source video',
      fix: 'Use Safety Checker before generating',
      link: '/videos/create',
    },
    {
      issue: 'Processing taking too long',
      cause: 'Current average: 1-3 hours',
      fix: 'Check Jobs page for real-time status',
      link: '/jobs',
    },
    {
      issue: "Can't download video",
      cause: 'Link may have expired (2 weeks)',
      fix: 'Regenerate download link from Jobs page',
      link: '/jobs',
    },
    {
      issue: 'Payment failed',
      cause: 'Card declined or insufficient funds',
      fix: 'Update payment method in Billing',
      link: '/billing',
    },
  ];

  const tutorials = [
    { title: 'Getting Started', duration: '5:23' },
    { title: 'Optimizing Quality', duration: '7:45' },
    { title: 'Troubleshoot Common Issues', duration: '4:12' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!email || !subject || !category || !message) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    if (message.length < 10) {
      setSubmitError('Please provide more details in your message (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitSupportTicket({
        email,
        subject,
        category,
        job_id: jobId || undefined,
        message,
      });

      setTicketId(response.ticket_id);
      setShowSuccess(true);
      // Reset form
      setSubject('');
      setCategory('');
      setJobId('');
      setMessage('');

      // Hide success after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setTicketId(null);
      }, 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-6 h-6 text-[#00F0D9]" />
          <h1 className="text-3xl font-bold text-[#F1F5F9]">Support & Help Center</h1>
        </div>
      </div>

      <div className="h-px bg-[#334155] mb-8"></div>

      {/* Search Section */}
      <div className="mb-12">
        <h2 className="text-[#F1F5F9] text-2xl mb-6 text-center">How can we help you today?</h2>

        <div className="max-w-3xl mx-auto mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] pl-12 pr-24 py-6 text-lg"
            />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
              Search
            </Button>
          </div>
        </div>

        <div className="text-center">
          <span className="text-[#94A3B8] mr-3">Popular:</span>
          {popularSearches.map((search, index) => (
            <Button key={index} variant="link" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
              {search}
            </Button>
          ))}
        </div>
      </div>

      {/* System Status Banner */}
      <div className="mb-12">
        <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🟢</span>
              <span className="text-green-400">System Status: Operational</span>
            </div>
            <Link href="/status">
              <Button variant="link" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                View Status Page
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
        <Link href="/documentation">
          <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] hover:border-[#00F0D9] transition-colors cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-[#00F0D9]" />
              </div>
              <div>
                <h3 className="text-[#F1F5F9] text-xl mb-2 group-hover:text-[#00F0D9] transition-colors">Documentation</h3>
                <p className="text-[#94A3B8] mb-4">Browse guides and tutorials</p>
                <span className="text-[#00F0D9]">View Docs →</span>
              </div>
            </div>
          </div>
        </Link>

        <div
          onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] hover:border-[#00F0D9] transition-colors cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-[#00F0D9]" />
            </div>
            <div>
              <h3 className="text-[#F1F5F9] text-xl mb-2 group-hover:text-[#00F0D9] transition-colors">Contact Support</h3>
              <p className="text-[#94A3B8] mb-4">Can&apos;t find an answer? Get in touch</p>
              <span className="text-[#00F0D9]">Contact Us →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Common Issues Quick Fixes */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-xl font-semibold text-[#F1F5F9]">Common Issues & Quick Fixes</h2>
        </div>

        <div className="space-y-4">
          {commonIssues.map((item, index) => (
            <div key={index} className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-[#F1F5F9] mb-1 flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    {item.issue}
                  </h3>
                  <p className="text-[#94A3B8] text-sm mb-2">→ {item.cause}</p>
                  <p className="text-[#00F0D9] text-sm">Fix: {item.fix}</p>
                </div>
                <Link href={item.link}>
                  <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <h2 className="text-xl font-semibold text-[#F1F5F9] mb-6">Frequently Asked Questions</h2>
        <div className="h-px bg-[#334155] mb-6"></div>

        <div className="space-y-6">
          {faqCategories.map((cat, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-[#F1F5F9] mb-4">{cat.title}</h3>
              <div className="h-px bg-[#334155] mb-4"></div>

              <Accordion type="single" collapsible className="space-y-2">
                {cat.questions.map((item, questionIndex) => (
                  <AccordionItem
                    key={questionIndex}
                    value={`${categoryIndex}-${questionIndex}`}
                    className="border border-[#334155] rounded-lg px-4 bg-[#1E293B]"
                  >
                    <AccordionTrigger className="text-[#F1F5F9] hover:text-[#00F0D9] hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#94A3B8] whitespace-pre-line">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Video className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-xl font-semibold text-[#F1F5F9]">Video Tutorials</h2>
        </div>
        <div className="h-px bg-[#334155] mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[#1E293B]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <Badge className="absolute bottom-3 right-3 bg-black/70 text-white border-none">
                  {tutorial.duration}
                </Badge>
              </div>
              <h3 className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">{tutorial.title}</h3>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
            Watch All Tutorials
          </Button>
        </div>
      </div>

      {/* Contact Support Form */}
      <div id="contact-form" className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-xl font-semibold text-[#F1F5F9]">Contact Support</h2>
        </div>
        <div className="h-px bg-[#334155] mb-6"></div>

        <p className="text-[#94A3B8] mb-6">Still need help? We&apos;re here for you.</p>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-[#00F0D9] mb-4" />
            <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">Ticket Submitted!</h3>
            <p className="text-[#94A3B8] mb-2">We&apos;ll get back to you within 24-48 hours.</p>
            {ticketId && (
              <p className="text-[#64748B] text-sm">Ticket ID: {ticketId.slice(0, 8)}</p>
            )}
            <p className="text-[#94A3B8] mt-4 text-sm">A confirmation email has been sent to your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#94A3B8]">Your Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-[#94A3B8]">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
                className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#94A3B8]">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="technical" className="text-[#F1F5F9]">Technical Issue</SelectItem>
                  <SelectItem value="billing" className="text-[#F1F5F9]">Billing</SelectItem>
                  <SelectItem value="account" className="text-[#F1F5F9]">Account</SelectItem>
                  <SelectItem value="feature" className="text-[#F1F5F9]">Feature Request</SelectItem>
                  <SelectItem value="bug" className="text-[#F1F5F9]">Bug Report</SelectItem>
                  <SelectItem value="other" className="text-[#F1F5F9]">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobId" className="text-[#94A3B8]">Job ID (if applicable)</Label>
              <Input
                id="jobId"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="job-abc-123-def"
                className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-[#94A3B8]">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]"
                placeholder="Please describe your issue in detail..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#94A3B8]">Attachments (optional)</Label>
              <Button type="button" variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach Files
              </Button>
              <p className="text-[#94A3B8] text-sm">Upload screenshots or files that may help us understand your issue</p>
            </div>

            {submitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* Quick Links */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <h3 className="text-xl font-semibold text-[#F1F5F9] mb-6">Need Something Else?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/documentation">
            <Button variant="outline" className="w-full justify-start border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
              <BookOpen className="w-4 h-4 mr-2 text-[#00F0D9]" />
              Documentation
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </Link>
          <Link href="/status">
            <Button variant="outline" className="w-full justify-start border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
              <Check className="w-4 h-4 mr-2 text-[#00F0D9]" />
              System Status
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </Link>
          <a href="mailto:support@nuumee.ai">
            <Button variant="outline" className="w-full justify-start border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
              <Mail className="w-4 h-4 mr-2 text-[#00F0D9]" />
              support@nuumee.ai
            </Button>
          </a>
        </div>
      </div>
    </main>
  );
}
