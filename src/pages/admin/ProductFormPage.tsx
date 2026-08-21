import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Percent, Save, Star, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getErrorMessage } from '@/lib/errors';
import { DISH_TAGS } from '@/lib/dishTags';
import { getCategories } from '@/services/categoryService';
import {
  MAX_IMAGES,
  addMenuItem,
  getMenuItemById,
  updateMenuItem,
  type MenuItemPayload,
} from '@/services/menuStorage';
import { fileToStoredImage } from '@/services/imageService';
import { validateImageFile } from '@/lib/imageValidation';
import { logActivity } from '@/services/activityStorage';
import { toast } from '@/store/toastStore';
import type { DishTag } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';

interface GalleryImage {
  key: string;
  url: string;
  file: File | null;
}

let galleryKeyCounter = 0;
const nextGalleryKey = () => `g${Date.now()}-${galleryKeyCounter++}`;

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { lang, t } = useTranslation();

  const categories = useMemo(() => getCategories(), []);
  const initialItem = useMemo(() => (id ? getMenuItemById(id) : null), [id]);
  const notFound = Boolean(id) && initialItem === null;

  const [gallery, setGallery] = useState<GalleryImage[]>(() => {
    const sources =
      initialItem && initialItem.images.length > 0
        ? initialItem.images
        : initialItem?.image_url
          ? [initialItem.image_url]
          : [];
    return sources.map((url) => ({ key: nextGalleryKey(), url, file: null }));
  });
  const [tags, setTags] = useState<DishTag[]>(initialItem?.tags ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createdUrlsRef = useRef<Set<string>>(new Set());

  // Revoke object URLs we created when leaving the page
  useEffect(() => {
    const created = createdUrlsRef.current;
    return () => {
      for (const url of created) URL.revokeObjectURL(url);
    };
  }, []);

  const toggleTag = (tag: DishTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag],
    );
  };

  const schema = useMemo(
    () =>
      z.object({
        name_ru: z.string().trim().min(2, t('form.validation.nameShort')),
        name_uz: z.string().trim().min(2, t('form.validation.nameShort')),
        description_ru: z.string(),
        description_uz: z.string(),
        price: z.coerce.number().positive(t('form.validation.priceNumber')),
        category_id: z.string().min(1, t('form.validation.required')),
        weight: z.string(),
        stock: z.string(),
        discount_percent: z.coerce.number().int().min(0).max(90),
        available: z.boolean(),
        featured: z.boolean(),
        isNew: z.boolean(),
        sort_order: z.coerce.number().int().min(0),
      }),
    [t],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialItem
      ? {
          name_ru: initialItem.name_ru,
          name_uz: initialItem.name_uz,
          description_ru: initialItem.description_ru ?? '',
          description_uz: initialItem.description_uz ?? '',
          price: Number(initialItem.price),
          category_id: initialItem.category_id,
          weight: initialItem.weight ?? '',
          stock: initialItem.stock !== null ? String(initialItem.stock) : '',
          discount_percent: initialItem.discount_percent ?? 0,
          available: initialItem.available,
          featured: initialItem.featured ?? false,
          isNew: initialItem.isNew ?? false,
          sort_order: initialItem.sort_order,
        }
      : {
          name_ru: '',
          name_uz: '',
          description_ru: '',
          description_uz: '',
          price: 0,
          category_id: '',
          weight: '',
          stock: '',
          discount_percent: 0,
          available: true,
          featured: false,
          isNew: false,
          sort_order: (categories.length + 1) * 10,
        },
  });

  if (notFound) {
    return (
      <div className="animate-fade-up">
        <Link
          to="/admin/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-espresso"
        >
          <ArrowLeft size={15} />
          {t('menuAdmin.title')}
        </Link>
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {t('menuAdmin.notFound')}
        </div>
      </div>
    );
  }

  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_IMAGES - gallery.length;
    if (remaining <= 0) {
      toast.error(t('form.galleryFull', { max: MAX_IMAGES }));
      return;
    }
    const accepted: GalleryImage[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      const validationError = validateImageFile(file);
      if (validationError) {
        toast.error(
          validationError === 'size'
            ? t('form.validation.imageSize')
            : t('form.validation.imageType'),
        );
        continue;
      }
      const url = URL.createObjectURL(file);
      createdUrlsRef.current.add(url);
      accepted.push({ key: nextGalleryKey(), url, file });
    }
    if (accepted.length > 0) setGallery((prev) => [...prev, ...accepted].slice(0, MAX_IMAGES));
    if (files.length > remaining) {
      toast.error(t('form.galleryFull', { max: MAX_IMAGES }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeGalleryImage = (key: string) => {
    setGallery((prev) => {
      const target = prev.find((image) => image.key === key);
      if (target && createdUrlsRef.current.has(target.url)) {
        URL.revokeObjectURL(target.url);
        createdUrlsRef.current.delete(target.url);
      }
      return prev.filter((image) => image.key !== key);
    });
  };

  const makeMain = (key: string) => {
    setGallery((prev) => {
      const index = prev.findIndex((image) => image.key === key);
      if (index <= 0) return prev;
      const copy = [...prev];
      const [image] = copy.splice(index, 1);
      copy.unshift(image);
      return copy;
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const images: string[] = [];
      for (const image of gallery) {
        images.push(image.file ? await fileToStoredImage(image.file) : image.url);
      }

      const stockRaw = values.stock.trim();
      const stockValue =
        stockRaw === '' ? null : Math.max(0, Math.floor(Number(stockRaw) || 0));

      const payload: MenuItemPayload = {
        category_id: values.category_id,
        name_ru: values.name_ru.trim(),
        name_uz: values.name_uz.trim(),
        description_ru: values.description_ru.trim() || null,
        description_uz: values.description_uz.trim() || null,
        price: values.price,
        image_url: images[0] ?? null,
        images,
        weight: values.weight.trim() || null,
        stock: stockValue,
        discount_percent: values.discount_percent,
        available: values.available,
        featured: values.featured,
        isNew: values.isNew,
        tags,
        sort_order: values.sort_order,
      };

      if (isEdit && id) {
        const updated = updateMenuItem(id, payload);
        if (!updated) {
          toast.error(t('menuAdmin.notFound'));
          return;
        }
        logActivity('activity.productUpdated', payload.name_ru);
        toast.success(t('menuAdmin.updated'));
      } else {
        addMenuItem(payload);
        logActivity('activity.productAdded', payload.name_ru);
        toast.success(t('menuAdmin.created'));
      }
      navigate('/admin/menu');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="animate-fade-up">
      <Link
        to="/admin/menu"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-espresso"
      >
        <ArrowLeft size={15} />
        {t('menuAdmin.title')}
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold text-espresso sm:text-3xl">
        {isEdit ? t('menuAdmin.editProduct') : t('menuAdmin.newProduct')}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label={t('form.nameRu')}
            placeholder="Чизбургер"
            error={errors.name_ru?.message}
            {...register('name_ru')}
          />
          <TextField
            label={t('form.nameUz')}
            placeholder="Chizburger"
            error={errors.name_uz?.message}
            {...register('name_uz')}
          />
          <TextAreaField
            label={t('form.descRu')}
            rows={3}
            placeholder="Сочная котлета, сыр, свежие овощи…"
            error={errors.description_ru?.message}
            {...register('description_ru')}
          />
          <TextAreaField
            label={t('form.descUz')}
            rows={3}
            placeholder="Shirin kotlet, pishloq, yangi sabzavotlar…"
            error={errors.description_uz?.message}
            {...register('description_uz')}
          />
          <TextField
            label={t('form.price')}
            type="number"
            min={0}
            step={1000}
            placeholder="45000"
            error={errors.price?.message}
            {...register('price')}
          />
          <SelectField
            label={t('form.category')}
            error={errors.category_id?.message}
            {...register('category_id')}
          >
            <option value="">{t('form.selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {lang === 'ru' ? category.name_ru : category.name_uz}
              </option>
            ))}
          </SelectField>
          <TextField
            label={`${t('form.weight')} (${t('common.optional')})`}
            placeholder="350 г"
            hint={t('form.weightHint')}
            error={errors.weight?.message}
            {...register('weight')}
          />
          <TextField
            label={`${t('form.stock')} (${t('common.optional')})`}
            type="number"
            min={0}
            step={1}
            placeholder="∞"
            hint={t('form.stockHint')}
            error={errors.stock?.message}
            {...register('stock')}
          />
          <TextField
            label={t('form.discount')}
            type="number"
            min={0}
            max={90}
            step={1}
            placeholder="0"
            hint={t('form.discountHint')}
            error={errors.discount_percent?.message}
            {...register('discount_percent')}
          />
          <TextField
            label={t('form.sortOrder')}
            type="number"
            min={0}
            step={1}
            error={errors.sort_order?.message}
            {...register('sort_order')}
          />

          {/* Gallery */}
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-coffee">
                {t('form.gallery')}
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold-dark">
                  <Percent size={9} className="hidden" aria-hidden />
                  {gallery.length}/{MAX_IMAGES}
                </span>
              </p>
              <p className="text-xs text-muted">{t('form.galleryHint')}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {gallery.map((image, index) => (
                <div
                  key={image.key}
                  className={cn(
                    'group relative aspect-square animate-scale-in overflow-hidden rounded-xl border-2 bg-sand',
                    index === 0 ? 'border-gold' : 'border-transparent',
                  )}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <Star size={9} className="fill-white" />
                      {t('form.mainPhoto')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(image.key)}
                    aria-label={t('common.delete')}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-red-500 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => makeMain(image.key)}
                      className="absolute inset-x-1.5 bottom-1.5 rounded-lg bg-black/55 py-1 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-espresso group-hover:opacity-100"
                    >
                      {t('form.makeMain')}
                    </button>
                  )}
                </div>
              ))}
              {gallery.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted transition-all duration-200 hover:border-gold hover:bg-gold/5 hover:text-gold-dark"
                >
                  <ImagePlus size={22} strokeWidth={1.6} />
                  <span className="px-1 text-center text-[11px] font-semibold leading-tight">
                    {t('form.addPhotos')}
                  </span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleAddFiles(e.target.files)}
            />
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-[13px] font-semibold text-coffee">{t('form.tags')}</p>
            <div className="flex flex-wrap gap-2">
              {DISH_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  aria-pressed={tags.includes(tag.value)}
                  className={cn(
                    'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-all duration-200',
                    tags.includes(tag.value)
                      ? 'border-gold bg-gold/10 text-gold-dark'
                      : 'border-border bg-white text-coffee hover:border-gold',
                  )}
                >
                  <span aria-hidden>{tag.emoji}</span>
                  {t(tag.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 md:col-span-2">
            <CheckboxField label={t('form.available')} {...register('available')} />
            <CheckboxField label={t('form.featured')} {...register('featured')} />
            <CheckboxField label={t('form.isNew')} {...register('isNew')} />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link to="/admin/menu" className="sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" type="button">
              {t('common.cancel')}
            </Button>
          </Link>
          <Button variant="primary" size="lg" type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save size={16} />
                {t('common.save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
