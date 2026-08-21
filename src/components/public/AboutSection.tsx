import { Coffee, HeartHandshake, Leaf } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getLocalized } from '@/lib/format';
import type { About } from '@/types';
import { SmartImage } from './SmartImage';

export function AboutSection({ about }: { about: About | null }) {
  const { lang, t } = useTranslation();

  const title = about ? getLocalized(about, 'title', lang) : t('about.title');
  const content = about ? getLocalized(about, 'content', lang) : '';
  const paragraphs = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section id="about" className="scroll-mt-20 bg-sand/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-3xl shadow-lift">
              <SmartImage
                src={about?.image_url ?? null}
                alt={title || 'HOFÉ'}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-3 hidden rounded-2xl bg-espresso px-6 py-4 shadow-lift sm:block lg:-right-6">
              <p className="font-display text-2xl font-bold text-gold-light">est. 2019</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cream/70">
                Tashkent
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold">
              {t('about.title')}
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-espresso sm:text-5xl">
              {title}
            </h2>

            {paragraphs.length > 0 && (
              <div className="mt-6 space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-[15px] leading-relaxed text-coffee sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Coffee, ru: 'Спешелти кофе', uz: 'Spesialty kofe' },
                { icon: Leaf, ru: 'Свежие продукты', uz: 'Yangi mahsulotlar' },
                { icon: HeartHandshake, ru: 'Уютная атмосфера', uz: 'Iliq muhit' },
              ].map((feature) => (
                <li
                  key={feature.ru}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-gold-dark">
                    <feature.icon size={17} strokeWidth={1.8} />
                  </span>
                  <span className="text-[13px] font-semibold leading-tight text-coffee">
                    {lang === 'ru' ? feature.ru : feature.uz}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
