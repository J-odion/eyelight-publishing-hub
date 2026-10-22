import React, { useEffect, useState } from 'react';
import { DealsApi, CrmApi } from '../lib/api';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export default function DealsPipeline() {
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [form, setForm] = useState({ title: '', value: 0, contactId: '', stage: 'open' });

  // Hardcoded stages for demo purposes (usually fetched from a Pipeline model)
  const stages = ['open', 'won', 'lost'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dealsRes, contactsRes] = await Promise.all([
        DealsApi.getDeals(),
        CrmApi.getContacts({ limit: 100 })
      ]);
      setDeals(dealsRes.data);
      setContacts(contactsRes.data.data || []);
    } catch (e) {
      toast.error('Failed to fetch pipeline data');
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (id: string, newStage: string) => {
    try {
      await DealsApi.updateDealStage(id, newStage);
      toast.success('Deal updated');
      fetchData();
    } catch (e) {
      toast.error('Failed to update deal');
    }
  };

  const handleCreateDeal = async () => {
    if (!form.title || !form.contactId) return toast.error('Title and Contact are required');
    try {
      await DealsApi.createDeal(form);
      toast.success('Deal created!');
      setShowAddDeal(false);
      setForm({ title: '', value: 0, contactId: '', stage: 'open' });
      fetchData();
    } catch (e) {
      toast.error('Failed to create deal');
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading pipeline...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track publishing deals through your pipeline stages.</p>
        </div>
        <Button size="sm" onClick={() => setShowAddDeal(true)}><Plus className="w-4 h-4 mr-2" /> Add Deal</Button>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-72 sm:w-80 bg-gray-100 rounded-lg p-4">
            <h2 className="text-base font-semibold capitalize mb-3 text-gray-700">
              {stage} ({deals.filter(d => d.stage === stage).length})
            </h2>
            <div className="space-y-3">
              {deals.filter(d => d.stage === stage).map(deal => (
                <Card key={deal._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="p-3.5 pb-2">
                    <CardTitle className="text-sm font-semibold">{deal.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    <p className="text-xl font-bold font-mono text-emerald-600">₦{deal.value?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {deal.contactId?.firstName} {deal.contactId?.lastName}
                    </p>
                    
                    <div className="mt-4 flex gap-2">
                      {stages.filter(s => s !== stage).map(s => (
                        <Button 
                          key={s} 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => updateStage(deal._id, s)}
                        >
                          Move to {s}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAddDeal} onOpenChange={setShowAddDeal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New Deal</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Deal Title</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enterprise Plan" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estimated Value ($)</label>
              <Input type="number" value={form.value} onChange={e => setForm({ ...form, value: +e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Related Contact</label>
              <Select value={form.contactId} onValueChange={v => setForm({ ...form, contactId: v })}>
                <SelectTrigger><SelectValue placeholder="Select a contact" /></SelectTrigger>
                <SelectContent>
                  {contacts.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDeal(false)}>Cancel</Button>
            <Button onClick={handleCreateDeal}>Save Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
