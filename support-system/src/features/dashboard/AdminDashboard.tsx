import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Ticket as TicketIcon, Inbox, CheckCircle2, ArrowUpRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardSkeleton, Table, THead, TBody, TR, TH, TD, StatusBadge, PriorityBadge, ErrorState, TableRowSkeleton } from '@/components/ui';
import { useTicketsList } from '@/hooks/useTickets';
import { useUsersList } from '@/hooks/useUsers';
import { CATEGORY_LABELS } from '@/lib/dummyData';
import { formatDate } from '@/lib/utils';

const COLORS = ['#6366f1', '#38bdf8', '#f59e0b', '#ef4444', '#10b981', '#a78bfa'];

export function AdminDashboard() {
  const { data: tickets, isLoading, isError, refetch } = useTicketsList();
  const { data: users, isLoading: usersLoading } = useUsersList();

  const counts = {
    total: tickets?.length ?? 0,
    open: tickets?.filter((t) => t.status === 'open').length ?? 0,
    closed: tickets?.filter((t) => t.status === 'closed').length ?? 0,
  };

  const categoryData = tickets
    ? Object.entries(
        tickets.reduce<Record<string, number>>((acc, t) => {
          const label = CATEGORY_LABELS[t.category];
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  const statusData = tickets
    ? [
        { name: 'Open', value: tickets.filter((t) => t.status === 'open').length },
        { name: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length },
        { name: 'Closed', value: tickets.filter((t) => t.status === 'closed').length },
      ]
    : [];

  const recentTickets = tickets
    ? [...tickets].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8)
    : [];

  const statCards = [
    { label: 'Total Users', value: users?.length ?? 0, icon: Users, color: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10', loading: usersLoading },
    { label: 'Total Tickets', value: counts.total, icon: TicketIcon, color: 'text-brand-500 bg-brand-50 dark:bg-brand-500/10', loading: isLoading },
    { label: 'Open', value: counts.open, icon: Inbox, color: 'text-sky-500 bg-sky-50 dark:bg-sky-500/10', loading: isLoading },
    { label: 'Closed', value: counts.closed, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', loading: isLoading },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of support operations across your organization.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) =>
          s.loading ? (
            <CardSkeleton key={s.label} />
          ) : (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Card className="hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                </div>
                <p className="text-3xl font-bold mt-3 text-slate-900 dark:text-white">{s.value}</p>
              </Card>
            </motion.div>
          )
        )}
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Tickets by Category</h2>
            {isLoading ? (
              <div className="skeleton h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-white/10" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 13 }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Tickets by Status</h2>
            {isLoading ? (
              <div className="skeleton h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={[COLORS[1], COLORS[2], COLORS[4]][i]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Tickets</h2>
          <Link to="/admin/assign" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
            Assign tickets <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Ticket ID</TH>
              <TH>Title</TH>
              <TH>Created By</TH>
              <TH>Priority</TH>
              <TH>Status</TH>
              <TH>Date</TH>
            </TR>
          </THead>
          <TBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : recentTickets.map((t) => (
                  <TR key={t.id}>
                    <TD>
                      <Link to={`/tickets/${t.id}`} className="font-mono text-xs text-brand-600 dark:text-brand-400 hover:underline">
                        {t.ticketNumber}
                      </Link>
                    </TD>
                    <TD className="font-medium text-slate-900 dark:text-white max-w-xs truncate">{t.title}</TD>
                    <TD>{t.createdBy}</TD>
                    <TD>
                      <PriorityBadge priority={t.priority} />
                    </TD>
                    <TD>
                      <StatusBadge status={t.status} />
                    </TD>
                    <TD className="text-slate-400">{formatDate(t.createdAt)}</TD>
                  </TR>
                ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
