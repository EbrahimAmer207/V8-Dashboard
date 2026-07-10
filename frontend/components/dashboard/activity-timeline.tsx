'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem } from '@/lib/dashboard-data';

const accentRing: Record<ActivityItem['accent'], string> = {
  sky: 'from-sky-500 to-cyan-400',
  emerald: 'from-emerald-500 to-teal-400',
  amber: 'from-amber-500 to-orange-400',
  rose: 'from-rose-500 to-fuchsia-400',
};

export function ActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="rounded-[30px] border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <CardHeader>
        <CardTitle>Activity timeline</CardTitle>
        <CardDescription>Structured audit motion for accountability, handoffs, and trust.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-2">
          <div className="absolute bottom-2 left-[16px] top-2 w-px bg-gradient-to-b from-slate-300 via-slate-200 to-transparent dark:from-white/20 dark:via-white/10" />
          <ul className="space-y-5">
            {activities.map((activity, index) => (
              <motion.li
                key={activity.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4"
              >
                <div
                  className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full bg-gradient-to-br ${accentRing[activity.accent]} shadow-[0_0_18px_rgba(49,94,251,0.24)] ring-4 ring-white dark:ring-slate-950`}
                />
                <div className="min-w-0 flex-1 rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{activity.title}</p>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      {activity.relativeTime}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{activity.description}</p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    {activity.actor}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
