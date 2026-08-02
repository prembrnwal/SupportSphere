import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

const demoAccounts = [
  { label: 'Admin Account', email: 'admin@helpdesk.com', pass: 'AdminPassword123!', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { label: 'Customer Account', email: 'customer@company.com', pass: 'Customer123!', icon: User, color: 'text-teal-600 bg-teal-50 border-teal-200' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e6f4f3] via-[#dcf0ed] to-white dark:from-[#091817] dark:via-[#0c211f] dark:to-[#0b0d12] px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Helpdesk</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your support workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-[#12141b]/95 border border-slate-200/80 dark:border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="remember" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4" />
              <label htmlFor="remember" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Chips */}
          <div className="mt-7 pt-6 border-t border-slate-100 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              1-Click Demo Accounts
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email, acc.pass)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all hover:scale-105 ${acc.color}`}
                >
                  <acc.icon className="h-3.5 w-3.5" />
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Switch to Signup */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Create free account
            </Link>
          </div>
        </div>

        {/* Home page link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
            ← Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
