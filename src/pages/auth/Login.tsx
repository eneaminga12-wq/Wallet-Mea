import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, Lock } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';

export default function Login() {
  const { t } = useLanguage();
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    // For simplicity: credentials are optional, works with or without typing
    try {
      await login(identifier.trim() || 'demo', password || 'demo');
      navigate('/dashboard');
    } catch {
      setError(t('auth.signInFailed'));
    }
  }

  async function handleQuickAccess() {
    try {
      await login('demo', 'demo');
      navigate('/dashboard');
    } catch {
      setError(t('auth.signInFailed'));
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t('auth.welcomeBack')}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{t('auth.signInDesc')}</p>

      {/* One-click Instant Access card (no credentials needed) */}
      <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold text-brand-900">{t('auth.quickAccess')}</p>
            <p className="mt-0.5 text-xs text-brand-700/80">{t('auth.quickAccessDesc')}</p>
          </div>
        </div>
        <Button
          type="button"
          size="md"
          fullWidth
          className="mt-3 bg-brand-700 hover:bg-brand-800"
          onClick={handleQuickAccess}
          loading={loading}
        >
          🚀 {t('auth.quickAccess')}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Input
          label={t('auth.phoneOrEmail')}
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder={t('auth.phoneOrEmailPlaceholder')}
          leftIcon={<Phone className="h-4 w-4" />}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <Input
          label={t('auth.password')}
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded-md p-1.5 text-slate-400 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>
        )}

        <div className="flex justify-end">
          <Link to="/forgot" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t('auth.logIn')}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-bold tracking-wider text-slate-400">{t('auth.or')}</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Button type="button" variant="secondary" size="lg" fullWidth onClick={() => showToast('Google sign-in is simulated in this demo', 'info')}>
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
          </svg>
          {t('auth.continueWithGoogle')}
        </Button>

        <p className="pt-2 text-center text-sm text-slate-500">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-bold text-brand-700 hover:text-brand-800">
            {t('auth.createAccount')}
          </Link>
        </p>

        <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-center text-[11px] font-medium text-slate-400">
          {t('auth.demoLogin')}
        </p>
      </form>
    </div>
  );
}
