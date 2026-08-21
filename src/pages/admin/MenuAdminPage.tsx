import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Percent,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  ZoomIn,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPrice, getLocalized } from '@/lib/format';
import { effectivePrice, hasDiscount, stockState } from '@/lib/pricing';
import { getErrorMessage } from '@/lib/errors';
import { moveItem } from '@/lib/array';
import { getCategories } from '@/services/categoryService';
import {
  deleteMenuItem,
  getMenuItems,
  saveMenuItems,
  updateMenuItem,
} from '@/services/menuStorage';
import { logActivity } from '@/services/activityStorage';
import { toast } from '@/store/toastStore';
import type { Category, MenuItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { SelectField, TextField } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/States';
import { SmartImage } from '@/components/public/SmartImage';
import { DishModal } from '@/components/public/DishModal';
import { cn } from '@/lib/cn';

type StatusFilter = 'all' | 'available' | 'hidden';
type SortMode = 'manual' | 'priceAsc' | 'priceDesc' | 'name' | 'discount';

export function MenuAdminPage() {
  const { lang, t } = useTranslation();
  const [items, setItems] = useState<MenuItem[]>(() => getMenuItems());
  const [categories] = useState<Category[]>(() => getCategories());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('manual');
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = items.filter((item) => {
      if (categoryFilter !== 'all' && item.category_id !== categoryFilter) return false;
      if (statusFilter === 'available' && !item.available) return false;
      if (statusFilter === 'hidden' && item.available) return false;
      if (query) {
        const haystack = `${item.name_ru} ${item.name_uz}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    if (sortMode === 'manual') return result;
    const sorted = [...result];
    switch (sortMode) {
      case 'priceAsc':
        sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case 'priceDesc':
        sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case 'name':
        sorted.sort((a, b) => a.name_ru.localeCompare(b.name_ru, lang));
        break;
      case 'discount':
        sorted.sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0));
        break;
    }
    return sorted;
  }, [items, search, categoryFilter, statusFilter, sortMode, lang]);

  const categoryName = (id: string) => {
    const category = categories.find((c) => c.id === id);
    return category ? getLocalized(category, 'name', lang) : t('menuAdmin.noCategory');
  };

  const handleToggleAvailability = (item: MenuItem) => {
    try {
      const updated = updateMenuItem(item.id, { available: !item.available });
      if (updated) {
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        toast.success(updated.available ? t('menuAdmin.shown') : t('menuAdmin.hiddenToast'));
      } else {
        toast.error(t('menuAdmin.notFound'));
        setItems(getMenuItems());
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    try {
      const removed = deleteMenuItem(deletingItem.id);
      if (removed) {
        setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
        logActivity('activity.productDeleted', deletingItem.name_ru);
        toast.success(t('menuAdmin.deleted'));
      } else {
        toast.error(t('menuAdmin.notFound'));
        setItems(getMenuItems());
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingItem(null);
    }
  };

  /** Merges a reordered filtered subset back into the full list and persists it. */
  const persistOrder = (nextFiltered: MenuItem[]) => {
    try {
      const filteredIds = new Set(nextFiltered.map((item) => item.id));
      let cursor = 0;
      const merged = items.map((item) =>
        filteredIds.has(item.id) ? nextFiltered[cursor++] : item,
      );
      const counters = new Map<string, number>();
      const resequenced = merged.map((item) => {
        const next = (counters.get(item.category_id) ?? 0) + 1;
        counters.set(item.category_id, next);
        return { ...item, sort_order: next * 10 };
      });
      saveMenuItems(resequenced);
      setItems(resequenced);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setItems(getMenuItems());
    }
  };

  const handleDrop = (targetItem: MenuItem) => {
    const sourceId = dragIdRef.current;
    dragIdRef.current = null;
    setDragId(null);
    setDragOverId(null);
    if (!sourceId || sourceId === targetItem.id) return;
    if (!canReorder(sourceId, targetItem.id)) return;
    const from = filteredItems.findIndex((item) => item.id === sourceId);
    const to = filteredItems.findIndex((item) => item.id === targetItem.id);
    if (from === -1 || to === -1) return;
    persistOrder(moveItem(filteredItems, from, to));
  };

  const canReorder = (sourceId: string, targetId: string): boolean => {
    const source = items.find((item) => item.id === sourceId);
    const target = items.find((item) => item.id === targetId);
    return !!source && !!target && source.category_id === target.category_id;
  };

  const moveBy = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= filteredItems.length) return;
    if (filteredItems[index].category_id !== filteredItems[target].category_id) return;
    persistOrder(moveItem(filteredItems, index, target));
  };

  const statusBadge = (available: boolean) =>
    available ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t('common.available')}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        {t('common.hidden')}
      </span>
    );

  const featureBadges = (item: MenuItem) => (
    <>
      {item.featured && (
        <span
          title={t('menu.featured')}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark"
        >
          <Sparkles size={11} />
        </span>
      )}
      {item.isNew && (
        <span className="rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
          {t('badge.new')}
        </span>
      )}
    </>
  );

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
            {t('menuAdmin.title')}
          </h1>
          <p className="mt-1 text-sm text-muted">{`${items.length}`}</p>
        </div>
        <Link to="/admin/menu/new" className="shrink-0">
          <Button variant="primary" size="md" className="w-full sm:w-auto">
            <Plus size={17} />
            {t('menuAdmin.addProduct')}
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <TextField
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <SelectField
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label={t('menuAdmin.category')}
        >
          <option value="all">{t('menuAdmin.filterCategory')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {getLocalized(category, 'name', lang)}
            </option>
          ))}
        </SelectField>
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label={t('common.available')}
        >
          <option value="all">{t('menuAdmin.filterStatus')}</option>
          <option value="available">{t('common.available')}</option>
          <option value="hidden">{t('common.hidden')}</option>
        </SelectField>
        <SelectField
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          aria-label={t('common.sort')}
        >
          <option value="manual">{t('menuAdmin.sortManual')}</option>
          <option value="priceAsc">{t('menuAdmin.sortPriceAsc')}</option>
          <option value="priceDesc">{t('menuAdmin.sortPriceDesc')}</option>
          <option value="name">{t('menuAdmin.sortName')}</option>
          <option value="discount">{t('menuAdmin.sortDiscount')}</option>
        </SelectField>
      </div>

      {sortMode !== 'manual' && filteredItems.length > 0 && (
        <p className="mt-3 text-xs font-medium text-gold-dark">
          {t('menuAdmin.sortHint')}
        </p>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted lg:hidden">
        <GripVertical size={13} aria-hidden />
        {t('common.dragHint')}
      </p>

      <div className="mt-6">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title={t('menuAdmin.empty')}
            subtitle={t('menuAdmin.emptyHint')}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-card lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-sand/60 text-[11px] font-bold uppercase tracking-wider text-muted">
                    {sortMode === 'manual' && <th className="w-10 px-4 py-3.5" aria-label="" />}
                    <th className="px-2 py-3.5">{t('form.nameRu')}</th>
                    <th className="px-4 py-3.5">{t('menuAdmin.category')}</th>
                    <th className="px-4 py-3.5">{t('menuAdmin.price')}</th>
                    <th className="px-4 py-3.5">{t('menuAdmin.stock')}</th>
                    <th className="px-4 py-3.5">{t('common.status')}</th>
                    <th className="px-5 py-3.5 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const discounted = hasDiscount(item);
                    const stock = stockState(item);
                    return (
                      <tr
                        key={item.id}
                        draggable={sortMode === 'manual'}
                        onDragStart={(e) => {
                          if (sortMode !== 'manual') return;
                          dragIdRef.current = item.id;
                          setDragId(item.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragIdRef.current && dragIdRef.current !== item.id) {
                            setDragOverId(
                              canReorder(dragIdRef.current, item.id) ? item.id : null,
                            );
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDrop(item);
                        }}
                        onDragEnd={() => {
                          dragIdRef.current = null;
                          setDragId(null);
                          setDragOverId(null);
                        }}
                        className={cn(
                          'border-b border-border/60 transition-colors last:border-0 hover:bg-sand/40',
                          dragId === item.id && 'opacity-50',
                          dragOverId === item.id && dragId !== null && dragId !== item.id
                            ? 'ring-2 ring-inset ring-gold'
                            : '',
                        )}
                      >
                        {sortMode === 'manual' && (
                          <td className="px-4 py-3.5">
                            <GripVertical
                              size={15}
                              className="cursor-grab text-muted/60 active:cursor-grabbing"
                              aria-hidden
                            />
                          </td>
                        )}
                        <td className="max-w-xs px-2 py-3.5">
                          <div className="flex items-center gap-3">
                            <SmartImage
                              src={item.image_url}
                              alt=""
                              className="h-11 w-11 shrink-0 overflow-hidden rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate font-semibold text-espresso">
                                  {item.name_ru}
                                </p>
                                {featureBadges(item)}
                              </div>
                              <p className="truncate text-xs text-muted">{item.name_uz}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-coffee">{categoryName(item.category_id)}</td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="font-semibold text-espresso">
                            {formatPrice(effectivePrice(item), lang)}
                          </span>
                          {discounted && (
                            <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                              <Percent size={9} />
                              {item.discount_percent}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {stock === 'untracked' ? (
                            <span className="text-xs text-muted">∞</span>
                          ) : stock === 'out' ? (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                              0
                            </span>
                          ) : (
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[11px] font-bold',
                                stock === 'low'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700',
                              )}
                            >
                              {item.stock}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">{statusBadge(item.available)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              title={t('common.preview')}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-mocha transition-colors hover:bg-sand hover:text-espresso"
                            >
                              <ZoomIn size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(item)}
                              title={item.available ? t('menuAdmin.hide') : t('menuAdmin.show')}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-mocha transition-colors hover:bg-sand hover:text-espresso"
                            >
                              {item.available ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <Link
                              to={`/admin/menu/${item.id}/edit`}
                              title={t('common.edit')}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-mocha transition-colors hover:bg-sand hover:text-gold-dark"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeletingItem(item)}
                              title={t('common.delete')}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-mocha transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-white p-4 shadow-card"
                >
                  <div className="flex gap-3.5">
                    <SmartImage
                      src={item.image_url}
                      alt=""
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold text-espresso">{item.name_ru}</p>
                        {featureBadges(item)}
                      </div>
                      <p className="truncate text-xs text-muted">{item.name_uz}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-bold text-coffee">
                          {formatPrice(effectivePrice(item), lang)}
                        </span>
                        {hasDiscount(item) && (
                          <>
                            <span className="text-xs font-medium text-muted line-through">
                              {formatPrice(item.price, lang)}
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                              <Percent size={9} />
                              {item.discount_percent}
                            </span>
                          </>
                        )}
                        {stockState(item) === 'out' && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            {t('menuAdmin.outOfStock')}
                          </span>
                        )}
                      </div>
                    </div>
                    {sortMode === 'manual' && (
                      <div className="flex shrink-0 flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveBy(index, -1)}
                        disabled={
                          index === 0 ||
                          filteredItems[index].category_id !==
                            filteredItems[index - 1].category_id
                        }
                        title={t('common.orderUp')}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-mocha transition-colors hover:bg-sand hover:text-gold-dark disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBy(index, 1)}
                        disabled={
                          index === filteredItems.length - 1 ||
                          filteredItems[index].category_id !==
                            filteredItems[index + 1].category_id
                        }
                        title={t('common.orderDown')}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-mocha transition-colors hover:bg-sand hover:text-gold-dark disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {statusBadge(item.available)}
                    <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold text-mocha">
                      {categoryName(item.category_id)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      title={t('common.preview')}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-mocha transition-colors hover:bg-sand hover:text-espresso"
                    >
                      <ZoomIn size={15} />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
                    >
                      {item.available ? <EyeOff size={14} /> : <Eye size={14} />}
                      {item.available ? t('menuAdmin.hide') : t('menuAdmin.show')}
                    </button>
                    <Link
                      to={`/admin/menu/${item.id}/edit`}
                      className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
                    >
                      <Pencil size={13} />
                      {t('common.edit')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={deletingItem !== null}
        title={t('menuAdmin.deleteConfirmTitle')}
        message={t('menuAdmin.deleteConfirmText')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />

      {previewItem && (
        <DishModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </div>
  );
}
