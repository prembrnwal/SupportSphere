import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Ticket as TicketIcon, Inbox, Loader2, CheckCircle2, ArrowUpRight, BarChart2 } from 'lucide-react';
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
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/dummyData';
import { formatDate } from '@/lib/utils';
import type { TicketPriority } from '@/types';

const COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#e11d48', '#8b5cf6', '#10b981'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: tickets, isLoading, isError, refetch } = useTicketsList();
  const { data: users, isLoading: usersLoading } = useUsersList();

  const totalTickets = tickets?.length ?? 0;
  const openCount = tickets?.filter((t) => t.status === 'open').length ?? 0;
  const inProgressCount = tickets?.filter((t) => t.status === 'in_progress').length ?? 0;
  const closedCount = tickets?.filter((t) => t.status === 'closed').length ?? 0;

  // Accurate Live Category Distribution Calculation
  const categoryData = tickets
    ? Object.entries(
        tickets.reduce<Record<string, number>>((acc, t) => {
          const label = CATEGORY_LABELS[t.category] || t.category;
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  // Accurate Live Priority Distribution Calculation
  const priorityData = tickets
    ? (['low', 'medium', 'high', 'urgent'] as TicketPriority[]).map((p) => ({
        name: PRIORITY_LABELS[p] || p,
        value: tickets.filter((t) => t.priority === p).length,
      }))
    : [];

  // Accurate Live Status Distribution Calculation
  const statusData = tickets
    ? [
        { name: 'Open', value: openCount },
        { name: 'In Progress', value: inProgressCount },
        { name: 'Closed', value: closedCount },
      ]
    : [];

  const recentTickets = tickets
    ? [...tickets].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 10)
    : [];

  const statCards = [
    { label: 'Total Users', value: users?.length ?? 0, icon: Users, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40', loading: usersLoading, to: '/admin/users' },
    { label: 'Total Tickets', value: totalTickets, icon: TicketIcon, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40', loading: isLoading, to: '/tickets' },
    { label: 'Open Tickets', value: openCount, icon: Inbox, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40', loading: isLoading, to: '/tickets' },
    { label: 'In Progress', value: inProgressCount, icon: Loader2, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', loading: isLoading, to: '/tickets' },
    { label: 'Closed Tickets', value: closedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', loading: isLoading, to: '/tickets' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Analytics & Operations</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time analytics, status breakdown, and ticket management dashboard.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s, i) =>
          s.loading ? (
            <CardSkeleton key={s.label} />
          ) : (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
              <Link to={s.to} className="block group">
                <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group-hover:border-teal-400 dark:group-hover:border-teal-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                      <s.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold mt-3 text-slate-900 dark:text-white">{s.value}</p>
                </Card>
              </Link>
            </motion.div>
          )
        )}
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          
          {/* Priority Distribution Bar Chart (Clickable) */}
          <Link to="/tickets" className="block group lg:col-span-1">
            <Card className="h-full hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group-hover:border-teal-400 dark:group-hover:border-teal-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Tickets by Priority</h2>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
              {isLoading ? (
                <div className="skeleton h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-white/10" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 13 }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      <Cell fill="#10b981" />
                      <Cell fill="#0284c7" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#e11d48" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Link>

          {/* Category Distribution Bar Chart (Clickable) */}
          <Link to="/tickets" className="block group lg:col-span-1">
            <Card className="h-full hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group-hover:border-teal-400 dark:group-hover:border-teal-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Tickets by Category</h2>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
              {isLoading ? (
                <div className="skeleton h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-white/10" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
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
          </Link>

          {/* Status Breakdown Pie Chart (Clickable) */}
          <Link to="/tickets" className="block group lg:col-span-1">
            <Card className="h-full hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group-hover:border-teal-400 dark:group-hover:border-teal-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Tickets Status Breakdown</h2>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
              {isLoading ? (
                <div className="skeleton h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                      <Cell fill="#0284c7" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Link>
        </div>
      )}

      {/* Live Recent Tickets Table (Every Row 100% Clickable) */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Live System Tickets</h2>
          <Link to="/tickets" className="text-sm text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1">
            View All Tickets <ArrowUpRight className="h-4 w-4" />
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
                  <TR
                    key={t.id}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="cursor-pointer hover:bg-teal-50/60 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <TD>
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
                        {t.ticketNumber}
                      </span>
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
