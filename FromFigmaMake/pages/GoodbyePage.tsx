import { CheckCircle, Heart, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function GoodbyePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-[#F1F5F9] mb-3">Account Deleted</h1>
          <p className="text-[#94A3B8] text-xl">
            We're sad to see you go
          </p>
        </div>

        {/* What Happened */}
        <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
          <h2 className="text-[#F1F5F9] mb-4">What happened:</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[#94A3B8]">Your account has been permanently deleted</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[#94A3B8]">All personal data has been removed</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[#94A3B8]">Active subscriptions have been cancelled</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[#94A3B8]">Generated videos and jobs have been deleted</span>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-[#00F0D9]/5 border border-[#00F0D9]/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-[#00F0D9]" />
            <h3 className="text-[#F1F5F9]">Thank you for trying NuuMee.AI</h3>
          </div>
          <p className="text-[#94A3B8] mb-6">
            Your feedback helps us improve. We've taken note of your comments and will work on making NuuMee.AI better.
          </p>
          
          <div className="space-y-3">
            <p className="text-[#94A3B8] text-sm">
              Changed your mind? You can always create a new account.
            </p>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                Create New Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-[#94A3B8]" />
            <p className="text-[#94A3B8]">
              Questions? Contact us at <a href="mailto:support@nuumee.ai" className="text-[#00F0D9] hover:underline">support@nuumee.ai</a>
            </p>
          </div>
        </div>

        {/* Return Home */}
        <div className="mt-8">
          <Link to="/">
            <Button variant="link" className="text-[#94A3B8] hover:text-[#F1F5F9]">
              ← Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
