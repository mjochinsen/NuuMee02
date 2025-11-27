import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function PaymentCancelledPage() {
  return (
    <main className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center">
        {/* Warning Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-amber-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#F1F5F9] mb-4">Payment Cancelled</h1>

        {/* Subheading */}
        <div className="mb-12">
          <p className="text-[#94A3B8] text-lg mb-2">Your payment was not completed.</p>
          <p className="text-[#94A3B8]">No charges have been made to your account.</p>
        </div>

        {/* Primary CTA */}
        <Link to="/price">
          <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-12 py-6 text-lg mb-6">
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        </Link>

        {/* Secondary Links */}
        <div className="flex justify-center gap-6 mb-12">
          <Link to="/price" className="text-[#00F0D9] hover:underline">
            Back to Pricing
          </Link>
          <Link to="/support" className="text-[#00F0D9] hover:underline">
            Contact Support
          </Link>
        </div>

        {/* Help Card */}
        <Card className="max-w-md mx-auto border-[#334155] bg-[#0F172A] p-8">
          <h2 className="text-[#F1F5F9] text-xl mb-4">Need help?</h2>
          <p className="text-[#94A3B8] mb-6">
            If you're having trouble with payment, our support team can help.
          </p>
          <Link to="/support">
            <Button
              variant="outline"
              className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
