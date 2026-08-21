import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Coffee,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  MessageSquareQuote,
  QrCode,
  ReceiptText,
  Settings,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/translations';
import { getOrders } from '@/services/orderStorage';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  key: TranslationKey;
  icon: typeof Coffee;
  end?: boolean;
  badge?: 'newOrders';
}

const NAV_GROUPS: Array<{ titleKey: TranslationKey; items: NavItem[] }> = [
  {
    titleKey: 'admin.group.overview',
    items: [
      { to: '/admin', key: 'admin.dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/orders', key: 'nav.orders', icon: ReceiptText, badge: 'newOrders' },
    ],
  },
  {
    titleKey: 'admin.group.catalog',
    items: [
      { to: '/admin/menu', key: 'admin.menu', icon: UtensilsCrossed },
      { to: '/admin/categories', key: 'admin.categories', icon: Tag },
    ],
  },
  {
    titleKey: 'admin.group.content',
    items: [
      { to: '/admin/reviews', key: 'nav.reviews', icon: MessageSquareQuote },
      { to: '/admin/about', key: 'admin.about', icon: Coffee },
      { to: '/admin/qr', key: 'admin.qr', icon: QrCode },
    ],
  },
  {
    titleKey: 'admin.group.system',
    items: [{ to: '/admin/settings', key: 'admin.settings', icon: Settings }],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const newOrders = useMemo(
    () => (pathname.startsWith('/admin') ? getOrders().filter((o) => o.status === 'new').length : 0),
    [pathname],
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        className="flex h-16 items-center gap-3 border-b border-white/10 px-5"
        onClick={onNavigate}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold font-display text-lg font-bold text-white">
          H
        </span>
        <span>
          <span className="block font-display text-lg font-bold leading-none tracking-wide text-cream">
            HOFÉ
          </span>
          <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.3em] text-gold-light">
            Café &amp; Market
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.titleKey}>
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-cream/40">
              {t(group.titleKey)}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-gold text-white shadow-sm'
                        : 'text-cream/70 hover:bg-white/10 hover:text-cream',
                    )
                  }
                >
                  <item.icon size={18} strokeWidth={1.9} />
                  <span className="flex-1">{t(item.key)}</span>
                  {item.badge === 'newOrders' && newOrders > 0 && (
                    <span className="animate-pop rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      {newOrders}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
        >
          <ExternalLink size={17} strokeWidth={1.9} />
          {t('admin.openSite')}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut size={17} strokeWidth={1.9} />
          {t('admin.logout')}
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-sand/50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-espresso lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-espresso/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-slide-in-left bg-espresso shadow-lift lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-cream/90 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-espresso transition-colors hover:bg-sand"
            aria-label="Open menu"
          >
            <MenuIcon size={22} />
          </button>
          <span className="font-display text-xl font-bold tracking-wide text-espresso">HOFÉ</span>
          <span className="ml-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted">
            <ShoppingBag size={13} aria-hidden />
            Admin
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
