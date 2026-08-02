import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dummyTickets } from '@/lib/dummyData';
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/types';

// In-memory store simulating a backend so creates/updates persist during the session
let ticketStore: Ticket[] = [...dummyTickets];

function delay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function useTicketsList() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => delay([...ticketStore].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))),
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => delay(ticketStore.find((t) => t.id === id) || null),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      description: string;
      category: TicketCategory;
      priority: TicketPriority;
      createdBy: string;
    }) => {
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
      return delay(newTicket, 700);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, actor }: { id: string; status: TicketStatus; actor: string }) => {
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
      return delay(ticketStore.find((t) => t.id === id), 500);
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
    mutationFn: ({ id, agent }: { id: string; agent: string }) => {
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
      return delay(ticketStore.find((t) => t.id === id), 600);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message, author, authorRole }: { id: string; message: string; author: string; authorRole: Ticket['comments'][0]['authorRole'] }) => {
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
