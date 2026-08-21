import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/public/Header';
import { Hero } from '@/components/public/Hero';
import { MenuSection } from '@/components/public/MenuSection';
import { AboutSection } from '@/components/public/AboutSection';
import { ReviewsSection } from '@/components/public/ReviewsSection';
import { Footer } from '@/components/public/Footer';
import { CartDrawer } from '@/components/public/CartDrawer';
import { TableBanner } from '@/components/public/TableBanner';
import { getCategories } from '@/services/categoryService';
import { getMenuItems } from '@/services/menuStorage';
import { getAbout } from '@/services/aboutService';
import { getSettings } from '@/services/settingsService';
import { useTableStore } from '@/store/tableStore';

export function HomePage() {
  const [searchParams] = useSearchParams();
  const setTable = useTableStore((state) => state.setTable);

  // QR menu entry point: /menu?table=N (or /?table=N) fixes the guest's table.
  useEffect(() => {
    const raw = searchParams.get('table');
    if (raw === null) return;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 999) {
      setTable(Math.round(parsed));
    }
  }, [searchParams, setTable]);

  const data = useMemo(
    () => ({
      categories: getCategories(),
      items: getMenuItems().filter((item) => item.available),
      about: getAbout(),
      settings: getSettings(),
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main>
        <Hero />
        <MenuSection categories={data.categories} items={data.items} />
        <AboutSection about={data.about} />
        <ReviewsSection />
      </main>
      <Footer
        phone={data.settings.phone}
        cafeName={data.settings.cafeName}
        tagline={data.settings.tagline}
        telegramUrl={data.settings.telegramUrl}
        instagramUrl={data.settings.instagramUrl}
      />
      <CartDrawer />
      <TableBanner />
    </div>
  );
}
