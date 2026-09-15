import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthorApi, AuthApi, ReferralsApi } from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock, LogOut, BookOpen, CreditCard, User, Gift, Copy, Check } from 'lucide-react';

const STAGES = ['Received', 'Editing', 'Cover Design', 'Proofreading', 'Published'];

function StageIcon({ status, stage }: { status: string; stage: string }) {
  const currentIdx = STAGES.indexOf(status);
  const stageIdx = STAGES.indexOf(stage);
  if (stageIdx < currentIdx) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (stageIdx === currentIdx) return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
  return <Circle className="w-5 h-5 text-muted-foreground/40" />;
}

function StageLabel({ status, stage }: { status: string; stage: string }) {
  const currentIdx = STAGES.indexOf(status);
  const stageIdx = STAGES.indexOf(stage);
  if (stageIdx < currentIdx) return 'Completed';
  if (stageIdx === currentIdx) return 'In Progress';
  return 'Upcoming';
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Author Login subcomponent
function AuthorLogin({ onLogin }: { onLogin: () => void }) {
  const [form, setForm] = useState({ email: '', passwordPlain: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.login(form);
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('portal_user', JSON.stringify(res.data.user));
      onLogin();
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-4">
            <BookOpen className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Author Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to track your book's progress</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input type="password" required value={form.passwordPlain} onChange={e => setForm({ ...form, passwordPlain: e.target.value })} />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Don't have an account? <a href="/submit-manuscript" className="text-accent underline">Submit your manuscript</a> to get started.
        </p>
      </div>
    </div>
  );
}

// Main Portal Dashboard
function PortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const portalUser = JSON.parse(localStorage.getItem('portal_user') || '{}');

  useEffect(() => {
    AuthorApi.getPortal()
      .then(r => setData(r.data))
      .catch(() => {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('portal_user');
        navigate('/portal');
      })
      .finally(() => setLoading(false));

    ReferralsApi.getMyInfo()
      .then(r => setReferralData(r.data))
      .catch(() => {});
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('portal_user');
    navigate('/portal');
    window.location.reload();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadProjectId) return;
    
    // Validate file type
    const fileExt = uploadFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'doc' && fileExt !== 'docx') {
      toast.error('Only .doc or .docx files are allowed.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/users/upload-manuscript-file/${uploadProjectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      toast.success('Manuscript version uploaded successfully!');
      setUploadProjectId(null);
      setUploadFile(null);
      
      // Refresh portal data
      AuthorApi.getPortal().then(r => setData(r.data));
    } catch (error) {
      toast.error('Failed to upload manuscript.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading your dashboard...</p>
    </div>
  );

  if (!data) return null;

  const { author, projects, payments } = data;
  const totalPaid = payments.filter((p: any) => p.status === 'Success').reduce((acc: number, p: any) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">My Eyelight Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {author.name?.split(' ')[0]}.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><BookOpen className="w-4 h-4" /> My Books</div>
            <p className="text-3xl font-bold">{projects.length}</p>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><CreditCard className="w-4 h-4" /> Total Paid</div>
            <p className="text-3xl font-bold">₦{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><User className="w-4 h-4" /> Account</div>
            <p className="text-sm font-semibold truncate">{author.email}</p>
          </div>
        </div>

        {/* Each Project */}
        {projects.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">You don't have any projects yet.</p>
            <Button className="mt-4" onClick={() => navigate('/submit-manuscript')}>Submit a Manuscript</Button>
          </div>
        ) : projects.map((project: any) => (
          <div key={project._id} className="bg-card border rounded-xl overflow-hidden">
            {/* Project Header */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{project.bookTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1">{project.genre}{project.wordCount ? ` · ${Number(project.wordCount).toLocaleString()} words` : ''}</p>
            </div>

            {/* Progress Tracker */}
            <div className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Project Progress</h3>
              <div className="space-y-3">
                {STAGES.map((stage) => (
                  <div key={stage} className="flex items-center gap-3">
                    <StageIcon status={project.status} stage={stage} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{stage}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${STAGES.indexOf(project.status) > STAGES.indexOf(stage) ? 'bg-green-100 text-green-700' :
                        STAGES.indexOf(project.status) === STAGES.indexOf(stage) ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'}`}>
                      <StageLabel status={project.status} stage={stage} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Details */}
            {project.bookDescription && (
              <div className="px-6 pb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Book Description</h3>
                <p className="text-sm text-muted-foreground">{project.bookDescription}</p>
              </div>
            )}

            {/* Manuscript Versions (Phase 1) */}
            <div className="px-6 pb-6 border-t pt-6 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Manuscript Versions</h3>
                <Button size="sm" variant="outline" onClick={() => setUploadProjectId(project._id)}>Upload New Version</Button>
              </div>
              
              {project.versions && project.versions.length > 0 ? (
                <div className="space-y-2">
                  {project.versions.map((v: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-background border p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium">Version {i + 1}</p>
                          <p className="text-xs text-muted-foreground">Uploaded: {new Date(v.uploadedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={v.fileUrl} target="_blank" rel="noreferrer">Download</a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center p-4 border border-dashed rounded-lg">No manuscript versions uploaded yet.</p>
              )}
            </div>
          </div>
        ))}

        {/* Referral Program */}
        {referralData && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-accent" /> Refer an Author</h2>
            <div className="bg-card border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-4">Share your unique referral link. When someone signs up and publishes through Eyelight, you earn a publishing credit.</p>
              <div className="flex items-center gap-2 mb-4">
                <input
                  readOnly
                  value={referralData.referralLink}
                  className="flex-1 px-3 py-2 bg-muted border rounded-lg text-sm font-mono text-foreground"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(referralData.referralLink);
                    setCopied(true);
                    toast.success('Referral link copied!');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-2xl font-bold">{referralData.stats.totalReferred}</p>
                  <p className="text-xs text-muted-foreground">Referred</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-2xl font-bold">{referralData.stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-2xl font-bold">₦{referralData.stats.totalCredits.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Credits Earned</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Payment History</h2>
            <div className="bg-card border rounded-xl divide-y">
              {payments.map((p: any) => (
                <div key={p._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">₦{p.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{p.purpose}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${p.status === 'Success' ? 'bg-green-100 text-green-700' :
                      p.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Dialog open={!!uploadProjectId} onOpenChange={(open) => !open && setUploadProjectId(null)}>
        <DialogContent>
          <form onSubmit={handleUpload}>
            <DialogHeader>
              <DialogTitle>Upload Manuscript Version</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <label className="block text-sm font-medium mb-2">Select File (.doc or .docx)</label>
              <Input type="file" accept=".doc,.docx" required onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground mt-2">This will not overwrite your previous versions. It will be added as a new version with today's date.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setUploadProjectId(null)}>Cancel</Button>
              <Button type="submit" disabled={!uploadFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload Version'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main export: switches between login/dashboard
export default function AuthorPortal() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('access_token') && !!localStorage.getItem('portal_user'));

  if (!loggedIn) return <AuthorLogin onLogin={() => setLoggedIn(true)} />;
  return <PortalDashboard />;
}
