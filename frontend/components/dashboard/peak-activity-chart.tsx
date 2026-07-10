'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarController, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PeakActivity } from '@/lib/dashboard-data';

ChartJS.register(BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function PeakActivityChart({ peaks }: { peaks: PeakActivity[] }) {
  const data = useMemo(
    () => ({
      labels: peaks.map((peak) => peak.label),
      datasets: [
        {
          label: 'Requests',
          data: peaks.map((peak) => peak.requests),
          backgroundColor: 'rgba(49, 94, 251, 0.28)',
          borderColor: 'rgba(49, 94, 251, 0.9)',
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 28,
        },
        {
          label: 'Active admins',
          data: peaks.map((peak) => peak.activeAdmins),
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 0.85)',
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 28,
        },
      ],
    }),
    [peaks],
  );

  return (
    <Card className="rounded-[30px] border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Peak activity windows</CardTitle>
          <CardDescription>Compare demand spikes with staffing coverage to plan smoother rotations.</CardDescription>
        </div>
        <Badge variant="muted">Local time</Badge>
      </CardHeader>
      <CardContent className="h-[300px] pt-2">
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: { color: '#94a3b8', boxWidth: 10, usePointStyle: true },
              },
              tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                grid: { color: 'rgba(148,163,184,0.14)' },
                ticks: { color: '#94a3b8' },
                border: { display: false },
              },
              y: {
                grid: { color: 'rgba(148,163,184,0.14)' },
                ticks: { color: '#94a3b8' },
                border: { display: false },
                beginAtZero: true,
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
