import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  Coffee,
  History,
  MessageSquareQuote,
  Plus,
  QrCode,
  ReceiptText,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/translations';
import { formatDate, formatPrice, getLocalized } from '@/lib/format';
import { getCategories } from '@/services/categoryService';
import { getMenuItems } from '@/services/menuStorage';
import { getOrders, ORDER_STATUSES } from '@/services/orderStorage';
import { getReviews } from '@/services/reviewStorage';
import { getActivities } from '@/services/activityStorage';
import type { OrderStatus } from '@/types';
import { Stars } from '@/components/ui/Stars';
import { cn } from '@/lib/cn';

const STATUS_DOT: Record<OrderStatus, string> = {
  new: 'bg-blue-500',
  confirmed: 'bg-violet-500',
  preparing: 'bg-amber-500',
  ready: 'bg-cyan-500',
  delivering: 'bg-indigo-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-400',
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

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: typeof Coffee;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lift">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            accent ? 'bg-gold/15 text-gold-dark' : 'bg-sand text-mocha',
          )}
        >
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <span className="font-display text-[26px] font-bold leading-none text-espresso">
          {value}
        </span>
      </div>
      <p className="mt-3 text-[13px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-xs font-medium text-gold-dark">{hint}</p>}
    </div>
  );
}

function RevenueChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const { lang, t } = useTranslation();
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-espresso">
          <TrendingUp size={18} className="text-gold-dark" aria-hidden />
          {t('dash.revenue7')}
        </h2>
      </div>
      <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
        {data.map((day) => (
          <div key={day.label} className="group flex flex-1 flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {formatPrice(day.value, lang)}
            </span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-gold to-gold-light transition-all duration-500 group-hover:from-gold-dark group-hover:to-gold"
              style={{ height: `${Math.max((day.value / max) * 100, 3)}%` }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { lang, t } = useTranslation();

  const data = useMemo(() => {
    const items = getMenuItems();
    const orders = getOrders();
    const reviews = getReviews();

    const now = new Date();
    const revenueByDay: Array<{ label: string; value: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const key = day.toDateString();
      const total = orders
        .filter(
          (o) =>
            o.status !== 'cancelled' && new Date(o.created_at).toDateString() === key,
        )
        .reduce((sum, o) => sum + o.total, 0);
      revenueByDay.push({ label: day.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { weekday: 'short' }), value: total });
    }

    const statusCounts = new Map<OrderStatus, number>();
    for (const status of ORDER_STATUSES) statusCounts.set(status, 0);
    for (const order of orders) statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);

    const productTotals = new Map<string, { name: string; qty: number; sum: number }>();
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      for (const line of order.items) {
        const entry = productTotals.get(line.item_id) ?? { name: line.name, qty: 0, sum: 0 };
        entry.qty += line.quantity;
        entry.sum += line.price * line.quantity;
        productTotals.set(line.item_id, entry);
      }
    }
    const topProducts = [...productTotals.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    return {
      items,
      categories: getCategories(),
      orders,
      reviews,
      activities: getActivities().slice(0, 6),
      revenueTotal: orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
      newOrdersCount: orders.filter((o) => o.status === 'new').length,
      uniqueCustomers: new Set(orders.map((o) => o.phone)).size,
      avgOrder:
        orders.length > 0
          ? Math.round(
              orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0) /
                Math.max(orders.filter((o) => o.status !== 'cancelled').length, 1),
            )
          : 0,
      avgRating:
        reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
      revenueByDay,
      statusCounts,
      topProducts,
    };
  }, [lang]);

  const quickActions: Array<{
    to: string;
    key: TranslationKey;
    icon: typeof Coffee;
    primary?: boolean;
  }> = [
    { to: '/admin/menu/new', key: 'dash.addItem', icon: Plus, primary: true },
    { to: '/admin/orders', key: 'nav.orders', icon: ReceiptText },
    { to: '/admin/menu', key: 'dash.manageMenu', icon: UtensilsCrossed },
    { to: '/admin/reviews', key: 'nav.reviews', icon: MessageSquareQuote },
    { to: '/admin/qr', key: 'admin.qr', icon: QrCode },
    { to: '/admin/settings', key: 'admin.settings', icon: Settings },
  ];

  const maxProductQty = Math.max(...data.topProducts.map((p) => p.qty), 1);

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
          {t('dash.title')}
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-[15px]">{t('dash.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={ReceiptText}
          label={t('dash.orders')}
          value={String(data.orders.length)}
          hint={
            data.newOrdersCount > 0
              ? t('dash.newOrders', { count: data.newOrdersCount })
              : undefined
          }
          accent={data.newOrdersCount > 0}
        />
        <StatCard
          icon={Banknote}
          label={t('dash.revenue')}
          value={formatPrice(data.revenueTotal, lang)}
        />
        <StatCard
          icon={ShoppingBag}
          label={t('dash.avgOrder')}
          value={formatPrice(data.avgOrder, lang)}
        />
        <StatCard
          icon={Users}
          label={t('dash.customers')}
          value={String(data.uniqueCustomers)}
        />
        <StatCard
          icon={UtensilsCrossed}
          label={t('dash.totalItems')}
          value={String(data.items.length)}
        />
        <StatCard
          icon={Tags}
          label={t('dash.totalCategories')}
          value={String(data.categories.length)}
        />
        <StatCard
          icon={MessageSquareQuote}
          label={t('nav.reviews')}
          value={String(data.reviews.length)}
          hint={data.avgRating > 0 ? `★ ${data.avgRating.toFixed(1)}` : undefined}
        />
        <StatCard
          icon={Star}
          label={t('dash.newItems')}
          value={String(data.items.filter((i) => i.isNew).length)}
        />
      </div>

      {/* Chart + statuses */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={data.revenueByDay} />
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
          <h2 className="font-display text-lg font-bold text-espresso">{t('dash.byStatus')}</h2>
          <ul className="mt-4 space-y-2.5">
            {ORDER_STATUSES.map((status) => {
              const count = data.statusCounts.get(status) ?? 0;
              if (count === 0) return null;
              return (
                <li key={status} className="flex items-center gap-2.5 text-sm">
                  <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT[status])} />
                  <span className="flex-1 font-medium text-coffee">{t(STATUS_KEYS[status])}</span>
                  <span className="font-bold text-espresso">{count}</span>
                </li>
              );
            })}
            {data.orders.length === 0 && (
              <li className="text-sm text-muted">{t('orders.emptyHint')}</li>
            )}
          </ul>
        </div>
      </div>

      {/* Top products + latest reviews */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
          <h2 className="font-display text-lg font-bold text-espresso">{t('dash.topProducts')}</h2>
          {data.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{t('dash.noData')}</p>
          ) : (
            <ul className="mt-4 space-y-3.5">
              {data.topProducts.map((product, index) => (
                <li key={product.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-semibold text-espresso">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sand text-[11px] font-bold text-mocha">
                        {index + 1}
                      </span>
                      {product.name}
                    </span>
                    <span className="shrink-0 text-xs font-bold text-muted">
                      ×{product.qty} · {formatPrice(product.sum, lang)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-all duration-700"
                      style={{ width: `${(product.qty / maxProductQty) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-espresso">
              {t('dash.latestReviews')}
            </h2>
            <Link
              to="/admin/reviews"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold-dark transition-colors hover:text-espresso"
            >
              {t('common.all')} <ArrowRight size={12} />
            </Link>
          </div>
          {data.reviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{t('reviews.emptyAdmin')}</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.reviews.slice(0, 4).map((review) => (
                <li key={review.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-espresso">
                      {review.author_name}
                    </p>
                    <Stars rating={review.rating} size={12} />
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {getLocalized(review, 'text', lang)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Activity feed */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-espresso">
          <History size={18} className="text-gold-dark" aria-hidden />
          {t('dash.activity')}
        </h2>
        {data.activities.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t('dash.noActivity')}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.activities.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="flex-1 text-coffee">
                  {t(entry.action as TranslationKey)}{' '}
                  {entry.subject && <span className="font-bold text-espresso">{entry.subject}</span>}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {formatDate(entry.created_at, lang)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display text-xl font-bold text-espresso">{t('dash.quickActions')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={
                action.primary
                  ? 'flex min-h-14 items-center gap-3 rounded-2xl bg-espresso px-5 py-4 text-sm font-bold text-cream shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-coffee hover:shadow-lift'
                  : 'flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 text-sm font-bold text-coffee shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:text-gold-dark hover:shadow-lift'
              }
            >
              <action.icon size={18} strokeWidth={1.9} />
              {t(action.key)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
