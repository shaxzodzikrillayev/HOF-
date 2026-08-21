import { useMemo, useState } from 'react';
import { Armchair, Banknote, CreditCard, Eye, ReceiptText, Search, Trash2, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/translations';
import { formatDateTime, formatPrice } from '@/lib/format';
import {
  ORDER_STATUSES,
  deleteOrder,
  getOrders,
  updateOrderStatus,
} from '@/services/orderStorage';
import { logActivity } from '@/services/activityStorage';
import { toast } from '@/store/toastStore';
import { getErrorMessage } from '@/lib/errors';
import type { Order, OrderStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/States';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 8;

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  confirmed: 'bg-violet-50 text-violet-700 ring-violet-200',
  preparing: 'bg-amber-50 text-amber-700 ring-amber-200',
  ready: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  delivering: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-red-50 text-red-600 ring-red-200',
};

const STATUS_KEYS: Record<OrderStatus, TranslationKey> = {
  new: 'order.status.new',
  confirmed: 'order.status.confirmed',
  preparing: 'order.status.preparing',
  ready: 'order.status.ready',
  delivering: 'order.status.delivering',
  completed: 'order.status.completed',
  cancelled: 'order.status.cancelled',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1',
        STATUS_STYLES[status],
      )}
    >
      {t(STATUS_KEYS[status])}
    </span>
  );
}

function TableBadge({ number }: { number: number }) {
  const { t } = useTranslation();
  return (
    <span
      title={t('orders.table')}
      className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold-dark"
    >
      <Armchair size={11} aria-hidden />
      {t('checkout.table', { number })}
    </span>
  );
}

function OrderDetails({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
}) {
  const { lang, t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={order.status} />
        {order.table_number !== null && <TableBadge number={order.table_number} />}
        <span className="text-xs font-medium text-muted">
          {formatDateTime(order.created_at, lang)}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-coffee">
          {order.payment_method === 'card' ? (
            <>
              <CreditCard size={14} aria-hidden /> {t('checkout.card')}
            </>
          ) : (
            <>
              <Banknote size={14} aria-hidden /> {t('checkout.cash')}
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-cream/60 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
            {t('orders.customer')}
          </p>
          <p className="mt-1 text-sm font-semibold text-espresso">{order.customer_name}</p>
          <a
            href={`tel:${order.phone.replace(/[^+\d]/g, '')}`}
            className="mt-0.5 block text-sm font-medium text-gold-dark hover:underline"
          >
            {order.phone}
          </a>
        </div>
        <div className="rounded-xl border border-border bg-cream/60 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
            {t('checkout.comment')}
          </p>
          <p className="mt-1 text-sm text-coffee">{order.comment || '—'}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-sand/60 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
              <th className="px-4 py-2.5">{t('orders.item')}</th>
              <th className="px-2 py-2.5 text-center">{t('orders.qty')}</th>
              <th className="px-4 py-2.5 text-right">{t('orders.sum')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((line) => (
              <tr key={`${line.item_id}-${line.name}`} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5 font-medium text-espresso">{line.name}</td>
                <td className="px-2 py-2.5 text-center text-coffee">×{line.quantity}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-coffee">
                  {formatPrice(line.price * line.quantity, lang)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-sand/60">
              <td colSpan={2} className="px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-muted">
                {t('cart.total')}
              </td>
              <td className="px-4 py-3 text-right font-display text-lg font-bold text-espresso">
                {formatPrice(order.total, lang)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
          {t('orders.changeStatus')}
        </p>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={status === order.status}
              onClick={() => onStatusChange(status)}
              className={cn(
                'min-h-9 rounded-full px-3.5 text-xs font-bold transition-all duration-200 active:scale-95',
                status === order.status
                  ? cn('cursor-default ring-1', STATUS_STYLES[status])
                  : 'border border-border bg-white text-coffee hover:border-gold hover:text-gold-dark',
              )}
            >
              {t(STATUS_KEYS[status])}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { lang, t } = useTranslation();
  const [version, setVersion] = useState(0);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [toDelete, setToDelete] = useState<Order | null>(null);

  const orders = useMemo(() => {
    void version;
    return [...getOrders()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [version]);

  const counts = useMemo(() => {
    const map = new Map<OrderStatus, number>();
    for (const status of ORDER_STATUSES) map.set(status, 0);
    for (const order of orders) map.set(order.status, (map.get(order.status) ?? 0) + 1);
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (!q) return true;
      return (
        String(order.number).includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.phone.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const refresh = () => setVersion((v) => v + 1);

  const handleStatusChange = (order: Order, status: OrderStatus) => {
    try {
      updateOrderStatus(order.id, status);
      if (status === 'cancelled') logActivity('activity.orderCancelled', `#${order.number}`);
      else if (status === 'completed') logActivity('activity.orderCompleted', `#${order.number}`);
      toast.success(t('toast.saved'));
      setSelected((prev) => (prev && prev.id === order.id ? { ...prev, status } : prev));
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = () => {
    if (!toDelete) return;
    try {
      deleteOrder(toDelete.id);
      logActivity('activity.orderDeleted', `#${toDelete.number}`);
      toast.success(t('toast.deleted'));
      setSelected(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
            {t('orders.title')}
          </h1>
          <p className="mt-1 text-sm text-muted sm:text-[15px]">{t('orders.subtitle')}</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t('orders.search')}
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm text-espresso outline-none transition-colors placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
      </div>

      {/* Status filter chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setFilter('all');
            setPage(1);
          }}
          className={cn(
            'min-h-9 rounded-full px-4 text-xs font-bold transition-all duration-200 active:scale-95',
            filter === 'all'
              ? 'bg-espresso text-cream shadow-card'
              : 'border border-border bg-white text-coffee hover:border-gold hover:text-gold-dark',
          )}
        >
          {t('common.all')} · {orders.length}
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => {
              setFilter(status);
              setPage(1);
            }}
            className={cn(
              'min-h-9 rounded-full px-4 text-xs font-bold transition-all duration-200 active:scale-95',
              filter === status
                ? 'bg-espresso text-cream shadow-card'
                : 'border border-border bg-white text-coffee hover:border-gold hover:text-gold-dark',
            )}
          >
            {t(STATUS_KEYS[status])} · {counts.get(status) ?? 0}
          </button>
        ))}
      </div>

      {pageItems.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={t('orders.empty')}
          subtitle={t('orders.emptyHint')}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-border bg-white shadow-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-sand/60 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">{t('orders.number')}</th>
                  <th className="px-3 py-3.5">{t('orders.customer')}</th>
                  <th className="px-3 py-3.5">{t('orders.date')}</th>
                  <th className="px-3 py-3.5">{t('orders.status')}</th>
                  <th className="px-3 py-3.5 text-right">{t('cart.total')}</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((order) => (
                  <tr
                    key={order.id}
                    className="group border-b border-border/60 transition-colors last:border-0 hover:bg-cream/50"
                  >
                    <td className="px-5 py-3.5 font-display font-bold text-espresso">
                      <span className="flex flex-wrap items-center gap-2">
                        #{order.number}
                        {order.table_number !== null && (
                          <TableBadge number={order.table_number} />
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-semibold text-espresso">{order.customer_name}</p>
                      <p className="text-xs text-muted">{order.phone}</p>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-muted">
                      {formatDateTime(order.created_at, lang)}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-3.5 text-right font-bold text-espresso">
                      {formatPrice(order.total, lang)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setSelected(order)}
                          aria-label={t('common.view')}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-coffee transition-colors hover:bg-sand hover:text-espresso"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(order)}
                          aria-label={t('common.delete')}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {pageItems.map((order) => (
              <article
                key={order.id}
                className="animate-fade-up rounded-2xl border border-border bg-white p-4 shadow-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-lg font-bold text-espresso">
                    #{order.number}
                  </span>
                  <span className="flex items-center gap-2">
                    {order.table_number !== null && (
                      <TableBadge number={order.table_number} />
                    )}
                    <StatusBadge status={order.status} />
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-espresso">{order.customer_name}</p>
                <p className="text-xs text-muted">
                  {formatDateTime(order.created_at, lang)} · {order.phone}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="font-display text-base font-bold text-espresso">
                    {formatPrice(order.total, lang)}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelected(order)}
                      className="flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-bold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
                    >
                      <Eye size={14} /> {t('common.view')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(order)}
                      aria-label={t('common.delete')}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={setPage}
            className="mt-6"
          />
        </>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `${t('orders.title')} #${selected.number}` : ''}
        size="lg"
      >
        {selected && (
          <>
            <OrderDetails
              order={selected}
              onStatusChange={(status) => handleStatusChange(selected, status)}
            />
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setToDelete(selected)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={15} /> {t('common.delete')}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border px-5 text-sm font-semibold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
              >
                <X size={15} /> {t('common.close')}
              </button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title={t('orders.deleteTitle')}
        message={
          toDelete
            ? t('orders.deleteText', { number: toDelete.number })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
