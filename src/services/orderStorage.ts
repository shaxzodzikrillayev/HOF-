import { nowIso, uid } from '@/lib/id';
import {
  loadOrdersRaw,
  readOrderCounter,
  saveOrdersRaw,
  writeOrderCounter,
} from '@/services/db';
import type { Order, OrderItem, OrderStatus, PaymentMethod } from '@/types';

/**
 * Single source of truth for order storage.
 */

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'new',
  'confirmed',
  'preparing',
  'ready',
  'delivering',
  'completed',
  'cancelled',
];

export type NewOrderPayload = {
  table_number?: number | null;
  customer_name: string;
  phone: string;
  comment: string | null;
  payment_method: PaymentMethod;
  items: OrderItem[];
};

function sanitizeItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((raw): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null)
    .map((raw) => ({
      item_id: typeof raw.item_id === 'string' ? raw.item_id : '',
      name: typeof raw.name === 'string' ? raw.name : '',
      price: Number.isFinite(Number(raw.price)) ? Number(raw.price) : 0,
      quantity: Math.max(1, Math.round(Number(raw.quantity)) || 1),
    }))
    .filter((item) => item.name.length > 0);
}

function sanitizeOrder(raw: unknown): Order | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const order = raw as Record<string, unknown>;
  if (typeof order.id !== 'string' || !order.id) return null;

  const status = ORDER_STATUSES.includes(order.status as OrderStatus)
    ? (order.status as OrderStatus)
    : 'new';
  const payment = order.payment_method === 'card' ? 'card' : 'cash';
  const items = sanitizeItems(order.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const createdRaw = typeof order.created_at === 'string' ? order.created_at : '';
  const createdDate = new Date(createdRaw);

  return {
    id: order.id,
    number:
      Number.isFinite(Number(order.number)) && Number(order.number) > 0
        ? Math.round(Number(order.number))
        : 0,
    table_number:
      Number.isFinite(Number(order.table_number)) && Number(order.table_number) >= 1
        ? Math.round(Number(order.table_number))
        : null,
    customer_name: typeof order.customer_name === 'string' ? order.customer_name : '—',
    phone: typeof order.phone === 'string' ? order.phone : '',
    comment: typeof order.comment === 'string' && order.comment ? order.comment : null,
    payment_method: payment,
    items,
    total,
    status,
    created_at: Number.isNaN(createdDate.getTime()) ? nowIso() : createdRaw,
    updated_at: typeof order.updated_at === 'string' ? order.updated_at : undefined,
  };
}

function loadOrders(): Order[] {
  const rawList = loadOrdersRaw();
  const byId = new Map<string, Order>();
  let repaired = false;

  for (const raw of rawList) {
    const order = sanitizeOrder(raw);
    if (!order) {
      repaired = true;
      continue;
    }
    if (byId.has(order.id)) {
      repaired = true;
      continue;
    }
    byId.set(order.id, order);
  }

  const list = [...byId.values()];
  if (repaired || list.length !== rawList.length) {
    try {
      saveOrdersRaw(list);
    } catch {
      // ignore repair-write failures
    }
  }
  return list;
}

export function getOrders(): Order[] {
  return [...loadOrders()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getOrderById(id: string): Order | null {
  if (!id) return null;
  return loadOrders().find((order) => order.id === id) ?? null;
}

/** Creates an order from a public checkout and returns it. */
export function addOrder(payload: NewOrderPayload): Order {
  const orders = loadOrders();
  const maxExistingNumber = orders.reduce((max, order) => Math.max(max, order.number), 0);
  // The counter continues from the highest known number so demo/seed
  // orders can never collide with freshly created ones.
  const nextNumber = Math.max(readOrderCounter(), maxExistingNumber) + 1;
  writeOrderCounter(nextNumber);

  const total = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tableRaw = payload.table_number;
  const order: Order = {
    id: uid(),
    number: nextNumber,
    table_number:
      typeof tableRaw === 'number' && Number.isFinite(tableRaw) && tableRaw >= 1
        ? Math.round(tableRaw)
        : null,
    customer_name: payload.customer_name,
    phone: payload.phone,
    comment: payload.comment,
    payment_method: payload.payment_method,
    items: payload.items,
    total,
    status: 'new',
    created_at: nowIso(),
  };
  saveOrdersRaw([order, ...orders]);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  if (!id || !ORDER_STATUSES.includes(status)) return null;
  let updated: Order | null = null;
  const next = loadOrders().map((order) => {
    if (order.id !== id) return order;
    updated = { ...order, status, updated_at: nowIso() };
    return updated;
  });
  if (!updated) return null;
  saveOrdersRaw(next);
  return updated;
}

export function deleteOrder(id: string): boolean {
  if (!id) return false;
  const orders = loadOrders();
  const next = orders.filter((order) => order.id !== id);
  if (next.length === orders.length) return false;
  saveOrdersRaw(next);
  return true;
}
