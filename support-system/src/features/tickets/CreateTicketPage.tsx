import { useForm, Controller } from 'react-hook-form';
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

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Please provide at least 20 characters of detail'),
  category: z.enum(['technical', 'billing', 'account', 'feature_request', 'bug', 'general'], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a priority' }),
  }),
});
type FormData = z.infer<typeof schema>;

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }));

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createTicket = useCreateTicket();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    label="Category"
                    placeholder="Select category"
                    options={categoryOptions}
                    error={errors.category?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    label="Priority"
                    placeholder="Select priority"
                    options={priorityOptions}
                    error={errors.priority?.message}
                    {...field}
                  />
                )}
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
