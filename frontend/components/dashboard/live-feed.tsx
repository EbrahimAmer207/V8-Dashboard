'use client';

import { motion } from 'framer-motion';
import { Bell, Clock3, Sparkle, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/workspace';
import { type ActivityItem, type NotificationItem } from '@/lib/dashboard-data';

const accentStyles: Record<ActivityItem['accent'], string> = {
  sky: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-300/18 dark:bg-sky-300/10 dark:text-sky-100',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/18 dark:bg-emerald-300/10 dark:text-emerald-100',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/18 dark:bg-amber-300/10 dark:text-amber-100',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-300/18 dark:bg-rose-300/10 dark:text-rose-100',
};

const priorityBadge: Record<NotificationItem['priority'], 'danger' | 'warning' | 'muted'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'muted',
  low: 'muted',
};

export function LiveFeed({
  activities,
  notifications,
  unreadCount,
  onMarkAllRead,
  onArchiveNotification,
}: {
  activities: ActivityItem[];
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onArchiveNotification: (id: string) => void;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-7 rounded-[30px] border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Escalations, resolutions, and operator movement across the workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="When the stream is quiet, this area should still feel intentionally designed."
              icon={Clock3}
            />
          ) : (
            <ScrollArea className="h-[360px] pr-2">
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{activity.actor.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{activity.title}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {activity.description}
                            </p>
                          </div>
                          <Badge className={accentStyles[activity.accent]} variant="muted">
                            {activity.actor}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {activity.relativeTime}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-5 rounded-[30px] border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Realtime alerts</CardTitle>
            <CardDescription>Operational signals for SLA, capacity, and queue health.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={unreadCount > 0 ? 'danger' : 'muted'}>
              <Bell className="h-3.5 w-3.5" />
              {unreadCount} unread
            </Badge>
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <EmptyState
              title="All caught up"
              description="No live alerts are waiting on the current snapshot."
              icon={Bell}
            />
          ) : (
            <ScrollArea className="h-[360px] pr-2">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(49,94,251,0.12)] bg-[rgba(49,94,251,0.08)] text-[var(--accent-strong)] dark:border-white/10 dark:bg-white/[0.08] dark:text-sky-100">
                        <Sparkle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{notification.title}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {notification.body}
                            </p>
                          </div>
                          <Badge variant={priorityBadge[notification.priority]}>{notification.priority}</Badge>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                            {notification.relativeTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => onArchiveNotification(notification.id)}
                            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400 dark:hover:text-white"
                            aria-label={`Archive ${notification.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
