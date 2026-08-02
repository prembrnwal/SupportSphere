import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { TicketPriority, TicketStatus } from '@/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const variants: Record<string, string> = {
  default: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

const statusVariant: Record<TicketStatus, BadgeProps['variant']> = {
  open: 'info',
  in_progress: 'warning',
  closed: 'success',
};
const statusLabel: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </Badge>
  );
}

const priorityVariant: Record<TicketPriority, BadgeProps['variant']> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};
const priorityLabel: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge variant={priorityVariant[priority]}>{priorityLabel[priority]}</Badge>;
}
