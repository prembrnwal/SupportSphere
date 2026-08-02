import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LifeBuoy, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Input, Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useAuthStore((s) => s.register);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await register_(data.name, data.email, data.password, 'customer');
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}.`);
      navigate('/dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0d12] px-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative"
      >
        <div className="glass rounded-2xl shadow-soft p-8">
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">SupportHub</span>
          </Link>

          <h1 className="text-xl font-semibold text-slate-900 dark:text-white text-center">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1 mb-6">
            Start managing support tickets in minutes
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name"
              icon={<User className="h-4 w-4" />}
              placeholder="Aarav Sharma"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
