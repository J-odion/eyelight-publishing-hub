import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthorsApi } from '../lib/api.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, User, BookOpen, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_COLORS: Record<string, string> = {
  Received: 'bg-gray-100 text-gray-700',
  Editing: 'bg-yellow-100 text-yellow-700',
  'Cover Design': 'bg-blue-100 text-blue-700',
  Proofreading: 'bg-purple-100 text-purple-700',
  Published: 'bg-green-100 text-green-700',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Success: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

export default function AuthorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ author: any; projects: any[]; payments: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    AuthorsApi.getProfile(id)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load author profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading author profile...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Author not found.</p>
    </div>
  );

  const { author, projects, payments } = data;
  const totalPaid = payments.filter(p => p.status === 'Success').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-8 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/crm')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-bold text-lg">{author.name}</h1>
          <p className="text-sm text-muted-foreground">{author.email}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${author.isAuthorOnboarded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {author.isAuthorOnboarded ? 'Active Author' : 'Pending Setup'}
          </span>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><BookOpen className="w-4 h-4" /> Books Submitted</div>
            <p className="text-3xl font-bold">{projects.length}</p>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><CreditCard className="w-4 h-4" /> Total Paid</div>
            <p className="text-3xl font-bold">₦{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><User className="w-4 h-4" /> Phone</div>
            <p className="text-xl font-semibold">{author.phone || '—'}</p>
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Books & Projects</h2>
          <div className="bg-card border rounded-xl divide-y">
            {projects.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No manuscripts submitted yet.</p>
            ) : projects.map((p: any) => (
              <div key={p._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{p.bookTitle}</p>
                  <p className="text-sm text-muted-foreground">{p.genre} · {p.wordCount ? `${Number(p.wordCount).toLocaleString()} words` : ''}</p>
                  {p.bookDescription && (
                    <p className="text-sm text-muted-foreground mt-1 max-w-lg line-clamp-2">{p.bookDescription}</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4 space-y-1">
                  <span className={`block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                  <p className="text-xs text-muted-foreground">{p.createdAt ? format(new Date(p.createdAt), 'PP') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Payment History</h2>
          <div className="bg-card border rounded-xl divide-y">
            {payments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No payments recorded.</p>
            ) : payments.map((p: any) => (
              <div key={p._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">₦{p.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{p.purpose}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.reference}</p>
                </div>
                <div className="text-right shrink-0 ml-4 space-y-1">
                  <span className={`block px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                  <p className="text-xs text-muted-foreground">{p.createdAt ? format(new Date(p.createdAt), 'PP') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
