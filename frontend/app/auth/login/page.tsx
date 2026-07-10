'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, TimerReset } from 'lucide-react';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth.service';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FEATURES = [
  {
    title: 'Operational clarity',
    description: 'See requests, cases, and live signals in a single calm control surface.',
    icon: ShieldCheck,
  },
  {
    title: 'Fast triage',
    description: 'Keep urgent work visible with polished workflows and less interface noise.',
    icon: TimerReset,
  },
  {
    title: 'Trusted coordination',
    description: 'Support admins, moderators, and providers with shared context and tight access control.',
    icon: Sparkles,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      localStorage.removeItem('auth');
      const response = await authService.login(formData);
      
      const rawData = response.data as any;
      const dataPayload = rawData && typeof rawData === 'object' 
        ? (rawData.data ? rawData.data : rawData)
        : rawData;
      
      const token = typeof dataPayload === 'string'
        ? dataPayload
        : (dataPayload?.token || dataPayload?.accessToken || dataPayload?.tokenString);

      if (!token || typeof token !== 'string') {
        throw new Error('No authentication token returned from server');
      }

      const claims = parseJwt(token) || {};
      
      const rawName = claims.given_name || 
                      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || 
                      claims.name || 
                      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                      claims.unique_name || 
                      '';
      
      const cleanRawName = rawName.includes('@') ? rawName.split('@')[0] : rawName;
      const nameParts = cleanRawName.trim().split(/\s+/);
      const fallbackFirstName = nameParts[0] || 'Admin';
      const fallbackLastName = nameParts.slice(1).join(' ') || 'User';

      const user = dataPayload?.user || {
        id: claims.nameid || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || claims.sub || 'admin',
        email: claims.email || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || formData.email,
        username: claims.unique_name || claims.sub || 'admin',
        firstName: claims.given_name || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || fallbackFirstName,
        lastName: claims.family_name || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || fallbackLastName,
        role: claims.role || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'ADMIN',
        isActive: true,
      };

      const authData = {
        accessToken: token,
        refreshToken: dataPayload?.refreshToken || token,
        user,
      };

      setAuth(authData);
      router.push('/dashboard');
    } catch (err: any) {
      const raw = err.response?.data?.message || err.response?.data?.error || err.response?.data;
      const message = Array.isArray(raw)
        ? raw.join(', ')
        : (raw && typeof raw === 'object' ? JSON.stringify(raw) : raw) || err.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      eyebrow="Secure access"
      title="Sign in to the operations workspace"
      description="A focused command surface for support requests, case management, and live coordination."
      sideTitle="Operate with less clutter and better judgment."
      sideDescription="This redesign brings stronger hierarchy, calmer surfaces, and clearer action paths so your team can move faster without losing trust."
      features={FEATURES}
      footer={
        <div className="rounded-[22px] border border-[rgba(49,94,251,0.12)] bg-[rgba(49,94,251,0.05)] p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
          <p className="font-semibold text-slate-900 dark:text-white">Database credentials</p>
          <p className="mt-1">
            Use the exact <strong className="font-semibold">Email</strong> or{' '}
            <strong className="font-semibold">UserName</strong> from{' '}
            <code className="rounded bg-slate-200/80 px-1 py-0.5 text-xs dark:bg-white/10">AspNetUsers</code>{' '}
            — placeholders like example.com are not auto-created.
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email or username from your database"
              required
              disabled={loading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
          <span>Using the connected database API</span>
          <button
            type="button"
            onClick={() => setFormData({ email: '', password: '' })}
            className="font-semibold text-[var(--accent-strong)]"
          >
            Clear
          </button>
        </div>

        <Button type="submit" className="h-12 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>
    </AuthShell>
  );
}
