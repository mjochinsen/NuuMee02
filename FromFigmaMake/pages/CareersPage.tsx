import { useState } from 'react';
import { Briefcase, MapPin, Clock, Users, Heart, Zap, Globe, TrendingUp, Coffee, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const jobListings: JobListing[] = [
    {
      id: '1',
      title: 'Senior Machine Learning Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build and optimize AI models for character replacement and video generation.',
    },
    {
      id: '2',
      title: 'Product Designer',
      department: 'Design',
      location: 'San Francisco / Remote',
      type: 'Full-time',
      description: 'Design intuitive interfaces for our AI video generation platform.',
    },
    {
      id: '3',
      title: 'Frontend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create responsive, performant web applications with React and TypeScript.',
    },
    {
      id: '4',
      title: 'Developer Advocate',
      department: 'Developer Relations',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build relationships with developers and create educational content.',
    },
    {
      id: '5',
      title: 'Sales Engineer',
      department: 'Sales',
      location: 'New York / Remote',
      type: 'Full-time',
      description: 'Help enterprise customers integrate NuuMee.AI into their workflows.',
    },
    {
      id: '6',
      title: 'Data Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build scalable data pipelines for training and inference.',
    },
  ];

  const departments = ['all', 'Engineering', 'Design', 'Developer Relations', 'Sales'];

  const filteredJobs = selectedDepartment === 'all' 
    ? jobListings 
    : jobListings.filter(job => job.department === selectedDepartment);

  const benefits = [
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive medical, dental, and vision coverage' },
    { icon: Globe, title: 'Remote First', description: 'Work from anywhere in the world' },
    { icon: TrendingUp, title: 'Equity', description: 'Competitive equity package for all employees' },
    { icon: Coffee, title: 'Flexible Schedule', description: 'Choose your own hours and work-life balance' },
    { icon: Zap, title: 'Learning Budget', description: '$2,000/year for courses, conferences, and books' },
    { icon: Sparkles, title: 'Latest Tech', description: 'Top-tier equipment and tools' },
  ];

  return (
    <main className="min-h-screen bg-[#0A0F1E]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#334155]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F0D9]/5 to-[#3B1FE2]/5"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/20 mb-6">
              <Briefcase className="w-4 h-4 text-[#00F0D9]" />
              <span className="text-[#00F0D9]">Join Our Team</span>
            </div>
            <h1 className="text-[#F1F5F9] mb-6">
              Build the Future of AI Video Generation
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              We're a team of innovators, creators, and engineers building cutting-edge AI technology 
              that empowers creators worldwide. Join us in shaping the future of video content creation.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[#334155]">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '50+', label: 'Team Members' },
              { value: '15', label: 'Countries' },
              { value: '$20M', label: 'Series A Funding' },
              { value: '100K+', label: 'Active Users' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-[#94A3B8] text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-[#334155]">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-[#F1F5F9] mb-4">Why Join NuuMee.AI?</h2>
              <p className="text-[#94A3B8] max-w-2xl mx-auto">
                We believe in taking care of our team so they can do their best work.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] hover:border-[#00F0D9]/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/10 to-[#3B1FE2]/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#00F0D9]" />
                    </div>
                    <h3 className="text-[#F1F5F9] mb-2">{benefit.title}</h3>
                    <p className="text-[#94A3B8] text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[#F1F5F9] mb-4">Open Positions</h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto">
              Explore opportunities to join our team and make an impact.
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  selectedDepartment === dept
                    ? 'bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9] text-[#F1F5F9]'
                    : 'border border-[#334155] text-[#94A3B8] hover:border-[#00F0D9]/50 hover:text-[#F1F5F9]'
                }`}
              >
                {dept === 'all' ? 'All Positions' : dept}
              </button>
            ))}
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] hover:border-[#00F0D9]/50 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-[#F1F5F9]">{job.title}</h3>
                      <Badge className="bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 text-[#00F0D9] border-[#00F0D9]/20">
                        {job.department}
                      </Badge>
                    </div>
                    <p className="text-[#94A3B8] mb-3">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#94A3B8]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white shrink-0"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
              <p className="text-[#94A3B8]">
                No positions available in this department. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[#334155]">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#F1F5F9] mb-4">Don't see a perfect fit?</h2>
            <p className="text-[#94A3B8] mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals. Send us your resume and tell us how you'd like to contribute to NuuMee.AI.
            </p>
            <Button
              variant="outline"
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Send General Application
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
