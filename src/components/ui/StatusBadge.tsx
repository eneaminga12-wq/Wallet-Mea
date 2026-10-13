import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import type { TransactionStatus } from '../../types';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';

interface StatusBadgeProps {
  status: TransactionStatus;
  size?: 'sm' | 'md';
}

const CONFIG: Record<TransactionStatus, { icon: typeof CheckCircle2; classes: string; key: 'tx.completed' | 'tx.pending' | 'tx.failed' }> = {
  completed: { icon: CheckCircle2, classes: 'bg-brand-50 text-brand-700', key: 'tx.completed' },
  pending: { icon: Clock3, classes: 'bg-amber-50 text-amber-700', key: 'tx.pending' },
  failed: { icon: XCircle, classes: 'bg-red-50 text-red-700', key: 'tx.failed' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { t } = useLanguage();
  const { icon: Icon, classes } = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        classes
      )}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {t(CONFIG[status].key)}
    </span>
  );
}
