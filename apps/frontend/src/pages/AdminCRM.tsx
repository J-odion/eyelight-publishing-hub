import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CrmApi, LeadsApi, ProjectsApi, AuthorsApi, EventsApi, PressApi } from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Users, Mail, BookOpen, CalendarDays, LayoutDashboard, Send,
  Settings, LogOut, Search, Filter, Plus, ChevronDown, Check,
  X, CheckCircle, Clock, Copy, Download, Upload
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
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import {
  Mail, Users, BookOpen, LayoutDashboard, LogOut, Plus, RefreshCw, CalendarDays, ExternalLink, Send
} from 'lucide-react';
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

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function EmailTab() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', content: '', builderData: null as any, audienceTags: [] as string[], scheduledFor: '' });

  const fetchCampaignsAndTags = useCallback(async () => {
    try {
      setLoading(true);
      const [campRes, tagsRes] = await Promise.all([
        CrmApi.getCampaigns(),
        CrmApi.getTags()
      ]);
      setCampaigns(campRes.data);
      setAvailableTags(tagsRes.data || []);
    } catch { toast.error('Failed to load campaigns data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCampaignsAndTags(); }, [fetchCampaignsAndTags]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success('Campaign saved!');
      }
      
      setShowForm(false);
      setEditId(null);
      setForm({ subject: '', content: '', builderData: null, audienceTags: [], scheduledFor: '' });
      fetchCampaignsAndTags();
    } catch { toast.error('Failed to save campaign'); }
  };

  const handleEdit = (c: any) => {
    setForm({
      subject: c.subject,
      content: c.content,
      audienceTags: c.audienceTags || [],
      scheduledFor: c.scheduledFor ? new Date(c.scheduledFor).toISOString().slice(0, 16) : ''
    });
    setEditId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await CrmApi.removeCampaign(id);
      toast.success('Campaign deleted!');
      fetchCampaignsAndTags();
    } catch { toast.error('Failed to delete campaign'); }
  };

  const handleSendNow = async (id: string) => {
    if (!window.confirm('Are you sure you want to send this campaign now?')) return;
    try {
      await CrmApi.updateCampaign(id, { scheduledFor: new Date().toISOString() });
      toast.success('Campaign scheduled for immediate send!');
      fetchCampaignsAndTags();
    } catch { toast.error('Failed to send campaign'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Email Engine</h2>
        <Button size="sm" onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditId(null);
            setForm({ subject: '', content: '', audienceTags: [], scheduledFor: '' });
          } else {
            setShowForm(true);
          }
        }}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'New Email'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject Line</label>
            <Input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Content</label>
            <div className="border rounded-md p-6 bg-muted/50 flex flex-col items-center justify-center space-y-3">
              <p className="text-sm text-muted-foreground text-center">Use the drag-and-drop builder to design your email.</p>
              <Button type="button" onClick={() => setShowEditor(true)}>Open Builder</Button>
            </div>
            
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
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience (Tags)</label>
              <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[40px]">
                {availableTags.length === 0 && <span className="text-muted-foreground text-sm">No tags found.</span>}
                {availableTags.map(tag => (
                  <label key={tag} className="flex items-center space-x-2 text-sm bg-muted px-2 py-1 rounded-md cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.audienceTags.includes(tag)}
                      onChange={e => {
                        const newTags = e.target.checked 
                          ? [...form.audienceTags, tag] 
                          : form.audienceTags.filter(t => t !== tag);
                        setForm({ ...form, audienceTags: newTags });
                      }}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule For (blank = draft)</label>
              <Input type="datetime-local" value={form.scheduledFor} onChange={e => setForm({ ...form, scheduledFor: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowPreview(true)}>Preview</Button>
            <Button onClick={handleCreate}>Save Campaign</Button>
          </div>
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-6 bg-white border rounded-xl shadow-sm">
            <div className="text-sm text-muted-foreground border-b pb-4 mb-4">
              <strong>Subject:</strong> {form.subject || '(No Subject)'}
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: form.content || '<em>Empty content...</em>' }} />
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Progress & Stats</TableHead>
            <TableHead>Scheduled / Sent</TableHead>
            <TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No campaigns yet.</TableCell></TableRow>
            ) : campaigns.map((c: any) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium">{c.subject}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Sent' ? 'bg-green-100 text-green-700' : c.status === 'Sending' ? 'bg-yellow-100 text-yellow-700' : c.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{c.status}</span>
                </TableCell>
                <TableCell>{c.audienceTags?.join(', ') || 'None'}</TableCell>
                <TableCell>
                  {c.stats ? (
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex gap-2">
                        <span className="text-green-600 font-medium">{c.stats.sent || 0} sent</span>
                        <span className="text-red-600 font-medium">{c.stats.failed || 0} failed</span>
                        <span className="text-blue-600 font-medium">{c.stats.queued || 0} queued</span>
                      </div>
                      <div className="flex gap-2 text-muted-foreground mt-1 border-t pt-1 border-gray-100">
                        <span>{c.stats.delivered || 0} delivered</span>
                        <span>{c.stats.opened || 0} opened</span>
                        <span>{c.stats.clicked || 0} clicked</span>
                        <span className="text-red-400">{c.stats.bounced || 0} bounced</span>
                        <span className="text-orange-400">{c.stats.complained || 0} spam</span>
                      </div>
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {c.status === 'Sent' && c.sentAt ? format(new Date(c.sentAt), 'PP p') :
                   c.status === 'Scheduled' && c.scheduledFor ? format(new Date(c.scheduledFor), 'PP p') : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c._id)}>Delete</Button>
                    {(c.status === 'Draft' || c.status === 'Scheduled') && (
                      <Button variant="outline" size="sm" onClick={() => handleSendNow(c._id)} className="gap-2">
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

function AutomationsTab() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ triggerEvent: '', subject: '', content: '', builderData: null as any, isActive: true });
  const [showEditor, setShowEditor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const TRIGGERS = [
    { id: 'user.registered', label: 'User Registered' },
    { id: 'payment.completed', label: 'Payment Completed' },
    { id: 'manuscript.submitted', label: 'Manuscript Submitted' },
    { id: 'project.status_changed', label: 'Project Status Changed' },
    { id: 'consultation.booked', label: 'Consultation Booked' },
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
    if (!form.triggerEvent || !form.subject || !form.content) return toast.error('Missing required fields');
    try {
      await CrmApi.upsertAutomation(form.triggerEvent, form);
      toast.success('Automation saved!');
      setShowForm(false);
      fetchAutomations();
    } catch { toast.error('Failed to save automation'); }
  };

  const handleEdit = (auto: any) => {
    setForm({ triggerEvent: auto.triggerEvent, subject: auto.subject, content: auto.content, builderData: auto.builderData || null, isActive: auto.isActive });
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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automations</h2>
          <p className="text-muted-foreground">Set up event-driven emails that fire automatically.</p>
        </div>
        <Button onClick={() => { setForm({ triggerEvent: '', subject: '', content: '', builderData: null as any, isActive: true }); setIsEditing(false); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Automation</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/30 p-6 rounded-xl border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Event</label>
              <Select value={form.triggerEvent} onValueChange={val => setForm({ ...form, triggerEvent: val })} disabled={isEditing}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select an event..." /></SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map(t => <SelectItem key={t.id} value={t.id}>{t.label} ({t.id})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject Line</label>
              <Input 
                className="bg-white" 
                placeholder="Subject (e.g. Welcome {{firstName}}!)" 
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Email Content</label>
            </div>
            <div className="border rounded-md p-6 bg-muted/50 flex flex-col items-center justify-center space-y-3">
              <p className="text-sm text-muted-foreground text-center">Use the drag-and-drop builder to design your automation.</p>
              <Button type="button" onClick={() => setShowEditor(true)}>Open Builder</Button>
            </div>
            
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

          <div className="flex justify-end gap-3 pt-12">
            <Button onClick={handleSave}>Save Automation</Button>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Trigger</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : automations.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No automations configured.</TableCell></TableRow>
            ) : automations.map((a: any) => (
              <TableRow key={a._id}>
                <TableCell className="font-medium">
                  {TRIGGERS.find(t => t.id === a.triggerEvent)?.label || a.triggerEvent}
                  <div className="text-xs text-muted-foreground">{a.triggerEvent}</div>
                </TableCell>
                <TableCell>{a.subject}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {a.isActive ? 'Active' : 'Disabled'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(a)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(a._id)}>Delete</Button>
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

function LeadsTab() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await CrmApi.getContacts();
      setContacts(res.data.data);
    } catch { toast.error('Failed to load contacts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (tagInput) formData.append('tag', tagInput);
      
      const res = await CrmApi.importContacts(formData);
      toast.success(`Imported! Added: ${res.data.added}, Updated: ${res.data.updated}, Skipped: ${res.data.skipped}`);
      setShowImport(false);
      setFile(null);
      setTagInput('');
      fetchContacts();
    } catch { toast.error('Failed to import contacts'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">CRM Contacts (Audience)</h2>
        <Button size="sm" onClick={() => setShowImport(!showImport)}>
          <Upload className="w-4 h-4 mr-2" /> {showImport ? 'Cancel Import' : 'Import CSV'}
        </Button>
      </div>

      {showImport && (
        <div className="bg-card border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-medium mb-4">Import Contacts via CSV</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium mb-1 block">Select CSV File</label>
              <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tag (Optional, e.g. imported-substack)</label>
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="imported-substack" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowImport(false)}>Cancel</Button>
              <Button onClick={handleImport}>Upload & Import</Button>
            </div>
          </div>
        </div>
      )}
      <div className="text-sm text-muted-foreground mb-4">{contacts.length} total contacts</div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Email</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : contacts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contacts yet.</TableCell></TableRow>
            ) : contacts.map((c: any) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium">{c.email}</TableCell>
                <TableCell>{c.firstName || '—'}</TableCell>
                <TableCell>{c.lastName || '—'}</TableCell>
                <TableCell>
                  {c.tags?.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-muted mr-1">{t}</span>
                  ))}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'subscribed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs uppercase">{c.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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
    if (!window.confirm(`Are you sure you want to change the status to ${status}?`)) return;
    setUpdating(id);
    try {
      await ProjectsApi.updateStatus(id, status);
      setProjects(prev => prev.map(p => p._id === id ? { ...p, status } : p));
      toast.success('Project status updated!');
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
                  <Select
                    value={p.status}
                    onValueChange={(val) => handleStatusChange(p._id, val)}
                    disabled={updating === p._id}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {p.createdAt ? format(new Date(p.createdAt), 'PP') : '—'}
                  {p.versions && p.versions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold text-foreground">Documents:</p>
                      {p.versions.map((v: any, idx: number) => (
                        <a key={idx} href={v.fileUrl} target="_blank" rel="noreferrer" className="flex items-center text-xs text-blue-600 hover:underline">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Version {idx + 1}
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
            <TableHead></TableHead>
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
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/admin/authors/${a._id}`); }}>
                    View Profile →
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
      const payload = {
        ...form,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString()
      };
      
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
    } catch (err: any) { 
      toast.error(err.response?.data?.message || 'Failed to save event'); 
    }
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
    if (!window.confirm('Are you sure you want to delete this event?')) return;
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
        <Button size="sm" onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditId(null);
            setForm({ title: '', date: '', type: 'Workshop', location: '', zoomLink: '', description: '' });
          } else {
            setShowForm(true);
          }
        }}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'New Event'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title</label>
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date & Time</label>
              <Input type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Launch">Launch</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Flyer Image (Optional)</label>
              <Input type="file" accept="image/*" onChange={e => setFlyer(e.target.files?.[0] || null)} />
            </div>
          </div>
          <Button type="submit">Save Event</Button>
        </form>
      )}

      <div className="space-y-6">
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
              {ev.registrations && ev.registrations.length > 0 ? (
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
              ) : (
                <p className="text-sm text-muted-foreground">No attendees registered yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PressTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', category: 'News', content: '', templateId: '1' });
  const [coverImage, setCoverImage] = useState<File | null>(null);

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
    if (!form.title || !form.slug || !form.content) {
      toast.error('Please fill all required fields');
      return;
    }
    if (isPublished && !window.confirm('Are you sure you want to publish this post live?')) return;
    
    try {
      if (editId) {
        await PressApi.updatePost(editId, { ...form, isPublished });
        toast.success(isPublished ? 'Post updated and published!' : 'Draft updated!');
      } else {
        await PressApi.createPost({ ...form, isPublished });
        toast.success(isPublished ? 'Post published successfully!' : 'Saved as draft!');
      }
      
      setShowForm(false);
      setEditId(null);
      setForm({ title: '', slug: '', category: 'News', content: '', templateId: '1' });
      fetchPosts();
    } catch (err: any) { 
      toast.error(err.response?.data?.message || 'Failed to save post'); 
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      title: p.title,
      slug: p.slug,
      category: p.category || 'News',
      content: p.content,
      templateId: String(p.templateId || '1')
    });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await PressApi.removePost(id);
      toast.success('Post deleted!');
      fetchPosts();
    } catch { toast.error('Failed to delete post'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Press & Blog Management</h2>
        <Button size="sm" onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditId(null);
            setForm({ title: '', slug: '', category: 'News', content: '', templateId: '1' });
          } else {
            setShowForm(true);
          }
        }}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'New Post'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Post Title</label>
              <Input 
                required 
                value={form.title} 
                onChange={e => {
                  const title = e.target.value;
                  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                  setForm({ ...form, title, slug });
                }} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Slug</label>
              <Input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRESS_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Template</label>
              <Select value={form.templateId} onValueChange={(val) => setForm({ ...form, templateId: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Template 1 - Standard Classic</SelectItem>
                  <SelectItem value="2">Template 2 - Modern Magazine</SelectItem>
                  <SelectItem value="3">Template 3 - Minimalist Hero</SelectItem>
                  <SelectItem value="4">Template 4 - Sidebar Layout</SelectItem>
                  <SelectItem value="5">Template 5 - Immersive Visual</SelectItem>
                  <SelectItem value="6">Template 6 - Author Focus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Post Content</label>
            <ReactQuill 
              theme="snow" 
              value={form.content} 
              onChange={val => setForm({ ...form, content: val })} 
              className="bg-white rounded-md mb-12 h-[350px]"
            />
          </div>

          <div className="space-y-2 mt-12">
            <label className="text-sm font-medium">Cover Image</label>
            <Input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)} />
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
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-6 bg-white border rounded-xl shadow-sm">
            <div className="text-sm font-medium text-blue-600 mb-2">{form.category}</div>
            <h1 className="text-3xl font-bold mb-4">{form.title || 'Untitled Post'}</h1>
            <div className="prose max-w-none whitespace-pre-wrap">{form.content || 'No content yet...'}</div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Close Preview</Button>
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
            <TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading posts...</TableCell></TableRow>
            ) : posts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No blog posts published yet.</TableCell></TableRow>
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
                  {p.publishedAt ? format(new Date(p.publishedAt), 'PP p') : 
                   p.createdAt ? format(new Date(p.createdAt), 'PP') : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p._id)}>Delete</Button>
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
  { id: 'email', label: 'Email Engine', icon: Mail },
  { id: 'automations', label: 'Automations', icon: Send },
  { id: 'leads', label: 'Audience & Leads', icon: Users },
  { id: 'bookings', label: 'Bookings & Schedules', icon: CalendarDays },
  { id: 'production', label: 'Production Board', icon: BookOpen },
  { id: 'authors', label: 'Author Directory', icon: LayoutDashboard },
  { id: 'events', label: 'Events Management', icon: CalendarDays },
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r bg-card flex flex-col shrink-0">
        <div className="p-6 border-b">
          <h1 className="font-bold text-lg text-foreground">Eyelight CRM</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{admin.name || 'Admin'}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'email' && <EmailTab />}
        {activeTab === 'automations' && <AutomationsTab />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'production' && <ProductionTab />}
        {activeTab === 'authors' && <AuthorsTab />}
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'press' && <PressTab />}
      </main>
    </div>
  );
}
