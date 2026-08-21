import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (password.length === 0) {
      setError(t('form.validation.required'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ok = await signIn(password);
      if (!ok) {
        setError(t('auth.invalidCredentials'));
        setPassword('');
        return;
      }
      navigate('/admin', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-espresso px-4 py-10">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=70)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/85 to-espresso" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-lift backdrop-blur-xl sm:p-9">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold font-display text-2xl font-bold text-white">
              H
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-cream sm:text-3xl">
              HOFÉ <span className="text-gold-light">·</span> Admin
            </h1>
            <p className="mt-2 text-sm text-cream/60">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wider text-cream/60">
                {t('auth.password')}
              </span>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream/40"
                  aria-hidden
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="current-password"
                  autoFocus
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/10 pl-11 pr-4 text-[15px] text-cream outline-none transition-colors placeholder:text-cream/40 focus:border-gold focus:ring-2 focus:ring-gold/40"
                />
              </div>
            </label>

            {error && (
              <p className="animate-fade-up rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-base font-bold text-white shadow-card transition-all duration-200 hover:bg-gold-dark active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={17} />
                  {t('auth.signIn')}
                </>
              )}
            </button>
          </form>
        </div>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-cream/60 transition-colors hover:text-gold-light"
        >
          <ArrowLeft size={15} />
          {t('auth.backToSite')}
        </Link>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-cream/40">
          <Lock size={12} />
          HOFÉ Admin
        </div>
      </div>
    </div>
  );
}
