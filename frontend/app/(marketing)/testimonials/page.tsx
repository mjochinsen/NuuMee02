'use client';

import Link from 'next/link';
import { Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator',
      company: 'YouTube',
      rating: 5,
      text: 'NuuMee.AI has completely transformed my content creation workflow. The character replacement is incredibly realistic, and the processing time is much faster than I expected. The post-processing tools are a game-changer!',
      avatar: 'SC',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Video Producer',
      company: 'Studio Mars',
      rating: 5,
      text: 'As a professional video producer, I was skeptical at first. But the quality of the AI replacements is outstanding. We use it for pre-visualization and client presentations. Saves us countless hours.',
      avatar: 'MR',
    },
    {
      name: 'Emily Watson',
      role: 'Marketing Director',
      company: 'TechFlow Inc',
      rating: 5,
      text: 'The ability to quickly create multiple video variations with different characters has been invaluable for our A/B testing. The ROI has been incredible, and our engagement rates have doubled.',
      avatar: 'EW',
    },
    {
      name: 'David Kim',
      role: 'Independent Filmmaker',
      company: 'Freelance',
      rating: 5,
      text: 'The 4K upscaling and auto-subtitle features alone are worth the subscription. But combined with the character replacement, this tool is absolutely essential for modern filmmaking.',
      avatar: 'DK',
    },
    {
      name: 'Lisa Anderson',
      role: 'Social Media Manager',
      company: 'BrandWave',
      rating: 5,
      text: 'Creating localized content for different markets used to take weeks. Now we can swap characters and add subtitles in multiple languages in just a few hours. Absolutely revolutionary.',
      avatar: 'LA',
    },
    {
      name: 'James Park',
      role: 'Creative Director',
      company: 'Pixel Studios',
      rating: 5,
      text: 'The JSON mode and API access make it perfect for integrating into our existing pipeline. The team loves how intuitive the interface is, and the results speak for themselves.',
      avatar: 'JP',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Videos Generated' },
    { value: '4.9/5', label: 'Average Rating' },
    { value: '10K+', label: 'Happy Users' },
    { value: '99.8%', label: 'Uptime' },
  ];

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-4">What Our Users Say</h1>
        <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto">
          Join thousands of creators, producers, and businesses using NuuMee.AI to transform their video content.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] text-center">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-[#94A3B8] text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] relative hover:border-[#00F0D9] transition-colors"
          >
            <Quote className="w-8 h-8 text-[#00F0D9] opacity-20 absolute top-4 right-4" />

            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#00F0D9] text-[#00F0D9]" />
              ))}
            </div>

            {/* Text */}
            <p className="text-[#94A3B8] mb-6 relative z-10">
              &quot;{testimonial.text}&quot;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                <span className="text-white font-medium">{testimonial.avatar}</span>
              </div>
              <div>
                <div className="text-[#F1F5F9] font-medium">{testimonial.name}</div>
                <div className="text-[#94A3B8] text-sm">
                  {testimonial.role} • {testimonial.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] text-center mt-12">
        <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">Ready to Join Them?</h2>
        <p className="text-[#94A3B8] mb-6 max-w-2xl mx-auto">
          Start creating amazing videos with AI character replacement today.
        </p>
        <Link href="/signup">
          <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8">
            Get Started Free
          </Button>
        </Link>
      </div>
    </main>
  );
}
