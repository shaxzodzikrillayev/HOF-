import { nowIso, uid } from '@/lib/id';
import { loadTablesRaw, saveTablesRaw } from '@/services/db';
import type { CafeTable } from '@/types';

/**
 * Single source of truth for cafe table storage (QR menu).
 */

export const MAX_TABLE_NUMBER = 999;

function sanitizeTable(raw: unknown): CafeTable | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const table = raw as Record<string, unknown>;
  const number = Math.round(Number(table.number));
  if (!Number.isFinite(number) || number < 1 || number > MAX_TABLE_NUMBER) return null;
  return {
    id: typeof table.id === 'string' && table.id ? table.id : uid(),
    number,
    created_at: typeof table.created_at === 'string' ? table.created_at : undefined,
    updated_at: typeof table.updated_at === 'string' ? table.updated_at : undefined,
  };
}

function loadTables(): CafeTable[] {
  const rawList = loadTablesRaw();
  const byId = new Map<string, CafeTable>();
  let repaired = false;

  for (const raw of rawList) {
    const table = sanitizeTable(raw);
    if (!table) {
      repaired = true;
      continue;
    }
    if (byId.has(table.id)) {
      repaired = true;
      continue;
    }
    byId.set(table.id, table);
  }

  const list = [...byId.values()].sort((a, b) => a.number - b.number);
  if (repaired || list.length !== rawList.length) {
    try {
      saveTablesRaw(list);
    } catch {
      // ignore repair-write failures
    }
  }
  return list;
}

export function getTables(): CafeTable[] {
  return [...loadTables()];
}

export function getTableById(id: string): CafeTable | null {
  if (!id) return null;
  return loadTables().find((table) => table.id === id) ?? null;
}

export function isTableNumberTaken(number: number, excludeId?: string): boolean {
  return loadTables().some(
    (table) => table.number === number && table.id !== excludeId,
  );
}

/** Adds a table. Throws when the number is missing, invalid or already used. */
export function addTable(number: number): CafeTable {
  const normalized = Math.round(Number(number));
  if (!Number.isFinite(normalized) || normalized < 1 || normalized > MAX_TABLE_NUMBER) {
    throw new Error('Некорректный номер стола.');
  }
  if (isTableNumberTaken(normalized)) {
    throw new Error(`Стол №${normalized} уже существует.`);
  }
  const table: CafeTable = { id: uid(), number: normalized, created_at: nowIso() };
  saveTablesRaw([...loadTables(), table]);
  return table;
}

/** Renames (changes the number of) an existing table. */
export function updateTable(id: string, number: number): CafeTable | null {
  if (!id) return null;
  const normalized = Math.round(Number(number));
  if (!Number.isFinite(normalized) || normalized < 1 || normalized > MAX_TABLE_NUMBER) {
    throw new Error('Некорректный номер стола.');
  }
  if (isTableNumberTaken(normalized, id)) {
    throw new Error(`Стол №${normalized} уже существует.`);
  }

  let updated: CafeTable | null = null;
  const next = loadTables().map((table) => {
    if (table.id !== id) return table;
    updated = { ...table, number: normalized, updated_at: nowIso() };
    return updated;
  });

  if (!updated) return null;
  saveTablesRaw(next.sort((a, b) => a.number - b.number));
  return updated;
}

export function deleteTable(id: string): boolean {
  if (!id) return false;
  const tables = loadTables();
  const next = tables.filter((table) => table.id !== id);
  if (next.length === tables.length) return false;
  saveTablesRaw(next);
  return true;
}
