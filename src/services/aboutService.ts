import { DEFAULT_ABOUT } from '@/data/about';
import { nowIso } from '@/lib/id';
import { loadAbout, saveAbout } from '@/services/db';
import type { About } from '@/types';

export function getAbout(): About {
  return loadAbout();
}

export function persistAbout(values: Omit<About, 'id' | 'updated_at'>): About {
  const current = loadAbout();
  const next: About = { ...current, ...values, id: DEFAULT_ABOUT.id, updated_at: nowIso() };
  saveAbout(next);
  return next;
}
