import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, LayoutGrid, List, PlusCircle, ArrowUpDown } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Pagination,
  EmptyState,
  ErrorState,
  StatusBadge,
  PriorityBadge,
  TableRowSkeleton,
} from '@/components/ui';
import { useTicketsList } from '@/hooks/useTickets';
import { useAuthStore } from '@/store/authStore';
import { CATEGORY_LABELS } from '@/lib/dummyData';
import { formatDate } from '@/lib/utils';
import type { TicketStatus, TicketPriority } from '@/types';

const PAGE_SIZE = 6;

export function MyTicketsPage() {
  const { user } = useAuthStore();
  const { data: allTickets, isLoading, isError, refetch } = useTicketsList();
  const [view, setView] = useState<'card' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'all'>('all');
  const [priority, setPriority] = useState<TicketPriority | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [page, setPage] = useState(1);

  const myTickets = allTickets?.filter((t) => t.createdBy === user?.name) ?? [];

  const filtered = useMemo(() => {
    let result = [...myTickets];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q));
    }
    if (status !== 'all') result = result.filter((t) => t.status === status);
    if (priority !== 'all') result = result.filter((t) => t.priority === priority);

    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (sort === 'newest') result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === 'oldest') result.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    if (sort === 'priority') result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return result;
  }, [myTickets, search, status, priority, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filtered.length} ticket{filtered.length !== 1 && 's'} found
          </p>
        </div>
        <Link to="/tickets/create">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create Ticket
          </Button>
        </Link>
      </div>

      <Card className="!p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by title or ticket ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className="lg:max-w-xs"
          />
          <Select
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'closed', label: 'Closed' },
            ]}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TicketStatus | 'all');
              resetPage();
            }}
            className="lg:max-w-[160px]"
          />
          <Select
            options={[
              { value: 'all', label: 'All priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as TicketPriority | 'all');
              resetPage();
            }}
            className="lg:max-w-[160px]"
          />
          <Select
            options={[
              { value: 'newest', label: 'Newest first' },
              { value: 'oldest', label: 'Oldest first' },
              { value: 'priority', label: 'Priority' },
            ]}
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="lg:max-w-[160px]"
          />
          <div className="hidden lg:flex items-center gap-1 ml-auto shrink-0">
            <button
              onClick={() => setView('table')}
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${view === 'table' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <List className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setView('card')}
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${view === 'card' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <LayoutGrid className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </Card>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <Table>
          <THead>
            <TR>
              {['ID', 'Title', 'Category', 'Priority', 'Status', 'Created'].map((h) => (
                <TH key={h}>{h}</TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={6} />
            ))}
          </TBody>
        </Table>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No tickets found"
          description="Try adjusting your search or filters, or create a new ticket to get started."
          actionLabel="Create Ticket"
          onAction={() => (window.location.href = '/tickets/create')}
        />
      ) : view === 'table' ? (
        <Table>
          <THead>
            <TR>
              <TH>Ticket ID</TH>
              <TH>Title</TH>
              <TH>Category</TH>
              <TH>Priority</TH>
              <TH>Status</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {paginated.map((t) => (
              <TR key={t.id} className="cursor-pointer">
                <TD>
                  <Link to={`/tickets/${t.id}`} className="font-mono text-xs text-brand-600 dark:text-brand-400 hover:underline">
                    {t.ticketNumber}
                  </Link>
                </TD>
                <TD>
                  <Link to={`/tickets/${t.id}`} className="font-medium text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {t.title}
                  </Link>
                </TD>
                <TD>{CATEGORY_LABELS[t.category]}</TD>
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
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((t) => (
            <Link key={t.id} to={`/tickets/${t.id}`}>
              <Card className="h-full hover:-translate-y-1 hover:shadow-glow transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400">{t.ticketNumber}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">{t.title}</h3>
                <p className="text-xs text-slate-400 mb-4">{CATEGORY_LABELS[t.category]}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-slate-400">{formatDate(t.createdAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
