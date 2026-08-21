import { useMemo, useState } from 'react';
import { Eye, EyeOff, MessageSquarePlus, Pencil, Search, Star, Trash2, UtensilsCrossed } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate, getLocalized } from '@/lib/format';
import {
  addReview,
  deleteReview,
  getReviews,
  updateReview,
} from '@/services/reviewStorage';
import { getMenuItems } from '@/services/menuStorage';
import { logActivity } from '@/services/activityStorage';
import { toast } from '@/store/toastStore';
import { getErrorMessage } from '@/lib/errors';
import type { Review } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/States';
import { Stars } from '@/components/ui/Stars';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 9;

type VisibilityFilter = 'all' | 'visible' | 'hidden';

interface ReviewFormState {
  author_name: string;
  rating: number;
  text_ru: string;
  text_uz: string;
  avatar_url: string;
  visible: boolean;
}

const EMPTY_FORM: ReviewFormState = {
  author_name: '',
  rating: 5,
  text_ru: '',
  text_uz: '',
  avatar_url: '',
  visible: true,
};

function ReviewForm({
  value,
  onChange,
}: {
  value: ReviewFormState;
  onChange: (next: ReviewFormState) => void;
}) {
  const { t } = useTranslation();
  const set = <K extends keyof ReviewFormState>(key: K, v: ReviewFormState[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-coffee">
            {t('reviews.form.author')}
          </span>
          <input
            value={value.author_name}
            onChange={(e) => set('author_name', e.target.value)}
            maxLength={60}
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-espresso outline-none transition-colors placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </label>
        <div>
          <span className="mb-1.5 block text-[13px] font-bold text-coffee">
            {t('reviews.form.rating')}
          </span>
          <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-white px-4">
            <Stars
              rating={value.rating}
              size={20}
              interactive
              onChange={(rating) => set('rating', rating)}
            />
            <span className="text-sm font-bold text-espresso">{value.rating}</span>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-bold text-coffee">
          {t('reviews.form.textRu')}
        </span>
        <textarea
          value={value.text_ru}
          onChange={(e) => set('text_ru', e.target.value)}
          rows={3}
          maxLength={600}
          className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-espresso outline-none transition-colors placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-bold text-coffee">
          {t('reviews.form.textUz')}
        </span>
        <textarea
          value={value.text_uz}
          onChange={(e) => set('text_uz', e.target.value)}
          rows={3}
          maxLength={600}
          className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-espresso outline-none transition-colors placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-bold text-coffee">
          {t('reviews.form.avatar')} ({t('common.optional')})
        </span>
        <input
          value={value.avatar_url}
          onChange={(e) => set('avatar_url', e.target.value)}
          placeholder="https://…"
          className="h-11 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-espresso outline-none transition-colors placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
      </label>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-cream/50 px-4 py-3">
        <input
          type="checkbox"
          checked={value.visible}
          onChange={(e) => set('visible', e.target.checked)}
          className="h-4 w-4 accent-espresso"
        />
        <span className="text-sm font-semibold text-coffee">{t('reviews.form.visible')}</span>
      </label>
    </div>
  );
}

export function ReviewsAdminPage() {
  const { lang, t } = useTranslation();
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterVisibility, setFilterVisibility] = useState<VisibilityFilter>('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Review | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ReviewFormState>(EMPTY_FORM);
  const [toDelete, setToDelete] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);

  // Dish names for badges; recomputed together with the list.
  const dishNames = useMemo(() => {
    void version;
    const map = new Map<string, string>();
    for (const item of getMenuItems()) {
      map.set(item.id, getLocalized(item, 'name', lang));
    }
    return map;
  }, [version, lang]);

  const reviews = useMemo(() => {
    void version;
    return [...getReviews()].sort(
      (a, b) =>
        new Date(b.created_at ?? b.visited_at ?? 0).getTime() -
        new Date(a.created_at ?? a.visited_at ?? 0).getTime(),
    );
  }, [version]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((review) => {
      if (filterRating !== null && review.rating !== filterRating) return false;
      if (filterVisibility === 'visible' && !review.visible) return false;
      if (filterVisibility === 'hidden' && review.visible) return false;
      if (!q) return true;
      return (
        review.author_name.toLowerCase().includes(q) ||
        review.text_ru.toLowerCase().includes(q) ||
        review.text_uz.toLowerCase().includes(q)
      );
    });
  }, [reviews, query, filterRating, filterVisibility]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  const refresh = () => setVersion((v) => v + 1);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreating(true);
  };

  const openEdit = (review: Review) => {
    setForm({
      author_name: review.author_name,
      rating: review.rating,
      text_ru: review.text_ru,
      text_uz: review.text_uz,
      avatar_url: review.avatar_url ?? '',
      visible: review.visible,
    });
    setEditing(review);
  };

  const handleSave = async () => {
    if (form.author_name.trim().length < 2 || (!form.text_ru.trim() && !form.text_uz.trim())) {
      toast.error(t('reviews.form.invalid'));
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        updateReview(editing.id, {
          author_name: form.author_name.trim(),
          rating: form.rating,
          text_ru: form.text_ru.trim(),
          text_uz: form.text_uz.trim(),
          avatar_url: form.avatar_url.trim() || null,
          visible: form.visible,
        });
        logActivity('activity.reviewUpdated', form.author_name.trim());
      } else {
        addReview({
          author_name: form.author_name.trim(),
          rating: form.rating,
          text_ru: form.text_ru.trim(),
          text_uz: form.text_uz.trim(),
          avatar_url: form.avatar_url.trim() || null,
          visible: form.visible,
          visited_at: new Date().toISOString().slice(0, 10),
        });
        logActivity('activity.reviewAdded', form.author_name.trim());
      }
      toast.success(t('toast.saved'));
      setCreating(false);
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVisible = (review: Review) => {
    try {
      updateReview(review.id, { visible: !review.visible });
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = () => {
    if (!toDelete) return;
    try {
      deleteReview(toDelete.id);
      logActivity('activity.reviewDeleted', toDelete.author_name);
      toast.success(t('toast.deleted'));
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
            {t('admin.reviews')}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted sm:text-[15px]">
            <Star size={14} className="fill-gold text-gold" aria-hidden />
            {average.toFixed(1)} · {t('reviews.basedOn', { count: reviews.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-espresso px-5 text-sm font-bold text-cream shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-lift active:scale-[0.98]"
        >
          <MessageSquarePlus size={17} />
          {t('reviews.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t('reviews.search')}
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm text-espresso outline-none transition-colors placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setFilterRating(null);
              setPage(1);
            }}
            className={cn(
              'min-h-9 rounded-full px-3.5 text-xs font-bold transition-all active:scale-95',
              filterRating === null
                ? 'bg-espresso text-cream'
                : 'border border-border bg-white text-coffee hover:border-gold',
            )}
          >
            {t('common.all')}
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => {
                setFilterRating(rating);
                setPage(1);
              }}
              className={cn(
                'inline-flex min-h-9 items-center gap-1 rounded-full px-3.5 text-xs font-bold transition-all active:scale-95',
                filterRating === rating
                  ? 'bg-espresso text-cream'
                  : 'border border-border bg-white text-coffee hover:border-gold',
              )}
            >
              {rating}
              <Star size={11} className="fill-gold text-gold" />
            </button>
          ))}
        </div>
        <select
          value={filterVisibility}
          onChange={(e) => {
            setFilterVisibility(e.target.value as VisibilityFilter);
            setPage(1);
          }}
          aria-label={t('reviews.filterStatus')}
          className="select-arrow h-11 appearance-none rounded-xl border border-border bg-white pl-4 pr-10 text-sm font-semibold text-coffee outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/40"
        >
          <option value="all">{t('reviews.filterStatus')}</option>
          <option value="visible">{t('reviews.filterVisible')}</option>
          <option value="hidden">{t('reviews.filterHidden')}</option>
        </select>
      </div>

      {pageItems.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Star} title={t('reviews.emptyAdmin')} subtitle={t('reviews.emptyHint')} />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((review) => (
              <article
                key={review.id}
                className="group flex animate-fade-up flex-col rounded-2xl border border-border bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-espresso">{review.author_name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(review.created_at ?? review.visited_at, lang)}
                    </p>
                  </div>
                  {!review.visible && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                      <EyeOff size={11} /> {t('reviews.hidden')}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Stars rating={review.rating} />
                  {review.item_id && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-cream px-2.5 py-0.5 text-[10px] font-bold text-coffee">
                      <UtensilsCrossed size={10} aria-hidden />
                      {dishNames.get(review.item_id) ?? t('reviews.general')}
                    </span>
                  )}
                </div>

                <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-coffee">
                  {lang === 'ru' ? review.text_ru || review.text_uz : review.text_uz || review.text_ru}
                </p>

                <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3.5 opacity-70 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(review)}
                    title={review.visible ? t('reviews.hide') : t('reviews.show')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-coffee transition-colors hover:bg-sand hover:text-espresso"
                  >
                    {review.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(review)}
                    title={t('common.edit')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-coffee transition-colors hover:bg-sand hover:text-espresso"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(review)}
                    title={t('common.delete')}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} className="mt-6" />
        </>
      )}

      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? t('reviews.editTitle') : t('reviews.createTitle')}
        size="md"
      >
        <ReviewForm value={form} onChange={setForm} />
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setEditing(null);
            }}
            disabled={busy}
            className="min-h-11 rounded-full border border-border px-6 text-sm font-semibold text-coffee transition-colors hover:border-gold hover:text-gold-dark disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="min-h-11 rounded-full bg-espresso px-7 text-sm font-bold text-cream transition-colors hover:bg-gold disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title={t('reviews.deleteTitle')}
        message={toDelete ? t('reviews.deleteText', { name: toDelete.author_name ?? '' }) : ''}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
