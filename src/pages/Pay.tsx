import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  QrCode as QrIcon,
  Radio,
  ScanLine,
  Smartphone,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';
import { Avatar, Button, Card, Input, PageHeader, SegmentedControl } from '../components/ui';
import QrScannerModal from '../components/QrScannerModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { paymentService } from '../services/paymentService';
import { btcToSats, formatBtcShort, formatPhone, formatSats, formatTzs, isValidTzPhone, tzsToBtc } from '../utils/money';
import { cn } from '../utils/cn';

type PayTab = 'paybee' | 'qr' | 'phone';

const PRESET_MERCHANTS = [
  { name: 'Mama Lishe Mwajuma', category: 'Chakula / Food', amount: 3500 },
  { name: 'Daladala Posta - Mwenge', category: 'Nauli / Fare', amount: 600 },
  { name: 'Duka la Mang’i Karoli', category: 'Vyakula / Groceries', amount: 12000 },
  { name: 'Boda Boda Ally', category: 'Usafiri / Transport', amount: 2000 },
];

export default function Pay() {
  const { t } = useLanguage();
  const { contacts, recordSent, lookupContact } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<PayTab>('paybee');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('5000');
  const [merchantName, setMerchantName] = useState('Mama Lishe Mwajuma');
  const [resolved, setResolved] = useState<{ name: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [invoiceOrAddress, setInvoiceOrAddress] = useState('');
  const [done, setDone] = useState<{
    name: string;
    amountTzs: number;
    reference: string;
    method: string;
  } | null>(null);

  const amountTzs = parseFloat(amount.replace(/,/g, '')) || 0;

  async function resolve() {
    if (!isValidTzPhone(phone)) return;
    const c = await lookupContact(formatPhone(phone));
    setResolved(c ? { name: c.name } : null);
  }

  async function handlePay(methodType: string, recipientName: string) {
    if (amountTzs <= 0) {
      showToast(t('send.enterAmount'), 'error');
      return;
    }
    setProcessing(true);
    try {
      const tx = await paymentService.executePay({
        recipient: recipientName,
        amountTzs,
      });
      recordSent(tx);
      setDone({
        name: recipientName,
        amountTzs,
        reference: tx.reference,
        method: methodType,
      });
      showToast('Payment successful!', 'success');
    } catch {
      showToast('Payment failed (simulated)', 'error');
    } finally {
      setProcessing(false);
    }
  }

  function handleQrScan(val: string) {
    setInvoiceOrAddress(val);
    setMerchantName(val.startsWith('lnbc') ? 'Lightning Merchant Invoice' : val);
    showToast('QR code scanned', 'success');
  }

  if (done) {
    return (
      <div className="animate-fade-in mx-auto max-w-xl">
        <Card className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 animate-pulse-ring items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 className="h-8 w-8 text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t('pay.success')}</h2>
            <p className="mt-1 text-xs text-slate-500">Micropayment confirmed via Lightning</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.recipient')}</span>
              <span className="text-sm font-bold text-slate-800">{done.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.amount')}</span>
              <div>
                <span className="tnum text-sm font-extrabold text-slate-900">{formatTzs(done.amountTzs)}</span>
                <span className="tnum ml-1.5 text-xs font-semibold text-amber-600">
                  ({formatSats(btcToSats(tzsToBtc(done.amountTzs)))})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.paymentMethod')}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> {done.method}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
              <span className="text-sm font-medium text-slate-500">{t('send.txRef')}</span>
              <span className="tnum font-mono text-xs font-bold text-slate-800">{done.reference}</span>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDone(null);
                setPhone('');
                setInvoiceOrAddress('');
              }}
            >
              {t('pay.payNow')}
            </Button>
            <Button onClick={() => navigate('/transactions')}>{t('nav.transactions')}</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-xl space-y-5">
      <PageHeader title={t('pay.title')} description={t('pay.desc')} />

      {/* Micropayment Method Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('paybee')}
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-bold transition-all',
            activeTab === 'paybee'
              ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-xs'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          )}
        >
          <CreditCard className="h-4 w-4 text-emerald-600" />
          <span>{t('pay.paybeeTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-bold transition-all',
            activeTab === 'qr'
              ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-xs'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          )}
        >
          <ScanLine className="h-4 w-4 text-amber-500" />
          <span>{t('pay.qrTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('phone')}
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-bold transition-all',
            activeTab === 'phone'
              ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-xs'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          )}
        >
          <Smartphone className="h-4 w-4 text-brand-600" />
          <span>{t('pay.phoneTab')}</span>
        </button>
      </div>

      {/* TAB 1: PAYBEE LIGHTNING CARD (TAP & PAY) */}
      {activeTab === 'paybee' && (
        <Card className="space-y-5">
          {/* PayBee Virtual Card Visual */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-brand-800 to-slate-900 p-5 text-white shadow-lg">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                  ⚡
                </span>
                <span className="font-extrabold tracking-wider text-sm">PAYBEE CARD</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-200">
                <Wifi className="h-5 w-5 rotate-90 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">NFC READY</span>
              </div>
            </div>

            <div className="my-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-200/80">Card ID</p>
                <p className="font-mono text-base font-bold tracking-widest text-white">PB-8821 •••• 4410</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-200/80">Rail</p>
                <p className="text-xs font-bold text-amber-300">Bitcoin Lightning</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/80">
              <span>{t('pay.paybeeLinked')}</span>
              <span className="font-semibold text-emerald-300">Instant Micropayments</span>
            </div>
          </div>

          {/* PayBee App Notice from Tito's instruction */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900">
            <p className="font-bold flex items-center gap-1.5">
              <span>📱</span> {t('pay.paybeeAppNotice')}
            </p>
            <p className="mt-1 text-[11px] text-amber-800">
              Pakua PayBee kwenye <strong>Google Play</strong> au <strong>App Store</strong>. Kutumia kwa vitendo unahitaji kadi yake ya PayBee ya NFC kugusisha kwenye POS.
            </p>
          </div>

          {/* Quick Merchant Selection */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Quick Micropayment Merchant:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_MERCHANTS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setMerchantName(m.name);
                    setAmount(m.amount.toString());
                  }}
                  className={cn(
                    'rounded-xl border p-2.5 text-left transition-all',
                    merchantName === m.name
                      ? 'border-brand-600 bg-brand-50/70 text-brand-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  <p className="truncate text-xs font-bold">{m.name}</p>
                  <p className="text-[10px] text-slate-400">{m.category}</p>
                  <p className="tnum mt-1 text-xs font-extrabold text-emerald-700">{formatTzs(m.amount)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient & Amount Inputs */}
          <Input
            label={t('pay.recipient')}
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            placeholder="Merchant / Shop Name"
          />

          <Input
            label={t('pay.amount')}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            rightSlot={<span className="pr-2 text-sm font-bold text-slate-400">TZS</span>}
          />
          {amountTzs > 0 && (
            <p className="tnum text-xs text-slate-500">
              ≈ {formatSats(btcToSats(tzsToBtc(amountTzs)))} (≈ {formatBtcShort(tzsToBtc(amountTzs))} BTC)
            </p>
          )}

          {/* Tap to Pay Button with animated NFC wave simulation */}
          <Button
            size="lg"
            fullWidth
            loading={processing}
            onClick={() => handlePay('PayBee Card (NFC Tap)', merchantName)}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Radio className="h-4 w-4" />
            {processing ? t('pay.paybeeTapping') : t('pay.paybeeTapToPay')}
          </Button>
        </Card>
      )}

      {/* TAB 2: QR CODE / LIGHTNING INVOICE */}
      {activeTab === 'qr' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Lightning Invoice / Address:
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setQrOpen(true)}
              className="text-xs"
            >
              <ScanLine className="h-3.5 w-3.5" />
              {t('send.byQr')}
            </Button>
          </div>

          <Input
            label="Lightning Invoice or Address"
            placeholder="lnbc... or name@meabit.wallet"
            value={invoiceOrAddress}
            onChange={(e) => {
              setInvoiceOrAddress(e.target.value);
              setMerchantName(e.target.value);
            }}
            rightSlot={
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="p-1.5 text-brand-700 hover:bg-brand-50 rounded-lg"
              >
                <ScanLine className="h-4 w-4" />
              </button>
            }
          />

          <Input
            label={t('pay.amount')}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            rightSlot={<span className="pr-2 text-sm font-bold text-slate-400">TZS</span>}
          />

          {amountTzs > 0 && (
            <p className="tnum text-xs text-slate-500">
              ≈ {formatSats(btcToSats(tzsToBtc(amountTzs)))}
            </p>
          )}

          <Button
            size="lg"
            fullWidth
            loading={processing}
            disabled={!invoiceOrAddress.trim()}
            onClick={() => handlePay('Lightning QR / Invoice', invoiceOrAddress || 'Lightning Payment')}
          >
            <Zap className="h-4 w-4" />
            {t('pay.payNow')}
          </Button>
        </Card>
      )}

      {/* TAB 3: PHONE NUMBER & CONTACTS */}
      {activeTab === 'phone' && (
        <Card className="space-y-4">
          <div>
            <Input
              label={t('pay.recipient')}
              placeholder="+255 7XX XXX XXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setResolved(null);
              }}
              onBlur={resolve}
            />
            {resolved && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                <p className="text-sm font-bold text-slate-800">
                  {resolved.name} · <span className="font-medium text-slate-500">{t('send.foundUser')}</span>
                </p>
              </div>
            )}
          </div>

          <Input
            label={t('pay.amount')}
            inputMode="numeric"
            placeholder="5,000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            rightSlot={<span className="pr-2 text-sm font-bold text-slate-400">TZS</span>}
          />
          {amountTzs > 0 && (
            <p className="tnum text-xs text-slate-500">
              ≈ {formatSats(btcToSats(tzsToBtc(amountTzs)))} (≈ {formatBtcShort(tzsToBtc(amountTzs))} BTC)
            </p>
          )}

          {/* Quick contact picker */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">{t('pay.chooseContact')}</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {contacts.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setPhone(c.phone);
                    setResolved({ name: c.name });
                  }}
                  className="flex w-16 shrink-0 flex-col items-center gap-1.5"
                >
                  <Avatar src={c.avatar} name={c.name} size="lg" />
                  <span className="w-full truncate text-center text-[11px] font-semibold text-slate-600">
                    {c.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            fullWidth
            loading={processing}
            onClick={() => handlePay('Phone / Lightning', resolved?.name ?? formatPhone(phone))}
          >
            {t('pay.payNow')}
          </Button>
        </Card>
      )}

      {/* QR Scanner Modal */}
      <QrScannerModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onScan={handleQrScan}
      />
    </div>
  );
}
