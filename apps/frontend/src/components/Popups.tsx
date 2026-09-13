import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { LeadsApi } from '../lib/api.js';

export default function Popups() {
  const [popupType, setPopupType] = useState<'newsletter' | 'exit' | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenMarketingPopup');
    if (hasSeenPopup) return;

    // Trigger newsletter popup after 5 seconds
    const timer = setTimeout(() => {
      setPopupType('newsletter');
    }, 5000);

    // Trigger exit intent when mouse leaves the top of the window
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setPopupType((current) => {
          if (!current && !localStorage.getItem('hasSeenMarketingPopup')) {
            return 'exit';
          }
          return current;
        });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const closePopup = () => {
    setPopupType(null);
    localStorage.setItem('hasSeenMarketingPopup', 'true'); // Prevent showing again for this session/forever
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await LeadsApi.submitNewsletter({ name: name.trim() || 'Anonymous', email: email.trim() });
      toast.success(popupType === 'exit' ? "Check your inbox for your exclusive offer!" : "Welcome to the Eyelight newsletter!");
      closePopup();
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {popupType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-10"
          >
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-20 bg-background/50 backdrop-blur-md rounded-full p-1"
            >
              <X size={20} />
            </button>

            {popupType === 'newsletter' ? (
              <div className="p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-accent/10 -z-10" />
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                  <Mail size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-3">Join the Insider Circle</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Get exclusive publishing tips, industry secrets, and early access to our webinars directly in your inbox.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-xl shadow-lg hover:shadow-accent/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Subscribe Now'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center relative overflow-hidden bg-gradient-to-br from-card to-muted">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-3xl font-extrabold mb-2 text-foreground">Wait, don't go!</h2>
                <p className="text-accent font-semibold mb-4 text-sm tracking-widest uppercase">Get 10% Off Your Publishing Journey</p>
                <p className="text-muted-foreground text-sm mb-6">
                  Before you leave, drop your email below and we'll send you a secret discount code and a free guide on how to become a bestselling author.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-foreground text-background font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-70"
                  >
                    {submitting ? 'Sending...' : 'Claim My Free Guide & Discount'}
                  </button>
                </form>
                <button
                  onClick={closePopup}
                  className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  No thanks, I don't want to succeed as an author right now.
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
