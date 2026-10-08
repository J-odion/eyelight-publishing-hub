import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CrmApi, ActivitiesApi, DealsApi } from '../lib/api';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowLeft, Phone, Mail, Building, Briefcase, MapPin, Star } from 'lucide-react';

export default function ContactProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [contact, setContact] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactRes, activitiesRes, dealsRes] = await Promise.all([
        CrmApi.getContactById(id!),
        ActivitiesApi.getActivities({ contactId: id }),
        DealsApi.getDeals({ contactId: id }),
      ]);
      setContact(contactRes.data);
      setActivities(activitiesRes.data);
      setDeals(dealsRes.data);
    } catch (e) {
      toast.error('Failed to load contact profile');
      navigate('/admin/crm');
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementScore = async () => {
    try {
      await CrmApi.updateLeadScore(id!, 5);
      toast.success('Lead score increased');
      fetchData();
    } catch {
      toast.error('Failed to update score');
    }
  };

  if (loading) return <div className="p-10">Loading profile...</div>;
  if (!contact) return <div className="p-10">Contact not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/admin/crm')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to CRM
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Col: Contact Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{contact.firstName} {contact.lastName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4" /> <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4" /> <span>{contact.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Building className="w-4 h-4" /> <span>{contact.company || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase className="w-4 h-4" /> <span>{contact.jobTitle || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-4 h-4" /> <span>{contact.address || '—'}</span>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                  <Star className="w-5 h-5 fill-current" />
                  Lead Score: {contact.leadScore || 0}
                </div>
                <Button size="sm" variant="outline" onClick={handleIncrementScore}>+5</Button>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {contact.tags?.map((t: string) => (
                    <span key={t} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{t}</span>
                  ))}
                  {!contact.tags?.length && <span className="text-sm text-gray-400">No tags</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Activities & Deals */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <p className="text-gray-500 text-sm">No deals linked to this contact.</p>
              ) : (
                <div className="space-y-4">
                  {deals.map(deal => (
                    <div key={deal._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{deal.title}</p>
                        <p className="text-sm text-gray-500 capitalize">Stage: {deal.stage}</p>
                      </div>
                      <p className="font-bold text-green-600">${deal.value?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm">No activities logged yet.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map(act => (
                    <div key={act._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium capitalize">{act.type}: {act.subject}</span>
                        <span className="text-xs text-gray-400">{format(new Date(act.date), 'PP p')}</span>
                      </div>
                      <p className="text-sm text-gray-600">{act.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
