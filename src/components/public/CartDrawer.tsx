import { useEffect, useMemo, useState } from 'react';
import { Armchair, CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPrice } from '@/lib/format';
import { cartTotal, useCartStore } from '@/store/cartStore';
import { useTableStore } from '@/store/tableStore';
import { addOrder } from '@/services/orderStorage';
import { logActivity } from '@/services/activityStorage';
import { toast } from '@/store/toastStore';
import { getErrorMessage } from '@/lib/errors';
import type { PaymentMethod } from '@/types';
import { SmartImage } from './SmartImage';
import { cn } from '@/lib/cn';

const EXIT_MS = 260;

export function CartDrawer() {
  const { lang, t } = useTranslation();
  const isOpen = useCartStore((state) => state.isOpen);
  const close = useCartStore((state) => state.close);
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const tableNumber = useTableStore((state) => state.tableNumber);

  const [rendered, setRendered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [placedNumber, setPlacedNumber] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const total = useMemo(() => cartTotal(lines), [lines]);

  useEffect(() => {
    if (isOpen) {
      setPlacedNumber(null);
      const raf = requestAnimationFrame(() => setRendered(true));
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleClose(): void {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      close();
      setRendered(false);
      setClosing(false);
    }, EXIT_MS);
  }

  const handleCheckout = async () => {
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = t('form.validation.nameShort');
    if (phone.replace(/\D/g, '').length < 9) nextErrors.phone = t('checkout.phoneInvalid');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || lines.length === 0) return;

    setSubmitting(true);
    try {
      const order = addOrder({
        table_number: tableNumber,
        customer_name: name.trim(),
        phone: phone.trim(),
        comment: comment.trim() || null,
        payment_method: payment,
        items: lines.map((line) => ({
          item_id: line.item_id,
          name: line.name,
          price: line.price,
          quantity: line.quantity,
        })),
      });
      logActivity('activity.newOrder', `#${order.number}`);
      clear();
      setComment('');
      setPlacedNumber(order.number);
      toast.success(t('checkout.success'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen && !rendered) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[96]',
        rendered && !closing ? 'opacity-100' : 'opacity-0',
        'transition-opacity duration-300',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={t('cart.title')}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-espresso/50 backdrop-blur-sm"
      />

      <aside
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-lift',
          rendered && !closing ? 'animate-slide-in-right' : 'translate-x-full transition-transform duration-300',
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-espresso text-cream">
              <ShoppingBag size={16} />
            </span>
            <h2 className="font-display text-lg font-bold text-espresso">{t('cart.title')}</h2>
            {tableNumber !== null && (
              <span
                title={t('table.hint')}
                className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-dark"
              >
                <Armchair size={13} aria-hidden />
                {t('checkout.table', { number: tableNumber })}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('common.close')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-espresso active:scale-90"
          >
            <X size={19} />
          </button>
        </div>

        {placedNumber !== null ? (
          /* Success state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-20 w-20 animate-scale-in items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 size={40} strokeWidth={1.6} />
            </span>
            <h3 className="font-display text-2xl font-bold text-espresso">
              {t('checkout.doneTitle')}
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              {tableNumber !== null
                ? t('checkout.doneTextTable', { number: placedNumber, table: tableNumber })
                : t('checkout.doneText', { number: placedNumber })}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 min-h-11 rounded-full bg-espresso px-7 text-sm font-bold text-cream transition-all duration-200 hover:bg-gold active:scale-[0.98]"
            >
              {t('checkout.continue')}
            </button>
          </div>
        ) : lines.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sand text-gold-dark">
              <ShoppingBag size={34} strokeWidth={1.4} />
            </span>
            <p className="font-display text-lg font-semibold text-espresso">{t('cart.empty')}</p>
            <p className="max-w-xs text-sm leading-relaxed text-muted">{t('cart.emptyHint')}</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 min-h-11 rounded-full border border-border bg-white px-7 text-sm font-bold text-coffee transition-all duration-200 hover:border-gold hover:text-gold-dark active:scale-[0.98]"
            >
              {t('cart.browseMenu')}
            </button>
          </div>
        ) : (
          <>
            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={line.item_id}
                    className="flex animate-fade-up gap-3.5 rounded-2xl border border-border bg-white p-3 shadow-card"
                  >
                    <SmartImage
                      src={line.image_url}
                      alt=""
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-espresso">{line.name}</p>
                        <button
                          type="button"
                          onClick={() => remove(line.item_id)}
                          aria-label={t('common.delete')}
                          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-muted">
                        {formatPrice(line.price, lang)}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.item_id, line.quantity - 1)}
                            aria-label="−"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-coffee transition-colors hover:bg-sand active:scale-90"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="min-w-6 text-center text-[13px] font-bold text-espresso">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(line.item_id, line.quantity + 1)}
                            aria-label="+"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-coffee transition-colors hover:bg-sand active:scale-90"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-espresso">
                          {formatPrice(line.price * line.quantity, lang)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Checkout form */}
              <div className="mt-5 space-y-3 border-t border-border pt-5">
                <p className="text-[13px] font-bold uppercase tracking-wider text-mocha">
                  {t('checkout.details')}
                </p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('checkout.name')}
                  className={cn(
                    'h-11 w-full rounded-xl border bg-white px-4 text-[15px] text-espresso outline-none transition-colors placeholder:text-muted/70 focus:ring-2 focus:ring-gold/40',
                    errors.name ? 'border-red-400' : 'border-border focus:border-gold',
                  )}
                />
                {errors.name && <p className="text-xs font-medium text-red-600">{errors.name}</p>}
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('checkout.phone')}
                  inputMode="tel"
                  className={cn(
                    'h-11 w-full rounded-xl border bg-white px-4 text-[15px] text-espresso outline-none transition-colors placeholder:text-muted/70 focus:ring-2 focus:ring-gold/40',
                    errors.phone ? 'border-red-400' : 'border-border focus:border-gold',
                  )}
                />
                {errors.phone && <p className="text-xs font-medium text-red-600">{errors.phone}</p>}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`${t('checkout.comment')} (${t('common.optional')})`}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-espresso outline-none transition-colors placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/40"
                />
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['cash', t('checkout.cash')],
                      ['card', t('checkout.card')],
                    ] as Array<[PaymentMethod, string]>
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPayment(value)}
                      className={cn(
                        'min-h-11 rounded-xl border text-sm font-semibold transition-all duration-200',
                        payment === value
                          ? 'border-gold bg-gold/10 text-gold-dark'
                          : 'border-border bg-white text-coffee hover:border-gold',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">{t('cart.total')}</span>
                <span className="font-display text-xl font-bold text-espresso">
                  {formatPrice(total, lang)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-gold-dark active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  t('checkout.place')
                )}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
