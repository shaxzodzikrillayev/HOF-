import type { MenuItem } from '@/types';

/** Price after discount, rounded to whole sums. */
export function effectivePrice(item: Pick<MenuItem, 'price' | 'discount_percent'>): number {
  const percent = Math.min(90, Math.max(0, Math.round(item.discount_percent ?? 0)));
  if (percent <= 0) return item.price;
  return Math.round((item.price * (100 - percent)) / 100);
}

export function hasDiscount(item: Pick<MenuItem, 'discount_percent'>): boolean {
  return (item.discount_percent ?? 0) > 0;
}

/** Stock availability label state: null = not tracked. */
export function stockState(
  item: Pick<MenuItem, 'stock'>,
): 'out' | 'low' | 'ok' | 'untracked' {
  if (item.stock === null || item.stock === undefined) return 'untracked';
  if (item.stock <= 0) return 'out';
  if (item.stock <= 3) return 'low';
  return 'ok';
}
