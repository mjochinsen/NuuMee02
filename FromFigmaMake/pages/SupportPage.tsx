import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  BookOpen,
  Mail,
  ChevronDown,
  ChevronRight,
  Play,
  Paperclip,
  Check,
  AlertCircle,
  Info,
  FileText,
  Video,
  MessageSquare,
  Bug,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('alex.chen@email.com');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [jobId, setJobId] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketNumber] = useState('12345');

  const popularSearches = [
    'Getting Started',
    'Video Quality',
    'Credits',
    'API Issues',
  ];

  const faqCategories = [
    {
      title: 'Getting Started',
      questions: [
        {
          question: 'How do I create my first video?',
          answer: (
            <div className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-[#94A3B8]">
                <li>Upload a reference character image</li>
                <li>Upload a motion source video</li>
                <li>Click "Generate Video"</li>
                <li>Wait 1-3 hours for processing</li>
                <li>Download your result</li>
              </ol>
              <Button
                variant="link"
                className="text-[#00F0D9] p-0 h-auto"
              >
                View Full Tutorial
              </Button>
            </div>
          ),
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
          answer: 'Each video generation costs credits based on video length and quality. Short videos (< 30s) cost 1 credit, medium videos (30-60s) cost 2 credits, and long videos (60-120s) cost 3 credits.',
        },
        {
          question: 'How much does each video cost?',
          answer: 'Pricing varies by video length: 1-3 credits per video. Credits cost $0.50 each when purchased in bulk. Subscription plans offer better rates.',
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
          answer: 'We recommend 720p for the best balance of quality and processing speed. 1080p is available on Creator and Studio plans. 4K upscaling is available as a post-processing option.',
        },
        {
          question: 'Can I upscale to 4K?',
          answer: 'Yes! After your video is generated, use the 4K Upscaler post-processing option. This costs an additional 2 credits per video.',
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
      link: '/create',
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
    {
      title: 'Getting Started',
      duration: '5:23',
      thumbnail: 'video tutorial learning',
    },
    {
      title: 'Optimizing Quality',
      duration: '7:45',
      thumbnail: 'professional video quality',
    },
    {
      title: 'Troubleshoot Common Issues',
      duration: '4:12',
      thumbnail: 'tech support help',
    },
  ];

  const systemStatus = [
    { service: 'API', status: 'operational' },
    { service: 'Video Generation', status: 'operational' },
    { service: 'File Uploads', status: 'operational' },
    { service: 'Authentication', status: 'operational' },
  ];

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessModal(true);
    // Reset form
    setSubject('');
    setCategory('');
    setJobId('');
    setMessage('');
  };

  const getStatusColor = (status: string) => {
    if (status === 'operational') return 'text-green-500';
    if (status === 'degraded') return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'operational') return '🟢';
    if (status === 'degraded') return '🟡';
    return '🔴';
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-6 h-6 text-[#00F0D9]" />
          <h1 className="text-[#F1F5F9]">Support & Help Center</h1>
        </div>
      </div>

      <div className="h-px bg-[#334155] mb-8"></div>

      {/* Search Section */}
      <div className="mb-12">
        <h2 className="text-[#F1F5F9] text-2xl mb-6 text-center">
          How can we help you today?
        </h2>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] pl-12 pr-24 py-6 text-lg"
            />
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Popular Searches */}
        <div className="text-center">
          <span className="text-[#94A3B8] mr-3">Popular:</span>
          {popularSearches.map((search, index) => (
            <Button
              key={index}
              variant="link"
              className="text-[#00F0D9] hover:text-[#00F0D9]/80"
            >
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
              <span className="text-green-500">All Systems Operational</span>
            </div>
            <Button
              variant="link"
              className="text-[#00F0D9] hover:text-[#00F0D9]/80"
            >
              View Status Page
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
        <Link to="/documentation">
          <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] hover:border-[#00F0D9] transition-colors cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-[#00F0D9]" />
              </div>
              <div>
                <h3 className="text-[#F1F5F9] text-xl mb-2 group-hover:text-[#00F0D9] transition-colors">
                  Documentation
                </h3>
                <p className="text-[#94A3B8] mb-4">
                  Browse guides and tutorials
                </p>
                <span className="text-[#00F0D9]">View Docs →</span>
              </div>
            </div>
          </div>
        </Link>

        <div
          onClick={() => {
            document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] hover:border-[#00F0D9] transition-colors cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-[#00F0D9]" />
            </div>
            <div>
              <h3 className="text-[#F1F5F9] text-xl mb-2 group-hover:text-[#00F0D9] transition-colors">
                Contact Support
              </h3>
              <p className="text-[#94A3B8] mb-4">
                Can't find an answer? Get in touch
              </p>
              <span className="text-[#00F0D9]">Contact Us →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Common Issues Quick Fixes */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Common Issues & Quick Fixes</h2>
        </div>

        <div className="space-y-4">
          {commonIssues.map((item, index) => (
            <div
              key={index}
              className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-[#F1F5F9] mb-1 flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    {item.issue}
                  </h3>
                  <p className="text-[#94A3B8] text-sm mb-2">
                    → {item.cause}
                  </p>
                  <p className="text-[#00F0D9] text-sm">
                    Fix: {item.fix}
                  </p>
                </div>
                <Link to={item.link}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                  >
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
        <h2 className="text-[#F1F5F9] mb-6">Frequently Asked Questions</h2>
        <div className="h-px bg-[#334155] mb-6"></div>

        <div className="space-y-6">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-[#F1F5F9] mb-4">{category.title}</h3>
              <div className="h-px bg-[#334155] mb-4"></div>
              
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((item, questionIndex) => (
                  <AccordionItem
                    key={questionIndex}
                    value={`${categoryIndex}-${questionIndex}`}
                    className="border border-[#334155] rounded-lg px-4 bg-[#1E293B]"
                  >
                    <AccordionTrigger className="text-[#F1F5F9] hover:text-[#00F0D9] hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#94A3B8]">
                      {typeof item.answer === 'string' ? (
                        <p>{item.answer}</p>
                      ) : (
                        item.answer
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          >
            View All FAQs
          </Button>
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Video className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Video Tutorials</h2>
        </div>
        <div className="h-px bg-[#334155] mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutorials.map((tutorial, index) => (
            <div
              key={index}
              className="group cursor-pointer"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[#1E293B]">
                <ImageWithFallback
                  src={`https://images.unsplash.com/photo-${
                    index === 0 ? '1516321497487-e288fb19713f' :
                    index === 1 ? '1574717024653-61fd2cf4d44d' :
                    '1516035069371-29a1b244cc32'
                  }?w=600&h=400&fit=crop`}
                  alt={tutorial.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <Badge className="absolute bottom-3 right-3 bg-black/70 text-white border-none">
                  {tutorial.duration}
                </Badge>
              </div>
              <h3 className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">
                {tutorial.title}
              </h3>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          >
            Watch All Tutorials
          </Button>
        </div>
      </div>

      {/* Contact Support Form */}
      <div id="contact-form" className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Contact Support</h2>
        </div>
        <div className="h-px bg-[#334155] mb-6"></div>

        <p className="text-[#94A3B8] mb-6">
          Still need help? We're here for you.
        </p>

        <form onSubmit={handleSubmitSupport} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#94A3B8]">Your Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-[#94A3B8]">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Video generation failed"
              required
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
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
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
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
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
              placeholder="Please describe your issue in detail..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#94A3B8]">Attachments (optional)</Label>
            <Button
              type="button"
              variant="outline"
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Attach Files
            </Button>
            <p className="text-[#94A3B8] text-sm">Max 10MB</p>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
            <p className="text-[#94A3B8] text-sm flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00F0D9] flex-shrink-0 mt-0.5" />
              <span>Response time: Usually within 24 hours</span>
            </p>
          </div>

          <Button
            type="submit"
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
          >
            Send Message
          </Button>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Quick Tips</h2>
        </div>
        <div className="h-px bg-[#334155] mb-6"></div>

        <ul className="space-y-3 text-[#94A3B8] mb-6">
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
            <span>Use high-quality reference images (300+ DPI)</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
            <span>Ensure character sizes match between image and video</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
            <span>Enable Safety Checker to verify before processing</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
            <span>Check job status page for real-time updates</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#00F0D9] flex-shrink-0 mt-0.5" />
            <span>Join our Discord community for tips from other creators</span>
          </li>
        </ul>

        <Button
          variant="outline"
          className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Join Discord Community
        </Button>
      </div>

      {/* System Status Details */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h2 className="text-[#F1F5F9]">System Status</h2>
        </div>
        <div className="h-px bg-[#334155] mb-6"></div>

        <div className="space-y-3 mb-6">
          {systemStatus.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getStatusIcon(item.status)}</span>
                <span className="text-[#F1F5F9]">{item.service}</span>
              </div>
              <span className={getStatusColor(item.status)}>
                Operational
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="text-[#94A3B8]">Last updated: 2 minutes ago</p>
          <div className="flex gap-3">
            <Button
              variant="link"
              className="text-[#00F0D9] hover:text-[#00F0D9]/80 p-0 h-auto"
            >
              View Full Status Page
            </Button>
            <Button
              variant="link"
              className="text-[#00F0D9] hover:text-[#00F0D9]/80 p-0 h-auto"
            >
              Subscribe to Updates
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] mb-6">Additional Resources</h2>
        <div className="h-px bg-[#334155] mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/documentation">
            <div className="flex items-center gap-3 text-[#F1F5F9] hover:text-[#00F0D9] transition-colors p-3 rounded-lg hover:bg-[#1E293B]">
              <FileText className="w-5 h-5" />
              <span>API Documentation</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </div>
          </Link>

          <div className="flex items-center gap-3 text-[#F1F5F9] hover:text-[#00F0D9] transition-colors p-3 rounded-lg hover:bg-[#1E293B] cursor-pointer">
            <Video className="w-5 h-5" />
            <span>Video Tutorials</span>
            <ExternalLink className="w-4 h-4 ml-auto" />
          </div>

          <div className="flex items-center gap-3 text-[#F1F5F9] hover:text-[#00F0D9] transition-colors p-3 rounded-lg hover:bg-[#1E293B] cursor-pointer">
            <MessageSquare className="w-5 h-5" />
            <span>Community Discord</span>
            <ExternalLink className="w-4 h-4 ml-auto" />
          </div>

          <div className="flex items-center gap-3 text-[#F1F5F9] hover:text-[#00F0D9] transition-colors p-3 rounded-lg hover:bg-[#1E293B] cursor-pointer">
            <BookOpen className="w-5 h-5" />
            <span>Blog & Updates</span>
            <ExternalLink className="w-4 h-4 ml-auto" />
          </div>

          <div className="flex items-center gap-3 text-[#F1F5F9] hover:text-[#00F0D9] transition-colors p-3 rounded-lg hover:bg-[#1E293B] cursor-pointer">
            <Bug className="w-5 h-5" />
            <span>Report a Bug</span>
            <ExternalLink className="w-4 h-4 ml-auto" />
          </div>

          <div className="flex items-center gap-3 text-[#F1F5F9] hover:text-[#00F0D9] transition-colors p-3 rounded-lg hover:bg-[#1E293B] cursor-pointer">
            <Lightbulb className="w-5 h-5" />
            <span>Request a Feature</span>
            <ExternalLink className="w-4 h-4 ml-auto" />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Message Sent Successfully
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-[#F1F5F9]">Thanks for contacting us!</p>
            
            <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
              <p className="text-[#94A3B8] mb-2">
                Ticket #{ticketNumber} has been created.
              </p>
              <p className="text-[#94A3B8] mb-2">
                We've sent a confirmation to:
              </p>
              <p className="text-[#00F0D9]">{email}</p>
            </div>

            <p className="text-[#94A3B8]">
              You'll hear back from us within 24 hours.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSuccessModal(false)}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Back to Support
            </Button>
            <Button
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              View Ticket Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
