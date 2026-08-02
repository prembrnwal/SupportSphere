import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserCog, Search } from 'lucide-react';
import { Card, Input, Select, Button, StatusBadge, PriorityBadge, EmptyState, ErrorState, ListSkeleton } from '@/components/ui';
import { useTicketsList, useAssignTicket } from '@/hooks/useTickets';
import { useAgents } from '@/hooks/useUsers';
import { CATEGORY_LABELS } from '@/lib/dummyData';
import { formatDate } from '@/lib/utils';

export function AssignTicketsPage() {
  const { data: tickets, isLoading, isError, refetch } = useTicketsList();
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const assignTicket = useAssignTicket();
  const [search, setSearch] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<Record<string, string>>({});

  const unassigned = tickets?.filter((t) => t.status !== 'closed') ?? [];
  const filtered = unassigned.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.toLowerCase()));

  const handleAssign = async (ticketId: string) => {
    const agent = selectedAgents[ticketId];
    if (!agent) {
      toast.error('Please select an agent first');
      return;
    }
    try {
      await assignTicket.mutateAsync({ id: ticketId, agent });
      toast.success(`Ticket assigned to ${agent}`);
    } catch {
      toast.error('Failed to assign ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Assign Tickets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Route open and in-progress tickets to the right support agent.
        </p>
      </div>

      <Card className="!p-4">
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || agentsLoading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UserCog className="h-6 w-6" />}
          title="No tickets to assign"
          description="All active tickets already have agents assigned. New tickets will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-400">{t.ticketNumber}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{t.title}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {CATEGORY_LABELS[t.category]} · Created {formatDate(t.createdAt)}
                  {t.assignedAgent && <> · Currently: <span className="text-slate-600 dark:text-slate-300">{t.assignedAgent}</span></>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
                <Select
                  placeholder="Select agent"
                  className="min-w-[160px]"
                  value={selectedAgents[t.id] || ''}
                  onChange={(e) => setSelectedAgents((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  options={(agents ?? []).map((a) => ({ value: a.name, label: a.name }))}
                />
                <Button size="md" onClick={() => handleAssign(t.id)} loading={assignTicket.isPending}>
                  Assign
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
