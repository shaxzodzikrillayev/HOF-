import { Route, Routes, useParams } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/admin/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { MenuAdminPage } from '@/pages/admin/MenuAdminPage';
import { ProductFormPage } from '@/pages/admin/ProductFormPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { AboutAdminPage } from '@/pages/admin/AboutAdminPage';
import { OrdersPage } from '@/pages/admin/OrdersPage';
import { ReviewsAdminPage } from '@/pages/admin/ReviewsAdminPage';
import { QrPage } from '@/pages/admin/QrPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { ToastViewport } from '@/components/ui/ToastViewport';

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="font-display text-6xl font-bold text-espresso">404</p>
      <p className="mt-3 text-muted">HOFÉ — CAFÉ &amp; MARKET</p>
      <a
        href="/"
        className="mt-6 rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-coffee"
      >
        Home
      </a>
    </div>
  );
}

/**
 * Remounts the form whenever the target id changes so form state,
 * image preview and defaults are never stale between different dishes.
 */
function ProductFormRoute() {
  const { id } = useParams<{ id: string }>();
  return <ProductFormPage key={id ?? 'new'} />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<HomePage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="menu" element={<MenuAdminPage />} />
          <Route path="menu/new" element={<ProductFormRoute />} />
          <Route path="menu/:id/edit" element={<ProductFormRoute />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="reviews" element={<ReviewsAdminPage />} />
          <Route path="about" element={<AboutAdminPage />} />
          <Route path="qr" element={<QrPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastViewport />
    </>
  );
}
