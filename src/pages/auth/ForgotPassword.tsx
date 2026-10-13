import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    await authService.requestPasswordReset(identifier.trim());
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="animate-fade-in text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
        <KeyRound className="h-7 w-7 text-brand-700" />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t('auth.resetTitle')}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{t('auth.resetDesc')}</p>

      {sent ? (
        <div className="mt-7">
          <div className="mx-auto max-w-sm rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
            {t('auth.resetSent')}
          </div>
          <Link to="/" className="mt-5 inline-block text-sm font-bold text-brand-700 hover:text-brand-800">
            {t('auth.backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-7 max-w-sm space-y-4 text-left">
          <Input
            label={t('auth.phoneOrEmail')}
            placeholder={t('auth.phoneOrEmailPlaceholder')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Button type="submit" size="lg" fullWidth loading={loading}>
            {t('auth.sendResetCode')}
          </Button>
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
