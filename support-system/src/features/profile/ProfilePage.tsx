import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Lock, Save, Camera } from 'lucide-react';
import { Card, Input, Button, Badge } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { initials, formatDate } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Required'),
    newPassword: z.string().min(6, 'Must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, email: user?.email },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: ProfileForm) => {
    await new Promise((r) => setTimeout(r, 500));
    updateProfile(data);
    toast.success('Profile updated successfully');
  };

  const onPasswordSubmit = async (_data: PasswordForm) => {
    await new Promise((r) => setTimeout(r, 500));
    passwordForm.reset();
    toast.success('Password changed successfully');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account details and security.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white text-lg font-semibold">
                {user ? initials(user.name) : <UserIcon />}
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#12141b] border border-slate-200 dark:border-white/10 text-slate-500 hover:text-brand-600 transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="neutral" className="capitalize">{user?.role}</Badge>
                <span className="text-xs text-slate-400">Joined {user ? formatDate(user.createdAt) : ''}</span>
              </div>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <Input
              label="Full name"
              icon={<UserIcon className="h-4 w-4" />}
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
            <Input
              label="Email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register('email')}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={profileForm.formState.isSubmitting}>
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <Input
              label="New password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label="Confirm new password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" loading={passwordForm.formState.isSubmitting}>
                Update password
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
