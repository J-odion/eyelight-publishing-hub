import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PaymentsApi } from '../lib/api.js';
import { useCartStore } from '../lib/useCartStore.js';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  Calendar,
  BookOpen,
  ShoppingBag,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '../assets/logo.jpeg';

interface PaymentDetails {
  reference: string;
  amount: number;
  customerEmail: string;
  customerName?: string;
  purpose: string;
  channel?: string;
  paidAt?: string;
  metadata?: Record<string, any>;
}

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);

  // Paystack returns 'reference' or 'trxref'
  const reference =
    searchParams.get('reference') ||
    searchParams.get('trxref') ||
    searchParams.get('ref');
  const typeParam = searchParams.get('type'); // 'booking', 'store', 'editor-school', 'portal'

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentData, setPaymentData] = useState<PaymentDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setErrorMessage('No payment reference found in the callback URL.');
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        const response = await PaymentsApi.verify(reference!);
        const resData = response.data;

        if (resData.success && isMounted) {
          const payment = resData.payment;
          setPaymentData({
            reference: payment.reference || reference!,
            amount: payment.amount || 0,
            customerEmail: payment.customerEmail || searchParams.get('email') || '',
            customerName: payment.customerName || payment.metadata?.customerName || '',
            purpose: payment.purpose || 'Payment to Eyelight Publishing',
            channel: payment.channel || 'Paystack',
            paidAt: payment.paidAt || new Date().toISOString(),
            metadata: payment.metadata || {},
          });

          // Mark payment confirmation in localStorage
          if (payment.customerEmail) {
            localStorage.setItem('eyelight_confirmed_payment', payment.customerEmail);
          }

          // If cart purchase, clear the store cart
          if (
            typeParam === 'store' ||
            payment.metadata?.type === 'store' ||
            payment.purpose?.toLowerCase().includes('store')
          ) {
            clearCart();
          }

          setStatus('success');
        } else if (isMounted) {
          setStatus('failed');
          setErrorMessage(
            resData.message || 'Payment verification could not be completed by Paystack.',
          );
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Verification error:', err);
          // If server failed or mock fallback, check if it's a test run
          if (searchParams.get('mock') === 'true') {
            setStatus('success');
            setPaymentData({
              reference: reference!,
              amount: 35000,
              customerEmail: 'customer@example.com',
              customerName: 'Valued Client',
              purpose: 'Mock Verified Transaction',
              channel: 'Paystack Test',
              paidAt: new Date().toISOString(),
            });
          } else {
            setStatus('failed');
            setErrorMessage(
              err?.response?.data?.message ||
                err.message ||
                'Unable to reach payment verification servers. Please check your transaction.',
            );
          }
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [reference, typeParam, clearCart, searchParams]);

  const copyReference = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine context type from URL or metadata
  const detectedType =
    typeParam ||
    paymentData?.metadata?.type ||
    (paymentData?.purpose?.toLowerCase().includes('consultation')
      ? 'booking'
      : paymentData?.purpose?.toLowerCase().includes('editor')
        ? 'editor-school'
        : paymentData?.purpose?.toLowerCase().includes('store')
          ? 'store'
          : 'general');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Eyelight Publishing" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Paystack Gateway
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-xl w-full">
          {status === 'loading' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xl space-y-6 animate-in fade-in-50 duration-300">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 relative">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Verifying Your Payment
                </h1>
                <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                  We are securely confirming your transaction with Paystack. Please do not refresh or close this window.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 font-mono text-xs rounded-full">
                  Reference: {reference || 'Querying...'}
                </span>
              </div>
            </div>
          )}

          {status === 'success' && paymentData && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              {/* Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8 text-center relative">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-lg">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">Payment Confirmed!</h1>
                <p className="text-emerald-100 text-sm">
                  Your transaction has been securely processed by Paystack.
                </p>
                <div className="mt-4 inline-block bg-white/20 backdrop-blur-md px-5 py-2 rounded-full font-mono text-lg font-bold tracking-tight">
                  ₦{paymentData.amount.toLocaleString()}
                </div>
              </div>

              {/* Receipt Details */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3.5 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Payment Reference</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-slate-800 text-xs sm:text-sm">
                        {paymentData.reference}
                      </span>
                      <button
                        onClick={copyReference}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                        title="Copy reference"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Purpose</span>
                    <span className="text-slate-900 font-semibold text-right max-w-[240px] truncate">
                      {paymentData.purpose}
                    </span>
                  </div>

                  {paymentData.customerName && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Payer Name</span>
                      <span className="text-slate-900 font-semibold">
                        {paymentData.customerName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Customer Email</span>
                    <span className="text-slate-900 font-mono text-xs sm:text-sm">
                      {paymentData.customerEmail}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Channel</span>
                    <span className="text-slate-900 capitalize font-medium">
                      {paymentData.channel || 'Paystack Direct'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <span>Date & Time</span>
                    <span>
                      {new Date(paymentData.paidAt || Date.now()).toLocaleString('en-NG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* Context-aware Action CTAs */}
                <div className="space-y-3 pt-2">
                  {detectedType === 'booking' && (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs sm:text-sm leading-relaxed">
                        <strong className="font-semibold block mb-1">Next Step: Pre-Consultation Brief</strong>
                        Your consultation appointment is locked in. Please complete the quick pre-consultation brief so our Chief Editor can review your book details before the session.
                      </div>
                      <Button
                        onClick={() => navigate('/pre-consultation-form')}
                        className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-slate-900 font-bold h-12 rounded-xl text-base shadow-md"
                      >
                        Fill Pre-Consultation Brief <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  )}

                  {detectedType === 'store' && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 text-xs sm:text-sm leading-relaxed">
                        <strong className="font-semibold block mb-1">Order Placed Successfully!</strong>
                        A receipt and fulfillment confirmation have been sent to your email. Your physical books will be dispatched according to the shipping schedule.
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => navigate('/store')}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium h-12 rounded-xl"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" /> Back to Store
                        </Button>
                        <Button
                          onClick={() => window.print()}
                          variant="outline"
                          className="flex-1 border-slate-300 h-12 rounded-xl"
                        >
                          <Download className="w-4 h-4 mr-2" /> Print Receipt
                        </Button>
                      </div>
                    </div>
                  )}

                  {detectedType === 'editor-school' && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-950 text-sm leading-relaxed">
                        <strong className="font-semibold block text-base mb-1 text-emerald-900">🎉 Enrollment Confirmed!</strong>
                        Your seat at The Book Editor Business School is officially secured. Your full registration receipt and cohort syllabus details have been sent to <span className="font-semibold font-mono text-xs">{paymentData.customerEmail}</span>.
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => navigate('/editor-school')}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium h-12 rounded-xl"
                        >
                          <BookOpen className="w-4 h-4 mr-2" /> Back to Editor School
                        </Button>
                        <Button
                          onClick={() => window.print()}
                          variant="outline"
                          className="flex-1 border-slate-300 h-12 rounded-xl"
                        >
                          <Download className="w-4 h-4 mr-2" /> Print Official Receipt
                        </Button>
                      </div>
                    </div>
                  )}

                  {detectedType === 'general' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium h-12 rounded-xl"
                      >
                        Return to Homepage
                      </Button>
                      <Button
                        onClick={() => navigate('/portal')}
                        variant="outline"
                        className="flex-1 border-slate-300 h-12 rounded-xl"
                      >
                        Author Portal
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-white rounded-3xl border border-red-100 p-8 sm:p-10 text-center shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <XCircle className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Payment Unconfirmed
                </h1>
                <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                  {errorMessage ||
                    'We were unable to confirm this transaction with Paystack. Your card may not have been charged.'}
                </p>
                {reference && (
                  <p className="mt-3 text-xs font-mono text-slate-400">
                    Ref: {reference}
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-12 rounded-xl"
                >
                  Retry Verification
                </Button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="flex-1 border-slate-300 h-11 rounded-xl text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Go Back
                  </Button>
                  <a
                    href={`https://wa.me/2348146682688?text=${encodeURIComponent(
                      `Hello Eyelight Support, I experienced an issue verifying my Paystack transaction. Reference: ${reference || 'N/A'}. Please assist me.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 h-11 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
