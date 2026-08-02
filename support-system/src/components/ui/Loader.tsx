import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Loader({ className, label }: { className?: string; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <Loader2 className={cn('h-6 w-6 animate-spin text-brand-500', className)} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 dark:bg-[#0b0d12]/70 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}
