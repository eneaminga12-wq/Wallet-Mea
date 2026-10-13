import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../utils/cn';

interface Props {
  variant?: 'light' | 'dark';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'dark', className }: Props) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border p-0.5',
        variant === 'light' ? 'border-white/30 bg-white/10 backdrop-blur' : 'border-slate-200 bg-white',
        className
      )}
    >
      <Languages className={cn('mx-1.5 h-3.5 w-3.5', variant === 'light' ? 'text-white/80' : 'text-slate-400')} />
      {(['en', 'sw'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-bold transition-colors',
            language === lang
              ? variant === 'light'
                ? 'bg-white text-brand-800'
                : 'bg-brand-700 text-white'
              : variant === 'light'
                ? 'text-white/75 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
          )}
        >
          {lang === 'en' ? 'English' : 'Kiswahili'}
        </button>
      ))}
    </div>
  );
}
