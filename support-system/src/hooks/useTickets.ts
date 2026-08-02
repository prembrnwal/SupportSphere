import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { dummyTickets } from '@/lib/dummyData';
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/types';

// In-memory store fallback simulating a backend if server is offline
let ticketStore: Ticket[] = [...dummyTickets];

function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function mapBackendTicket(raw: any): Ticket {
  const statusRaw = String(raw.status || 'OPEN').toLowerCase();
  const priorityRaw = String(raw.priority || 'MEDIUM').toLowerCase();

  let status: TicketStatus = 'open';
  if (statusRaw === 'in_progress') status = 'in_progress';
  if (statusRaw === 'resolved' || statusRaw === 'closed') status = 'closed';

  let priority: TicketPriority = 'medium';
  if (priorityRaw === 'low') priority = 'low';
  if (priorityRaw === 'high') priority = 'high';
  if (priorityRaw === 'critical' || priorityRaw === 'urgent') priority = 'urgent';

  return {
    id: raw.id,
    ticketNumber: `TCK-${raw.id.slice(0, 6).toUpperCase()}`,
    title: raw.title,
    description: raw.description,
    category: (raw.category || 'general') as TicketCategory,
    priority,
    status,
    createdBy: raw.creator?.name || raw.creator?.email || 'Customer',
    assignedAgent: raw.assignee?.name || raw.assignee?.email || undefined,
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
    timeline: [
      { id: 'e1', label: 'Ticket registered in database', timestamp: raw.created_at || new Date().toISOString(), actor: raw.creator?.name || 'System' }
    ],
    comments: [],
  };
}

export function useTicketsList() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/v1/tickets');
        if (res.data?.success && res.data?.data) {
          const items = res.data.data.items || res.data.data;
          if (Array.isArray(items)) {
            const mapped = items.map(mapBackendTicket);
            // Combine with local session store for seamless view
            const dbIds = new Set(mapped.map((t) => t.id));
            const merged = [...mapped, ...ticketStore.filter((t) => !dbIds.has(t.id))];
            return merged.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
          }
        }
      } catch {
        // Fallback to local memory if backend is unreachable
      }
      return delay([...ticketStore].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
    },
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await api.get(`/api/v1/tickets/${id}`);
        if (res.data?.success && res.data?.data) {
          return mapBackendTicket(res.data.data);
        }
      } catch {
        // Fallback to memory
      }
      return delay(ticketStore.find((t) => t.id === id) || null);
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string;
      category: TicketCategory;
      priority: TicketPriority;
      createdBy: string;
    }) => {
      try {
        const backendPriority = input.priority === 'urgent' ? 'CRITICAL' : input.priority.toUpperCase();
        const res = await api.post('/api/v1/tickets', {
          title: input.title,
          description: input.description,
          category: input.category,
          priority: backendPriority,
        });

        if (res.data?.success && res.data?.data) {
          const ticket = mapBackendTicket(res.data.data);
          ticketStore = [ticket, ...ticketStore];
          return ticket;
        }
      } catch {
        // Fallback if backend API is offline
      }

      // Memory fallback
      const newTicket: Ticket = {
        id: 't' + (ticketStore.length + 1) + '-' + Date.now(),
        ticketNumber: `TCK-${1000 + ticketStore.length}`,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        status: 'open',
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [{ id: 'e1', label: 'Ticket created', timestamp: new Date().toISOString(), actor: input.createdBy }],
        comments: [],
      };
      ticketStore = [newTicket, ...ticketStore];
      return delay(newTicket, 500);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, actor }: { id: string; status: TicketStatus; actor: string }) => {
      try {
        const backendStatus = status === 'closed' ? 'RESOLVED' : status.toUpperCase();
        await api.put(`/api/v1/tickets/${id}`, { status: backendStatus });
      } catch {
        // Fallback
      }

      ticketStore = ticketStore.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...t.timeline,
                { id: 'e' + (t.timeline.length + 1), label: `Status changed to ${status.replace('_', ' ')}`, timestamp: new Date().toISOString(), actor },
              ],
            }
          : t
      );
      return delay(ticketStore.find((t) => t.id === id), 400);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket', vars.id] });
    },
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, agent }: { id: string; agent: string }) => {
      ticketStore = ticketStore.map((t) =>
        t.id === id
          ? {
              ...t,
              assignedAgent: agent,
              status: t.status === 'open' ? 'in_progress' : t.status,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...t.timeline,
                { id: 'e' + (t.timeline.length + 1), label: `Assigned to ${agent}`, timestamp: new Date().toISOString(), actor: 'Admin' },
              ],
            }
          : t
      );
      return delay(ticketStore.find((t) => t.id === id), 400);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, message, author, authorRole }: { id: string; message: string; author: string; authorRole: Ticket['comments'][0]['authorRole'] }) => {
      ticketStore = ticketStore.map((t) =>
        t.id === id
          ? {
              ...t,
              comments: [
                ...t.comments,
                { id: 'c' + (t.comments.length + 1), author, authorRole, message, createdAt: new Date().toISOString() },
              ],
            }
          : t
      );
      return delay(ticketStore.find((t) => t.id === id), 400);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ticket', vars.id] });
    },
  });
}
