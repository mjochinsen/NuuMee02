'use client';

import Link from 'next/link';
import { Book, Code, Video, Image, Settings, Wrench } from 'lucide-react';

export default function DocumentationPage() {
  const sections = [
    {
      icon: Video,
      title: 'Getting Started',
      description: 'Learn the basics of character replacement and how to create your first video.',
      topics: ['Quick Start Guide', 'Uploading Files', 'Basic Configuration', 'Understanding Results'],
    },
    {
      icon: Settings,
      title: 'Configuration',
      description: 'Deep dive into all configuration options and advanced settings.',
      topics: ['Resolution Settings', 'Video Quality Options', 'Seed & Randomization', 'Inference Steps'],
    },
    {
      icon: Image,
      title: 'Best Practices',
      description: 'Tips and tricks for getting the best results from your character replacements.',
      topics: ['Image Selection', 'Video Preparation', 'Lighting Conditions', 'Motion Considerations'],
    },
    {
      icon: Wrench,
      title: 'Post-Processing',
      description: 'Learn how to enhance your videos with our post-processing tools.',
      topics: ['Video Extension', '4K Upscaling', 'Adding Sound', 'Auto Subtitles'],
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Integrate NuuMee.AI into your applications with our API.',
      topics: ['Authentication', 'Endpoints', 'Webhooks', 'Rate Limits'],
    },
    {
      icon: Book,
      title: 'FAQ',
      description: 'Frequently asked questions and troubleshooting guide.',
      topics: ['Common Issues', 'Credit Usage', 'File Formats', 'Processing Times'],
    },
  ];

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-4">Documentation</h1>
        <p className="text-[#94A3B8] text-xl max-w-3xl">
          Everything you need to know about using NuuMee.AI for AI character replacement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] hover:border-[#00F0D9] transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center mb-4">
              <section.icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-[#F1F5F9] font-semibold mb-2 group-hover:text-[#00F0D9] transition-colors">
              {section.title}
            </h3>

            <p className="text-[#94A3B8] mb-4 text-sm">
              {section.description}
            </p>

            <ul className="space-y-2">
              {section.topics.map((topic) => (
                <li key={topic} className="text-[#94A3B8] text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#00F0D9]"></div>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mt-12">
        <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/api-keys"
            className="flex items-center gap-3 p-4 rounded-lg border border-[#334155] hover:border-[#00F0D9] transition-colors group"
          >
            <Code className="w-5 h-5 text-[#00F0D9]" />
            <div>
              <div className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">API Documentation</div>
              <div className="text-[#94A3B8] text-sm">Full API reference and examples</div>
            </div>
          </Link>

          <Link
            href="/examples"
            className="flex items-center gap-3 p-4 rounded-lg border border-[#334155] hover:border-[#00F0D9] transition-colors group"
          >
            <Video className="w-5 h-5 text-[#00F0D9]" />
            <div>
              <div className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">Video Tutorials</div>
              <div className="text-[#94A3B8] text-sm">Step-by-step video guides</div>
            </div>
          </Link>

          <Link
            href="/changelog"
            className="flex items-center gap-3 p-4 rounded-lg border border-[#334155] hover:border-[#00F0D9] transition-colors group"
          >
            <Book className="w-5 h-5 text-[#00F0D9]" />
            <div>
              <div className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">Changelog</div>
              <div className="text-[#94A3B8] text-sm">Latest updates and features</div>
            </div>
          </Link>

          <Link
            href="/support"
            className="flex items-center gap-3 p-4 rounded-lg border border-[#334155] hover:border-[#00F0D9] transition-colors group"
          >
            <Wrench className="w-5 h-5 text-[#00F0D9]" />
            <div>
              <div className="text-[#F1F5F9] group-hover:text-[#00F0D9] transition-colors">Support Center</div>
              <div className="text-[#94A3B8] text-sm">Get help from our team</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
