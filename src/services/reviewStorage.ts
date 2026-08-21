import { nowIso, uid } from '@/lib/id';
import { loadReviewsRaw, saveReviewsRaw } from '@/services/db';
import type { Review } from '@/types';

/**
 * Single source of truth for review storage.
 */

export type ReviewPayload = {
  item_id?: string | null;
  author_name: string;
  rating: number;
  text_ru: string;
  text_uz: string;
  avatar_url: string | null;
  visited_at: string;
  visible: boolean;
};

function clampRating(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.min(5, Math.max(1, Math.round(num)));
}

function sanitizeReview(raw: unknown): Review | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const review = raw as Record<string, unknown>;
  const name = typeof review.author_name === 'string' ? review.author_name.trim() : '';
  const textRu = typeof review.text_ru === 'string' ? review.text_ru : '';
  const textUz = typeof review.text_uz === 'string' ? review.text_uz : '';
  if (!name && !textRu && !textUz) return null;

  const visitedRaw = typeof review.visited_at === 'string' ? review.visited_at : '';
  const visitedDate = new Date(visitedRaw);

  return {
    id: typeof review.id === 'string' && review.id ? review.id : uid(),
    item_id:
      typeof review.item_id === 'string' && review.item_id ? review.item_id : null,
    author_name: name,
    rating: clampRating(review.rating),
    text_ru: textRu,
    text_uz: textUz,
    avatar_url:
      typeof review.avatar_url === 'string' && review.avatar_url ? review.avatar_url : null,
    visited_at: Number.isNaN(visitedDate.getTime()) ? nowIso() : visitedRaw,
    visible: review.visible !== false,
    created_at: typeof review.created_at === 'string' ? review.created_at : undefined,
    updated_at: typeof review.updated_at === 'string' ? review.updated_at : undefined,
  };
}

function loadReviews(): Review[] {
  const rawList = loadReviewsRaw();
  const byId = new Map<string, Review>();
  let repaired = false;

  for (const raw of rawList) {
    const review = sanitizeReview(raw);
    if (!review) {
      repaired = true;
      continue;
    }
    if (byId.has(review.id)) {
      repaired = true;
      continue;
    }
    byId.set(review.id, review);
  }

  const list = [...byId.values()];
  if (repaired || list.length !== rawList.length) {
    try {
      saveReviewsRaw(list);
    } catch {
      // ignore repair-write failures
    }
  }
  return list;
}

export function getReviews(options?: {
  onlyVisible?: boolean;
  itemId?: string;
}): Review[] {
  const list = loadReviews().sort(
    (a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
  );
  let result = options?.onlyVisible ? list.filter((review) => review.visible) : list;
  if (options?.itemId !== undefined) {
    result = result.filter((review) => review.item_id === options.itemId);
  }
  return result;
}

/** Visible reviews for a specific menu item (used by the product view). */
export function getItemReviews(itemId: string): Review[] {
  return getReviews({ onlyVisible: true, itemId });
}

export function getReviewById(id: string): Review | null {
  if (!id) return null;
  return loadReviews().find((review) => review.id === id) ?? null;
}

export function addReview(payload: ReviewPayload): Review {
  const review: Review = {
    id: uid(),
    item_id: payload.item_id ?? null,
    created_at: nowIso(),
    author_name: payload.author_name,
    rating: clampRating(payload.rating),
    text_ru: payload.text_ru,
    text_uz: payload.text_uz,
    avatar_url: payload.avatar_url,
    visited_at: payload.visited_at,
    visible: payload.visible,
  };
  saveReviewsRaw([...loadReviews(), review]);
  return review;
}

export function updateReview(id: string, updates: Partial<ReviewPayload>): Review | null {
  if (!id) return null;
  const { id: _ignoredId, created_at: _ignoredCreated, ...rest } = updates as Record<string, unknown>;
  const changes = rest as Partial<ReviewPayload>;

  let updated: Review | null = null;
  const next = loadReviews().map((review) => {
    if (review.id !== id) return review;
    updated = { ...review, ...changes, id: review.id, updated_at: nowIso() };
    return updated;
  });

  if (!updated) return null;
  saveReviewsRaw(next);
  return updated;
}

export function deleteReview(id: string): boolean {
  if (!id) return false;
  const reviews = loadReviews();
  const next = reviews.filter((review) => review.id !== id);
  if (next.length === reviews.length) return false;
  saveReviewsRaw(next);
  return true;
}
