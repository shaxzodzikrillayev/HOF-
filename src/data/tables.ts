import type { CafeTable } from '@/types';

/**
 * Seed tables 1–6 so the QR page is usable right after install.
 * The owner can add, rename or delete tables in the admin panel.
 */
export const SEED_TABLES: CafeTable[] = [1, 2, 3, 4, 5, 6].map((number) => ({
  id: `t1000000-0000-4000-8000-${String(number).padStart(12, '0')}`,
  number,
}));
