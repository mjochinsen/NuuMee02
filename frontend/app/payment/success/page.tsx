'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Zap, Mail, Download, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getReceipt, ReceiptResponse, getCreditBalance } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const creditsParam = searchParams.get('credits');
  const { user } = useAuth();

  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!sessionId || !user) {
        setLoading(false);
        return;
      }

      try {
        const [receiptData, balanceData] = await Promise.all([
          getReceipt(sessionId),
          getCreditBalance()
        ]);
        setReceipt(receiptData);
        setCurrentBalance(balanceData.balance);
      } catch (err) {
        console.error('Failed to fetch receipt:', err);
        setError('Failed to load receipt details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sessionId, user]);

  const creditsAdded = receipt?.credits || parseInt(creditsParam || '0');

  const formatCurrency = (cents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleDownloadPdf = async () => {
    if (!receipt) return;

    // If Stripe provides a hosted receipt URL, use that
    if (receipt.receipt_url) {
      window.open(receipt.receipt_url, '_blank');
      return;
    }

    // Generate a simple PDF using browser's print functionality
    setDownloadingPdf(true);
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download the receipt');
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>NuuMee Receipt - ${receipt.transaction_id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #00F0D9; }
            .title { font-size: 20px; margin-top: 10px; }
            .section { margin: 20px 0; padding: 15px 0; border-top: 1px solid #eee; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { color: #666; }
            .value { font-weight: 500; }
            .total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 15px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">NuuMee</div>
            <div class="title">Payment Receipt</div>
          </div>

          <div class="section">
            <div class="row"><span class="label">Transaction ID:</span><span class="value">${receipt.transaction_id}</span></div>
            <div class="row"><span class="label">Date:</span><span class="value">${formatDate(receipt.created_at)}</span></div>
            <div class="row"><span class="label">Email:</span><span class="value">${receipt.customer_email}</span></div>
          </div>

          <div class="section">
            <div class="row"><span class="label">Package:</span><span class="value">${receipt.package_name}</span></div>
            <div class="row"><span class="label">Credits:</span><span class="value">${receipt.credits} credits</span></div>
            ${receipt.payment_method_last4 ? `<div class="row"><span class="label">Payment Method:</span><span class="value">${(receipt.payment_method_brand || 'Card').charAt(0).toUpperCase() + (receipt.payment_method_brand || 'Card').slice(1)} •••• ${receipt.payment_method_last4}</span></div>` : ''}
          </div>

          <div class="section total">
            <div class="row"><span class="label">Total Paid:</span><span class="value">${formatCurrency(receipt.amount_cents, receipt.currency)}</span></div>
          </div>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>NuuMee - AI Video Generation</p>
            <p>https://nuumee.ai</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleEmailReceipt = () => {
    if (receipt?.receipt_url) {
      // Open email client with receipt link
      const subject = encodeURIComponent(`NuuMee Receipt - ${receipt.transaction_id}`);
      const body = encodeURIComponent(`Here is your NuuMee receipt:\n\nTransaction ID: ${receipt.transaction_id}\nAmount: ${formatCurrency(receipt.amount_cents, receipt.currency)}\nCredits: ${receipt.credits}\n\nView full receipt: ${receipt.receipt_url}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-6 py-20 max-w-4xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00F0D9] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading receipt...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-4">Payment Successful!</h1>
        <p className="text-[#94A3B8] text-lg mb-12">{creditsAdded} credits added to your account</p>

        {/* Credit Balance Card */}
        <Card className="max-w-md mx-auto border-[#334155] bg-[#1E293B] p-8 mb-10">
          <p className="text-[#94A3B8] mb-4">Your Credit Balance</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-[#00F0D9]" />
            <span className="text-[#00F0D9] text-5xl font-bold">
              {currentBalance !== null ? currentBalance : '---'}
            </span>
            <span className="text-[#94A3B8] text-xl">credits</span>
          </div>
          {currentBalance !== null && (
            <p className="text-[#94A3B8] text-sm">Added: +{creditsAdded} credits</p>
          )}
        </Card>

        {/* Primary CTA */}
        <Link href="/videos/create">
          <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-12 py-6 text-lg mb-6">
            Start Creating Videos<ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>

        {/* Secondary Links */}
        <div className="flex justify-center gap-6 mb-12">
          {receipt?.receipt_url && (
            <button
              onClick={handleEmailReceipt}
              className="text-[#00F0D9] hover:underline flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />Email Receipt
            </button>
          )}
          <Link href="/billing" className="text-[#00F0D9] hover:underline">Back to Dashboard</Link>
        </div>

        {/* Receipt Details */}
        <Card className="max-w-md mx-auto border-[#334155] bg-[#0F172A] p-6 text-left">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📄</span>
            <h2 className="text-[#F1F5F9] text-xl font-semibold">Receipt Details</h2>
          </div>
          <div className="h-px bg-[#334155] mb-4"></div>

          {error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : receipt ? (
            <div className="space-y-3 text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="text-[#F1F5F9]">{receipt.package_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Credits:</span>
                <span className="text-[#F1F5F9]">{receipt.credits} credits</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="text-[#F1F5F9]">{formatCurrency(receipt.amount_cents, receipt.currency)}</span>
              </div>
              {receipt.payment_method_last4 && (
                <div className="flex justify-between">
                  <span>Payment method:</span>
                  <span className="text-[#F1F5F9]">
                    {receipt.payment_method_brand?.charAt(0).toUpperCase()}{receipt.payment_method_brand?.slice(1)} •••• {receipt.payment_method_last4}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-[#F1F5F9]">{formatDate(receipt.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="text-[#F1F5F9] font-mono text-sm">{receipt.transaction_id.slice(0, 20)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Credits:</span>
                <span className="text-[#F1F5F9]">{creditsAdded} credits</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-[#F1F5F9]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <Button
              variant="outline"
              className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
              onClick={handleDownloadPdf}
              disabled={!receipt || downloadingPdf}
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {receipt?.receipt_url ? 'View Stripe Receipt' : 'Download PDF Receipt'}
            </Button>

            {receipt?.receipt_url && (
              <a
                href={receipt.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[#94A3B8] hover:text-[#00F0D9] text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                Open in Stripe
              </a>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#94A3B8]">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
