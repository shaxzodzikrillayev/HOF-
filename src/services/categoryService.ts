import { nowIso, uid } from '@/lib/id';
import { loadCategories, saveCategories } from '@/services/db';
import type { Category } from '@/types';

export type CategoryPayload = {
  name_ru: string;
  name_uz: string;
  image_url?: string | null;
  hidden?: boolean;
  sort_order: number;
};

export function getCategories(): Category[] {
  return [...loadCategories()].sort(
    (a, b) => a.sort_order - b.sort_order || a.name_ru.localeCompare(b.name_ru),
  );
}

/** Persists a full categories list (used by drag & drop reordering). */
export function saveItems(categories: Category[]): void {
  saveCategories(categories);
}

export function createCategory(values: CategoryPayload): Category {
  const category: Category = {
    id: uid(),
    name_ru: values.name_ru,
    name_uz: values.name_uz,
    sort_order: values.sort_order,
    image_url: values.image_url ?? null,
    hidden: values.hidden ?? false,
  };
  saveCategories([...loadCategories(), category]);
  return category;
}

export function updateCategory(id: string, values: CategoryPayload): Category | null {
  let updated: Category | null = null;
  const next = loadCategories().map((category) => {
    if (category.id !== id) return category;
    updated = {
      ...category,
      name_ru: values.name_ru,
      name_uz: values.name_uz,
      sort_order: values.sort_order,
      image_url: values.image_url ?? null,
      hidden: values.hidden ?? false,
      updated_at: nowIso(),
    };
    return updated;
  });
  if (!updated) return null;
  saveCategories(next);
  return updated;
}

/** Deletes a category. Caller must ensure no menu items reference it. */
export function deleteCategory(id: string): void {
  saveCategories(loadCategories().filter((category) => category.id !== id));
}
