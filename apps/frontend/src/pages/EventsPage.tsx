import React, { useState, useEffect } from 'react';
import { EventsApi } from '../lib/api.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    EventsApi.getAll()
      .then(r => setEvents(r.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (eventId: string) => {
    if (!regForm.name || !regForm.email) {
      toast.error('Name and email are required.');
      return;
    }
    try {
      await EventsApi.register(eventId, regForm);
      toast.success('You are registered! Check your email for confirmation.');
      setRegistering(null);
      setRegForm({ name: '', email: '', phone: '' });
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  const EVENT_TYPE_COLORS: Record<string, string> = {
    Launch: 'bg-green-100 text-green-700',
    Workshop: 'bg-blue-100 text-blue-700',
    Webinar: 'bg-purple-100 text-purple-700',
    BookClub: 'bg-yellow-100 text-yellow-700',
    Masterclass: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 lg:pt-32 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Eyelight <span className="text-accent">Events</span></h1>
          <p className="text-muted-foreground mt-2">Book launches, workshops, webinars, and more.</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No upcoming events. Check back soon!</p>
        ) : (
          <div className="space-y-6">
            {events.map((event: any) => (
              <div key={event._id} className="bg-card border rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-100 text-gray-700'}`}>
                          {event.type}
                        </span>
                        {event.isFreeForAuthors && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">Free for Authors</span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold">{event.title}</h2>
                      {event.description && <p className="text-sm text-muted-foreground mt-2">{event.description}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {event.price > 0 && <p className="text-lg font-bold">₦{event.price.toLocaleString()}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {event.date ? format(new Date(event.date), 'EEEE, MMMM d, yyyy · h:mm a') : '—'}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {event.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> {event.registrations?.length || 0} registered
                    </div>
                  </div>

                  {/* Registration */}
                  {registering === event._id ? (
                    <div className="mt-4 bg-muted rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input placeholder="Name" required value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
                        <Input placeholder="Email" type="email" required value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                        <Input placeholder="Phone (optional)" value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleRegister(event._id)}>Confirm Registration</Button>
                        <Button size="sm" variant="ghost" onClick={() => setRegistering(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="mt-4" size="sm" onClick={() => setRegistering(event._id)}>
                      Register
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
