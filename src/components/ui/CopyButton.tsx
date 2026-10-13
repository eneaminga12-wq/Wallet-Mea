import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { cn } from '../../utils/cn';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  variant?: 'chip' | 'icon';
}

export default function CopyButton({ value, label, className, variant = 'chip' }: CopyButtonProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable — still show feedback in demo */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700',
          copied && 'text-brand-600',
          className
        )}
        aria-label={t('receive.copy')}
      >
        {copied ? <Check className="h-4 w-4 text-brand-600" /> : <Copy className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50',
        className
      )}
    >
      {copied ? <Check className="h-4 w-4 text-brand-600" /> : <Copy className="h-4 w-4" />}
      {copied ? '✓' : (label ?? t('receive.copy'))}
    </button>
  );
}
