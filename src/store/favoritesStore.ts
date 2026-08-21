import { create } from 'zustand';
import { STORAGE_KEYS } from '@/services/db';

interface FavoritesState {
  ids: string[];
  toggle: (itemId: string) => void;
  has: (itemId: string) => boolean;
}

function readStoredIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.favorites);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function persist(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids));
  } catch {
    // favorites are non-critical — ignore storage failures
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: readStoredIds(),

  toggle: (itemId) => {
    const ids = get().ids.includes(itemId)
      ? get().ids.filter((id) => id !== itemId)
      : [...get().ids, itemId];
    persist(ids);
    set({ ids });
  },

  has: (itemId) => get().ids.includes(itemId),
}));
