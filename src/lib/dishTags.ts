import type { TranslationKey } from '@/i18n/translations';
import type { DishTag } from '@/types';

export const DISH_TAGS: Array<{ value: DishTag; emoji: string; labelKey: TranslationKey }> = [
  { value: 'spicy', emoji: '🌶️', labelKey: 'tag.spicy' },
  { value: 'vegetarian', emoji: '🌱', labelKey: 'tag.vegetarian' },
  { value: 'popular', emoji: '⭐', labelKey: 'tag.popular' },
];
