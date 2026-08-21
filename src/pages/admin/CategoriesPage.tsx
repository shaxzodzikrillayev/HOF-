import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, ChevronUp, EyeOff, GripVertical, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getErrorMessage } from '@/lib/errors';
import { moveItem } from '@/lib/array';
import {
  createCategory,
  deleteCategory,
  getCategories,
  saveItems,
  updateCategory,
} from '@/services/categoryService';
import { countItemsByCategory } from '@/services/menuStorage';
import { fileToStoredImage } from '@/services/imageService';
import { validateImageFile } from '@/lib/imageValidation';
import { logActivity } from '@/services/activityStorage';
import { toast } from '@/store/toastStore';
import type { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { CheckboxField, FileField, TextField } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/States';
import { cn } from '@/lib/cn';

export function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const itemCounts = useMemo(() => countItemsByCategory(), []);

  const schema = useMemo(
    () =>
      z.object({
        name_ru: z.string().trim().min(2, t('form.validation.nameShort')),
        name_uz: z.string().trim().min(2, t('form.validation.nameShort')),
        sort_order: z.coerce.number().int().min(0),
        hidden: z.boolean(),
      }),
    [t],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditingCategory(null);
    setImageFile(null);
    setPreviewUrl(null);
    reset({ name_ru: '', name_uz: '', sort_order: (categories.length + 1) * 10, hidden: false });
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setImageFile(null);
    setPreviewUrl(category.image_url ?? null);
    reset({
      name_ru: category.name_ru,
      name_uz: category.name_uz,
      sort_order: category.sort_order,
      hidden: category.hidden,
    });
    setModalOpen(true);
  };

  const handleImageChange = (file: File | null) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(
        validationError === 'size'
          ? t('form.validation.imageSize')
          : t('form.validation.imageType'),
      );
      return;
    }
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : editingCategory?.image_url ?? null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let imageUrl = editingCategory?.image_url ?? null;
      if (imageFile) {
        imageUrl = await fileToStoredImage(imageFile);
      }
      const payload = {
        name_ru: values.name_ru.trim(),
        name_uz: values.name_uz.trim(),
        sort_order: values.sort_order,
        image_url: imageUrl,
        hidden: values.hidden,
      };
      if (editingCategory) {
        updateCategory(editingCategory.id, payload);
        logActivity('activity.categoryUpdated', payload.name_ru);
        toast.success(t('catAdmin.updated'));
      } else {
        createCategory(payload);
        logActivity('activity.categoryCreated', payload.name_ru);
        toast.success(t('catAdmin.created'));
      }
      setCategories(getCategories());
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = () => {
    if (!deletingCategory) return;
    try {
      if ((itemCounts[deletingCategory.id] ?? 0) > 0) {
        toast.error(t('catAdmin.deleteBlocked'));
        return;
      }
      deleteCategory(deletingCategory.id);
      setCategories(getCategories());
      logActivity('activity.categoryDeleted', deletingCategory.name_ru);
      toast.success(t('catAdmin.deleted'));
      setDeletingCategory(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const persistOrder = (next: Category[]) => {
    try {
      const resequenced = next.map((category, index) => ({
        ...category,
        sort_order: (index + 1) * 10,
      }));
      saveItems(resequenced);
      setCategories(getCategories());
    } catch (err) {
      toast.error(getErrorMessage(err));
      setCategories(getCategories());
    }
  };

  const handleDrop = (targetIndex: number) => {
    const from = dragIndexRef.current;
    dragIndexRef.current = null;
    setDragIndex(null);
    setDragOverIndex(null);
    if (from === null || from === targetIndex) return;
    persistOrder(moveItem(categories, from, targetIndex));
  };

  const moveBy = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= categories.length) return;
    persistOrder(moveItem(categories, index, target));
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
            {t('catAdmin.title')}
          </h1>
          <p className="mt-1 text-sm text-muted">{t('catAdmin.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={openCreate} className="shrink-0">
          <Plus size={17} />
          {t('catAdmin.add')}
        </Button>
      </div>

      <div className="mt-6">
        {categories.length === 0 ? (
          <EmptyState icon={Tag} title={t('catAdmin.empty')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category, index) => (
              <div
                key={category.id}
                draggable
                onDragStart={(e) => {
                  dragIndexRef.current = index;
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragIndexRef.current !== null && dragIndexRef.current !== index) {
                    setDragOverIndex(index);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(index);
                }}
                onDragEnd={() => {
                  dragIndexRef.current = null;
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card transition-shadow hover:shadow-lift',
                  dragIndex === index && 'opacity-50',
                  dragOverIndex === index && dragIndex !== null && dragIndex !== index
                    ? 'ring-2 ring-gold'
                    : '',
                )}
              >
                <GripVertical
                  size={16}
                  className="shrink-0 cursor-grab text-muted/60 active:cursor-grabbing"
                  aria-hidden
                />
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand font-display text-base font-bold text-gold-dark">
                    {category.sort_order}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-espresso">{category.name_ru}</p>
                    {category.hidden && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                        <EyeOff size={10} />
                        {t('common.hidden')}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted">{category.name_uz}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gold-dark">
                    {itemCounts[category.id] ?? 0} {t('catAdmin.itemsCount')}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-0.5 sm:hidden">
                  <button
                    type="button"
                    onClick={() => moveBy(index, -1)}
                    disabled={index === 0}
                    title={t('common.orderUp')}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-mocha transition-colors hover:bg-sand hover:text-gold-dark disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBy(index, 1)}
                    disabled={index === categories.length - 1}
                    title={t('common.orderDown')}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-mocha transition-colors hover:bg-sand hover:text-gold-dark disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    title={t('common.edit')}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-mocha transition-colors hover:bg-sand hover:text-gold-dark"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCategory(category)}
                    title={t('common.delete')}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-mocha transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? t('catAdmin.edit') : t('catAdmin.new')}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            label={t('form.nameRu')}
            placeholder="Завтраки"
            error={errors.name_ru?.message}
            {...register('name_ru')}
          />
          <TextField
            label={t('form.nameUz')}
            placeholder="Nonushtalar"
            error={errors.name_uz?.message}
            {...register('name_uz')}
          />
          <TextField
            label={t('form.sortOrder')}
            type="number"
            min={0}
            step={1}
            error={errors.sort_order?.message}
            {...register('sort_order')}
          />
          <FileField
            label={`${t('form.image')} (${t('common.optional')})`}
            hint={t('form.imageHint')}
            previewUrl={previewUrl}
            onChange={handleImageChange}
          />
          <CheckboxField label={t('catAdmin.hiddenCategory')} {...register('hidden')} />
          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deletingCategory !== null}
        title={t('catAdmin.deleteConfirmTitle')}
        message={t('catAdmin.deleteConfirmText')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}
