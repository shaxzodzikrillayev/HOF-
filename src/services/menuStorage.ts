import { nowIso, uid } from '@/lib/id';
import { loadMenuItemsRaw, saveMenuItemsRaw } from '@/services/db';
import type { DishTag, MenuItem } from '@/types';

/**
 * Single source of truth for menu item storage.
 * Every Add / Edit / Delete / bulk save goes through this module.
 * Components must never touch localStorage directly.
 */

export type MenuItemPayload = {
  category_id: string;
  name_ru: string;
  name_uz: string;
  description_ru: string | null;
  description_uz: string | null;
  price: number;
  images?: string[];
  image_url?: string | null;
  weight: string | null;
  stock?: number | null;
  discount_percent?: number;
  available: boolean;
  featured?: boolean;
  isNew?: boolean;
  tags?: DishTag[];
  sort_order: number;
};

const VALID_TAGS: readonly DishTag[] = ['spicy', 'vegetarian', 'popular'];
export const MAX_IMAGES = 5;

function toFiniteNumber(value: unknown, fallback = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Normalises the gallery: strings only, deduped, max length. */
function sanitizeImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string' || entry.length === 0 || seen.has(entry)) continue;
    seen.add(entry);
    result.push(entry);
    if (result.length >= MAX_IMAGES) break;
  }
  return result;
}

function sanitizeTags(value: unknown): DishTag[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (tag): tag is DishTag => typeof tag === 'string' && VALID_TAGS.includes(tag as DishTag),
  );
}

/** Repairs a raw stored entry; returns null when the entry is unusable. */
function sanitizeMenuItem(raw: unknown): MenuItem | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const item = raw as Record<string, unknown>;
  const name_ru = typeof item.name_ru === 'string' ? item.name_ru : '';
  const name_uz = typeof item.name_uz === 'string' ? item.name_uz : '';
  if (!name_ru && !name_uz) return null;

  // Gallery: prefer `images`, fall back to legacy single image_url.
  const images = sanitizeImages(item.images);
  const legacyImage = toOptionalString(item.image_url);
  if (images.length === 0 && legacyImage) images.push(legacyImage);

  const discountRaw = toFiniteNumber(item.discount_percent);
  const stockRaw = item.stock;
  const stock =
    stockRaw === null || stockRaw === undefined
      ? null
      : Math.max(0, Math.round(toFiniteNumber(stockRaw)));

  return {
    id: typeof item.id === 'string' && item.id ? item.id : uid(),
    category_id: typeof item.category_id === 'string' ? item.category_id : '',
    name_ru,
    name_uz,
    description_ru: typeof item.description_ru === 'string' ? item.description_ru : null,
    description_uz: typeof item.description_uz === 'string' ? item.description_uz : null,
    price: toFiniteNumber(item.price),
    images,
    image_url: images[0] ?? null,
    weight: toOptionalString(item.weight),
    stock,
    discount_percent: Math.min(90, Math.max(0, Math.round(discountRaw))),
    available: item.available !== false,
    featured: item.featured === true,
    isNew: item.isNew === true,
    tags: sanitizeTags(item.tags),
    sort_order: toFiniteNumber(item.sort_order),
    created_at: typeof item.created_at === 'string' ? item.created_at : undefined,
    updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
  };
}

/** Loads, repairs and de-duplicates the stored list (one id = one item). */
function loadItems(): MenuItem[] {
  const rawList = loadMenuItemsRaw();
  const byId = new Map<string, MenuItem>();
  let repaired = false;

  for (const raw of rawList) {
    const item = sanitizeMenuItem(raw);
    if (!item) {
      repaired = true;
      continue;
    }
    if (byId.has(item.id)) {
      repaired = true;
      continue;
    }
    byId.set(item.id, item);
  }

  const list = [...byId.values()];
  if (repaired || list.length !== rawList.length) {
    try {
      saveMenuItemsRaw(list);
    } catch {
      // storage full/unavailable — keep working with the repaired in-memory list
    }
  }
  return list;
}

export function getMenuItems(): MenuItem[] {
  return [...loadItems()].sort(
    (a, b) => a.sort_order - b.sort_order || a.name_ru.localeCompare(b.name_ru),
  );
}

export function getMenuItemById(id: string): MenuItem | null {
  if (!id) return null;
  return loadItems().find((item) => item.id === id) ?? null;
}

/** Bulk replace (used by drag & drop reordering). */
export function saveMenuItems(items: MenuItem[]): void {
  saveMenuItemsRaw(items);
}

export function addMenuItem(payload: MenuItemPayload): MenuItem {
  const images = sanitizeImages(payload.images ?? (payload.image_url ? [payload.image_url] : []));
  const item: MenuItem = {
    ...payload,
    images,
    image_url: images[0] ?? null,
    stock: payload.stock ?? null,
    discount_percent: Math.min(90, Math.max(0, Math.round(payload.discount_percent ?? 0))),
    featured: payload.featured ?? false,
    isNew: payload.isNew ?? false,
    tags: payload.tags ?? [],
    // A fresh stable id is always generated here; any incoming id is ignored.
    id: uid(),
    created_at: nowIso(),
  };
  saveMenuItemsRaw([...loadItems(), item]);
  return item;
}

export function updateMenuItem(id: string, updates: Partial<MenuItemPayload>): MenuItem | null {
  if (!id) return null;

  // The identifier and creation stamp are immutable.
  const { id: _ignoredId, created_at: _ignoredCreated, ...rest } = updates as Record<string, unknown>;
  const changes = rest as Partial<MenuItemPayload>;

  let updated: MenuItem | null = null;
  const next = loadItems().map((item) => {
    if (item.id !== id) return item;
    const merged: MenuItem = { ...item, ...changes, id: item.id, updated_at: nowIso() };
    // Keep the gallery and the legacy cover field in sync.
    merged.images = sanitizeImages(merged.images);
    if (merged.images.length === 0 && merged.image_url) merged.images = [merged.image_url];
    merged.image_url = merged.images[0] ?? null;
    merged.discount_percent = Math.min(90, Math.max(0, Math.round(merged.discount_percent ?? 0)));
    updated = merged;
    return updated;
  });

  if (!updated) return null;
  saveMenuItemsRaw(next);
  return updated;
}

export function deleteMenuItem(id: string): boolean {
  if (!id) return false;
  const items = loadItems();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  saveMenuItemsRaw(next);
  return true;
}

export function countItemsByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of loadItems()) {
    counts[item.category_id] = (counts[item.category_id] ?? 0) + 1;
  }
  return counts;
}
