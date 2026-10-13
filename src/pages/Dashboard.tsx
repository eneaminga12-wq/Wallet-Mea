import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bitcoin,
  Eye,
  EyeOff,
  ShieldCheck,
  ShoppingBag,
  Users,
  Radio,
  Wallet,
  Zap,
} from 'lucide-react';
import { Card, SegmentedControl } from '../components/ui';
import TransactionListItem from '../components/TransactionListItem';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Avatar from '../components/ui/Avatar';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { BTC_TZS_RATE, btcToSats, btcToTzs, formatBtcShort, formatSats, formatTzs } from '../utils/money';

export default function Dashboard() {
  const { t } = useLanguage();
  const { balances, transactions, vikoba, initializing } = useWallet();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [display, setDisplay] = useState<'TZS' | 'BTC'>('TZS');
  const [hidden, setHidden] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t('greeting.morning');
    if (h < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  }, [t]);

  const firstName = user?.fullName.split(' ')[0] ?? 'MeaBit';
  const nextVikoba = vikoba
    .slice()
    .sort((a, b) => +new Date(a.nextContribution) - +new Date(b.nextContribution))[0];

  const actions = [
    { to: '/send', label: t('dash.send'), icon: ArrowUpRight },
    { to: '/receive', label: t('dash.receive'), icon: ArrowDownLeft },
    { to: '/buy', label: t('dash.buy'), icon: Bitcoin },
    { to: '/pay', label: t('dash.pay'), icon: ShoppingBag },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{greeting},</p>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <button
            onClick={() => navigate('/notifications')}
            className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button onClick={() => navigate('/profile')}>
            <Avatar src={user?.avatar} name={user?.fullName ?? 'MeaBit'} size="md" />
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border-brand-800 bg-brand-800 p-0 text-white">
        <div className="relative p-6 sm:p-7">
          <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-brand-700/50 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-brand-100">{t('dash.totalBalance')}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHidden((v) => !v)}
                  className="rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20"
                  aria-label={hidden ? t('dash.showBalance') : t('dash.hideBalance')}
                >
                  {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <SegmentedControl
                  options={[
                    { value: 'TZS', label: 'TZS' },
                    { value: 'BTC', label: 'BTC' },
                  ]}
                  value={display}
                  onChange={setDisplay}
                />
              </div>
            </div>
            {hidden ? (
              <p className="tnum mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">••••••</p>
            ) : display === 'TZS' ? (
              <div>
                <p className="tnum mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {formatTzs(balances.totalTzs)}
                </p>
                <p className="tnum mt-1 text-sm font-medium text-brand-200">
                  ≈ {formatBtcShort(balances.totalBtc)} BTC
                </p>
              </div>
            ) : (
              <div>
                <p className="tnum mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {formatBtcShort(balances.totalBtc)} BTC
                </p>
                <p className="tnum mt-1 text-sm font-medium text-brand-200">
                  ≈ {formatTzs(balances.totalTzs)}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('dash.lightning')}</p>
            <p className="tnum truncate text-lg font-extrabold text-amber-600">
              {formatSats(btcToSats(balances.lightningBtc))}
            </p>
            <p className="tnum text-xs text-slate-400">
              ≈ {formatTzs(btcToTzs(balances.lightningBtc))} · {formatBtcShort(balances.lightningBtc)} BTC
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50">
            <Bitcoin className="h-5 w-5 text-brand-700" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('dash.bitcoin')}</p>
            <p className="tnum truncate text-lg font-extrabold text-slate-900">
              {formatBtcShort(balances.onchainBtc)} BTC
            </p>
            <p className="tnum text-xs text-slate-400">≈ {formatTzs(btcToTzs(balances.onchainBtc))}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <Wallet className="h-5 w-5 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('dash.todaysRate')}</p>
            <p className="tnum text-lg font-extrabold text-slate-900">{BTC_TZS_RATE.toLocaleString('en-US')}</p>
            <p className="text-xs text-slate-400">{t('dash.1BTC')}</p>
          </div>
        </Card>
      </div>
      {nextVikoba && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <Users className="h-5 w-5 text-brand-700" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{t('dash.upcomingVikoba')}</p>
              <p className="text-sm font-bold text-slate-800">
                {nextVikoba.name} · {formatTzs(nextVikoba.contributionAmount)}
              </p>
              <p className="text-xs text-slate-500">
                {t('dash.vikobaDue')}{' '}
                {new Date(nextVikoba.nextContribution).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/vikoba/${nextVikoba.id}`)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
          >
            {t('dash.contribNow')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </Card>
      )}
      <Card padded={false}>
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">{t('dash.recentTx')}</h2>
          <button
            onClick={() => navigate('/transactions')}
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800"
          >
            {t('dash.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {(initializing ? [] : transactions.slice(0, 5)).map((tx) => (
            <TransactionListItem key={tx.id} tx={tx} onClick={() => navigate(`/transactions/${tx.id}`)} />
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <div>
            <p className="text-sm font-bold text-slate-800">{t('dash.securityTipTitle')}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t('dash.securityTip')}</p>
          </div>
        </Card>
        <button onClick={() => navigate('/sms-ussd')} className="text-left">
          <Card className="flex items-start gap-3 transition-colors hover:border-brand-300">
            <Radio className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {t('sms.title')} · <span className="text-brand-700">{t('sms.badge')}</span>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t('dash.lowNetwork')}</p>
            </div>
          </Card>
        </button>
      </div>
    </div>
  );
}
