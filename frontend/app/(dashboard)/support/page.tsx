'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Book, Mail, Send, CheckCircle2, Search, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  created: string;
  lastUpdate: string;
}

export default function SupportPage() {
  const [tickets] = useState<SupportTicket[]>([
    { id: 'TICK-001', subject: 'Question about API rate limits', status: 'resolved', created: 'Nov 1, 2025', lastUpdate: 'Nov 5, 2025' },
    { id: 'TICK-002', subject: 'Video generation not working', status: 'in-progress', created: 'Nov 10, 2025', lastUpdate: 'Nov 12, 2025' },
  ]);
  const [formData, setFormData] = useState({ subject: '', category: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setFormData({ subject: '', category: '', email: '', message: '' }); }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in-progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const faqItems = [
    { q: 'How do I upgrade my plan?', a: 'Visit the Billing page and click "Change Plan" to see available options.' },
    { q: 'What are the API rate limits?', a: 'Rate limits depend on your plan. Creator: 100 requests/min, Studio: 500 requests/min.' },
    { q: 'How long does video generation take?', a: 'Typically 1-3 hours depending on video length and queue position.' },
    { q: 'Do credits expire?', a: 'Subscription credits roll over 50% monthly. Purchased credits never expire.' },
  ];

  return (
    <main className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center"><HelpCircle className="w-6 h-6 text-[#00F0D9]" /></div>
          <div><h1 className="text-3xl font-bold text-[#F1F5F9]">Support Center</h1><p className="text-[#94A3B8] text-sm">Get help and submit support tickets</p></div>
        </div>
        <div className="h-px bg-[#334155]"></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="space-y-6">
          <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
            <div className="flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Submit a Ticket</h2></div>
            <p className="text-[#94A3B8] text-sm mb-6">We typically respond within 24 hours</p>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-[#00F0D9] mb-4" />
                <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">Ticket Submitted!</h3>
                <p className="text-[#94A3B8]">We&apos;ll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="subject" className="text-[#94A3B8]">Subject</Label><Input id="subject" placeholder="Brief description of your issue" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]" required /></div>
                <div className="space-y-2"><Label className="text-[#94A3B8]">Category</Label><Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}><SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent className="bg-[#1E293B] border-[#334155]"><SelectItem value="billing" className="text-[#F1F5F9]">Billing</SelectItem><SelectItem value="technical" className="text-[#F1F5F9]">Technical Issue</SelectItem><SelectItem value="api" className="text-[#F1F5F9]">API</SelectItem><SelectItem value="other" className="text-[#F1F5F9]">Other</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="email" className="text-[#94A3B8]">Email</Label><Input id="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]" required /></div>
                <div className="space-y-2"><Label htmlFor="message" className="text-[#94A3B8]">Message</Label><Textarea id="message" placeholder="Describe your issue in detail..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8] min-h-[150px]" required /></div>
                <Button type="submit" className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"><Send className="w-4 h-4 mr-2" />Send Message</Button>
              </form>
            )}
          </div>

          {/* Quick Links */}
          <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
            <h3 className="text-[#F1F5F9] mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/documentation"><Button variant="outline" className="w-full justify-start border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"><Book className="w-4 h-4 mr-2 text-[#00F0D9]" />Documentation<ExternalLink className="w-3 h-3 ml-auto" /></Button></Link>
              <Button variant="outline" className="w-full justify-start border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"><Mail className="w-4 h-4 mr-2 text-[#00F0D9]" />Email: support@nuumee.ai</Button>
            </div>
          </div>
        </div>

        {/* Support Tickets & FAQ */}
        <div className="space-y-6">
          <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
            <h2 className="text-[#F1F5F9] mb-4">Your Tickets</h2>
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-[#94A3B8]">No support tickets yet</div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="border border-[#334155] rounded-xl p-4 bg-[#1E293B] hover:border-[#00F0D9]/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2"><div><h3 className="text-[#F1F5F9] font-semibold">{ticket.subject}</h3><p className="text-sm text-[#94A3B8]">#{ticket.id}</p></div><Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('-', ' ')}</Badge></div>
                    <div className="flex items-center gap-4 text-sm text-[#94A3B8]"><span>Created: {ticket.created}</span><span>Updated: {ticket.lastUpdate}</span></div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
            <h2 className="text-[#F1F5F9] mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((faq, idx) => (
                <div key={idx} className="border-b border-[#334155] last:border-0 pb-4 last:pb-0">
                  <h3 className="text-[#F1F5F9] font-semibold mb-2">{faq.q}</h3>
                  <p className="text-[#94A3B8] text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
