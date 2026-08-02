import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    role: z.enum(['customer', 'admin']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function getPasswordStrength(pass: string) {
  if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-rose-500' };
  if (score === 2) return { score: 40, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3 || score === 4) return { score: 75, label: 'Good', color: 'bg-teal-500' };
  return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useAuthStore((s) => s.register);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  });

  const selectedRole = watch('role');
  const passwordValue = watch('password') || '';
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: FormData) => {
    try {
      const user = await register_(data.name, data.email, data.password, data.role as UserRole);
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}.`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account. Please try again.');
    }
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Start managing customer support tickets in minutes
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-[#12141b]/95 border border-slate-200/80 dark:border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Select Account Type:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'customer', label: 'Customer', icon: User, desc: 'Raise & track tickets' },
                  { value: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Manage all tickets' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setValue('role', r.value as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRole === r.value
                        ? 'bg-teal-50 border-teal-600 text-teal-700 dark:bg-teal-950/50 dark:border-teal-500 dark:text-teal-300 shadow-xs'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <r.icon className="h-4 w-4 mb-1" />
                    <span>{r.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Aarav Sharma"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  {...register('name')}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
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

            {/* Password Field with Password Strength Meter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
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

              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>Password Strength</span>
                    <span className="font-bold">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Return to Home Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
            ← Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
