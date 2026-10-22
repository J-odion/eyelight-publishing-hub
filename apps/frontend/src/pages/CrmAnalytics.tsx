import React, { useEffect, useState } from 'react';
import { AnalyticsApi, LeadsApi, PaymentsApi } from '../lib/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  TrendingUp,
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Check,
  CreditCard,
  Users,
} from 'lucide-react';

export default function CrmAnalytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [courseLeads, setCourseLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState<'all' | 'Success' | 'Pending' | 'Abandoned' | 'Failed'>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, leadsRes] = await Promise.all([
        AnalyticsApi.getDashboardMetrics(),
        LeadsApi.getAllLeads().catch(() => ({ data: [] })),
      ]);
      setMetrics(metricsRes.data);
      const schoolLeads = (leadsRes.data || [])
        .filter((l: any) => l.type === 'CourseRegistration')
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setCourseLeads(schoolLeads);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
      toast.error('Failed to update dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (lead: any) => {
    if (!window.confirm(`Mark ${lead.name || lead.email} as PAID (₦15,500)?\nThis updates Collected Revenue, sets Paid status, and sends the Course Confirmation email.`)) {
      return;
    }
    try {
      await PaymentsApi.markPaid({
        email: lead.email,
        name: lead.name,
        phone: lead.phone,
        amount: 15500,
        purpose: 'The Book Editor Business School (December Cohort)',
        type: 'editor-school',
        sendEmail: true,
      });
      toast.success(`Payment recorded for ${lead.name || lead.email}! Dashboard updated.`);
      fetchDashboardData();
    } catch (e) {
      toast.error('Failed to record payment');
    }
  };

  if (loading && !metrics) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[350px] text-muted-foreground">
        <RefreshCw className="w-7 h-7 animate-spin text-slate-700 mb-3" />
        <p className="text-sm font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  const wonRevenue = metrics?.wonRevenue || 0;
  const pipelineValue = metrics?.pipelineValue || 0;
  const breakdown = metrics?.revenueBreakdown || { course: 0, consultation: 0, store: 0 };
  const txCounts = metrics?.transactionCounts || { successful: 0, abandoned: 0, failed: 0, pending: 0, total: 0 };
  const courseStats = metrics?.courseStats || { totalApplicants: 0, paidStudents: 0 };
  const consultStats = metrics?.consultationStats || { totalRequests: 0, confirmedSessions: 0 };
  const recentTransactions = metrics?.recentTransactions || [];

  const filteredTransactions = recentTransactions.filter((tx: any) => {
    if (txFilter === 'all') return true;
    if (txFilter === 'Success') return tx.status === 'Success';
    if (txFilter === 'Pending') return tx.status === 'Pending';
    if (txFilter === 'Abandoned') return tx.status === 'Abandoned';
    if (txFilter === 'Failed') return tx.status === 'Failed';
    return true;
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
          </span>
        );
      case 'Abandoned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Abandoned
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> {status || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time revenue, course registrations, and payment transactions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading} className="h-8 text-xs gap-1.5 shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Collected Revenue */}
        <Card className="border-emerald-200/80 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
            <span>Collected Revenue</span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/50">NGN</span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            ₦{wonRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex gap-2">
            <span>School: ₦{breakdown.course.toLocaleString()}</span>
            <span>·</span>
            <span>1:1: ₦{breakdown.consultation.toLocaleString()}</span>
          </div>
        </Card>

        {/* Pipeline Value */}
        <Card className="border-amber-200/80 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
            <span>Pipeline (Pending)</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            ₦{pipelineValue.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {txCounts.pending} pending checkout(s)
          </div>
        </Card>

        {/* Editor School */}
        <Card className="border-blue-200/80 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">
            <span>Editor School (Dec)</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {courseStats.paidStudents} <span className="text-sm font-semibold text-slate-500 font-sans">Paid</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {courseStats.totalApplicants} registered applicant(s)
          </div>
        </Card>

        {/* 1:1 Consultations */}
        <Card className="border-purple-200/80 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-800 uppercase tracking-wider mb-2">
            <span>1:1 Consultations</span>
            <CalendarCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {consultStats.confirmedSessions} <span className="text-sm font-semibold text-slate-500 font-sans">Confirmed</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {consultStats.totalRequests} total request(s)
          </div>
        </Card>
      </div>

      {/* Course Registrations Summary Table */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900">Recent Course Registrations (December Cohort)</h2>
            <span className="text-xs text-muted-foreground font-mono">({courseLeads.length})</span>
          </div>
          <div className="text-xs text-slate-500">
            Fee: ₦15,500 / seat
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-3">Applicant</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {courseLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No course applicants yet.
                  </td>
                </tr>
              ) : (
                courseLeads.slice(0, 8).map((lead: any) => {
                  const status = lead.metadata?.status || 'incomplete';
                  const isPaid = status === 'paid';
                  const isAwaiting = status === 'registered_unpaid' || status === 'complete' || status === 'pending_payment';
                  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
                  const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}` : null;

                  return (
                    <tr key={lead._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {lead.name || 'Anonymous'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        <div>{lead.email}</div>
                        {lead.phone && <div className="text-slate-400">{lead.phone}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, h:mm a') : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPaid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Paid / Confirmed
                          </span>
                        ) : isAwaiting ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                            Awaiting Payment
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Incomplete / Abandoned
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkPaid(lead)}
                              className="h-6 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                              title="Confirm offline transfer / mark as paid"
                            >
                              <Check className="w-3 h-3 mr-1" /> Mark Paid
                            </Button>
                          )}
                          {whatsappLink && (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center h-6 px-2 rounded bg-green-600 hover:bg-green-700 text-white text-[11px] font-medium transition-colors"
                            >
                              WhatsApp
                            </a>
                          )}
                          <a
                            href={`mailto:${lead.email}?subject=Regarding Your Registration with Eyelight Publishing`}
                            className="inline-flex items-center h-6 px-2 rounded border border-border hover:bg-slate-100 text-[11px] font-medium transition-colors"
                          >
                            Email
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Transactions Stream */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900">Payment Attempts</h2>
          </div>

          {/* Filter Pills with Embedded Counts */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTxFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                txFilter === 'all' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({recentTransactions.length})
            </button>
            <button
              onClick={() => setTxFilter('Success')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                txFilter === 'Success' ? 'bg-white shadow-sm text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Successful ({txCounts.successful})
            </button>
            <button
              onClick={() => setTxFilter('Pending')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                txFilter === 'Pending' ? 'bg-white shadow-sm text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({txCounts.pending})
            </button>
            <button
              onClick={() => setTxFilter('Abandoned')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                txFilter === 'Abandoned' ? 'bg-white shadow-sm text-amber-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Abandoned ({txCounts.abandoned})
            </button>
            <button
              onClick={() => setTxFilter('Failed')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                txFilter === 'Failed' ? 'bg-white shadow-sm text-rose-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Failed ({txCounts.failed})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 font-mono">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    No transactions matching "{txFilter}".
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {tx.createdAt ? format(new Date(tx.createdAt), 'MMM d, h:mm a') : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{tx.customerName || 'Anonymous'}</div>
                      <div className="font-mono text-[11px] text-slate-500">{tx.customerEmail}</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-600">
                      {tx.purpose || 'Payment'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      ₦{tx.amount?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {renderStatusBadge(tx.status)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                      {tx.reference}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
