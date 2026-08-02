import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, LayoutGrid, List, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';
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
  ConfirmDialog,
} from '@/components/ui';
import { useTicketsList, useUpdateTicketStatus, useDeleteTicket } from '@/hooks/useTickets';
import { useAuthStore } from '@/store/authStore';
import { CATEGORY_LABELS } from '@/lib/dummyData';
import { formatDate } from '@/lib/utils';
import type { TicketStatus, TicketPriority, Ticket } from '@/types';

const PAGE_SIZE = 8;

export function MyTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { data: allTickets, isLoading, isError, refetch } = useTicketsList();
  const updateStatus = useUpdateTicketStatus();
  const deleteTicket = useDeleteTicket();

  const [view, setView] = useState<'card' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'all'>('all');
  const [priority, setPriority] = useState<TicketPriority | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [page, setPage] = useState(1);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  // If Admin, display all tickets across system; if Customer, display user's tickets
  const baseTickets = useMemo(() => {
    if (!allTickets) return [];
    if (isAdmin) return allTickets;
    return allTickets.filter((t) => t.createdBy === user?.name || t.createdBy === user?.email);
  }, [allTickets, isAdmin, user]);

  const filtered = useMemo(() => {
    let result = [...baseTickets];
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
  }, [baseTickets, search, status, priority, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleMarkFinished = async (ticket: Ticket) => {
    try {
      await updateStatus.mutateAsync({ id: ticket.id, status: 'closed', actor: user?.name || 'Admin' });
      toast.success(`Ticket ${ticket.ticketNumber} marked as finished`);
    } catch {
      toast.error('Failed to update ticket status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;
    try {
      await deleteTicket.mutateAsync(ticketToDelete.id);
      toast.success(`Ticket ${ticketToDelete.ticketNumber} deleted`);
      setTicketToDelete(null);
    } catch {
      toast.error('Failed to delete ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isAdmin ? 'All Tickets Management' : 'My Tickets'}
          </h1>
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
              { value: 'closed', label: 'Closed / Finished' },
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
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${view === 'table' ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <List className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setView('card')}
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${view === 'card' ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
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
              {['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Created', 'Actions'].map((h) => (
                <TH key={h}>{h}</TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={7} />
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
              {isAdmin && <TH className="text-right">Admin Actions</TH>}
            </TR>
          </THead>
          <TBody>
            {paginated.map((t) => (
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
                <TD>
                  <span className="font-medium text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    {t.title}
                  </span>
                </TD>
                <TD>{CATEGORY_LABELS[t.category] || t.category}</TD>
                <TD>
                  <PriorityBadge priority={t.priority} />
                </TD>
                <TD>
                  <StatusBadge status={t.status} />
                </TD>
                <TD className="text-slate-400">{formatDate(t.createdAt)}</TD>
                {isAdmin && (
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {t.status !== 'closed' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkFinished(t);
                          }}
                          title="Mark Finished"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Finish</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTicketToDelete(t);
                        }}
                        title="Delete Ticket"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
        </Table>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((t) => (
            <Card key={t.id} className="h-full flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400">{t.ticketNumber}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <Link to={`/tickets/${t.id}`}>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-teal-600 transition-colors">
                    {t.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-400 mb-4">{CATEGORY_LABELS[t.category] || t.category}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <StatusBadge status={t.status} />
                {isAdmin ? (
                  <div className="flex items-center gap-1">
                    {t.status !== 'closed' && (
                      <button
                        type="button"
                        onClick={() => handleMarkFinished(t)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Mark Finished"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setTicketToDelete(t)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Ticket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">{formatDate(t.createdAt)}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={!!ticketToDelete}
        onClose={() => setTicketToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Ticket"
        description={`Are you sure you want to delete ticket ${ticketToDelete?.ticketNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
