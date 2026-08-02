import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User as UserIcon, Send, Trash2, CheckCircle2 } from 'lucide-react';
import {
  Card,
  Button,
  Select,
  Textarea,
  StatusBadge,
  PriorityBadge,
  Loader,
  ErrorState,
  ConfirmDialog,
} from '@/components/ui';
import { useTicket, useUpdateTicketStatus, useAddComment, useDeleteTicket } from '@/hooks/useTickets';
import { useAuthStore } from '@/store/authStore';
import { CATEGORY_LABELS } from '@/lib/dummyData';
import { formatDateTime, initials } from '@/lib/utils';
import type { TicketStatus } from '@/types';

export function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: ticket, isLoading, isError, refetch } = useTicket(id);
  const updateStatus = useUpdateTicketStatus();
  const addComment = useAddComment();
  const deleteTicket = useDeleteTicket();
  const [comment, setComment] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const canManageTicket = user?.role === 'admin';

  if (isLoading) return <Loader label="Loading ticket details..." />;
  if (isError || !ticket)
    return <ErrorState message="This ticket could not be found." onRetry={() => refetch()} />;

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await updateStatus.mutateAsync({ id: ticket.id, status, actor: user?.name || 'Agent' });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleMarkFinished = async () => {
    try {
      await updateStatus.mutateAsync({ id: ticket.id, status: 'closed', actor: user?.name || 'Admin' });
      toast.success(`Ticket ${ticket.ticketNumber} marked as finished`);
    } catch {
      toast.error('Failed to mark ticket as finished');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment.mutateAsync({
        id: ticket.id,
        message: comment,
        author: user?.name || 'You',
        authorRole: user?.role || 'customer',
      });
      setComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteTicket = async () => {
    try {
      await deleteTicket.mutateAsync(ticket.id);
      toast.success(`Ticket ${ticket.ticketNumber} deleted`);
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      toast.error('Failed to delete ticket');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {canManageTicket && (
          <div className="flex items-center gap-2">
            {ticket.status !== 'closed' && (
              <button
                type="button"
                onClick={handleMarkFinished}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as Finished
              </button>
            )}
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Ticket
            </button>
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-mono text-slate-400">{ticket.ticketNumber}</span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{ticket.title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{ticket.description}</p>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/10 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Category:</span>
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Created by:</span>
              {ticket.createdBy}
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Created:</span>
              {formatDateTime(ticket.createdAt)}
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Assigned Agent:</span>
              {ticket.assignedAgent || 'System Admin'}
            </div>
          </div>

          {canManageTicket && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Update Ticket Status</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
                <Select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  options={[
                    { value: 'open', label: 'Open' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'closed', label: 'Closed / Finished' },
                  ]}
                />
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Timeline */}
      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Status Timeline</h2>
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200 dark:bg-white/10" />
          {ticket.timeline.map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-teal-500 ring-4 ring-teal-100 dark:ring-teal-500/20" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">{event.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatDateTime(event.timestamp)} · {event.actor}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Comments */}
      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Comments</h2>

        {ticket.comments.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No comments yet. Be the first to respond.</p>
        ) : (
          <div className="space-y-4 mb-5">
            {ticket.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                  {initials(c.author)}
                </div>
                <div className="flex-1">
                  <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{c.author}</span>
                      <span className="text-xs text-slate-400 capitalize">{c.authorRole}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{c.message}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(c.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-semibold">
            {user ? initials(user.name) : <UserIcon className="h-4 w-4" />}
          </div>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAddComment} loading={addComment.isPending} disabled={!comment.trim()}>
                <Send className="h-3.5 w-3.5" /> Post Comment
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Ticket Confirmation Dialog */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteTicket}
        title="Delete Ticket"
        description={`Are you sure you want to delete ticket ${ticket.ticketNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
