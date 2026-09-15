import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CrmApi, LeadsApi, ProjectsApi, AuthorsApi, EventsApi, PressApi } from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', content: '', audienceTags: '', scheduledFor: '' });

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await CrmApi.getCampaigns();
      setCampaigns(res.data);
    } catch { toast.error('Failed to load campaigns'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        audienceTags: form.audienceTags.split(',').map(t => t.trim()).filter(Boolean),
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
      setForm({ subject: '', content: '', audienceTags: '', scheduledFor: '' });
      fetchCampaigns();
    } catch { toast.error('Failed to save campaign'); }
  };

  const handleEdit = (c: any) => {
    setForm({
      subject: c.subject,
      content: c.content,
      audienceTags: c.audienceTags ? c.audienceTags.join(', ') : '',
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
      fetchCampaigns();
    } catch { toast.error('Failed to delete campaign'); }
  };

  const handleSendNow = async (id: string) => {
    if (!window.confirm('Are you sure you want to send this campaign right now?')) return;
    try {
      await CrmApi.sendCampaignNow(id);
      toast.success('Campaign dispatched successfully!');
      fetchCampaigns();
    } catch { toast.error('Failed to dispatch campaign'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Email Engine</h2>
        <Button size="sm" onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditId(null);
            setForm({ subject: '', content: '', audienceTags: '', scheduledFor: '' });
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
            <ReactQuill 
              theme="snow" 
              value={form.content} 
              onChange={val => setForm({ ...form, content: val })} 
              className="bg-white rounded-md mb-12 h-64"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience (comma separated)</label>
              <Input placeholder="e.g. Author, Newsletter" value={form.audienceTags} onChange={e => setForm({ ...form, audienceTags: e.target.value })} />
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
            <TableHead>Scheduled / Sent</TableHead>
            <TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No campaigns yet.</TableCell></TableRow>
            ) : campaigns.map((c: any) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium">{c.subject}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Sent' ? 'bg-green-100 text-green-700' : c.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{c.status}</span>
                </TableCell>
                <TableCell>{c.audienceTags?.join(', ') || 'All'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {c.status === 'Sent' && c.sentAt ? format(new Date(c.sentAt), 'PP p') :
                   c.status === 'Scheduled' && c.scheduledFor ? format(new Date(c.scheduledFor), 'PP p') : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c._id)}>Delete</Button>
                    {c.status !== 'Sent' && (
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

function LeadsTab() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [importCsv, setImportCsv] = useState('');

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await LeadsApi.getAllLeads();
      setLeads(res.data);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleImport = async () => {
    if (!importCsv.trim()) return;
    try {
      const lines = importCsv.trim().split('\n');
      const newLeads = lines.map(line => {
        const [name, email] = line.split(',').map(s => s.trim());
        return { name: name || 'Unknown', email, type: 'Newsletter' };
      }).filter(l => l.email);

      await LeadsApi.importBulk(newLeads);
      toast.success(`Successfully imported ${newLeads.length} leads!`);
      setShowImport(false);
      setImportCsv('');
      fetchLeads();
    } catch { toast.error('Failed to import leads'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Leads & Audience</h2>
        <Button size="sm" onClick={() => setShowImport(!showImport)}>
          <Plus className="w-4 h-4 mr-2" /> {showImport ? 'Cancel Import' : 'Import List'}
        </Button>
      </div>

      {showImport && (
        <div className="bg-card border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-medium mb-2">Import CSV (Format: Name, Email)</h3>
          <Textarea 
            placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com" 
            className="min-h-[120px] mb-4 font-mono text-sm"
            value={importCsv}
            onChange={e => setImportCsv(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowImport(false)}>Cancel</Button>
            <Button onClick={handleImport}>Import Leads</Button>
          </div>
        </div>
      )}
      <div className="text-sm text-muted-foreground mb-4">{leads.length} total</div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : leads.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No leads captured yet.</TableCell></TableRow>
            ) : leads.map((l: any) => (
              <TableRow key={l._id}>
                <TableCell className="font-medium">{l.name || '—'}</TableCell>
                <TableCell>{l.email}</TableCell>
                <TableCell>{l.phone || '—'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${l.type === 'Newsletter' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{l.type}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {l.createdAt ? format(new Date(l.createdAt), 'PP') : '—'}
                </TableCell>
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
              <p className="text-sm font-medium">{ev.registrations?.length || 0} Registered</p>
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
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
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
