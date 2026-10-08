import React, { useEffect, useState } from 'react';
import { ActivitiesApi, CrmApi } from '../lib/api';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Phone, Mail, Calendar, Edit3, Trash2 } from 'lucide-react';

export default function CrmActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: 'note', subject: '', description: '', contactId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [actRes, contactsRes] = await Promise.all([
        ActivitiesApi.getActivities(),
        CrmApi.getContacts({ limit: 100 })
      ]);
      setActivities(actRes.data);
      setContacts(contactsRes.data.data || []);
    } catch (e) {
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!form.subject) return toast.error('Subject is required');
    if (!form.contactId) return toast.error('Please select a contact to link this activity to');
    try {
      await ActivitiesApi.createActivity({ ...form, date: new Date() });
      toast.success('Activity logged!');
      setForm({ type: 'note', subject: '', description: '', contactId: '' });
      fetchData();
    } catch (e) {
      toast.error('Failed to log activity');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await ActivitiesApi.deleteActivity(id);
      toast.success('Activity deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete activity');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-blue-500" />;
      case 'email': return <Mail className="w-4 h-4 text-green-500" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <Edit3 className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) return <div className="p-10">Loading activities...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
      </div>

      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Log New Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Activity Type</label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Related Contact</label>
              <Select value={form.contactId} onValueChange={v => setForm({ ...form, contactId: v })}>
                <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                <SelectContent>
                  {contacts.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Discovery Call" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Notes / Description</label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Enter details..." className="h-24" />
          </div>
          <Button onClick={handleCreateActivity}>Log Activity</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        {activities.length === 0 ? (
          <p className="text-gray-500">No activities logged yet.</p>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {activities.map((act) => (
              <div key={act._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-indigo-50 text-slate-500 group-[.is-active]:text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  {getIcon(act.type)}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-900 capitalize">
                      {act.type}: {act.subject}
                    </div>
                    <time className="font-mono text-xs font-medium text-slate-500">{format(new Date(act.date), 'MMM d, p')}</time>
                  </div>
                  {act.contactId && (
                    <div className="text-xs font-semibold text-indigo-600 mb-2">
                      Linked to: {act.contactId.firstName} {act.contactId.lastName}
                    </div>
                  )}
                  <div className="text-sm text-slate-500 mb-2">{act.description}</div>
                  <Button variant="ghost" size="sm" className="text-red-500 h-6 px-2 text-xs" onClick={() => handleDelete(act._id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
