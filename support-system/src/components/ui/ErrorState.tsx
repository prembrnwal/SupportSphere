import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 py-16 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/15 text-red-500">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Something went wrong</h3>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {message || 'We ran into an error loading this data. Please try again.'}
      </p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
