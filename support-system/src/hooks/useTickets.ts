import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { dummyTickets } from '@/lib/dummyData';
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/types';

const STORAGE_KEY = 'sh_local_tickets';

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function getStoredTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with initial dummy tickets to preserve default mock tickets
        const storedIds = new Set(parsed.map((t: Ticket) => t.id));
        const missingDummies = dummyTickets.filter((t) => !storedIds.has(t.id));
        return [...parsed, ...missingDummies];
      }
    }
  } catch {
    // Ignore parse error
  }
  return [...dummyTickets];
}

function saveStoredTickets(tickets: Ticket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Ignore storage quota error
  }
}

let ticketStore: Ticket[] = getStoredTickets();

function delay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function isRealToken(): boolean {
  const token = localStorage.getItem('sh_token');
  return !!token && !token.startsWith('demo-token-');
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
      { id: 'e1', label: 'Ticket registered in system', timestamp: raw.created_at || new Date().toISOString(), actor: raw.creator?.name || 'System' }
    ],
    comments: [],
  };
}

export function useTicketsList() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      if (isRealToken()) {
        try {
          const res = await api.get('/api/v1/tickets');
          if (res.data?.success && res.data?.data) {
            const items = res.data.data.items || res.data.data;
            if (Array.isArray(items)) {
              const mapped = items.map(mapBackendTicket);
              const dbIds = new Set(mapped.map((t) => t.id));
              const merged = [...mapped, ...ticketStore.filter((t) => !dbIds.has(t.id))];
              saveStoredTickets(merged);
              ticketStore = merged;
              return merged.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
            }
          }
        } catch {
          // Fallback to local memory if backend is unreachable
        }
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

      // 1. Check local stored tickets first
      const localMatch = ticketStore.find((t) => t.id === id);
      if (localMatch) return localMatch;

      // 2. Query backend ONLY if id is a valid UUID and user has a real JWT token
      if (isUUID(id) && isRealToken()) {
        try {
          const res = await api.get(`/api/v1/tickets/${id}`);
          if (res.data?.success && res.data?.data) {
            const mapped = mapBackendTicket(res.data.data);
            ticketStore = ticketStore.map((t) => (t.id === id ? mapped : t));
            saveStoredTickets(ticketStore);
            return mapped;
          }
        } catch {
          // Ignore network / auth error and fallback below
        }
      }

      // 3. Fallback: search in initial dummy tickets or return placeholder
      const dummyMatch = dummyTickets.find((t) => t.id === id);
      if (dummyMatch) return dummyMatch;

      // If ticket ID was generated during a previous session (e.g. t19-...), generate dynamic ticket representation
      if (id.startsWith('t')) {
        const fallbackTicket: Ticket = {
          id,
          ticketNumber: `TCK-${id.slice(1, 6).toUpperCase()}`,
          title: 'Support Ticket',
          description: 'Ticket created in local session.',
          category: 'general',
          priority: 'medium',
          status: 'open',
          createdBy: 'Customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeline: [{ id: 'e1', label: 'Ticket created', timestamp: new Date().toISOString(), actor: 'Customer' }],
          comments: [],
        };
        ticketStore = [fallbackTicket, ...ticketStore];
        saveStoredTickets(ticketStore);
        return fallbackTicket;
      }

      return null;
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
      if (isRealToken()) {
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
            saveStoredTickets(ticketStore);
            return ticket;
          }
        } catch {
          // Fallback if backend API is offline
        }
      }

      // Memory & LocalStorage fallback
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
      saveStoredTickets(ticketStore);
      return delay(newTicket, 200);
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
      if (isUUID(id) && isRealToken()) {
        try {
          const backendStatus = status === 'closed' ? 'RESOLVED' : status.toUpperCase();
          await api.put(`/api/v1/tickets/${id}`, { status: backendStatus });
        } catch {
          // Fallback
        }
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
      saveStoredTickets(ticketStore);
      return delay(ticketStore.find((t) => t.id === id), 200);
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
      saveStoredTickets(ticketStore);
      return delay(ticketStore.find((t) => t.id === id), 200);
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
      saveStoredTickets(ticketStore);
      return delay(ticketStore.find((t) => t.id === id), 200);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ticket', vars.id] });
    },
  });
}
