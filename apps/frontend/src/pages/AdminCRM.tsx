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
  Mail, Users, BookOpen, LayoutDashboard, LogOut, Plus, RefreshCw
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

// ─── Main Admin CRM Shell ─────────────────────────────────────────────────────

const TABS = [
  { id: 'email', label: 'Email Engine', icon: Mail },
  { id: 'leads', label: 'Audience & Leads', icon: Users },
  { id: 'production', label: 'Production Board', icon: BookOpen },
  { id: 'authors', label: 'Author Directory', icon: LayoutDashboard },
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
        {activeTab === 'production' && <ProductionTab />}
        {activeTab === 'authors' && <AuthorsTab />}
      </main>
    </div>
  );
}
