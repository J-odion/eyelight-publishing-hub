import React, { useState } from 'react';
import { AuthApi } from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', passwordPlain: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.login(form);
      const { access_token, user } = res.data;
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.');
        return;
      }
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      navigate('/admin/crm');
    } catch (err) {
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
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Eyelight Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access the internal dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              required
              value={form.passwordPlain}
              onChange={(e) => setForm({ ...form, passwordPlain: e.target.value })}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Default: admin@eyelight.com / Admin@Eyelight2025
        </p>
      </div>
    </div>
  );
}
