'use client';

import React, { useState } from 'react';
import { Bell, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageIntro, SectionCard, StatCard } from '@/components/ui/workspace';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUser({ ...user, ...formData });
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <PageIntro
            eyebrow="Workspace settings"
            title="Personal preferences and account posture"
            description="Tighten profile details, review account posture, and keep sensitive controls visually separate from the everyday edits."
            meta={<Badge variant="muted">Local profile updates only</Badge>}
          />

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Role" value={user?.role ?? '—'} icon={ShieldCheck} tone="brand" />
            <StatCard label="Status" value="Active" icon={UserRound} tone="success" meta="Workspace access is currently enabled" />
            <StatCard label="Email" value={user?.email ?? '—'} icon={Bell} tone="neutral" meta="Verification remains server-enforced" />
          </section>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <SectionCard
              title="Profile details"
              description="Keep your name accurate for assignments, notifications, and handoff visibility."
            >
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <span>First name</span>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <span>Last name</span>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <span>Email</span>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="opacity-80"
                  />
                  <p className="text-xs text-slate-500">Email changes require verification and remain server-controlled.</p>
                </label>

                <Button type="submit">Save profile</Button>
              </form>
            </SectionCard>

            <div className="space-y-5">
              <SectionCard title="Account posture" description="High-signal details that should be glanceable and not buried.">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="text-slate-600 dark:text-slate-400">Current role</span>
                    <Badge variant="default">{user?.role ?? '—'}</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="text-slate-600 dark:text-slate-400">Access status</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/90 p-4 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                    Sensitive permissions, password policy, and audit requirements remain enforced by backend logic.
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Notification routing" description="A cleaner placeholder for future per-channel control.">
                <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/90 p-5 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                  Add email, SMS, and push routing here in the next iteration without changing the existing backend contract.
                </div>
              </SectionCard>
            </div>
          </div>

          <SectionCard title="Security" description="Keep password changes visually distinct from profile edits so the flow feels safer and more deliberate.">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <span>Current password</span>
                <Input type="password" />
              </label>
              <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <span>New password</span>
                <Input type="password" />
              </label>
              <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <span>Confirm password</span>
                <Input type="password" />
              </label>
            </div>
            <div className="mt-5">
              <Button variant="secondary" type="button">
                <Lock className="h-4 w-4" />
                Update password
              </Button>
            </div>
          </SectionCard>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
