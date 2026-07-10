'use client';

import { AreaChart, Bolt, Download, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const actions = [
  {
    icon: FileText,
    title: 'Executive summary',
    description: 'Auto-curated narrative focused on forecast movement, risk, and next steps.',
  },
  {
    icon: AreaChart,
    title: 'Board deck appendix',
    description: 'Slides ready charts and annotations for leadership review and investor updates.',
  },
  {
    icon: Bolt,
    title: 'Live operations snapshot',
    description: 'Detailed system posture with anomalies, health trends, and active owner actions.',
  },
];

export function ReportDialog({ open, onOpenChange }: ReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <Badge variant="default" className="w-fit">
            Premium workflow
          </Badge>
          <DialogTitle>Generate a polished leadership brief</DialogTitle>
          <DialogDescription>
            Pick the report package you want to prepare from the connected operational data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {actions.map((action) => (
            <div
              key={action.title}
              className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/14 dark:hover:bg-white/[0.06]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(49,94,251,0.12)] bg-[rgba(49,94,251,0.08)] text-[var(--accent-strong)] dark:border-white/10 dark:bg-white/[0.08] dark:text-sky-100">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{action.title}</p>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            <Download className="h-4 w-4" />
            Export brief
            <Share2 className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
