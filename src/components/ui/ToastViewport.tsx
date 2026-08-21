import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useToastStore, type ToastType } from '@/store/toastStore';

const icons: Record<ToastType, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-gold',
};

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
      {toasts.map((toastItem) => {
        const Icon = icons[toastItem.type];
        return (
          <div
            key={toastItem.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-white/95 px-4 py-3.5 shadow-lift backdrop-blur animate-toast-in"
          >
            <Icon size={19} className={`mt-0.5 shrink-0 ${styles[toastItem.type]}`} />
            <p className="flex-1 text-sm font-medium leading-snug text-espresso">
              {toastItem.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(toastItem.id)}
              className="-mr-1 -mt-1 rounded-full p-1 text-muted transition-colors hover:bg-sand hover:text-espresso"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
