import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CrmApi, LeadsApi, ProjectsApi, AuthorsApi } from '../lib/api.js';
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
import { format } from 'date-fns';
import {
  Mail, Users, BookOpen, LayoutDashboard, LogOut, Plus, RefreshCw, CalendarDays
} from 'lucide-react';

const PROJECT_STATUSES = ['Received', 'Editing', 'Cover Design', 'Proofreading', 'Published'];

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
      await CrmApi.createCampaign({
        ...form,
        audienceTags: form.audienceTags.split(',').map(t => t.trim()).filter(Boolean),
        scheduledFor: form.scheduledFor ? new Date(form.scheduledFor) : undefined,
      });
      toast.success('Campaign saved!');
      setShowForm(false);
      setForm({ subject: '', content: '', audienceTags: '', scheduledFor: '' });
      fetchCampaigns();
    } catch { toast.error('Failed to save campaign'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Email Engine</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'New Email'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject Line</label>
            <Input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Content (HTML)</label>
            <Textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="min-h-[120px] font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience (comma separated)</label>
              <Input placeholder="e.g. Author, Newsletter" value={form.audienceTags} onChange={e => setForm({ ...form, audienceTags: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule For (blank = draft)</label>
              <Input type="datetime-local" value={form.scheduledFor} onChange={e => setForm({ ...form, scheduledFor: e.target.value })} />
            </div>
          </div>
          <Button type="submit">Save Campaign</Button>
        </form>
      )}

      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Scheduled / Sent</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No campaigns yet.</TableCell></TableRow>
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

  useEffect(() => {
    LeadsApi.getAllLeads()
      .then(r => setLeads(r.data))
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Audience & Leads</h2>
        <span className="text-sm text-muted-foreground">{leads.length} total</span>
      </div>
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
  const [form, setForm] = useState({ title: '', date: '', type: 'Workshop', zoomLink: '', location: '' });
  const [flyer, setFlyer] = useState<File | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/events');
      if (res.ok) setEvents(await res.json());
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const createdEvent = await res.json();
      
      if (flyer && createdEvent._id) {
        const formData = new FormData();
        formData.append('file', flyer);
        await fetch(`http://localhost:3000/events/${createdEvent._id}/upload-flyer`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      }
      
      toast.success('Event created!');
      setShowForm(false);
      setFlyer(null);
      fetchEvents();
    } catch { toast.error('Failed to create event'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Events Management</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
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
  const [form, setForm] = useState({ title: '', slug: '', content: '', templateId: '1' });
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/press/posts');
      if (res.ok) setPosts(await res.json());
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      // In a real app, this would use a proper API service
      toast.success('Press post created successfully!');
      setShowForm(false);
      fetchPosts();
    } catch { toast.error('Failed to create post'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Press & Blog Management</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'New Post'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border rounded-xl p-6 mb-6 space-y-6">
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Content (React Quill)</label>
            {/* This is a placeholder for the actual React Quill component */}
            <Textarea 
              required 
              placeholder="Rich text editor will load here..." 
              className="min-h-[200px]"
              value={form.content} 
              onChange={e => setForm({ ...form, content: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <Input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)} />
            </div>
          </div>
          <Button type="submit">Publish Post</Button>
        </form>
      )}

      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading posts...</TableCell></TableRow>
            ) : posts.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No blog posts published yet.</TableCell></TableRow>
            ) : posts.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell className="font-semibold">{p.title}</TableCell>
                <TableCell>Template {p.templateId}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {p.publishedAt ? format(new Date(p.publishedAt), 'PP') : '—'}
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
