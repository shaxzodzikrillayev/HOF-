import { useCallback } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { translate, type TranslationKey } from '@/i18n/translations';
import type { Language } from '@/types';

export function useTranslation() {
  const lang = useLanguageStore((state) => state.lang);
  const setLang = useLanguageStore((state) => state.setLang);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(key, lang, params),
    [lang],
  );

  return { lang, setLang, t };
}

export type { Language };
