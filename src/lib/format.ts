import type { Language } from '@/types';

export function formatPrice(price: number, lang: Language): string {
  const formatted = new Intl.NumberFormat('ru-RU').format(Math.round(price));
  return `${formatted} ${lang === 'ru' ? 'сум' : "so'm"}`;
}

export function getLocalized(
  row: object,
  baseKey: string,
  lang: Language,
): string {
  const record = row as Record<string, unknown>;
  const value = record[`${baseKey}_${lang}`];
  if (typeof value === 'string' && value.trim().length > 0) return value;
  const fallback = record[`${baseKey}_ru`];
  return typeof fallback === 'string' ? fallback : '';
}

export function formatDate(iso: string, lang: Language): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(iso: string, lang: Language): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
