'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  Database,
  FileText,
  FolderOpen,
  GripHorizontal,
  Inbox,
  MessageSquare,
  Mic,
  Share2,
  Stethoscope,
  Users,
} from 'lucide-react';
import { type DashboardMetric } from '@/lib/dashboard-data';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

const metricIcons: Record<string, React.ElementType> = {
  'total-users': Users,
  'total-doctors': Stethoscope,
  'pending-requests': Inbox,
  'upcoming-sessions': Calendar,
  'active-cases': FolderOpen,
  'community-posts': Share2,
  'avg-response': Clock,
  'total-records': Database,
  'total-reports': FileText,
  'media-library': BookOpen,
  'total-podcasts': Mic,
};


const toneConfig: Record<
  DashboardMetric['tone'],
  { shell: string; iconShell: string; iconColor: string; glow: string }
> = {
  sky: {
    shell: 'border-[rgba(49,94,251,0.08)] bg-[var(--bg-elevated)] dark:border-white/8',
    iconShell: 'bg-[var(--accent-soft)] dark:bg-white/8',
    iconColor: 'text-[var(--accent-strong)] dark:text-sky-300',
    glow: 'rgba(49,94,251,0.1)',
  },
  emerald: {
    shell: 'border-emerald-200/40 bg-[var(--bg-elevated)] dark:border-emerald-400/10',
    iconShell: 'bg-emerald-50 dark:bg-emerald-400/10',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    glow: 'rgba(16,185,129,0.1)',
  },
  amber: {
    shell: 'border-amber-200/40 bg-[var(--bg-elevated)] dark:border-amber-400/10',
    iconShell: 'bg-amber-50 dark:bg-amber-400/10',
    iconColor: 'text-amber-600 dark:text-amber-300',
    glow: 'rgba(245,158,11,0.1)',
  },
  rose: {
    shell: 'border-rose-200/40 bg-[var(--bg-elevated)] dark:border-rose-400/10',
    iconShell: 'bg-rose-50 dark:bg-rose-400/10',
    iconColor: 'text-rose-600 dark:text-rose-300',
    glow: 'rgba(244,63,94,0.1)',
  },
};

function formatMetricValue(metric: DashboardMetric, value: number) {
  if (metric.suffix === 'h') return `${value.toFixed(1)}${metric.suffix}`;
  if (metric.suffix === '%') return `${value.toFixed(0)}${metric.suffix}`;
  if (metric.prefix === '$') {
    return `$${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
  }
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function AnimatedCounter({ metric }: { metric: DashboardMetric }) {
  const [display, setDisplay] = useState(metric.previousValue);
  const ref = useRef(metric.previousValue);

  useEffect(() => {
    const control = animate(ref.current, metric.value, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (value) => {
        ref.current = value;
        setDisplay(value);
      },
    });
    return () => control.stop();
  }, [metric.value]);

  return (
    <span className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
      {formatMetricValue(metric, display)}
    </span>
  );
}

const metricUrls: Record<string, string> = {
  'total-users': '/users',
  'total-doctors': '/therapists',
  'pending-requests': '/operations?tab=requests',
  'upcoming-sessions': '/operations?tab=sessions',
  'active-cases': '/operations?tab=cases',
  'community-posts': '/social',
  'total-records': '/clinical',
  'total-reports': '/clinical',
  'media-library': '/content',
  'total-podcasts': '/podcasts',
};

function SortableMetricCard({ metric, index }: { metric: DashboardMetric; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: metric.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };
  const Icon = metricIcons[metric.id] ?? Users;
  const positive = metric.delta >= 0;
  const tone = toneConfig[metric.tone];
  const url = metricUrls[metric.id];

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-sm)] transition-all duration-200',
        tone.shell,
        isDragging && 'ring-2 ring-[var(--border-focus)]',
        url && !isDragging && 'hover:border-[var(--accent-soft)] hover:shadow-[var(--shadow-md)] cursor-pointer'
      )}
      style={{ boxShadow: isDragging ? `0 16px 40px ${tone.glow}` : undefined }}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2.5 top-2.5 z-10 cursor-grab rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] p-1.5 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--text-primary)] active:cursor-grabbing group-hover:opacity-100"
      >
        <GripHorizontal className="h-3 w-3" />
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)]', tone.iconShell)}>
            <Icon className={cn('h-4 w-4', tone.iconColor)} />
          </div>
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2 py-0.5 text-[11px] font-semibold',
              positive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300',
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(metric.delta).toFixed(1)}%
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {metric.label}
          </p>
          <div className="mt-1">
            <AnimatedCounter metric={metric} />
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[var(--text-tertiary)]">{metric.description}</p>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={cn('relative touch-none group', isDragging && 'opacity-80')}
    >
      {url && !isDragging ? (
        <Link href={url}>{content}</Link>
      ) : (
        content
      )}
    </motion.div>
  );
}

export function MetricsGrid({ metrics: initial }: { metrics: DashboardMetric[] }) {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    setItems((current) => {
      const updated = current.map((item) => initial.find((entry) => entry.id === item.id) ?? item);
      const added = initial.filter((item) => !current.find((entry) => entry.id === item.id));
      return [...updated, ...added];
    });
  }, [initial]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((current) => {
        const oldIndex = current.findIndex((item) => item.id === active.id);
        const newIndex = current.findIndex((item) => item.id === over.id);
        return arrayMove(current, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map((metric, index) => (
            <SortableMetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </section>
      </SortableContext>
    </DndContext>
  );
}
