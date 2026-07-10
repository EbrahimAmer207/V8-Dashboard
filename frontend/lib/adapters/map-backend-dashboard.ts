import type {
  DashboardMetric,
  DashboardSnapshot,
  HelpRequest,
  HelpRequestStatus,
  HelpRequestType,
  NotificationItem,
} from '@/lib/dashboard-data';

/** Shape returned by Nest `DashboardService.getSnapshot()` */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendDashboardToFrontend(raw: any): DashboardSnapshot {
  const metrics = Array.isArray(raw.metrics)
    ? raw.metrics.map((m: any) => ({
        id: String(m.id),
        label: String(m.label),
        value: Number(m.value) || 0,
        previousValue: Number(m.previousValue) ?? 0,
        delta: Number(m.delta) ?? 0,
        tone: m.tone ?? 'sky',
        suffix: m.suffix,
        prefix: m.prefix,
        description: String(m.description ?? ''),
      }))
    : [];

  const rot = Array.isArray(raw.requestsOverTime) ? raw.requestsOverTime : [];
  const res = Array.isArray(raw.resolution) ? raw.resolution : [];
  const timeline = rot.map((row: any, i: number) => ({
    label: String(row.label ?? ''),
    incoming: Number(row.total ?? row.medical + row.psychological + row.service) || 0,
    resolved: Number(res[i]?.resolved) || 0,
  }));

  const shares = Array.isArray(raw.categoryShares) ? raw.categoryShares : [];
  const categories = shares.map((c: any, i: number) => ({
    id: `cat-${i}`,
    label: String(c.label),
    value: Number(c.value) || 0,
    color: String(c.color ?? '#94a3b8'),
  }));

  const peakRows = Array.isArray(raw.peak) ? raw.peak : [];
  const activityPeaks = peakRows.map((p: any) => {
    const vals = [p.Mon, p.Tue, p.Wed, p.Thu, p.Fri].map((v: any) => Number(v) || 0);
    const requests = Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1));
    return {
      label: String(p.hour ?? ''),
      requests,
      activeAdmins: Math.max(8, Math.round(requests * 0.45)),
    };
  });

  const mapReqStatus = (s: string): HelpRequestStatus => {
    const v = String(s);
    if (v === 'Rejected') return 'Rejected';
    if (v === 'In Progress' || v === 'Approved') return 'In Progress';
    if (v === 'Completed') return 'Completed';
    return 'Pending';
  };

  const requests: HelpRequest[] = Array.isArray(raw.requests)
    ? raw.requests.map((r: any) => ({
        id: String(r.id),
        user: String(r.user ?? 'Anonymous'),
        type: (r.category ?? r.type ?? 'Psychological') as HelpRequestType,
        title: String(r.title ?? ''),
        priority: r.priority ?? 'Medium',
        status: mapReqStatus(r.status),
        assignedTo: r.assignedTo,
        submittedAt: String(r.submittedAt ?? ''),
      }))
    : [];

  const mapNotifPriority = (p: string): NotificationItem['priority'] => {
    const x = String(p).toLowerCase();
    if (x === 'critical') return 'critical';
    if (x === 'high') return 'high';
    if (x === 'low') return 'low';
    return 'medium';
  };

  const notifications: NotificationItem[] = Array.isArray(raw.notifications)
    ? raw.notifications.map((n: any) => ({
        id: String(n.id),
        title: String(n.title ?? ''),
        body: String(n.body ?? ''),
        relativeTime: String(n.relativeTime ?? ''),
        priority: mapNotifPriority(n.priority ?? 'normal'),
        unread: Boolean(n.unread),
      }))
    : [];

  const activities = Array.isArray(raw.activities)
    ? raw.activities.map((a: any) => ({
        id: String(a.id),
        actor: String(a.actor ?? ''),
        title: String(a.title ?? ''),
        description: String(a.description ?? ''),
        relativeTime: String(a.relativeTime ?? ''),
        accent: (a.accent ?? 'sky') as 'sky' | 'emerald' | 'amber' | 'rose',
      }))
    : [];

  const health = Array.isArray(raw.health)
    ? raw.health.map((h: any) => {
        const st = String(h.status ?? 'operational');
        let status: 'healthy' | 'degraded' | 'down' = 'healthy';
        if (st === 'degraded' || st === 'watching') status = 'degraded';
        if (st === 'down' || st === 'outage') status = 'down';
        return { name: String(h.label ?? h.name ?? 'Service'), status };
      })
    : [];

  const pending = metrics.find((m: DashboardMetric) => m.id === 'pending-requests');
  const slaAlerts =
    pending && pending.value > 0
      ? [
          {
            id: 'sla-derived',
            title: 'Queue attention',
            detail: `${pending.value} help requests are still pending triage.`,
            severity: pending.value > 5 ? ('critical' as const) : ('warning' as const),
            caseIds: [] as string[],
          },
        ]
      : [];

  return {
    metrics,
    timeline: timeline.length ? timeline : [{ label: '—', incoming: 0, resolved: 0 }],
    categories: categories.length ? categories : [{ id: 'n', label: 'N/A', value: 0, color: '#64748b' }],
    activityPeaks: activityPeaks.length ? activityPeaks : [{ label: '—', requests: 0, activeAdmins: 0 }],
    requests,
    notifications,
    activities,
    health,
    slaAlerts,
    updatedAt: new Date().toISOString(),
  };
}
