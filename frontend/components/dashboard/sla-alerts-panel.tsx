'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { SlaAlertItem } from '@/lib/dashboard-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/workspace';

export function SlaAlertsPanel({ alerts }: { alerts: SlaAlertItem[] }) {
  return (
    <Card className="rounded-[30px] border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500 dark:text-amber-300" />
            SLA and risk
          </CardTitle>
          <CardDescription>Issues that need a decision in the next few minutes.</CardDescription>
        </div>
        <Badge variant="warning">{alerts.length} open</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <EmptyState
            title="No active SLA breaches"
            description="The calmer empty state makes healthy periods feel intentional instead of unfinished."
            icon={ShieldAlert}
          />
        ) : (
          alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border ${
                  alert.severity === 'critical'
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-300/18 dark:bg-rose-300/10 dark:text-rose-100'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/18 dark:bg-amber-300/10 dark:text-amber-100'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{alert.title}</p>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : 'warning'}>{alert.severity}</Badge>
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{alert.detail}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Cases: {alert.caseIds.join(', ')}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
