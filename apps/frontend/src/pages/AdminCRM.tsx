import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CrmApi, LeadsApi, ProjectsApi, AuthorsApi, EventsApi, PressApi } from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Users, Mail, BookOpen, CalendarDays, LayoutDashboard, Send,
  LogOut, Plus, ChevronDown, X, Check, RefreshCw, ExternalLink,
  Upload, Download, Search, Zap, Eye, Trash2, Edit2, UserPlus,
  List as ListIcon, AtSign, Tags
} from 'lucide-react';
import { format } from 'date-fns';
import Papa from 'papaparse';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TemplateEditor from '@/components/TemplateEditor';

const PROJECT_STATUSES = ['Received', 'Editing', 'Cover Design', 'Proofreading', 'Published'];
const PRESS_CATEGORIES = [
  'News', 'Author Spotlight', 'Release', 'Update',
  'Press Release', 'Author Photo', 'Book Cover',
  'Author Bio', 'Media Kit', 'Brand Asset', 'Interview Request'
];
const STATUS_COLORS: Record<string, string> = {
  Received: 'bg-gray-100 text-gray-700',
  Editing: 'bg-yellow-100 text-yellow-700',
  'Cover Design': 'bg-blue-100 text-blue-700',
  Proofreading: 'bg-purple-100 text-purple-700',
  Published: 'bg-green-100 text-green-700',
};

// ─── Email Center Tab ─────────────────────────────────────────────────────────

type SendMode = 'campaign' | 'direct';
type AudienceMode = 'tags' | 'list' | 'individuals';

function EmailTab() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableLists, setAvailableLists] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [sendMode, setSendMode] = useState<SendMode>('campaign');
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('tags');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Typed individual emails
  const [typedEmails, setTypedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');

  const [form, setForm] = useState({
    subject: '',
    content: '',
    builderData: null as any,
    audienceTags: [] as string[],
    audienceListIds: [] as string[],
    audienceContactIds: [] as string[],
    scheduledFor: '',
  });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [campRes, tagsRes, listsRes] = await Promise.all([
        CrmApi.getCampaigns(),
        CrmApi.getTags(),
        CrmApi.getLists(),
      ]);
      setCampaigns(campRes.data);
      setAvailableTags(tagsRes.data || []);
      setAvailableLists(listsRes.data || []);
    } catch { toast.error('Failed to load email data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Debounced contact search for individual mode
  useEffect(() => {
    if (audienceMode !== 'individuals') return;
    const timer = setTimeout(async () => {
      try {
        const res = await CrmApi.getContacts({ search: contactSearch || undefined, limit: 30 });
        setContacts(res.data.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [contactSearch, audienceMode]);

  const resetForm = () => {
    setForm({ subject: '', content: '', builderData: null, audienceTags: [], audienceListIds: [], audienceContactIds: [], scheduledFor: '' });
    setTypedEmails([]);
    setEmailInput('');
    setEditId(null);
    setSendMode('campaign');
    setAudienceMode('tags');
  };

  const handleAddTypedEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) return toast.error('Enter a valid email address');
    if (typedEmails.includes(email)) return;
    setTypedEmails(prev => [...prev, email]);
    setEmailInput('');
  };

  const handleSaveCampaign = async () => {
    if (!form.subject || !form.content) return toast.error('Subject and content are required');
    try {
      const payload = {
        ...form,
        scheduledFor: form.scheduledFor ? new Date(form.scheduledFor) : undefined,
      };
      if (editId) {
        await CrmApi.updateCampaign(editId, payload);
        toast.success('Campaign updated!');
      } else {
        await CrmApi.createCampaign(payload);
        toast.success('Campaign saved as draft!');
      }
      setShowCompose(false);
      resetForm();
      fetchAll();
    } catch { toast.error('Failed to save campaign'); }
  };

  const handleSendNow = async (id: string) => {
    if (!window.confirm('Send this campaign now?')) return;
    try {
      await CrmApi.sendNow(id);
      toast.success('Campaign queued for immediate sending!');
      fetchAll();
    } catch { toast.error('Failed to send campaign'); }
  };

  const handleSendDirect = async () => {
    if (!form.subject || !form.content) return toast.error('Subject and content are required');
    const recipients = [...typedEmails];
    if (audienceMode === 'individuals') {
      form.audienceContactIds.forEach(id => {
        const c = contacts.find(ct => ct._id === id);
        if (c) recipients.push(c.email);
      });
    }
    if (recipients.length === 0) return toast.error('Add at least one recipient');
    if (!window.confirm(`Send directly to ${recipients.length} recipient(s) now?`)) return;
    setIsSending(true);
    try {
      const res = await CrmApi.sendDirect({ to: recipients, subject: form.subject, html: form.content });
      toast.success(`Sent: ${res.data.sent}, Failed: ${res.data.failed}`);
      setShowCompose(false);
      resetForm();
    } catch { toast.error('Failed to send emails'); }
    finally { setIsSending(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await CrmApi.removeCampaign(id);
      toast.success('Campaign deleted');
      fetchAll();
    } catch { toast.error('Failed to delete campaign'); }
  };

  const handleEdit = (c: any) => {
    setForm({
      subject: c.subject,
      content: c.content,
      builderData: c.builderData || null,
      audienceTags: c.audienceTags || [],
      audienceListIds: (c.audienceListIds || []).map((id: any) => id._id || id),
      audienceContactIds: (c.audienceContactIds || []).map((id: any) => id._id || id),
      scheduledFor: c.scheduledFor ? new Date(c.scheduledFor).toISOString().slice(0, 16) : '',
    });
    setEditId(c._id);
    setSendMode('campaign');
    setShowCompose(true);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600',
      Scheduled: 'bg-blue-100 text-blue-700',
      Sending: 'bg-yellow-100 text-yellow-700',
      Sent: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Center</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Send campaigns, direct emails, and schedule broadcasts — from <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">services@eyelightpublishers.com</span>
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowCompose(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Compose Email
        </Button>
      </div>

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={(open) => { if (!open) { setShowCompose(false); resetForm(); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Campaign' : 'Compose Email'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Send Mode Selector */}
            {!editId && (
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <button
                  onClick={() => setSendMode('campaign')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${sendMode === 'campaign' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  📋 Campaign (Schedule / Draft)
                </button>
                <button
                  onClick={() => setSendMode('direct')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${sendMode === 'direct' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  ⚡ Direct Send (Immediate)
                </button>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Subject Line</label>
              <Input
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Welcome to Eyelight Publishing, {{firstName}}!"
              />
            </div>

            {/* Email Content */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Content</label>
              {form.content ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-700 flex-1">Template ready ({form.content.length} chars)</span>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>Preview</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>Edit</Button>
                </div>
              ) : (
                <div className="border rounded-lg p-6 bg-muted/30 flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">Design your email with the drag-and-drop builder</p>
                  <Button onClick={() => setShowEditor(true)}>Open Email Builder</Button>
                </div>
              )}
              {showEditor && (
                <TemplateEditor
                  initialSubject={form.subject}
                  initialBuilderData={form.builderData}
                  initialHtml={form.content}
                  onClose={() => setShowEditor(false)}
                  onSave={async (sub, html, bData) => {
                    setForm(f => ({ ...f, subject: sub, content: html, builderData: bData }));
                    setShowEditor(false);
                  }}
                />
              )}
            </div>

            {/* Recipients Section */}
            <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Recipients</label>
                <div className="flex gap-1 p-0.5 bg-muted rounded-md">
                  {[
                    { id: 'tags', label: 'By Tags', icon: Tags },
                    { id: 'list', label: 'By Group', icon: ListIcon },
                    { id: 'individuals', label: 'Individuals', icon: AtSign },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setAudienceMode(id as AudienceMode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${audienceMode === id ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Icon className="w-3 h-3" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {audienceMode === 'tags' && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Select tags — all subscribed contacts with these tags will receive the email.</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.length === 0 && <span className="text-xs text-muted-foreground">No tags found. Import contacts first.</span>}
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center gap-1.5 text-sm bg-white border px-3 py-1.5 rounded-full cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="checkbox"
                          className="w-3 h-3"
                          checked={form.audienceTags.includes(tag)}
                          onChange={e => {
                            const newTags = e.target.checked
                              ? [...form.audienceTags, tag]
                              : form.audienceTags.filter(t => t !== tag);
                            setForm({ ...form, audienceTags: newTags });
                          }}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {audienceMode === 'list' && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Select saved contact groups — all subscribed members will receive the email.</p>
                  <div className="flex flex-wrap gap-2">
                    {availableLists.length === 0 && <span className="text-xs text-muted-foreground">No lists yet. Create one in the Audience tab.</span>}
                    {availableLists.map((lst: any) => (
                      <label key={lst._id} className="flex items-center gap-1.5 text-sm bg-white border px-3 py-1.5 rounded-full cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="checkbox"
                          className="w-3 h-3"
                          checked={form.audienceListIds.includes(lst._id)}
                          onChange={e => {
                            const newIds = e.target.checked
                              ? [...form.audienceListIds, lst._id]
                              : form.audienceListIds.filter(id => id !== lst._id);
                            setForm({ ...form, audienceListIds: newIds });
                          }}
                        />
                        <span className="font-medium">{lst.name}</span>
                        <span className="text-xs text-muted-foreground">({lst.type})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {audienceMode === 'individuals' && (
                <div className="space-y-3">
                  {/* Type in email addresses */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Type email addresses directly:</p>
                    <div className="flex gap-2">
                      <Input
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="email@example.com"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTypedEmail(); } }}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleAddTypedEmail}>Add</Button>
                    </div>
                    {typedEmails.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {typedEmails.map(email => (
                          <span key={email} className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                            {email}
                            <button onClick={() => setTypedEmails(prev => prev.filter(e => e !== email))} className="hover:text-blue-900">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Or pick from contacts */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Or pick from your contact list:</p>
                    <Input
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      placeholder="Search contacts by name or email..."
                      className="mb-2"
                    />
                    <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                      {contacts.length === 0 && (
                        <p className="text-xs text-muted-foreground p-3">No contacts found.</p>
                      )}
                      {contacts.map((c: any) => {
                        const isSelected = form.audienceContactIds.includes(c._id);
                        return (
                          <label key={c._id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-muted/40'}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                const newIds = e.target.checked
                                  ? [...form.audienceContactIds, c._id]
                                  : form.audienceContactIds.filter(id => id !== c._id);
                                setForm({ ...form, audienceContactIds: newIds });
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{c.firstName} {c.lastName}</div>
                              <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                            </div>
                            {c.tags?.slice(0, 2).map((t: string) => (
                              <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded">{t}</span>
                            ))}
                          </label>
                        );
                      })}
                    </div>
                    {form.audienceContactIds.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{form.audienceContactIds.length} contact(s) selected from list</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Schedule (campaign mode only) */}
            {sendMode === 'campaign' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Schedule For <span className="text-muted-foreground font-normal">(leave blank to save as draft)</span></label>
                <Input
                  type="datetime-local"
                  value={form.scheduledFor}
                  onChange={e => setForm({ ...form, scheduledFor: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!form.content}>
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
            {sendMode === 'campaign' ? (
              <Button onClick={handleSaveCampaign}>
                {editId ? 'Update Campaign' : form.scheduledFor ? 'Schedule Campaign' : 'Save as Draft'}
              </Button>
            ) : (
              <Button onClick={handleSendDirect} disabled={isSending}>
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : `Send Now (${typedEmails.length + form.audienceContactIds.length} recipients)`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-2 p-5 bg-white border rounded-xl shadow-sm">
            <div className="text-sm text-muted-foreground border-b pb-3 mb-4 space-y-1">
              <div><strong>From:</strong> Eyelight Publishing &lt;services@eyelightpublishers.com&gt;</div>
              <div><strong>Subject:</strong> {form.subject || '(No Subject)'}</div>
            </div>
            <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: form.content || '<em>No content yet...</em>' }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaigns List */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Email Campaigns</h3>
          <span className="text-xs text-muted-foreground">{campaigns.length} campaigns</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Scheduled / Sent</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No campaigns yet. Click "Compose Email" to get started.</TableCell></TableRow>
            ) : campaigns.map((c: any) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium max-w-xs truncate">{c.subject}</TableCell>
                <TableCell>{statusBadge(c.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
                  {c.audienceTags?.length > 0 && `Tags: ${c.audienceTags.join(', ')}`}
                  {c.audienceListIds?.length > 0 && `Lists: ${c.audienceListIds.length}`}
                  {c.audienceContactIds?.length > 0 && `${c.audienceContactIds.length} contact(s)`}
                  {!c.audienceTags?.length && !c.audienceListIds?.length && !c.audienceContactIds?.length && '—'}
                </TableCell>
                <TableCell>
                  {c.stats ? (
                    <div className="text-xs space-y-0.5">
                      <div className="flex gap-2">
                        <span className="text-green-600 font-medium">{c.stats.sent || 0} sent</span>
                        <span className="text-red-500">{c.stats.failed || 0} failed</span>
                        <span className="text-blue-600">{c.stats.queued || 0} queued</span>
                      </div>
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {c.status === 'Sent' && c.sentAt ? format(new Date(c.sentAt), 'PP p') :
                    c.status === 'Scheduled' && c.scheduledFor ? format(new Date(c.scheduledFor), 'PP p') : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c._id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    {(c.status === 'Draft' || c.status === 'Scheduled') && (
                      <Button variant="outline" size="sm" onClick={() => handleSendNow(c._id)} className="h-7 text-xs gap-1">
                        <Send className="w-3 h-3" /> Send Now
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Automations Tab ──────────────────────────────────────────────────────────

function AutomationsTab() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({ triggerEvent: '', subject: '', content: '', builderData: null as any, isActive: true });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const TRIGGERS = [
    { id: 'newsletter.subscribed', label: '📧 Newsletter Subscribed', desc: 'Fires when someone subscribes to your newsletter' },
    { id: 'user.registered', label: '👤 User Registered', desc: 'Fires when an author account is created' },
    { id: 'payment.completed', label: '💳 Payment Completed', desc: 'Fires after a successful payment' },
    { id: 'manuscript.submitted', label: '📝 Manuscript Submitted', desc: 'Fires when an author submits their manuscript' },
    { id: 'project.status_changed', label: '🔄 Project Status Changed', desc: 'Fires when a manuscript status is updated' },
    { id: 'consultation.booked', label: '📅 Consultation Booked', desc: 'Fires when someone books a consultation' },
  ];

  const fetchAutomations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await CrmApi.getAutomations();
      setAutomations(res.data);
    } catch { toast.error('Failed to load automations'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const handleSave = async () => {
    if (!form.triggerEvent || !form.subject || !form.content) return toast.error('Please fill trigger, subject, and add email content');
    setIsSaving(true);
    try {
      await CrmApi.upsertAutomation(form.triggerEvent, form);
      toast.success('Automation saved!');
      setShowForm(false);
      fetchAutomations();
    } catch { toast.error('Failed to save automation'); }
    finally { setIsSaving(false); }
  };

  const handleEdit = (auto: any) => {
    setForm({
      triggerEvent: auto.triggerEvent,
      subject: auto.subject,
      content: auto.content,
      builderData: auto.builderData || null,
      isActive: auto.isActive,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this automation?')) return;
    try {
      await CrmApi.removeAutomation(id);
      toast.success('Automation deleted');
      fetchAutomations();
    } catch { toast.error('Failed to delete automation'); }
  };

  const selectedTrigger = TRIGGERS.find(t => t.id === form.triggerEvent);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Automations</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Set up event-driven emails that fire automatically when something happens.</p>
        </div>
        <Button onClick={() => {
          setForm({ triggerEvent: '', subject: '', content: '', builderData: null, isActive: true });
          setIsEditing(false);
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancel' : <><Zap className="w-4 h-4 mr-2" /> New Automation</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/20 border rounded-xl p-6 space-y-5">
          <h3 className="font-semibold">{isEditing ? 'Edit Automation' : 'Create New Automation'}</h3>

          {/* Trigger selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trigger Event</label>
            {isEditing ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedTrigger?.label || form.triggerEvent}</span>
                <span className="text-xs text-muted-foreground ml-auto">Trigger locked for existing automations</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {TRIGGERS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setForm({ ...form, triggerEvent: t.id })}
                    className={`text-left p-3 rounded-lg border transition-all ${form.triggerEvent === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-white hover:bg-muted/30'}`}
                  >
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Subject Line</label>
            <Input
              className="bg-white"
              placeholder="e.g. Welcome to Eyelight, {{firstName}}! 🎉"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Use <code>{'{{firstName}}'}</code> and <code>{'{{lastName}}'}</code> for personalization.</p>
          </div>

          {/* Email Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Content</label>
            {form.content ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-sm text-green-700 flex-1">Template ready ({form.content.length} chars)</span>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>Preview</Button>
                <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>Edit</Button>
              </div>
            ) : (
              <div className="border rounded-lg p-6 bg-muted/30 flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">Design the automation email with the drag-and-drop builder</p>
                <Button onClick={() => setShowEditor(true)}>Open Email Builder</Button>
              </div>
            )}
            {showEditor && (
              <TemplateEditor
                initialSubject={form.subject}
                initialBuilderData={form.builderData}
                initialHtml={form.content}
                onClose={() => setShowEditor(false)}
                onSave={async (sub, html, bData) => {
                  setForm(f => ({ ...f, subject: sub, content: html, builderData: bData }));
                  setShowEditor(false);
                }}
              />
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Status:</label>
            <button
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-muted-foreground">{form.isActive ? 'Active — will fire on trigger' : 'Disabled'}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!form.content}>
              <Eye className="w-4 h-4 mr-2" /> Preview Email
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Automation'}
            </Button>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Automation Email Preview</DialogTitle></DialogHeader>
          <div className="mt-2 p-5 bg-white border rounded-xl shadow-sm">
            <div className="text-sm text-muted-foreground border-b pb-3 mb-4 space-y-1">
              <div><strong>From:</strong> Eyelight Publishing &lt;services@eyelightpublishers.com&gt;</div>
              <div><strong>Subject:</strong> {form.subject || '(No Subject)'}</div>
              <div><strong>Trigger:</strong> {selectedTrigger?.label || form.triggerEvent}</div>
            </div>
            <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: form.content || '<em>No content yet...</em>' }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Automations Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trigger</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : automations.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No automations configured yet.</TableCell></TableRow>
            ) : automations.map((a: any) => {
              const trigger = TRIGGERS.find(t => t.id === a.triggerEvent);
              return (
                <TableRow key={a._id}>
                  <TableCell>
                    <div className="font-medium text-sm">{trigger?.label || a.triggerEvent}</div>
                    <div className="text-xs text-muted-foreground font-mono">{a.triggerEvent}</div>
                  </TableCell>
                  <TableCell className="text-sm">{a.subject}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {a.isActive ? '● Active' : '○ Disabled'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(a)}><Edit2 className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(a._id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Audience & Leads Tab ─────────────────────────────────────────────────────

function LeadsTab() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [listForm, setListForm] = useState({ name: '', type: 'static' });
  const [contactForm, setContactForm] = useState({ email: '', firstName: '', lastName: '', tags: '' });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [contactsRes, listsRes] = await Promise.all([
        CrmApi.getContacts({ search: search || undefined }),
        CrmApi.getLists(),
      ]);
      setContacts(contactsRes.data.data || []);
      setTotal(contactsRes.data.total || 0);
      setLists(listsRes.data || []);
    } catch { toast.error('Failed to load audience'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleImport = async () => {
    if (!file) return toast.error('Please select a CSV file');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (tagInput) formData.append('tag', tagInput);
      const res = await CrmApi.importContacts(formData);
      toast.success(`Done! Added: ${res.data.added}, Updated: ${res.data.updated}, Skipped: ${res.data.skipped}`);
      setShowImport(false);
      setFile(null);
      setTagInput('');
      fetchAll();
    } catch { toast.error('Failed to import contacts'); }
  };

  const handleCreateList = async () => {
    if (!listForm.name) return toast.error('Enter a list name');
    try {
      await CrmApi.createList(listForm);
      toast.success('List created!');
      setShowCreateList(false);
      setListForm({ name: '', type: 'static' });
      fetchAll();
    } catch { toast.error('Failed to create list'); }
  };

  const handleAddContact = async () => {
    if (!contactForm.email) return toast.error('Email is required');
    try {
      const tags = contactForm.tags ? contactForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await CrmApi.createContact({ ...contactForm, tags });
      toast.success('Contact added!');
      setShowAddContact(false);
      setContactForm({ email: '', firstName: '', lastName: '', tags: '' });
      fetchAll();
    } catch { toast.error('Failed to add contact'); }
  };

  const handleDeleteList = async (id: string) => {
    if (!window.confirm('Delete this list?')) return;
    try {
      await CrmApi.deleteList(id);
      toast.success('List deleted');
      fetchAll();
    } catch { toast.error('Failed to delete list'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audience & Leads</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{total} total contacts in your CRM</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCreateList(true)}>
            <ListIcon className="w-4 h-4 mr-2" /> New Group
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAddContact(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
          <Button size="sm" onClick={() => setShowImport(!showImport)}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
        </div>
      </div>

      {/* Contact Groups */}
      {lists.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Contact Groups / Lists</h3>
          <div className="flex flex-wrap gap-2">
            {lists.map((lst: any) => (
              <div key={lst._id} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1.5 text-sm shadow-sm">
                <ListIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium">{lst.name}</span>
                <span className="text-xs text-muted-foreground">({lst.type})</span>
                <button onClick={() => handleDeleteList(lst._id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import CSV */}
      {showImport && (
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Import Contacts via CSV</h3>
          <p className="text-xs text-muted-foreground">CSV should have columns: <code>email, firstName, lastName</code> (or <code>name</code>)</p>
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="text-sm font-medium mb-1 block">Select CSV File</label>
              <Input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tag (optional)</label>
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="e.g. newsletter" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImport(false)}>Cancel</Button>
            <Button size="sm" onClick={handleImport}>Upload & Import</Button>
          </div>
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Contact Manually</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><label className="text-sm font-medium mb-1 block">Email *</label>
              <Input value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">First Name</label>
                <Input value={contactForm.firstName} onChange={e => setContactForm({ ...contactForm, firstName: e.target.value })} />
              </div>
              <div><label className="text-sm font-medium mb-1 block">Last Name</label>
                <Input value={contactForm.lastName} onChange={e => setContactForm({ ...contactForm, lastName: e.target.value })} />
              </div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Tags (comma-separated)</label>
              <Input value={contactForm.tags} onChange={e => setContactForm({ ...contactForm, tags: e.target.value })} placeholder="newsletter, vip" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddContact(false)}>Cancel</Button>
            <Button onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create List Dialog */}
      <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Contact Group</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><label className="text-sm font-medium mb-1 block">Group Name</label>
              <Input value={listForm.name} onChange={e => setListForm({ ...listForm, name: e.target.value })} placeholder="e.g. VIP Authors, Newsletter Subscribers" />
            </div>
            <div><label className="text-sm font-medium mb-1 block">Type</label>
              <Select value={listForm.type} onValueChange={val => setListForm({ ...listForm, type: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static (manually add contacts)</SelectItem>
                  <SelectItem value="dynamic">Dynamic (auto-matches a tag query)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateList(false)}>Cancel</Button>
            <Button onClick={handleCreateList}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search contacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Contacts Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : contacts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No contacts found.</TableCell></TableRow>
            ) : contacts.map((c: any) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium text-sm">{c.email}</TableCell>
                <TableCell className="text-sm">{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.tags?.map((t: string) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-xs bg-muted">{t}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'subscribed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {c.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground uppercase">{c.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────

function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LeadsApi.getAllLeads()
      .then(r => setBookings(r.data.filter((l: any) => l.type === 'Consultation')))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Bookings & Schedules</h2>
        <span className="text-sm text-muted-foreground">{bookings.length} consultations</span>
      </div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Requested Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : bookings.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No bookings scheduled yet.</TableCell></TableRow>
            ) : bookings.map((b: any) => (
              <TableRow key={b._id}>
                <TableCell className="font-medium">{b.name || '—'}</TableCell>
                <TableCell>
                  <div className="text-sm">{b.email}</div>
                  <div className="text-xs text-muted-foreground">{b.phone || '—'}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {b.metadata?.date ? format(new Date(b.metadata.date), 'PP p') : (b.createdAt ? format(new Date(b.createdAt), 'PP') : '—')}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Pending Review</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Production Board Tab ─────────────────────────────────────────────────────

function ProductionTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ProjectsApi.getAll();
      setProjects(res.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleStatusChange = async (id: string, status: string) => {
    if (!window.confirm(`Change status to ${status}?`)) return;
    setUpdating(id);
    try {
      await ProjectsApi.updateStatus(id, status);
      setProjects(prev => prev.map(p => p._id === id ? { ...p, status } : p));
      toast.success('Status updated!');
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Production Board</h2>
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          <span>{projects.length} active</span>
          <Button variant="ghost" size="icon" onClick={fetchProjects}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Book Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : projects.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No projects yet.</TableCell></TableRow>
            ) : projects.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell className="font-semibold">{p.bookTitle}</TableCell>
                <TableCell>{p.author?.name || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{p.genre || '—'}</TableCell>
                <TableCell>
                  <Select value={p.status} onValueChange={val => handleStatusChange(p._id, val)} disabled={updating === p._id}>
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {p.createdAt ? format(new Date(p.createdAt), 'PP') : '—'}
                  {p.versions?.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {p.versions.map((v: any, idx: number) => (
                        <a key={idx} href={v.fileUrl} target="_blank" rel="noreferrer" className="flex items-center text-xs text-blue-600 hover:underline">
                          <ExternalLink className="w-3 h-3 mr-1" /> Version {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Authors Tab ──────────────────────────────────────────────────────────────

function AuthorsTab() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    AuthorsApi.getAll()
      .then(r => setAuthors(r.data))
      .catch(() => toast.error('Failed to load authors'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Author Directory</h2>
        <span className="text-sm text-muted-foreground">{authors.length} authors</span>
      </div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead />
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : authors.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No authors yet.</TableCell></TableRow>
            ) : authors.map((a: any) => (
              <TableRow key={a._id} className="cursor-pointer" onClick={() => navigate(`/admin/authors/${a._id}`)}>
                <TableCell className="font-semibold">{a.name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>{a.phone || '—'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.isAuthorOnboarded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {a.isAuthorOnboarded ? 'Active' : 'Pending Setup'}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {a.createdAt ? format(new Date(a.createdAt), 'PP') : '—'}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/admin/authors/${a._id}`); }}>
                    View →
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', type: 'Workshop', zoomLink: '', location: '', description: '' });
  const [flyer, setFlyer] = useState<File | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await EventsApi.getAll();
      setEvents(res.data);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, date: form.date ? new Date(form.date).toISOString() : new Date().toISOString() };
      let createdEvent;
      if (editId) {
        const res = await EventsApi.update(editId, payload);
        createdEvent = res.data;
        toast.success('Event updated!');
      } else {
        const res = await EventsApi.create(payload);
        createdEvent = res.data;
        toast.success('Event created!');
      }
      if (flyer && createdEvent._id) {
        const formData = new FormData();
        formData.append('file', flyer);
        const token = localStorage.getItem('access_token');
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/events/${createdEvent._id}/upload-flyer`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ title: '', date: '', type: 'Workshop', location: '', zoomLink: '', description: '' });
      setFlyer(null);
      fetchEvents();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save event'); }
  };

  const handleEdit = (ev: any) => {
    setForm({
      title: ev.title,
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '',
      type: ev.type || 'Workshop',
      location: ev.location || '',
      zoomLink: ev.zoomLink || '',
      description: ev.description || '',
    });
    setEditId(ev._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await EventsApi.remove(id);
      toast.success('Event deleted!');
      fetchEvents();
    } catch { toast.error('Failed to delete event'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Events Manager</h2>
        <Button size="sm" onClick={() => { if (showForm) { setShowForm(false); setEditId(null); setForm({ title: '', date: '', type: 'Workshop', location: '', zoomLink: '', description: '' }); } else { setShowForm(true); } }}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'New Event'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Event Title</label>
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Date & Time</label>
              <Input type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Type</label>
              <Select value={form.type} onValueChange={val => setForm({ ...form, type: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Launch">Launch</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Flyer Image (Optional)</label>
              <Input type="file" accept="image/*" onChange={e => setFlyer(e.target.files?.[0] || null)} />
            </div>
          </div>
          <Button type="submit">Save Event</Button>
        </form>
      )}

      <div className="space-y-4">
        {loading ? <p className="text-muted-foreground">Loading events...</p> : events.length === 0 ? <p className="text-muted-foreground">No events yet.</p> : events.map(ev => (
          <div key={ev._id} className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{ev.title} <span className="text-xs ml-2 px-2 py-0.5 bg-accent text-accent-foreground rounded-full">{ev.type}</span></h3>
                <p className="text-sm text-muted-foreground">{new Date(ev.date).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">{ev.registrations?.length || 0} Registered</p>
                <div className="flex gap-2 border-l pl-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(ev)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(ev._id)}>Delete</Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-semibold mb-3">Registered Attendees</h4>
              {ev.registrations?.length > 0 ? (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered At</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {ev.registrations.map((reg: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{reg.name}</TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(reg.registeredAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-sm text-muted-foreground">No attendees registered yet.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Press Tab ────────────────────────────────────────────────────────────────

function PressTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', category: 'News', content: '', templateId: '1' });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await PressApi.getPosts();
      setPosts(res.data);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCreate = async (isPublished: boolean) => {
    if (!form.title || !form.slug || !form.content) { toast.error('Please fill all required fields'); return; }
    if (isPublished && !window.confirm('Publish this post live?')) return;
    try {
      if (editId) {
        await PressApi.updatePost(editId, { ...form, isPublished });
        toast.success(isPublished ? 'Post updated and published!' : 'Draft updated!');
      } else {
        await PressApi.createPost({ ...form, isPublished });
        toast.success(isPublished ? 'Post published!' : 'Saved as draft!');
      }
      setShowForm(false); setEditId(null);
      setForm({ title: '', slug: '', category: 'News', content: '', templateId: '1' });
      fetchPosts();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save post'); }
  };

  const handleEdit = (p: any) => {
    setForm({ title: p.title, slug: p.slug, category: p.category || 'News', content: p.content, templateId: String(p.templateId || '1') });
    setEditId(p._id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    try { await PressApi.removePost(id); toast.success('Post deleted!'); fetchPosts(); }
    catch { toast.error('Failed to delete post'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Press & Blog Management</h2>
        <Button size="sm" onClick={() => { if (showForm) { setShowForm(false); setEditId(null); setForm({ title: '', slug: '', category: 'News', content: '', templateId: '1' }); } else setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'New Post'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Post Title</label>
              <Input required value={form.title} onChange={e => { const title = e.target.value; const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''); setForm({ ...form, title, slug }); }} />
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">URL Slug</label>
              <Input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={val => setForm({ ...form, category: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRESS_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Display Template</label>
              <Select value={form.templateId} onValueChange={val => setForm({ ...form, templateId: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4', '5', '6'].map(t => <SelectItem key={t} value={t}>Template {t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Post Content</label>
            <ReactQuill theme="snow" value={form.content} onChange={val => setForm({ ...form, content: val })} className="bg-white rounded-md mb-12 h-[350px]" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(true)}>Preview</Button>
            <Button variant="secondary" onClick={() => handleCreate(false)}>Save as Draft</Button>
            <Button onClick={() => handleCreate(true)}>Publish Live</Button>
          </div>
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Post Preview</DialogTitle></DialogHeader>
          <div className="mt-4 p-6 bg-white border rounded-xl shadow-sm">
            <div className="text-sm font-medium text-blue-600 mb-2">{form.category}</div>
            <h1 className="text-3xl font-bold mb-4">{form.title || 'Untitled Post'}</h1>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: form.content || 'No content yet...' }} />
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Post Details</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published / Created</TableHead>
            <TableHead />
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading posts...</TableCell></TableRow>
            ) : posts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No blog posts yet.</TableCell></TableRow>
            ) : posts.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.category}</div>
                </TableCell>
                <TableCell>Template {p.templateId}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {p.publishedAt ? format(new Date(p.publishedAt), 'PP p') : p.createdAt ? format(new Date(p.createdAt), 'PP') : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p._id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Main Admin CRM Shell ─────────────────────────────────────────────────────

const TABS = [
  { id: 'email', label: 'Email Center', icon: Mail },
  { id: 'automations', label: 'Automations', icon: Zap },
  { id: 'leads', label: 'Audience & Leads', icon: Users },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'production', label: 'Production Board', icon: BookOpen },
  { id: 'authors', label: 'Author Directory', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'press', label: 'Press & Blog', icon: BookOpen },
];

export default function AdminCRM() {
  const [activeTab, setActiveTab] = useState('email');
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-white flex text-[#111]">
      {/* Sidebar - Resend Dark Mode */}
      <aside className="w-[240px] border-r border-[#222] bg-black text-[#888] flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-sm" />
            </div>
            <h1 className="font-semibold text-white tracking-tight text-lg">Eyelight</h1>
          </div>
          <div className="mt-4 text-[11px] font-mono text-gray-400 bg-[#111] p-2 rounded-md border border-[#333] truncate">
             services@eyelightpublishers.com
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${activeTab === tab.id ? 'bg-[#222] text-white shadow-sm' : 'hover:text-white hover:bg-[#111]'}`}
              >
                <Icon className="w-4 h-4" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#222]">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium hover:text-white hover:bg-[#111] transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto p-10">
          {activeTab === 'email' && <EmailTab />}
          {activeTab === 'automations' && <AutomationsTab />}
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'production' && <ProductionTab />}
          {activeTab === 'authors' && <AuthorsTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'press' && <PressTab />}
        </div>
      </main>
    </div>
  );
}
