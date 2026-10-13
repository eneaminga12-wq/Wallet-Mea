import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { cn } from '../../utils/cn';

export default function OtpVerification() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const phone = user?.phone ?? '+255 7XX XXX XXX';

  function setDigit(index: number, value: string) {
    const v = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    if (digits.some((d) => d === '')) {
      setError(t('auth.otpError'));
      return;
    }
    setVerifying(true);
    setError('');
    try {
      const result = await authService.verifyOtp(phone, digits.join(''));
      if (result.verified) {
        navigate('/dashboard');
      } else {
        setError(t('auth.otpWrong'));
      }
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setResending(true);
    await authService.resendOtp(phone);
    setResending(false);
  }

  return (
    <div className="animate-fade-in text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
        <ShieldCheck className="h-7 w-7 text-brand-700" />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t('auth.verifyTitle')}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {t('auth.verifyDesc')} <span className="font-bold text-slate-700">{phone}</span>
      </p>

      <div className="mt-7 flex justify-center gap-2 sm:gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            className={cn(
              'h-13 w-11 rounded-xl border text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 sm:h-14 sm:w-12',
              error ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-brand-600 focus:ring-brand-100'
            )}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}

      <p className="mt-4 text-xs font-semibold text-slate-400">{t('auth.otpDemoHint')}</p>

      <div className="mt-6 space-y-3">
        <Button size="lg" fullWidth loading={verifying} onClick={handleVerify}>
          {t('auth.verify')}
        </Button>
        <Button variant="ghost" size="md" fullWidth loading={resending} onClick={handleResend}>
          {resending ? t('auth.resending') : t('auth.resend')}
        </Button>
      </div>

      <button
        onClick={() => navigate('/register')}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('auth.backToLogin')}
      </button>
    </div>
  );
}
