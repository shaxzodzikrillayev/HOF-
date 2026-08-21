import { useState } from 'react';
import { Armchair, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTableStore } from '@/store/tableStore';
import { cn } from '@/lib/cn';

/**
 * Floating badge shown when the guest opened the menu via a table QR code.
 * Keeps the table context visible while browsing and ordering.
 */
export function TableBanner() {
  const { t } = useTranslation();
  const tableNumber = useTableStore((state) => state.tableNumber);
  const [dismissed, setDismissed] = useState(false);

  if (tableNumber === null || dismissed) return null;

  return (
    <div
      className={cn(
        'fixed left-1/2 top-[76px] z-40 -translate-x-1/2 sm:top-[84px]',
        'animate-fade-up',
      )}
      role="status"
    >
      <div className="glass flex items-center gap-2.5 rounded-full border border-gold/40 py-2 pl-3 pr-2 shadow-lift">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-white">
          <Armchair size={15} strokeWidth={2} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="whitespace-nowrap font-display text-sm font-bold text-espresso">
            {t('table.banner', { number: tableNumber })}
          </span>
          <span className="hidden whitespace-nowrap text-[10px] font-medium text-muted sm:block">
            {t('table.hint')}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t('common.close')}
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-espresso"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
