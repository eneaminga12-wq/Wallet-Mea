import { ArrowDownLeft, ArrowUpRight, Bitcoin, ShoppingBag, Users } from 'lucide-react';
import type { Transaction } from '../types';
import { formatTzs, formatBtcShort, formatRelativeDay } from '../utils/money';
import StatusBadge from './ui/StatusBadge';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../utils/cn';

interface Props {
  tx: Transaction;
  onClick?: () => void;
}

export default function TransactionListItem({ tx, onClick }: Props) {
  const { t } = useLanguage();
  const outgoing = tx.type === 'sent' || tx.type === 'pay' || tx.type === 'vikoba_contribution';

  const icon =
    tx.type === 'buy' ? Bitcoin : tx.type === 'vikoba_contribution' ? Users : outgoing ? ArrowUpRight : ArrowDownLeft;

  const Icon = icon;
  const sign = outgoing ? '-' : '+';

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-slate-50"
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          tx.status === 'failed'
            ? 'bg-red-50 text-red-500'
            : outgoing
              ? 'bg-slate-100 text-slate-600'
              : 'bg-brand-50 text-brand-700'
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-800">{tx.counterpartyName}</p>
        <p className="truncate text-xs text-slate-400">
          {formatRelativeDay(tx.timestamp, t('common.today'), t('common.yesterday'))} ·{' '}
          {tx.rail === 'lightning' ? t('tx.lightning') : t('tx.onchain')}
        </p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'tnum text-sm font-extrabold',
            tx.status === 'failed' ? 'text-slate-400 line-through' : outgoing ? 'text-slate-800' : 'text-brand-700'
          )}
        >
          {sign} {formatTzs(tx.amountTzs)}
        </p>
        <p className="tnum text-[11px] text-slate-400">
          {sign} {formatBtcShort(tx.amountBtc)} BTC
        </p>
      </div>
      <div className="hidden sm:block">
        <StatusBadge status={tx.status} />
      </div>
    </button>
  );
}
