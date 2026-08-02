import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FileText, Send } from 'lucide-react';
import { Card, Input, Select, Textarea, Button } from '@/components/ui';
import { useCreateTicket } from '@/hooks/useTickets';
import { useAuthStore } from '@/store/authStore';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/dummyData';
import type { TicketCategory, TicketPriority } from '@/types';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Please provide at least 20 characters of detail'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority'),
});

type FormData = {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
};

const categoryOptions = [
  { value: '', label: 'Select category...' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

const priorityOptions = [
  { value: '', label: 'Select priority...' },
  ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
];

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createTicket = useCreateTicket();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const ticket = await createTicket.mutateAsync({ ...data, createdBy: user?.name || 'You' });
      toast.success(`Ticket ${ticket.ticketNumber} created successfully`);
      navigate(`/tickets/${ticket.id}`);
    } catch {
      toast.error('Failed to create ticket. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create a Ticket</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Describe your issue in detail so our team can help you faster.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Title"
              icon={<FileText className="h-4 w-4" />}
              placeholder="Brief summary of the issue"
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="Description"
              rows={6}
              placeholder="Explain what happened, steps to reproduce, and what you expected instead..."
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="grid sm:grid-cols-2 gap-5">
              <Select
                label="Category"
                options={categoryOptions}
                error={errors.category?.message}
                {...register('category')}
              />
              <Select
                label="Priority"
                options={priorityOptions}
                error={errors.priority?.message}
                {...register('priority')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={createTicket.isPending}>
                <Send className="h-4 w-4" /> Submit Ticket
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
