import React, { useState, useEffect } from 'react';
import {
  FormsStore,
  CustomForm,
  FormField,
  FormSubmission,
} from '@/lib/formsStore';
import { toast } from 'sonner';
import {
  Plus,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  CheckCircle,
  Eye,
  Lock,
  ArrowUp,
  ArrowDown,
  X,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function CrmForms() {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedFormForSubs, setSelectedFormForSubs] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Builder Modal State
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);

  // Submissions Detail Modal
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const reloadData = () => {
    const f = FormsStore.getForms();
    setForms(f);
    setSubmissions(FormsStore.getSubmissions());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/forms/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success(`Copied shareable link: /forms/${slug}`);
  };

  const handleOpenBuilder = (form?: CustomForm) => {
    if (form) {
      setEditingForm(JSON.parse(JSON.stringify(form)));
    } else {
      setEditingForm({
        id: 'form_' + Date.now(),
        slug: 'custom-form-' + Math.floor(Math.random() * 1000),
        title: 'Untitled Form',
        description: 'Provide information or guidance for your project.',
        requiresPaymentConfirmation: false,
        createdAt: new Date().toISOString(),
        fields: [
          {
            id: 'q_' + Date.now(),
            label: 'Untitled Question',
            type: 'text',
            required: false,
            placeholder: 'Your answer...',
          },
        ],
      });
    }
    setShowBuilder(true);
  };

  const handleSaveBuilder = () => {
    if (!editingForm) return;
    if (!editingForm.title.trim()) {
      toast.error('Form must have a title.');
      return;
    }
    if (!editingForm.slug.trim()) {
      toast.error('Form must have a slug for its URL.');
      return;
    }
    FormsStore.saveForm(editingForm);
    toast.success('Form saved successfully!');
    setShowBuilder(false);
    setEditingForm(null);
    reloadData();
  };

  const handleDeleteForm = (id: string, title: string) => {
    if (id === 'eyelight-pre-consultation' || id === 'eyelight-client-review') {
      toast.error('Default system forms cannot be deleted, but you can edit them.');
      return;
    }
    if (confirm(`Are you sure you want to delete form "${title}"?`)) {
      FormsStore.deleteForm(id);
      toast.success('Form deleted.');
      reloadData();
    }
  };

  const addQuestion = () => {
    if (!editingForm) return;
    const newField: FormField = {
      id: 'q_' + Date.now(),
      label: 'New Question',
      type: 'text',
      required: false,
      placeholder: 'Your answer...',
    };
    setEditingForm({
      ...editingForm,
      fields: [...editingForm.fields, newField],
    });
  };

  const updateQuestion = (index: number, updates: Partial<FormField>) => {
    if (!editingForm) return;
    const fields = [...editingForm.fields];
    fields[index] = { ...fields[index], ...updates };
    setEditingForm({ ...editingForm, fields });
  };

  const deleteQuestion = (index: number) => {
    if (!editingForm) return;
    const fields = editingForm.fields.filter((_, i) => i !== index);
    setEditingForm({ ...editingForm, fields });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!editingForm) return;
    const fields = [...editingForm.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const temp = fields[index];
    fields[index] = fields[targetIndex];
    fields[targetIndex] = temp;
    setEditingForm({ ...editingForm, fields });
  };

  const addOptionToQuestion = (qIndex: number) => {
    if (!editingForm) return;
    const fields = [...editingForm.fields];
    const currentOptions = fields[qIndex].options || [];
    fields[qIndex].options = [...currentOptions, `Option ${currentOptions.length + 1}`];
    setEditingForm({ ...editingForm, fields });
  };

  const updateOptionInQuestion = (qIndex: number, optIndex: number, val: string) => {
    if (!editingForm) return;
    const fields = [...editingForm.fields];
    const options = [...(fields[qIndex].options || [])];
    options[optIndex] = val;
    fields[qIndex].options = options;
    setEditingForm({ ...editingForm, fields });
  };

  const removeOptionFromQuestion = (qIndex: number, optIndex: number) => {
    if (!editingForm) return;
    const fields = [...editingForm.fields];
    const options = (fields[qIndex].options || []).filter((_, i) => i !== optIndex);
    fields[qIndex].options = options;
    setEditingForm({ ...editingForm, fields });
  };

  // Filtered submissions
  const currentSubmissions = selectedFormForSubs
    ? submissions.filter((s) => s.formId === selectedFormForSubs)
    : submissions;

  const filteredSubs = currentSubmissions.filter(
    (s) =>
      (s.clientEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(s.answers).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111] flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" /> Form Center & Briefs
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create, share, and track Google-Forms-style questionnaires for author briefs, pre-consultations, and client reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenBuilder()}
            className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={16} /> Create New Form
          </button>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => {
          const formSubs = submissions.filter((s) => s.formId === form.id);
          const isPreConsult = form.slug === 'pre-consultation';
          const isReview = form.slug === 'review';

          return (
            <div
              key={form.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                      /forms/{form.slug}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{form.title}</h3>
                  </div>
                  {form.requiresPaymentConfirmation ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200 shrink-0">
                      <Lock size={12} /> Confirmed Clients
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200 shrink-0">
                      <CheckCircle size={12} /> Public
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                  {form.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 py-3 border-y border-gray-100 mb-4">
                  <div>
                    <span className="font-semibold text-gray-900">{form.fields.length}</span> questions
                  </div>
                  <div>•</div>
                  <div>
                    <span className="font-semibold text-gray-900">{formSubs.length}</span> submissions
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(form.slug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition-colors"
                  >
                    <Copy size={13} /> Copy Link
                  </button>
                  <a
                    href={`/forms/${form.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-semibold transition-colors"
                  >
                    <ExternalLink size={13} /> Preview
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFormForSubs(form.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md text-xs font-bold transition-colors"
                  >
                    <Eye size={13} /> Submissions ({formSubs.length})
                  </button>
                  <button
                    onClick={() => handleOpenBuilder(form)}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors"
                    title="Edit in Google Forms Builder"
                  >
                    <Edit2 size={15} />
                  </button>
                  {!isPreConsult && !isReview && (
                    <button
                      onClick={() => handleDeleteForm(form.id, form.title)}
                      className="p-1.5 hover:bg-rose-50 rounded text-gray-400 hover:text-rose-600 transition-colors"
                      title="Delete form"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submissions Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              {selectedFormForSubs
                ? `Submissions: ${forms.find((f) => f.id === selectedFormForSubs)?.title}`
                : 'All Client Submissions'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Responses submitted by authors and clients in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedFormForSubs && (
              <button
                onClick={() => setSelectedFormForSubs(null)}
                className="text-xs text-amber-600 font-semibold hover:underline"
              >
                Show All Forms
              </button>
            )}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {filteredSubs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No submissions found yet. Responses submitted by clients through public form links will appear here instantly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client / Book</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Form</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubs.map((sub) => {
                  const form = forms.find((f) => f.id === sub.formId);
                  const dateStr = new Date(sub.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{dateStr}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {sub.clientName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono">{sub.clientEmail || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-medium">
                          {form?.title || 'Form'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                        {Object.values(sub.answers).slice(0, 2).join(' · ')}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] transition-colors mr-2"
                        >
                          View Full Response
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this submission?')) {
                              FormsStore.deleteSubmission(sub.id);
                              reloadData();
                              toast.success('Submission deleted.');
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Google Forms Builder Modal ────────────────────────────────────────────── */}
      {showBuilder && editingForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F0F4F8] text-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-300 my-8 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900 text-base">Google Forms Style Form Builder</h3>
              </div>
              <button
                onClick={() => setShowBuilder(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Form Metadata Card */}
              <div className="bg-white rounded-xl border-t-4 border-t-amber-500 border-x border-b border-gray-200 p-6 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Form Title
                  </label>
                  <input
                    type="text"
                    value={editingForm.title}
                    onChange={(e) => setEditingForm({ ...editingForm, title: e.target.value })}
                    className="w-full text-xl font-bold border-b border-gray-200 focus:border-amber-500 py-1.5 outline-none"
                    placeholder="Form Title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Description / Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={editingForm.description}
                    onChange={(e) => setEditingForm({ ...editingForm, description: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Instructions for the user..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Shareable URL Slug
                    </label>
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200">
                      <span>/forms/</span>
                      <input
                        type="text"
                        value={editingForm.slug}
                        onChange={(e) =>
                          setEditingForm({
                            ...editingForm,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                          })
                        }
                        className="bg-transparent font-semibold text-gray-800 outline-none flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={editingForm.requiresPaymentConfirmation}
                        onChange={(e) =>
                          setEditingForm({
                            ...editingForm,
                            requiresPaymentConfirmation: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-gray-300"
                      />
                      <span>Require Confirmed Payment (Review Gate)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {editingForm.fields.map((field, qIdx) => (
                  <div
                    key={field.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateQuestion(qIdx, { label: e.target.value })}
                        className="flex-1 font-semibold text-sm border-b border-gray-200 focus:border-amber-500 py-1 outline-none text-gray-900"
                        placeholder="Question title"
                      />

                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateQuestion(qIdx, {
                            type: e.target.value as any,
                            options:
                              e.target.value === 'checkboxes' || e.target.value === 'radio'
                                ? field.options || ['Option 1', 'Option 2']
                                : undefined,
                          })
                        }
                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 outline-none"
                      >
                        <option value="text">Short answer</option>
                        <option value="paragraph">Paragraph</option>
                        <option value="email">Email address</option>
                        <option value="checkboxes">Checkboxes</option>
                        <option value="radio">Multiple choice</option>
                        <option value="rating">1-5 Rating</option>
                      </select>
                    </div>

                    {/* Options for Checkboxes or Radio */}
                    {(field.type === 'checkboxes' || field.type === 'radio') && (
                      <div className="pl-2 space-y-2 pt-2 border-l-2 border-amber-300">
                        {(field.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-gray-300 shrink-0" />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOptionInQuestion(qIdx, optIdx, e.target.value)}
                              className="text-xs border-b border-gray-200 focus:border-amber-500 py-0.5 outline-none flex-1 text-gray-700"
                            />
                            {(field.options?.length || 0) > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOptionFromQuestion(qIdx, optIdx)}
                                className="text-gray-400 hover:text-rose-500 p-1"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOptionToQuestion(qIdx)}
                          className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 pt-1"
                        >
                          <Plus size={12} /> Add option
                        </button>
                      </div>
                    )}

                    {/* Question Card Footer Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={qIdx === 0}
                          onClick={() => moveQuestion(qIdx, 'up')}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={qIdx === editingForm.fields.length - 1}
                          onClick={() => moveQuestion(qIdx, 'down')}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                          <span>Required</span>
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateQuestion(qIdx, { required: e.target.checked })}
                            className="w-3.5 h-3.5 rounded text-amber-500 border-gray-300"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(qIdx)}
                          className="text-gray-400 hover:text-rose-500 p-1"
                          title="Delete question"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Question Button */}
              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-xl text-xs font-bold text-gray-600 hover:text-amber-600 flex items-center justify-center gap-2 transition-colors bg-white/70"
              >
                <Plus size={15} /> Add Question
              </button>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBuilder}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow"
              >
                Save Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detailed Submission Modal ────────────────────────────────────────────── */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Submission Details</h3>
                <p className="text-xs text-gray-500">
                  From: {selectedSubmission.clientName || 'Client'} ({selectedSubmission.clientEmail}) ·{' '}
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {Object.entries(selectedSubmission.answers).map(([key, val]) => (
                <div key={key} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap font-medium">
                    {Array.isArray(val) ? val.join(', ') : String(val)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 px-6 py-3 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
