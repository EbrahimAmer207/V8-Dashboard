import type React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('skeleton-shimmer rounded-[16px]', className)} {...props} />;
}

export { Skeleton };
