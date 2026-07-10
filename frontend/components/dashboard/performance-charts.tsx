'use client';

import { ArcElement, CategoryScale, Chart as ChartJS, ChartData, ChartOptions, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestsByCategory, RequestsTimelineView } from '@/lib/dashboard-data';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

interface PerformanceChartsProps {
  timeline: RequestsTimelineView[];
  categories: RequestsByCategory[];
}

export function PerformanceCharts({ timeline, categories }: PerformanceChartsProps) {
  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animations: {
      tension: { duration: 1000, easing: 'linear' },
      y: { duration: 400, easing: 'easeOutQuart' },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          boxWidth: 8,
          usePointStyle: true,
          font: { family: 'inherit', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.14)', drawTicks: false },
        ticks: { color: '#94a3b8', font: { family: 'inherit' }, padding: 8 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.14)', drawTicks: false },
        ticks: { color: '#94a3b8', font: { family: 'inherit' }, padding: 12 },
        border: { display: false },
        beginAtZero: true,
      },
    },
    interaction: { mode: 'index', intersect: false },
  };

  const lineData: ChartData<'line'> = {
    labels: timeline.map((point) => point.label),
    datasets: [
      {
        label: 'Incoming requests',
        data: timeline.map((point) => point.incoming),
        borderColor: '#315efb',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(49,94,251,0)');
          gradient.addColorStop(1, 'rgba(49,94,251,0.22)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#315efb',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Resolved cases',
        data: timeline.map((point) => point.resolved),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#10b981',
      },
    ],
  };

  const doughnutData: ChartData<'doughnut'> = {
    labels: categories.map((item) => item.label),
    datasets: [
      {
        data: categories.map((item) => item.value),
        backgroundColor: categories.map((item) => item.color),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  return (
    <section className="grid gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-8 rounded-[30px] border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Demand versus resolution</CardTitle>
            <CardDescription>
              The chart now emphasizes the comparison that matters most: incoming pressure against completed work.
            </CardDescription>
          </div>
          <Badge variant="default">Live timeline</Badge>
        </CardHeader>
        <CardContent className="h-[340px] pt-4">
          <Line data={lineData} options={lineOptions} />
        </CardContent>
      </Card>

      <Card className="xl:col-span-4 rounded-[30px] border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
        <CardHeader>
          <CardTitle>Category mix</CardTitle>
          <CardDescription>Active request distribution by domain.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[340px] flex-col items-center justify-center p-6">
          <div className="relative h-full w-full max-h-[220px]">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '74%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', padding: 18, usePointStyle: true },
                  },
                  tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                  },
                },
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
                {categories.reduce((total, item) => total + item.value, 0)}
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Weighted share</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
