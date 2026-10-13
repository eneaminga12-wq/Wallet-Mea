import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card, EmptyState, Input, PageHeader } from '../components/ui';
import TransactionListItem from '../components/TransactionListItem';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { cn } from '../utils/cn';

type Filter = 'all' | 'sent' | 'received' | 'buy' | 'pay' | 'lightning' | 'onchain' | 'vikoba' | 'pending' | 'completed' | 'failed';

export default function Transactions() {
  const { t } = useLanguage();
  const { transactions, initializing } = useWallet();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    let list = transactions;
    if (filter !== 'all') {
      if (['pending', 'completed', 'failed'].includes(filter)) {
        list = list.filter((tx) => tx.status === filter);
      } else if (filter === 'lightning' || filter === 'onchain') {
        list = list.filter((tx) => tx.rail === filter);
      } else {
        list = list.filter((tx) => tx.type === filter);
      }
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (tx) =>
          tx.counterpartyName.toLowerCase().includes(q) ||
          tx.counterpartyHandle.toLowerCase().includes(q) ||
          tx.reference.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, filter, query]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('tx.all') },
    { key: 'sent', label: t('tx.sent') },
    { key: 'received', label: t('tx.received') },
    { key: 'buy', label: t('tx.buy') },
    { key: 'pay', label: t('tx.pay') },
    { key: 'vikoba', label: t('tx.vikoba') },
    { key: 'lightning', label: t('tx.lightning') },
    { key: 'onchain', label: t('tx.onchain') },
    { key: 'pending', label: t('tx.pending') },
    { key: 'completed', label: t('tx.completed') },
    { key: 'failed', label: t('tx.failed') },
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <PageHeader title={t('tx.title')} description={t('tx.desc')} />

      <Input
        placeholder={t('tx.search')}
        leftIcon={<Search className="h-4 w-4" />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors',
              filter === f.key
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {initializing ? (
        <Card className="py-14 text-center text-sm text-slate-400">{t('common.loading')}</Card>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('tx.empty')} />
      ) : (
        <Card padded={false} className="divide-y divide-slate-100">
          {filtered.map((tx) => (
            <TransactionListItem key={tx.id} tx={tx} onClick={() => navigate(`/transactions/${tx.id}`)} />
          ))}
        </Card>
      )}
    </div>
  );
}
