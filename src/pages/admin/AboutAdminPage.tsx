import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getErrorMessage } from '@/lib/errors';
import { getAbout, persistAbout } from '@/services/aboutService';
import { fileToStoredImage } from '@/services/imageService';
import { validateImageFile } from '@/lib/imageValidation';
import { toast } from '@/store/toastStore';
import { Button } from '@/components/ui/Button';
import { FileField, TextAreaField, TextField } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

export function AboutAdminPage() {
  const { t } = useTranslation();

  const initialAbout = useMemo(() => getAbout(), []);
  const [existingImageUrl] = useState<string | null>(initialAbout.image_url);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAbout.image_url);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        title_ru: z.string().trim().min(2, t('form.validation.nameShort')),
        title_uz: z.string().trim().min(2, t('form.validation.nameShort')),
        content_ru: z.string().trim().min(10),
        content_uz: z.string().trim().min(10),
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
    defaultValues: {
      title_ru: initialAbout.title_ru,
      title_uz: initialAbout.title_uz,
      content_ru: initialAbout.content_ru,
      content_uz: initialAbout.content_uz,
    },
  });

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
    if (previewUrl && previewUrl !== existingImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(file ? URL.createObjectURL(file) : existingImageUrl);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        imageUrl = await fileToStoredImage(imageFile);
      }
      persistAbout({
        title_ru: values.title_ru.trim(),
        title_uz: values.title_uz.trim(),
        content_ru: values.content_ru.trim(),
        content_uz: values.content_uz.trim(),
        image_url: imageUrl,
      });
      toast.success(t('aboutAdmin.saved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
        {t('aboutAdmin.title')}
      </h1>
      <p className="mt-1 text-sm text-muted">{t('aboutAdmin.subtitle')}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Title RU"
            error={errors.title_ru?.message}
            {...register('title_ru')}
          />
          <TextField
            label="Title UZ"
            error={errors.title_uz?.message}
            {...register('title_uz')}
          />
          <TextAreaField
            label={t('aboutAdmin.contentRu')}
            rows={6}
            error={errors.content_ru?.message}
            {...register('content_ru')}
          />
          <TextAreaField
            label={t('aboutAdmin.contentUz')}
            rows={6}
            error={errors.content_uz?.message}
            {...register('content_uz')}
          />
          <div className="md:col-span-2">
            <FileField
              label={t('form.image')}
              hint={t('form.imageHint')}
              previewUrl={previewUrl}
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="mt-7 flex justify-end border-t border-border pt-6">
          <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
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
