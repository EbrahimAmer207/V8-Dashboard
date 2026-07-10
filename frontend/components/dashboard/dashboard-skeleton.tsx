import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonGridProps {
  cols?: number;
  count?: number;
  height?: string;
  className?: string;
}

function SkeletonGrid({ cols = 4, count = 4, height = 'h-32', className }: SkeletonGridProps) {
  return (
    <div className={cn('grid gap-3', className)} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn('rounded-[var(--radius-lg)]', height)} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Banner Skeleton */}
      <Skeleton className="h-64 rounded-[var(--radius-xl)]" />
      
      {/* Metrics Row */}
      <SkeletonGrid cols={3} count={3} height="h-36" className="xl:grid-cols-3" />
      
      {/* Main Content Split */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Skeleton className="h-96 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-[var(--radius-md)]" />
          <Skeleton className="h-8 w-24 rounded-[var(--radius-md)]" />
        </div>
        <Skeleton className="h-[400px] rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}
