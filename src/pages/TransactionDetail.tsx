import { Link, useParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Bitcoin, ShoppingBag, Users } from 'lucide-react';
import { Card, PageHeader, StatusBadge } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { formatBtcShort, formatDate, formatTime, formatTzs, truncateMiddle } from '../utils/money';
import type { TransactionType } from '../types';

export default function TransactionDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { transactions } = useWallet();
  const tx = transactions.find((x) => x.id === id);

  if (!tx) {
    return (
      <div className="mx-auto max-w-xl animate-fade-in">
        <Card className="p-8 text-center text-sm text-slate-500">{t('tx.notFound')}</Card>
        <Link to="/transactions" className="mt-4 block text-center text-sm font-bold text-brand-700">
          ← {t('tx.title')}
        </Link>
      </div>
    );
  }

  const outgoing = tx.type === 'sent' || tx.type === 'pay' || tx.type === 'vikoba_contribution';
  const Icon =
    tx.type === 'buy' ? Bitcoin : tx.type === 'vikoba_contribution' ? Users : outgoing ? ArrowUpRight : ArrowDownLeft;

  const typeLabel: Record<TransactionType, string> = {
    sent: t('tx.sent'),
    received: t('tx.received'),
    buy: t('tx.buy'),
    pay: t('tx.pay'),
    vikoba_contribution: t('tx.vikoba'),
  };

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('tx.type'), value: typeLabel[tx.type] },
    { label: t('tx.amount'), value: `${outgoing ? '-' : '+'} ${formatTzs(tx.amountTzs)}` },
    { label: 'BTC', value: `${outgoing ? '-' : '+'} ${formatBtcShort(tx.amountBtc)} BTC` },
    { label: t('tx.tzsEquivalent'), value: formatTzs(tx.amountTzs) },
    { label: outgoing ? t('tx.counterparty') : t('tx.sender'), value: tx.counterpartyName },
    { label: t('send.paymentMethod'), value: tx.rail === 'lightning' ? t('tx.lightning') : t('tx.onchain') },
    { label: t('tx.date'), value: formatDate(tx.timestamp) },
    { label: t('tx.time'), value: formatTime(tx.timestamp) },
    { label: t('tx.fee'), value: tx.feeTzs > 0 ? formatTzs(tx.feeTzs) : '—' },
    { label: t('tx.status'), value: <StatusBadge status={tx.status} size="md" /> },
    { label: t('tx.reference'), value: <span className="font-mono text-xs">{tx.reference}</span> },
  ];

  if (tx.txid) {
    rows.push({
      label: t('tx.txid'),
      value: <span className="font-mono text-[11px]">{truncateMiddle(tx.txid, 16, 12)}</span>,
    });
  }
  if (tx.invoiceRef) {
    rows.push({
      label: t('tx.invoiceRef'),
      value: <span className="font-mono text-[11px]">{truncateMiddle(tx.invoiceRef, 14, 8)}</span>,
    });
  }
  if (typeof tx.confirmations === 'number') {
    rows.push({ label: t('tx.confirmations'), value: `${tx.confirmations}/6` });
  }
  if (tx.note) {
    rows.push({ label: t('tx.note'), value: tx.note });
  }

  return (
    <div className="animate-fade-in mx-auto max-w-xl">
      <PageHeader title={t('tx.detail')} onBack={() => window.history.back()} />

      <Card className="mb-5 text-center">
        <div
          className={
            'mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ' +
            (outgoing ? 'bg-slate-100 text-slate-600' : 'bg-brand-50 text-brand-700')
          }
        >
          <Icon className="h-6 w-6" />
        </div>
        <p className="tnum mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
          {outgoing ? '-' : '+'} {formatTzs(tx.amountTzs)}
        </p>
        <p className="tnum text-sm text-slate-400">≈ {formatBtcShort(tx.amountBtc)} BTC</p>
        <div className="mt-3 flex justify-center">
          <StatusBadge status={tx.status} size="md" />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-700">{tx.counterpartyName}</p>
        <p className="tnum text-xs text-slate-400">{tx.counterpartyHandle}</p>
      </Card>

      <Card padded={false}>
        <div className="divide-y divide-slate-100">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 px-5 py-3">
              <span className="shrink-0 text-sm font-medium text-slate-500">{label}</span>
              <span className="tnum text-right text-sm font-bold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
