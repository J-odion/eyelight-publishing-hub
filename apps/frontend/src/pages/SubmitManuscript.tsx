import React, { useState } from 'react';
import { AuthorApi } from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function SubmitManuscript() {
  const [step, setStep] = useState(1);
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

  const handleDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthorApi.submitManuscriptData(formData);
      toast.success('Manuscript data submitted! Please finalize your account.');
      setStep(2);
    } catch (error) {
      toast.error('Failed to submit manuscript data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthorApi.finalizeAccount({ email: formData.email, passwordPlain: formData.passwordPlain });
      toast.success('Account finalized! You can now log in to the Author Portal.');
      // Redirect to login or portal
      window.location.href = '/portal';
    } catch (error) {
      toast.error('Failed to finalize account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-card border rounded-xl shadow-sm">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Submit Your Manuscript</h1>
      
      {step === 1 && (
        <form onSubmit={handleDataSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input name="name" required value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" required value={formData.email} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input name="phone" required value={formData.phone} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Book Title</label>
            <Input name="bookTitle" required value={formData.bookTitle} onChange={handleInputChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Genre</label>
              <Input name="genre" required value={formData.genre} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Word Count</label>
              <Input name="wordCount" type="number" required value={formData.wordCount} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Book Description</label>
            <Textarea name="bookDescription" required value={formData.bookDescription} onChange={handleInputChange} className="min-h-[100px]" />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Manuscript Data'}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleAccountFinalize} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Almost there!</h3>
            <p className="text-sm text-muted-foreground">Please create a password for your Author Portal account. You will use this to track your manuscript's progress.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email (Fixed)</label>
            <Input name="email" value={formData.email} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Create Password</label>
            <Input name="passwordPlain" type="password" required value={formData.passwordPlain} onChange={handleInputChange} />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Finalizing...' : 'Finalize Account & View Dashboard'}
          </Button>
        </form>
      )}
    </div>
  );
}
