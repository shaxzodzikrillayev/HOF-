import { Instagram, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface FooterProps {
  phone?: string;
  cafeName?: string;
  tagline?: string;
  telegramUrl?: string;
  instagramUrl?: string;
}

export function Footer({
  phone,
  cafeName = 'HOFÉ',
  tagline = 'Café & Market',
  telegramUrl,
  instagramUrl,
}: FooterProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const goTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="bg-espresso py-12 text-cream/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div>
            <p className="font-display text-2xl font-bold tracking-wide text-cream">{cafeName}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-light">
              {tagline}
            </p>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                className="mt-4 inline-block text-sm font-medium text-cream/80 transition-colors hover:text-gold-light"
              >
                {phone}
              </a>
            )}
          </div>

          <nav className="flex flex-col items-center gap-2.5 md:items-start">
            {(
              [
                ['menu', 'nav.menu'],
                ['about', 'nav.about'],
                ['reviews', 'nav.reviews'],
              ] as const
            ).map(([id, key]) => (
              <button
                key={id}
                type="button"
                onClick={() => goTo(id)}
                className="text-sm font-medium text-cream/75 transition-colors hover:text-gold-light"
              >
                {t(key)}
              </button>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex gap-3">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-gold hover:text-white"
                >
                  <Instagram size={17} />
                </a>
              )}
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-gold hover:text-white"
                >
                  <Send size={17} />
                </a>
              )}
            </div>
            <a
              href="/admin"
              className="text-xs font-semibold uppercase tracking-wider text-cream/50 transition-colors hover:text-gold-light"
            >
              {t('footer.admin')}
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-cream/50">
          © {year} {cafeName} — {tagline.toUpperCase()}. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
}
