import { cn } from '../utils/cn';

interface LogoProps {
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

/** MeaBit brand mark: an abstract "M" / mountain arrow in a rounded square. */
export default function Logo({ variant = 'dark', showText = true, className }: LogoProps) {
  const box =
    variant === 'light'
      ? 'bg-white/15 backdrop-blur'
      : 'bg-brand-700';
  const text = variant === 'light' ? 'text-white' : 'text-brand-900';
  const sub = variant === 'light' ? 'text-white/70' : 'text-slate-500';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl shadow-sm', box)}>
        <svg viewBox="0 0 32 32" className="h-5.5 w-5.5" fill="none" aria-hidden="true">
          <path
            d="M6 23V9l10 10L26 9v14"
            stroke={variant === 'light' ? '#ffffff' : '#ffffff'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <div className="leading-tight">
          <p className={cn('text-[15px] font-extrabold tracking-tight', text)}>
            MEABIT <span className="font-medium opacity-70">WALLET</span>
          </p>
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.18em]', sub)}>
            Bitcoin · Lightning · TZS
          </p>
        </div>
      )}
    </div>
  );
}
