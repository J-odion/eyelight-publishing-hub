import React, { useEffect, useState } from 'react';
import { AnalyticsApi } from '../lib/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  GraduationCap,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CrmAnalytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState<'all' | 'Success' | 'Abandoned' | 'Failed'>('all');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data } = await AnalyticsApi.getDashboardMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-base font-medium">Loading Dashboard data...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground mb-4">No metrics available.</p>
        <Button onClick={fetchMetrics}>Retry</Button>
      </div>
    );
  }

  const wonRevenue = metrics.wonRevenue || 0;
  const pipelineValue = metrics.pipelineValue || 0;
  const breakdown = metrics.revenueBreakdown || { course: 0, consultation: 0, store: 0, publishing: 0 };
  const txCounts = metrics.transactionCounts || { successful: 0, abandoned: 0, failed: 0, pending: 0, total: 0 };
  const courseStats = metrics.courseStats || { paidStudents: 0, totalApplicants: 0 };
  const consultStats = metrics.consultationStats || { confirmedSessions: 0, totalRequests: 0 };
  const recentTransactions = metrics.recentTransactions || [];

  const filteredTransactions = recentTransactions.filter((tx: any) => {
    if (txFilter === 'all') return true;
    return tx.status === txFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
          </span>
        );
      case 'Abandoned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Abandoned
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> {status || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-[1240px] mx-auto text-left">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time business performance, course registrations, 1:1 consultation bookings, and live transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} className="gap-2 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Won Revenue */}
        <Card className="border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Won Revenue (Collected)
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ₦
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₦{wonRevenue.toLocaleString()}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600">
              <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200/60">
                School: ₦{breakdown.course.toLocaleString()}
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200/60">
                1:1: ₦{breakdown.consultation.toLocaleString()}
              </span>
              {breakdown.store > 0 && (
                <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200/60">
                  Store: ₦{breakdown.store.toLocaleString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Value (Open) */}
        <Card className="border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pipeline Value (Open)
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₦{pipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Potential revenue from {txCounts.abandoned} abandoned and {txCounts.pending} pending checkouts.
            </p>
          </CardContent>
        </Card>

        {/* Course Registrations */}
        <Card className="border-blue-200/80 bg-gradient-to-br from-white to-blue-50/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Editor School (Dec Cohort)
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {courseStats.paidStudents}{' '}
              <span className="text-sm font-normal text-slate-500 font-sans">paid students</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {courseStats.totalApplicants} total registration leads logged in CRM.
            </p>
          </CardContent>
        </Card>

        {/* 1:1 Consultations */}
        <Card className="border-purple-200/80 bg-gradient-to-br from-white to-purple-50/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-purple-800">
              1:1 Consultations
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {consultStats.confirmedSessions}{' '}
              <span className="text-sm font-normal text-slate-500 font-sans">confirmed sessions</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {consultStats.totalRequests} consultation requests logged in CRM.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Health Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Successful</div>
            <div className="text-xl font-bold font-mono text-slate-900">{txCounts.successful}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Abandoned</div>
            <div className="text-xl font-bold font-mono text-slate-900">{txCounts.abandoned}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Failed</div>
            <div className="text-xl font-bold font-mono text-slate-900">{txCounts.failed}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Checkout Attempts</div>
            <div className="text-xl font-bold font-mono text-slate-900">{txCounts.total}</div>
          </div>
        </div>
      </div>

      {/* Live Transactions Stream */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Live Transactions Stream
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instant capture of all payment attempts (Successful, Abandoned, and Failed).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTxFilter('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                txFilter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({recentTransactions.length})
            </button>
            <button
              onClick={() => setTxFilter('Success')}
              className={`px-3 py-1 rounded-md transition-all ${
                txFilter === 'Success' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Successful ({txCounts.successful})
            </button>
            <button
              onClick={() => setTxFilter('Abandoned')}
              className={`px-3 py-1 rounded-md transition-all ${
                txFilter === 'Abandoned' ? 'bg-white shadow-sm text-amber-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Abandoned ({txCounts.abandoned})
            </button>
            <button
              onClick={() => setTxFilter('Failed')}
              className={`px-3 py-1 rounded-md transition-all ${
                txFilter === 'Failed' ? 'bg-white shadow-sm text-rose-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Failed ({txCounts.failed})
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                      No transactions recorded in this category yet.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx: any) => (
                    <tr key={tx._id || tx.reference} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(tx.paidAt || tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {tx.customerName || 'Anonymous Client'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{tx.customerEmail}</div>
                        {tx.customerPhone && (
                          <div className="text-[11px] text-slate-400">{tx.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-[220px] truncate text-slate-700 text-xs font-medium">
                        {tx.purpose}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        ₦{Number(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(tx.status)}</td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-400 select-all">
                        {tx.reference}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Audience &amp; Lead Sources</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.contactsBySource || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#82ca9d"
                  label
                >
                  {(metrics.contactsBySource || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Highest Lead Scores */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex justify-between items-center">
            <CardTitle className="text-sm font-semibold">High-Intent Leads (CRM Score)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(metrics.topLeads || []).map((lead: any) => (
                <div
                  key={lead._id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{lead.email}</p>
                    {lead.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {lead.tags.map((t: string) => (
                          <span
                            key={t}
                            className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono text-emerald-600">+{lead.leadScore}</p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Score</p>
                  </div>
                </div>
              ))}
              {(!metrics.topLeads || metrics.topLeads.length === 0) && (
                <p className="text-muted-foreground text-sm text-center py-8">No leads logged yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
