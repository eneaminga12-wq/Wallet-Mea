import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Zap, FileText } from 'lucide-react';
import { Card, PageHeader, SegmentedControl } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { DEMO_BALANCE_HISTORY, DEMO_FLOW_HISTORY } from '../data/vikoba';
import { formatTzs, btcToTzs } from '../utils/money';

export default function Analytics() {
  const { t } = useLanguage();
  const { transactions } = useWallet();

  const lightningCount = transactions.filter((tx) => tx.rail === 'lightning').length;
  const onchainCount = transactions.filter((tx) => tx.rail === 'onchain').length;
  const incoming = transactions.filter((tx) => !['sent', 'pay', 'vikoba_contribution'].includes(tx.type));
  const outgoing = transactions.filter((tx) => ['sent', 'pay', 'vikoba_contribution'].includes(tx.type));
  const inSum = incoming.reduce((s, tx) => s + tx.amountTzs, 0);
  const outSum = outgoing.reduce((s, tx) => s + tx.amountTzs, 0);

  const balanceSeries = useMemo(
    () => DEMO_BALANCE_HISTORY.map((p) => ({ ...p, value: Math.round(p.value * 1.35) })),
    []
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('analytics.title')} description={t('analytics.desc')} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('analytics.in'), value: formatTzs(inSum), icon: ArrowDownLeft, tone: 'bg-brand-50 text-brand-700' },
          { label: t('analytics.out'), value: formatTzs(outSum), icon: ArrowUpRight, tone: 'bg-red-50 text-red-500' },
          { label: t('tx.lightning'), value: `${lightningCount} ${t('analytics.txCount')}`, icon: Zap, tone: 'bg-amber-50 text-amber-500' },
          { label: t('tx.onchain'), value: `${onchainCount} ${t('analytics.txCount')}`, icon: FileText, tone: 'bg-slate-100 text-slate-500' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="flex items-center gap-3.5">
            <div className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ' + tone}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="tnum truncate text-base font-extrabold text-slate-900">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">{t('analytics.balanceHistory')}</h2>
            <SegmentedControl
              size="sm"
              options={[
                { value: '30', label: t('analytics.last30') },
                { value: '90', label: t('analytics.last90') },
              ]}
              value={'30'}
              onChange={() => undefined}
            />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceSeries} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  width={38}
                />
                <Tooltip formatter={(v) => formatTzs(Number(v))} labelFormatter={(l) => `Day ${l}`} />
                <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={2.5} fill="url(#balGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">{t('analytics.incoming')} / {t('analytics.outgoing')}</h2>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_FLOW_HISTORY} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  width={38}
                />
                <Tooltip formatter={(v) => formatTzs(Number(v))} labelFormatter={(l) => `Day ${l}`} />
                <Bar dataKey="incoming" name={t('analytics.in')} fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outgoing" name={t('analytics.out')} fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
