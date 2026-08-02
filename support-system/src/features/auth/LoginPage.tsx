import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LifeBuoy, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Input, Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0d12] px-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />

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

          <h1 className="text-xl font-semibold text-slate-900 dark:text-white text-center">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1 mb-6">
            Sign in to manage your support tickets
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <input type="checkbox" className="rounded border-slate-300" />
                Remember me
              </label>
              <a href="#" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                Forgot password?
              </a>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-4">
            Try <span className="font-medium">isha.admin@acme.com</span> for admin access — any password works.
          </p>

          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
