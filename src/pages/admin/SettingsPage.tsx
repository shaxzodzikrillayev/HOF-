import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getErrorMessage } from '@/lib/errors';
import { getSettings, persistSettings } from '@/services/settingsService';
import { fileToStoredImage } from '@/services/imageService';
import { validateImageFile } from '@/lib/imageValidation';
import { toast } from '@/store/toastStore';
import type { Language } from '@/types';
import { Button } from '@/components/ui/Button';
import { FileField, SelectField, TextAreaField, TextField } from '@/components/ui/Input';

export function SettingsPage() {
  const { t } = useTranslation();
  const initial = useMemo(() => getSettings(), []);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl] = useState<string | null>(initial.logoUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial.logoUrl);

  const schema = useMemo(
    () =>
      z.object({
        cafeName: z.string().trim().min(1, t('form.validation.required')),
        tagline: z.string().trim(),
        description: z.string().trim(),
        phone: z.string().trim().min(5, t('form.validation.required')),
        address: z.string().trim().min(3, t('form.validation.required')),
        workingHours: z.string().trim(),
        telegramUrl: z
          .string()
          .trim()
          .refine((value) => value === '' || /^https?:\/\//.test(value), t('form.validation.url')),
        instagramUrl: z
          .string()
          .trim()
          .refine((value) => value === '' || /^https?:\/\//.test(value), t('form.validation.url')),
        defaultLang: z.enum(['ru', 'uz']),
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
      cafeName: initial.cafeName,
      tagline: initial.tagline,
      description: initial.description ?? '',
      phone: initial.phone,
      address: initial.address,
      workingHours: initial.workingHours,
      telegramUrl: initial.telegramUrl,
      instagramUrl: initial.instagramUrl,
      defaultLang: initial.defaultLang,
    },
  });

  const handleLogoChange = (file: File | null) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(
        validationError === 'size'
          ? t('form.validation.imageSize')
          : t('form.validation.imageType'),
      );
      return;
    }
    setLogoFile(file);
    if (previewUrl && previewUrl !== existingLogoUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(file ? URL.createObjectURL(file) : existingLogoUrl);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let logoUrl = existingLogoUrl;
      if (logoFile) {
        logoUrl = await fileToStoredImage(logoFile);
      }
      persistSettings({
        cafeName: values.cafeName.trim(),
        tagline: values.tagline.trim(),
        description: values.description.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        workingHours: values.workingHours.trim(),
        telegramUrl: values.telegramUrl.trim(),
        instagramUrl: values.instagramUrl.trim(),
        logoUrl,
        defaultLang: values.defaultLang as Language,
      });
      toast.success(t('settings.saved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="animate-fade-up">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-espresso"
      >
        <ArrowLeft size={15} />
        {t('dash.title')}
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold text-espresso sm:text-3xl">
        {t('settings.title')}
      </h1>
      <p className="mt-1 text-sm text-muted sm:text-[15px]">{t('settings.subtitle')}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label={t('settings.cafeName')}
            placeholder="HOFÉ"
            error={errors.cafeName?.message}
            {...register('cafeName')}
          />
          <TextField
            label={t('settings.tagline')}
            placeholder="CAFÉ & MARKET"
            error={errors.tagline?.message}
            {...register('tagline')}
          />
          <TextField
            label={t('settings.phone')}
            placeholder="+998 90 123 45 67"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <TextField
            label={t('settings.hours')}
            placeholder="09:00 — 23:00"
            error={errors.workingHours?.message}
            {...register('workingHours')}
          />
          <div className="md:col-span-2">
            <TextAreaField
              label={`${t('settings.description')} (${t('common.optional')})`}
              rows={3}
              placeholder={t('settings.descriptionHint')}
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
          <div className="md:col-span-2">
            <TextField
              label={t('settings.address')}
              placeholder="г. Ташкент, ул. Амира Темура, 12"
              error={errors.address?.message}
              {...register('address')}
            />
          </div>
          <TextField
            label={`${t('settings.telegram')} (${t('common.optional')})`}
            placeholder="https://t.me/hofe_cafe"
            error={errors.telegramUrl?.message}
            {...register('telegramUrl')}
          />
          <TextField
            label={`${t('settings.instagram')} (${t('common.optional')})`}
            placeholder="https://instagram.com/hofe.cafe"
            error={errors.instagramUrl?.message}
            {...register('instagramUrl')}
          />
          <SelectField
            label={t('settings.defaultLang')}
            error={errors.defaultLang?.message}
            {...register('defaultLang')}
          >
            <option value="ru">{t('settings.langRu')}</option>
            <option value="uz">{t('settings.langUz')}</option>
          </SelectField>
          <div>
            <FileField
              label={`${t('settings.logo')} (${t('common.optional')})`}
              previewUrl={previewUrl}
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="lg" type="button" onClick={() => history.back()}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
