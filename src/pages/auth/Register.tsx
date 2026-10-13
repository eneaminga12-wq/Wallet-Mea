import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatPhone, isValidTzPhone } from '../../utils/money';
import { cn } from '../../utils/cn';

export default function Register() {
  const { t } = useLanguage();
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [agree, setAgree] = useState(false);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = t('auth.fillAllFields');
    if (!isValidTzPhone(form.phone)) errs.phone = t('send.invalidPhone');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = t('auth.fillAllFields');
    if (form.password.length < 6) errs.password = t('auth.fillAllFields');
    if (form.password !== form.confirm) errs.confirm = t('auth.passwordsDoNotMatch');
    if (!agree) errs.agree = t('auth.termsError');
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await register({
        fullName: form.fullName.trim(),
        phone: formatPhone(form.phone),
        email: form.email.trim(),
        password: form.password,
        country: 'Tanzania',
      });
      navigate('/verify');
    } catch {
      setErrors({ root: t('auth.signInFailed') });
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t('auth.createTitle')}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{t('auth.createDesc')}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label={t('auth.fullName')}
          placeholder={t('auth.fullNamePlaceholder')}
          leftIcon={<UserIcon className="h-4 w-4" />}
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          error={errors.fullName}
        />
        <Input
          label={t('auth.phone')}
          placeholder="+255 7XX XXX XXX"
          leftIcon={<Phone className="h-4 w-4" />}
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          error={errors.phone}
          hint="Tanzania (+255)"
        />
        <Input
          label={t('auth.email')}
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          leftIcon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t('auth.password')}
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            rightSlot={
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="rounded-md p-1.5 text-slate-400 hover:text-slate-600"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input
            label={t('auth.confirmPassword')}
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            error={errors.confirm}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="rounded-md p-1.5 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
          />
          <span className={cn('text-slate-600', errors.agree && 'text-red-600')}>{t('auth.terms')}</span>
        </label>

        {errors.root && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{errors.root}</p>
        )}

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t('auth.createTitle') === '' ? 'Create Account' : t('auth.createTitle')}
        </Button>

        <p className="pt-1 text-center text-sm text-slate-500">
          {t('auth.backToLogin')}{' '}
          <Link to="/" className="font-bold text-brand-700 hover:text-brand-800">
            {t('auth.logIn')}
          </Link>
        </p>
      </form>
    </div>
  );
}
