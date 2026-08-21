import { nowIso, uid } from '@/lib/id';
import { loadActivitiesRaw, saveActivitiesRaw } from '@/services/db';
import type { ActivityEntry } from '@/types';

/**
 * Lightweight admin activity log (last 30 entries).
 */

export function getActivities(): ActivityEntry[] {
  return [...loadActivitiesRaw()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function logActivity(action: string, subject: string): void {
  const entry: ActivityEntry = { id: uid(), action, subject, created_at: nowIso() };
  try {
    saveActivitiesRaw([entry, ...loadActivitiesRaw()]);
  } catch {
    // activity log must never break the actual operation
  }
}
