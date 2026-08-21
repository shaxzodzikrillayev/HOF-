import { DEFAULT_ABOUT } from '@/data/about';
import { SEED_CATEGORIES } from '@/data/categories';
import { SEED_MENU_ITEMS } from '@/data/menu';
import { SEED_ORDERS } from '@/data/orders';
import { SEED_REVIEWS } from '@/data/reviews';
import { SEED_TABLES } from '@/data/tables';
import { DEFAULT_SETTINGS } from '@/data/settings';
import type {
  About,
  ActivityEntry,
  CafeTable,
  Category,
  MenuItem,
  Order,
  Review,
  Settings,
} from '@/types';

/**
 * Low-level localStorage layer.
 * All application data lives under the "hofe:" namespace.
 * On first read each collection is seeded from src/data/.
 * JSON parsing and quota errors are handled safely here;
 * shape validation lives in the service modules.
 */

export const STORAGE_KEYS = {
  categories: 'hofe:categories',
  menuItems: 'hofe:menu-items',
  about: 'hofe:about',
  settings: 'hofe:settings',
  reviews: 'hofe:reviews',
  orders: 'hofe:orders',
  orderCounter: 'hofe:order-counter',
  activities: 'hofe:activities',
  cart: 'hofe:cart',
  favorites: 'hofe:favorites',
  tables: 'hofe:tables',
  tableSession: 'hofe:table-session',
} as const;

/**
 * One-time marker: when absent, the stored menu items are replaced with the
 * (empty) seed. This clears demo dishes from browsers that visited an older
 * version of the site. Runs at most once per browser.
 */
const MENU_SEED_FLAG = 'hofe:menu-seed-v2';

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupted JSON or unavailable storage — fall back to seed data.
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(
      'Локальное хранилище браузера переполнено. Удалите неиспользуемые изображения в админке.',
    );
  }
}

export function readCollection<T>(key: string, seed: T[]): T[] {
  const existing = readJson<T[]>(key);
  if (Array.isArray(existing)) return existing;
  writeJson(key, seed);
  return [...seed];
}

export function readRow<T>(key: string, seed: T): T {
  const existing = readJson<T>(key);
  if (existing && typeof existing === 'object') return existing as T;
  writeJson(key, seed);
  return { ...seed };
}

// ---------- Raw menu item accessors (shape validation in menuStorage.ts) ----------

export function loadMenuItemsRaw(): MenuItem[] {
  let migrated = true;
  try {
    migrated = window.localStorage.getItem(MENU_SEED_FLAG) === '1';
  } catch {
    return [...SEED_MENU_ITEMS];
  }
  if (!migrated) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.menuItems, JSON.stringify(SEED_MENU_ITEMS));
      window.localStorage.setItem(MENU_SEED_FLAG, '1');
    } catch {
      // storage unavailable — fall through to normal read
    }
    return [...SEED_MENU_ITEMS];
  }
  return readCollection<MenuItem>(STORAGE_KEYS.menuItems, SEED_MENU_ITEMS);
}

export function saveMenuItemsRaw(items: MenuItem[]): void {
  writeJson(STORAGE_KEYS.menuItems, items);
}

// ---------- Typed accessors ----------

function sanitizeCategory(raw: unknown): Category | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const category = raw as Record<string, unknown>;
  const name_ru = typeof category.name_ru === 'string' ? category.name_ru : '';
  const name_uz = typeof category.name_uz === 'string' ? category.name_uz : '';
  if (!name_ru && !name_uz) return null;
  const sortOrder = Number(category.sort_order);
  return {
    id: typeof category.id === 'string' && category.id ? category.id : crypto.randomUUID(),
    name_ru,
    name_uz,
    image_url: typeof category.image_url === 'string' && category.image_url ? category.image_url : null,
    hidden: category.hidden === true,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    created_at: typeof category.created_at === 'string' ? category.created_at : undefined,
    updated_at: typeof category.updated_at === 'string' ? category.updated_at : undefined,
  };
}

export function loadCategories(): Category[] {
  const rawList = readCollection<Category>(STORAGE_KEYS.categories, SEED_CATEGORIES);
  const byId = new Map<string, Category>();
  let repaired = false;

  for (const raw of rawList) {
    const category = sanitizeCategory(raw);
    if (!category) {
      repaired = true;
      continue;
    }
    if (byId.has(category.id)) {
      repaired = true;
      continue;
    }
    byId.set(category.id, category);
  }

  const list = [...byId.values()];
  if (repaired || list.length !== rawList.length) {
    try {
      writeJson(STORAGE_KEYS.categories, list);
    } catch {
      // ignore repair-write failures
    }
  }
  return list;
}

export function saveCategories(categories: Category[]): void {
  writeJson(STORAGE_KEYS.categories, categories);
}

export function loadAbout(): About {
  return readRow<About>(STORAGE_KEYS.about, DEFAULT_ABOUT);
}

export function saveAbout(about: About): void {
  writeJson(STORAGE_KEYS.about, about);
}

export function loadSettings(): Settings {
  const stored = readJson<Partial<Settings>>(STORAGE_KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export function saveSettings(settings: Settings): void {
  writeJson(STORAGE_KEYS.settings, settings);
}

// ---------- Reviews ----------

export function loadReviewsRaw(): Review[] {
  return readCollection<Review>(STORAGE_KEYS.reviews, SEED_REVIEWS);
}

export function saveReviewsRaw(reviews: Review[]): void {
  writeJson(STORAGE_KEYS.reviews, reviews);
}

// ---------- Cafe tables ----------

export function loadTablesRaw(): CafeTable[] {
  return readCollection<CafeTable>(STORAGE_KEYS.tables, SEED_TABLES);
}

export function saveTablesRaw(tables: CafeTable[]): void {
  writeJson(STORAGE_KEYS.tables, tables);
}

// ---------- Orders ----------

export function loadOrdersRaw(): Order[] {
  return readCollection<Order>(STORAGE_KEYS.orders, SEED_ORDERS);
}

export function saveOrdersRaw(orders: Order[]): void {
  writeJson(STORAGE_KEYS.orders, orders);
}

export function readOrderCounter(): number {
  const value = readJson<number>(STORAGE_KEYS.orderCounter);
  return typeof value === 'number' && Number.isFinite(value) ? value : 1000;
}

export function writeOrderCounter(value: number): void {
  writeJson(STORAGE_KEYS.orderCounter, value);
}

// ---------- Admin activity log ----------

export function loadActivitiesRaw(): ActivityEntry[] {
  const existing = readJson<ActivityEntry[]>(STORAGE_KEYS.activities);
  return Array.isArray(existing) ? existing : [];
}

export function saveActivitiesRaw(entries: ActivityEntry[]): void {
  writeJson(STORAGE_KEYS.activities, entries.slice(0, 30));
}
