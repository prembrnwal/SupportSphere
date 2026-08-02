import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Inbox, Loader2, CheckCircle2, Ticket as TicketIcon, ArrowUpRight } from 'lucide-react';
import { Button, Card, CardSkeleton, EmptyState, ErrorState, StatusBadge, PriorityBadge } from '@/components/ui';
import { useTicketsList } from '@/hooks/useTickets';
import { useAuthStore } from '@/store/authStore';
import { timeAgo, formatDate } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/dummyData';

const statCards = [
  { key: 'open', label: 'Open Tickets', icon: Inbox, color: 'text-sky-500 bg-sky-50 dark:bg-sky-500/10' },
  { key: 'in_progress', label: 'In Progress', icon: Loader2, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  { key: 'closed', label: 'Closed', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
  { key: 'total', label: 'Total Tickets', icon: TicketIcon, color: 'text-brand-500 bg-brand-50 dark:bg-brand-500/10' },
];

export function CustomerDashboard() {
  const { user } = useAuthStore();
  const { data: allTickets, isLoading, isError, refetch } = useTicketsList();

  const tickets = allTickets?.filter((t) => t.createdBy === user?.name) ?? [];
  const counts = {
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
    total: tickets.length,
  };

  const recent = [...tickets]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with your support tickets.
          </p>
        </div>
        <Link to="/tickets/create">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create Ticket
          </Button>
        </Link>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : statCards.map((s, i) => (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="hover:-translate-y-0.5 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
                        <s.icon className="h-4.5 w-4.5" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold mt-3 text-slate-900 dark:text-white">
                      {counts[s.key as keyof typeof counts]}
                    </p>
                  </Card>
                </motion.div>
              ))}
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
          <Link to="/tickets" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description="You haven't created any support tickets. Start by describing your issue and we'll take it from there."
            actionLabel="Create your first ticket"
            onAction={() => (window.location.href = '/tickets/create')}
          />
        ) : (
          <div className="space-y-2">
            {recent.map((t) => (
              <Link
                key={t.id}
                to={`/tickets/${t.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-xl border border-slate-100 dark:border-white/10 p-4 hover:border-brand-200 dark:hover:border-brand-500/30 hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{t.ticketNumber}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{t.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {CATEGORY_LABELS[t.category]} · Updated {timeAgo(t.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
