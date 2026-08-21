export type Language = 'ru' | 'uz';

export type DishTag = 'spicy' | 'vegetarian' | 'popular';

export interface Category {
  id: string;
  name_ru: string;
  name_uz: string;
  image_url: string | null;
  hidden: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_ru: string;
  name_uz: string;
  description_ru: string | null;
  description_uz: string | null;
  price: number;
  /** Gallery of stored image URLs/data-URLs. First entry is the cover. */
  images: string[];
  /** Legacy single-image field kept in sync with images[0]. */
  image_url: string | null;
  weight: string | null;
  /** Available stock; null means "not tracked". */
  stock: number | null;
  /** Discount percentage 0–90 applied to price. */
  discount_percent: number;
  available: boolean;
  featured: boolean;
  isNew: boolean;
  tags: DishTag[];
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface About {
  id: string;
  title_ru: string;
  title_uz: string;
  content_ru: string;
  content_uz: string;
  image_url: string | null;
  updated_at?: string;
}

export interface Settings {
  cafeName: string;
  tagline: string;
  phone: string;
  address: string;
  workingHours: string;
  description: string;
  telegramUrl: string;
  instagramUrl: string;
  logoUrl: string | null;
  defaultLang: Language;
}

// ---------- Reviews ----------

export interface Review {
  id: string;
  /** Linked menu item; null = general review about the venue. */
  item_id: string | null;
  author_name: string;
  rating: number; // 1..5
  text_ru: string;
  text_uz: string;
  avatar_url: string | null;
  visited_at: string; // ISO date shown on the card
  visible: boolean;
  created_at?: string;
  updated_at?: string;
}

// ---------- Cafe tables (QR menu) ----------

export interface CafeTable {
  id: string;
  number: number;
  created_at?: string;
  updated_at?: string;
}

// ---------- Orders ----------

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card';

export interface OrderItem {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: number;
  /** Table number from the QR menu (?table=N); null for regular website orders. */
  table_number: number | null;
  customer_name: string;
  phone: string;
  comment: string | null;
  payment_method: PaymentMethod;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

// ---------- Admin activity log ----------

export interface ActivityEntry {
  id: string;
  action: string; // translation key
  subject: string; // human-readable target (dish name, order number…)
  created_at: string;
}
