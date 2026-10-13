import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, CheckCircle2, Info, Loader2, Smartphone } from 'lucide-react';
import { Button, Card, Input, PageHeader } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { paymentService, BUY_FEE_RATE, type BuyMethod } from '../services/paymentService';
import { BTC_TZS_RATE, formatBtcShort, formatTzs } from '../utils/money';
import { cn } from '../utils/cn';
import type { Transaction } from '../types';

type Phase = 'form' | 'review' | 'processing' | 'success';

export default function Buy() {
  const { t } = useLanguage();
  const { recordBuy } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<BuyMethod>('mobile_payment');
  const [phase, setPhase] = useState<Phase>('form');
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const amountTzs = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ''));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const feeTzs = Math.round(amountTzs * BUY_FEE_RATE);
  const btcAmount = amountTzs / BTC_TZS_RATE;
  const btcReceived = (amountTzs - feeTzs) / BTC_TZS_RATE;

  const methods: { key: BuyMethod; label: string; icon: typeof Smartphone }[] = [
    { key: 'mobile_payment', label: t('buy.mobilePayment'), icon: Smartphone },
    { key: 'bank', label: t('buy.bank'), icon: Banknote },
    { key: 'other', label: t('buy.other'), icon: Info },
  ];

  async function startBuy() {
    if (amountTzs < 1000) {
      showToast('Minimum purchase is TZS 1,000', 'error');
      return;
    }
    setPhase('review');
  }

  async function confirmBuy() {
    setPhase('processing');
    try {
      const tx = await paymentService.executeBuy({ amountTzs, method });
      recordBuy(tx);
      setReceipt(tx);
      setPhase('success');
    } catch {
      showToast('Purchase failed (simulated)', 'error');
      setPhase('review');
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-xl">
      <PageHeader title={t('buy.title')} description={t('buy.desc')} />

      {phase === 'form' && (
        <Card className="space-y-5">
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
            {t('buy.demoNotice')}
          </div>
          <Input
            label={t('buy.amountTzs')}
            inputMode="numeric"
            placeholder="100,000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            rightSlot={<span className="pr-2 text-sm font-bold text-slate-400">TZS</span>}
          />
          {amountTzs > 0 && (
            <div className="rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{t('buy.estimatedBtc')}</p>
              <p className="tnum mt-1 text-xl font-extrabold text-slate-900">
                ≈ {formatBtcShort(btcAmount)} BTC
              </p>
              <p className="tnum mt-1 text-xs text-slate-500">
                {t('buy.fee')}: {formatTzs(feeTzs)} · {t('buy.receiveAmount')}: ≈ {formatBtcShort(btcReceived)} BTC
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">{t('buy.paymentMethod')}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {methods.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMethod(key)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3.5 text-xs font-bold transition-colors',
                    method === key
                      ? 'border-brand-600 bg-brand-50/60 text-brand-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[50000, 100000, 250000].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:border-brand-400 hover:text-brand-700"
              >
                {formatTzs(v)}
              </button>
            ))}
          </div>

          <Button size="lg" fullWidth onClick={startBuy}>
            {t('buy.review')}
          </Button>
        </Card>
      )}

      {phase === 'review' && (
        <Card className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('buy.amountTzs')}</span>
              <span className="tnum text-sm font-bold text-slate-800">{formatTzs(amountTzs)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('buy.rate')}</span>
              <span className="tnum text-sm font-bold text-slate-800">
                1 BTC = {BTC_TZS_RATE.toLocaleString('en-US')} TZS
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('buy.fee')}</span>
              <span className="tnum text-sm font-bold text-slate-800">{formatTzs(feeTzs)}</span>
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{t('buy.receiveAmount')}</span>
                <span className="tnum text-base font-extrabold text-slate-900">
                  ≈ {formatBtcShort(btcReceived)} BTC
                </span>
              </div>
            </div>
          </div>
          <Button size="lg" fullWidth onClick={confirmBuy}>
            {t('buy.confirm')}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setPhase('form')}>
            {t('common.back')}
          </Button>
        </Card>
      )}

      {phase === 'processing' && (
        <Card className="flex flex-col items-center py-14 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="mt-5 text-base font-bold text-slate-800">{t('buy.processing')}</p>
        </Card>
      )}

      {phase === 'success' && receipt && (
        <Card className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 animate-pulse-ring items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 className="h-8 w-8 text-brand-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{t('buy.success')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('buy.successDesc')}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('buy.totalDebit')}</span>
              <span className="tnum text-sm font-bold text-slate-800">{formatTzs(receipt.amountTzs)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('buy.receiveAmount')}</span>
              <span className="tnum text-sm font-bold text-slate-800">{formatBtcShort(receipt.amountBtc)} BTC</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('tx.reference')}</span>
              <span className="tnum font-mono text-xs font-bold text-slate-800">{receipt.reference}</span>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => navigate('/transactions')}>
              {t('nav.transactions')}
            </Button>
            <Button onClick={() => { setPhase('form'); setAmount(''); setReceipt(null); }}>
              {t('buy.newOrder')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
