import { useState, useMemo } from 'react';
import { Clock, FileText, QrCode as QrIcon, Share2, Sparkles, Zap } from 'lucide-react';
import { Button, Card, CopyButton, Input, PageHeader, QrCode, SegmentedControl } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { DEMO_USER_LIGHTNING_ADDRESS, DEMO_USER_BTC_ADDRESS } from '../data/mock';
import { lightningService } from '../services/lightningService';
import { btcToSats, btcToTzs, formatSats, formatTzs, satsToTzs, tzsToBtc, tzsToSats } from '../utils/money';
import { cn } from '../utils/cn';

type Tab = 'lightning' | 'phone' | 'onchain';
type LnSubTab = 'invoice' | 'address';

export default function Receive() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('lightning');
  const [lnSubTab, setLnSubTab] = useState<LnSubTab>('invoice');

  // Lightning Invoice generation state
  const [invoiceAmount, setInvoiceAmount] = useState('10000');
  const [invoiceCurrency, setInvoiceCurrency] = useState<'TZS' | 'SATS'>('SATS');
  const [invoiceMemo, setInvoiceMemo] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState<{
    invoice: string;
    amountSats: number;
    amountTzs: number;
    memo: string;
    expiresIn: number;
  } | null>(() => {
    // Default pre-generated sample invoice for immediate usability
    const sats = 5000;
    const tzs = satsToTzs(sats);
    return {
      invoice: 'lnbc50n1p3xmeabitdemoq7vz9k2m4n8pa89d7fa98s7dfa98sdf7a098s7dfa',
      amountSats: sats,
      amountTzs: tzs,
      memo: 'MeaBit Payment',
      expiresIn: 3600,
    };
  });
  const [generating, setGenerating] = useState(false);

  const lightningAddr = DEMO_USER_LIGHTNING_ADDRESS;
  const phone = user?.phone ?? '+255 712 345 678';
  const btcAddr = DEMO_USER_BTC_ADDRESS;

  const currentSats = useMemo(() => {
    const n = parseFloat(invoiceAmount.replace(/,/g, ''));
    if (!Number.isFinite(n) || n <= 0) return 0;
    return invoiceCurrency === 'SATS' ? n : tzsToSats(n);
  }, [invoiceAmount, invoiceCurrency]);

  const currentTzs = useMemo(() => {
    return satsToTzs(currentSats);
  }, [currentSats]);

  async function handleCreateInvoice() {
    if (currentSats <= 0) {
      showToast('Please enter an amount', 'error');
      return;
    }
    setGenerating(true);
    try {
      const res = await lightningService.createInvoice(currentTzs, invoiceMemo);
      setGeneratedInvoice({
        invoice: res.invoice,
        amountSats: currentSats,
        amountTzs: currentTzs,
        memo: invoiceMemo || 'MeaBit Payment',
        expiresIn: 3600,
      });
      showToast(t('receive.invoiceGenerated'), 'success');
    } catch {
      showToast('Failed to generate invoice', 'error');
    } finally {
      setGenerating(false);
    }
  }

  function handleShare(textToShare: string) {
    if (navigator.share) {
      navigator.share({ title: 'MeaBit Wallet', text: textToShare }).catch(() => undefined);
    } else {
      showToast(t('receive.copied'), 'success');
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-xl">
      <PageHeader title={t('receive.title')} description={t('receive.desc')} />

      {/* Main Tabs */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {(
          [
            { key: 'lightning', label: '⚡ ' + t('common.lightning') },
            { key: 'phone', label: t('receive.withPhone') },
            { key: 'onchain', label: t('receive.withOnchain') },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors',
              tab === key
                ? 'border-brand-600 bg-brand-50 text-brand-800'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="p-6 text-center">
        {tab === 'lightning' && (
          <div className="animate-fade-in space-y-5">
            {/* Sub Tabs: Lightning Invoice vs Lightning Address */}
            <div className="mx-auto flex max-w-xs justify-center">
              <SegmentedControl
                options={[
                  { value: 'invoice', label: `⚡ ${t('receive.invoice')}` },
                  { value: 'address', label: `@ ${t('receive.lightningAddressTab')}` },
                ]}
                value={lnSubTab}
                onChange={(val) => setLnSubTab(val as LnSubTab)}
              />
            </div>

            {/* OPTION 1: LIGHTNING INVOICE */}
            {lnSubTab === 'invoice' && (
              <div className="animate-fade-in space-y-4 text-left">
                {generatedInvoice ? (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      <Zap className="h-3.5 w-3.5" />
                      {formatSats(generatedInvoice.amountSats)} · ≈ {formatTzs(generatedInvoice.amountTzs)}
                    </div>

                    <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <QrCode value={`lightning:${generatedInvoice.invoice}`} size={200} />
                    </div>

                    <div className="flex items-center justify-center gap-1 text-xs font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{t('receive.invoiceExpires')}: ~59 min</span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {t('receive.invoice')}
                      </p>
                      <p className="tnum mt-1 break-all font-mono text-xs text-slate-800">
                        {generatedInvoice.invoice}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      <CopyButton value={generatedInvoice.invoice} label={t('receive.copyInvoice')} />
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleShare(`lightning:${generatedInvoice.invoice}`)}
                      >
                        <Share2 className="h-4 w-4" /> {t('receive.share')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="md"
                        onClick={() => setGeneratedInvoice(null)}
                      >
                        {t('receive.newInvoice')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {t('receive.createInvoice')}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <Input
                        label={t('receive.invoiceAmount')}
                        inputMode="numeric"
                        placeholder="1,000"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        rightSlot={
                          <span className="pr-2 text-xs font-bold text-slate-400">
                            {invoiceCurrency}
                          </span>
                        }
                      />
                      <SegmentedControl
                        options={[
                          { value: 'SATS', label: 'Sats' },
                          { value: 'TZS', label: 'TZS' },
                        ]}
                        value={invoiceCurrency}
                        onChange={setInvoiceCurrency}
                      />
                    </div>

                    {currentSats > 0 && (
                      <p className="tnum text-xs text-slate-500">
                        ≈ {invoiceCurrency === 'SATS' ? formatTzs(currentTzs) : formatSats(currentSats)}
                      </p>
                    )}

                    <Input
                      label={t('receive.invoiceMemo')}
                      placeholder={t('receive.invoiceMemoPlaceholder')}
                      value={invoiceMemo}
                      onChange={(e) => setInvoiceMemo(e.target.value)}
                    />

                    <Button
                      fullWidth
                      size="lg"
                      loading={generating}
                      onClick={handleCreateInvoice}
                    >
                      <Zap className="h-4 w-4" />
                      {t('receive.createInvoice')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* OPTION 2: STATIC LIGHTNING ADDRESS */}
            {lnSubTab === 'address' && (
              <div className="animate-fade-in text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
                  ⚡ {t('receive.lightningAddress')}
                </div>
                <div className="mx-auto mt-4 w-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <QrCode value={`lightning:${lightningAddr}`} size={190} />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {t('receive.lightningAddress')}
                </p>
                <p className="tnum mt-1 font-mono text-base font-bold text-slate-900">
                  {lightningAddr}
                </p>
                <p className="mt-2 text-xs text-slate-500">{t('receive.lightningNote')}</p>
                <div className="mt-5 flex justify-center gap-2">
                  <CopyButton value={lightningAddr} label={t('receive.copy')} />
                  <Button variant="secondary" size="md" onClick={() => handleShare(lightningAddr)}>
                    <Share2 className="h-4 w-4" /> {t('receive.share')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'phone' && (
          <div className="animate-fade-in text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
              {t('receive.yourNumber')}
            </div>
            <p className="tnum mt-5 font-mono text-2xl font-extrabold tracking-tight text-slate-900">{phone}</p>
            <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
              {t('receive.scanToPay')} — other MeaBit users can send to this number via Lightning.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <CopyButton value={phone} label={t('receive.copy')} />
              <Button variant="secondary" size="md" onClick={() => handleShare(phone)}>
                <Share2 className="h-4 w-4" /> {t('receive.share')}
              </Button>
            </div>
          </div>
        )}

        {tab === 'onchain' && (
          <div className="animate-fade-in text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {t('receive.withOnchain')}
            </div>
            <div className="mx-auto mt-5 w-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <QrCode value={`bitcoin:${btcAddr}`} size={190} />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">{t('receive.bitcoinAddress')}</p>
            <p className="tnum mx-auto mt-1 max-w-xs break-all font-mono text-xs font-bold text-slate-800">{btcAddr}</p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-500">{t('receive.onchainNote')}</p>
            <div className="mt-5 flex justify-center gap-2">
              <CopyButton value={btcAddr} label={t('receive.copy')} />
              <Button variant="secondary" size="md" onClick={() => handleShare(btcAddr)}>
                <Share2 className="h-4 w-4" /> {t('receive.share')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
