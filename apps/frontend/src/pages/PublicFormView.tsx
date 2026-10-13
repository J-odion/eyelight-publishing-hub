import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { FormsStore, CustomForm } from '@/lib/formsStore';
import { toast } from 'sonner';
import { CheckCircle2, ArrowLeft, Star, Lock, ShieldCheck, Send } from 'lucide-react';
import logo from '@/assets/logo.jpeg';

export default function PublicFormView({ defaultSlug }: { defaultSlug?: string }) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const slug = defaultSlug || paramSlug || 'pre-consultation';

  const [form, setForm] = useState<CustomForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [clientEmail, setClientEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyEmailInput, setVerifyEmailInput] = useState('');

  useEffect(() => {
    const loaded = FormsStore.getFormBySlug(slug);
    if (loaded) {
      setForm(loaded);
      // Check payment confirmation bypass
      const isConfirmedParam = searchParams.get('confirmed') === 'true';
      const storedConfirmation = localStorage.getItem('eyelight_confirmed_payment');
      if (!loaded.requiresPaymentConfirmation || isConfirmedParam || storedConfirmation) {
        setIsVerified(true);
      }
    }
  }, [slug, searchParams]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmailInput.trim() || !verifyEmailInput.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    // Grant verification
    setIsVerified(true);
    setClientEmail(verifyEmailInput);
    setAnswers((prev) => ({ ...prev, email: verifyEmailInput, author_email: verifyEmailInput }));
    localStorage.setItem('eyelight_confirmed_payment', verifyEmailInput);
    toast.success('Client verified successfully.');
  };

  const handleAnswerChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    if (fieldId === 'email' || fieldId === 'author_email') {
      setClientEmail(val);
    }
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const current: string[] = answers[fieldId] || [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswers((prev) => ({ ...prev, [fieldId]: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validation
    for (const field of form.fields) {
      if (field.required) {
        const val = answers[field.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          toast.error(`Please answer: "${field.label}"`);
          return;
        }
      }
    }

    // Save
    FormsStore.submitForm({
      formId: form.id,
      clientEmail: clientEmail || answers['email'] || answers['author_email'] || 'Anonymous',
      clientName: answers['author_name'] || answers['name'] || answers['working_title'] || 'Client',
      answers,
    });

    setSubmitted(true);
    toast.success('Your response has been recorded successfully!');
  };

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Form Not Found</h2>
        <p className="text-slate-400 mb-6">The form you are looking for does not exist or may have been retired.</p>
        <Link to="/" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors">
          Return to Eyelight Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Navigation / Header Brand */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={14} /> Back to Website
          </Link>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Eyelight Publishing" className="h-7 w-7 rounded object-cover" />
            <span className="text-xs uppercase tracking-widest font-bold text-slate-700">Eyelight Publishing</span>
          </div>
        </div>

        {/* Payment Confirmation Lock Gate */}
        {form.requiresPaymentConfirmation && !isVerified ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={26} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirmed Clients Only</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              This review form is reserved for authors who have confirmed their payments with Eyelight Publishing. Please enter the email address used for your booking or project.
            </p>
            <form onSubmit={handleVerify} className="max-w-sm mx-auto space-y-4">
              <input
                type="email"
                required
                placeholder="Enter your payment email..."
                value={verifyEmailInput}
                onChange={(e) => setVerifyEmailInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> Verify & Access Form
              </button>
            </form>
          </div>
        ) : submitted ? (
          /* Submission Success Card */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">Response Recorded</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
              Thank you for taking the time to share these details. Your responses have been forwarded directly to our Chief Editor and publishing team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Back to Home
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Submit Another Response
              </button>
            </div>
          </div>
        ) : (
          /* The Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Form Banner Card */}
            <div className="bg-white rounded-2xl border-t-8 border-t-amber-500 border-x border-b border-slate-200 p-8 shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-3">{form.title}</h1>
              <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed mb-4">
                {form.description}
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>* Indicates required question</span>
                {form.requiresPaymentConfirmation && (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <ShieldCheck size={14} /> Verified Client Form
                  </span>
                )}
              </div>
            </div>

            {/* Questions Cards */}
            {form.fields.map((field, idx) => (
              <div
                key={field.id}
                className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:border-slate-300 transition-colors"
              >
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  {idx + 1}. {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-xs text-slate-500 mb-3">{field.helpText}</p>
                )}

                {/* Field Inputs */}
                <div className="mt-3">
                  {field.type === 'text' && (
                    <input
                      type="text"
                      required={field.required}
                      placeholder={field.placeholder || 'Your answer'}
                      value={answers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      className="w-full border-b-2 border-slate-200 focus:border-amber-500 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent transition-colors"
                    />
                  )}

                  {field.type === 'email' && (
                    <input
                      type="email"
                      required={field.required}
                      placeholder={field.placeholder || 'your.email@example.com'}
                      value={answers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      className="w-full border-b-2 border-slate-200 focus:border-amber-500 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent transition-colors"
                    />
                  )}

                  {field.type === 'paragraph' && (
                    <textarea
                      rows={4}
                      required={field.required}
                      placeholder={field.placeholder || 'Your answer'}
                      value={answers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-slate-50/50 transition-all resize-y"
                    />
                  )}

                  {field.type === 'rating' && (
                    <div className="flex items-center gap-3 py-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const current = answers[field.id] || 0;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => handleAnswerChange(field.id, star)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              size={28}
                              className={
                                star <= current
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 hover:text-amber-300'
                              }
                            />
                          </button>
                        );
                      })}
                      {answers[field.id] ? (
                        <span className="text-xs font-bold text-amber-600 ml-2">
                          {answers[field.id]} of 5 Stars
                        </span>
                      ) : null}
                    </div>
                  )}

                  {field.type === 'checkboxes' && field.options && (
                    <div className="space-y-2.5">
                      {field.options.map((option) => {
                        const isChecked = (answers[field.id] || []).includes(option);
                        return (
                          <label
                            key={option}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-amber-50/60 border-amber-300 text-slate-900 font-medium'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxToggle(field.id, option)}
                              className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                            />
                            <span className="leading-snug">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {field.type === 'radio' && field.options && (
                    <div className="space-y-2.5">
                      {field.options.map((option) => {
                        const isSelected = answers[field.id] === option;
                        return (
                          <label
                            key={option}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-50/60 border-amber-300 text-slate-900 font-medium'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.id}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(field.id, option)}
                              className="w-4 h-4 mt-0.5 text-amber-500 focus:ring-amber-400 border-slate-300"
                            />
                            <span className="leading-snug">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="submit"
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Send size={16} /> Submit Form
              </button>
              <button
                type="button"
                onClick={() => setAnswers({})}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear form
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
