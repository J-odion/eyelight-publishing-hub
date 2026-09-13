import React, { useState } from 'react';
import { AuthorApi } from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubmitManuscript() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bookTitle: '',
    genre: '',
    wordCount: '',
    bookDescription: '',
    passwordPlain: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 1: Submit Manuscript Data
      await AuthorApi.submitManuscriptData(formData);
      
      // Step 2: Automatically finalize the account with the provided password
      await AuthorApi.finalizeAccount({ email: formData.email, passwordPlain: formData.passwordPlain });
      
      toast.success('Account created successfully! Redirecting to your portal...', { duration: 3000 });
      
      // Redirect to login or portal
      setTimeout(() => {
        window.location.href = '/portal';
      }, 1500);
    } catch (error) {
      toast.error('Failed to submit manuscript data or create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors";

  return (
    <div className="min-h-screen bg-muted/30 py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Start Your <span className="text-accent">Publishing Journey</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tell us about your book and create your author account in one simple step to get started.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card border border-border rounded-3xl shadow-sm p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Section: Author Details */}
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-5 border-b border-border/50 pb-3">
                <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">1</span>
                Author Details & Account
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Full Name <span className="text-accent">*</span></label>
                  <input name="name" required value={formData.name} onChange={handleInputChange} className={inputClasses} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email Address <span className="text-accent">*</span></label>
                  <input name="email" type="email" required value={formData.email} onChange={handleInputChange} className={inputClasses} placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Phone Number <span className="text-accent">*</span></label>
                  <input name="phone" required value={formData.phone} onChange={handleInputChange} className={inputClasses} placeholder="+1234567890" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Create Password <span className="text-accent">*</span></label>
                  <input name="passwordPlain" type="password" required value={formData.passwordPlain} onChange={handleInputChange} className={inputClasses} placeholder="••••••••" minLength={6} />
                  <p className="text-xs text-muted-foreground mt-1">You will use this to log into your Author Portal.</p>
                </div>
              </div>
            </div>

            {/* Section: Manuscript Details */}
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-5 border-b border-border/50 pb-3">
                <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">2</span>
                Manuscript Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">Book Title <span className="text-accent">*</span></label>
                  <input name="bookTitle" required value={formData.bookTitle} onChange={handleInputChange} className={inputClasses} placeholder="The Great Story" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Genre <span className="text-accent">*</span></label>
                  <input name="genre" required value={formData.genre} onChange={handleInputChange} className={inputClasses} placeholder="E.g. Business, Fiction, Memoir" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Word Count <span className="text-accent">*</span></label>
                  <input name="wordCount" type="number" required value={formData.wordCount} onChange={handleInputChange} className={inputClasses} placeholder="E.g. 50000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Brief Book Description <span className="text-accent">*</span></label>
                <textarea name="bookDescription" required value={formData.bookDescription} onChange={handleInputChange} className={`${inputClasses} min-h-[120px] resize-none`} placeholder="What is your book about? What is the core message?" />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (
                  <>Submit Manuscript & Create Account <BookOpen size={18} /></>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
