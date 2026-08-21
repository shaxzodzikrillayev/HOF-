import { create } from 'zustand';
import { STORAGE_KEYS } from '@/services/db';

/**
 * Tracks the table number detected from the QR menu URL (?table=N).
 * Persisted in sessionStorage so a page refresh keeps the context.
 */

interface TableState {
  tableNumber: number | null;
  setTable: (number: number) => void;
  clear: () => void;
}

function readStoredTable(): number | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.tableSession);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 1 ? Math.round(parsed) : null;
  } catch {
    return null;
  }
}

function persist(number: number | null): void {
  try {
    if (number === null) window.sessionStorage.removeItem(STORAGE_KEYS.tableSession);
    else window.sessionStorage.setItem(STORAGE_KEYS.tableSession, String(number));
  } catch {
    // non-critical — ignore storage failures
  }
}

export const useTableStore = create<TableState>((set) => ({
  tableNumber: readStoredTable(),

  setTable: (number) => {
    persist(number);
    set({ tableNumber: number });
  },

  clear: () => {
    persist(null);
    set({ tableNumber: null });
  },
}));
