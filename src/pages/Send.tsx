import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AtSign,
  CheckCircle2,
  ClipboardPaste,
  Clock3,
  Copy,
  FileText,
  Loader2,
  Phone,
  QrCode as QrIcon,
  ScanLine,
  Zap,
} from 'lucide-react';
import { Button, Card, CopyButton, Input, PageHeader, SegmentedControl } from '../components/ui';
import QrScannerModal from '../components/QrScannerModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { lightningService } from '../services/lightningService';
import { bitcoinService } from '../services/bitcoinService';
import { DEMO_USER_LIGHTNING_ADDRESS } from '../data/mock';
import {
  btcToTzs,
  formatBtcShort,
  formatPhone,
  formatTzs,
  isValidBtcAddress,
  isValidLightningAddress,
  isValidLightningInvoice,
  isValidTzPhone,
  tzsToBtc,
} from '../utils/money';
import type { Contact, Currency, PaymentRail, Transaction } from '../types';
import { cn } from '../utils/cn';

type Phase = 'form' | 'review' | 'processing' | 'success' | 'pending';
type LnMethod = 'phone' | 'lightning_address' | 'lightning_invoice' | 'qr';
type OnchainMethod = 'bitcoin_address' | 'qr';

export default function Send() {
  const { t } = useLanguage();
  const { balances, lookupContact, recordSent } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [rail, setRail] = useState<PaymentRail | null>(null);
  const [lnMethod, setLnMethod] = useState<LnMethod>('phone');
  const [onchainMethod, setOnchainMethod] = useState<OnchainMethod>('bitcoin_address');
  const [recipient, setRecipient] = useState('');
  const [resolved, setResolved] = useState<Contact | null>(null);
  const [resolving, setResolving] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('TZS');
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [fee, setFee] = useState<{ tzs: number; btc: number; eta?: string } | null>(null);
  const [receipt, setReceipt] = useState<{ reference: string; txid?: string; invoiceRef?: string } | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  function handleScanResult(scannedVal: string) {
    const val = scannedVal.replace(/^lightning:/i, '').replace(/^bitcoin:/i, '').trim();
    setRecipient(val);
    setResolved(null);

    if (val.toLowerCase().startsWith('lnbc')) {
      setRail('lightning');
      setLnMethod('lightning_invoice');
      showToast('Lightning invoice loaded', 'success');
    } else if (val.includes('@')) {
      setRail('lightning');
      setLnMethod('lightning_address');
      showToast('Lightning address loaded', 'success');
    } else if (val.startsWith('bc1') || val.startsWith('1') || val.startsWith('3')) {
      setRail('onchain');
      setOnchainMethod('bitcoin_address');
      showToast('Bitcoin address loaded', 'success');
    } else if (isValidTzPhone(val)) {
      setRail('lightning');
      setLnMethod('phone');
      lookupContact(formatPhone(val)).then((c) => setResolved(c));
    }
  }

  async function handlePaste() {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleScanResult(text.trim());
          return;
        }
      }
    } catch {
      /* ignore */
    }
    showToast('Paste text or allow clipboard permission', 'info');
  }

  const amountTzs = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ''));
    if (!Number.isFinite(n) || n <= 0) return 0;
    return currency === 'TZS' ? n : btcToTzs(n);
  }, [amount, currency]);

  const amountBtc = tzsToBtc(amountTzs);

  const validationError = useMemo(() => {
    if (!recipient.trim()) return null;
    if (rail === 'lightning') {
      if (lnMethod === 'phone' && !isValidTzPhone(recipient)) return t('send.invalidPhone');
      if (lnMethod === 'lightning_address' && !isValidLightningAddress(recipient)) return t('send.invalidLnAddress');
      if (lnMethod === 'lightning_invoice' && !isValidLightningInvoice(recipient)) return t('send.invalidInvoice');
    }
    if (rail === 'onchain' && !isValidBtcAddress(recipient)) return t('send.invalidAddress');
    return null;
  }, [recipient, rail, lnMethod, t]);

  async function handleRecipientBlur() {
    if (rail !== 'lightning' || lnMethod !== 'phone' || !isValidTzPhone(recipient)) return;
    setResolving(true);
    const contact = await lookupContact(formatPhone(recipient));
    setResolved(contact);
    setResolving(false);
    if (contact?.lightningAddress) {
      showToast(`${contact.name} · ${t('send.lightningAvailable')}`, 'success');
    }
  }

  async function goReview() {
    if (!rail) return;
    if (!recipient.trim()) {
      showToast(t('send.enterRecipient'), 'error');
      return;
    }
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }
    if (amountTzs <= 0) {
      showToast(t('send.enterAmount'), 'error');
      return;
    }
    if (rail === 'lightning' && amountTzs > btcToTzs(balances.lightningBtc)) {
      showToast(t('send.insufficient'), 'error');
      return;
    }
    setPhase('review');
    if (rail === 'lightning') {
      const q = await lightningService.quoteFee(amountTzs);
      setFee({ tzs: q.feeTzs, btc: q.feeBtc });
    } else {
      const rows = await bitcoinService.estimateFees(amountTzs);
      const mid = rows[1] ?? rows[0];
      setFee({ tzs: mid.feeTzs, btc: mid.feeBtc, eta: mid.eta });
    }
  }
  async function confirmSend() {
    if (!rail) return;
    setPhase('processing');
    const isLn = rail === 'lightning';
    try {
      if (isLn) {
        const r = await lightningService.send({
          amountTzs,
          amountBtc,
          recipient: resolved?.lightningAddress ?? recipient,
          note,
        });
        const tx: Transaction = {
          id: `tx-send-${Date.now()}`,
          type: 'sent',
          rail: 'lightning',
          status: 'completed',
          amountBtc,
          amountTzs,
          feeBtc: fee?.btc ?? 0,
          feeTzs: fee?.tzs ?? 0,
          counterpartyName: resolved?.name ?? recipient,
          counterpartyHandle: resolved?.lightningAddress ?? recipient,
          timestamp: new Date().toISOString(),
          reference: r.reference,
          invoiceRef: r.invoiceRef,
          note: note || undefined,
        };
        recordSent(tx);
        setReceipt({ reference: r.reference, invoiceRef: r.invoiceRef });
        setPhase('success');
      } else {
        const b = await bitcoinService.broadcast({ address: recipient, amountBtc, amountTzs, feeBtc: fee?.btc ?? 0 });
        const tx: Transaction = {
          id: `tx-send-${Date.now()}`,
          type: 'sent',
          rail: 'onchain',
          status: 'pending',
          amountBtc,
          amountTzs,
          feeBtc: fee?.btc ?? 0,
          feeTzs: fee?.tzs ?? 0,
          counterpartyName: recipient.startsWith('bc1') ? 'Bitcoin address' : recipient,
          counterpartyHandle: recipient,
          timestamp: new Date().toISOString(),
          reference: b.reference,
          txid: b.txid,
          confirmations: 0,
          note: note || undefined,
        };
        recordSent(tx);
        setReceipt({ reference: b.reference, txid: b.txid });
        setPhase('pending');
      }
    } catch {
      showToast('Payment failed (simulated)', 'error');
      setPhase('review');
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-xl">
      <PageHeader
        title={t('send.title')}
        description={t('send.desc')}
        onBack={phase !== 'form' ? () => setPhase('form') : undefined}
      />
      {phase === 'form' && (
        <div className="space-y-5">
          {/* Rail choice */}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setRail('lightning')}
              className={cn(
                'rounded-2xl border-2 p-4 text-left transition-colors',
                rail === 'lightning' ? 'border-brand-600 bg-brand-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                <Zap className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <p className="text-sm font-bold text-slate-900">{t('send.lightningRail')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t('send.lightningRailDesc')}</p>
            </button>
            <button
              onClick={() => setRail('onchain')}
              className={cn(
                'rounded-2xl border-2 p-4 text-left transition-colors',
                rail === 'onchain' ? 'border-brand-600 bg-brand-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <FileText className="h-4.5 w-4.5 text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">{t('send.onchainRail')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t('send.onchainRailDesc')}</p>
            </button>
          </div>

          {rail && (
            <Card className="space-y-4">
              {/* Method chips */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('send.chooseMethod')}</p>
                  <button
                    type="button"
                    onClick={() => setQrScannerOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
                  >
                    <ScanLine className="h-3.5 w-3.5" />
                    {t('send.byQr')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rail === 'lightning'
                    ? (
                      [
                        { key: 'phone', label: t('send.byPhone'), icon: Phone },
                        { key: 'lightning_invoice', label: t('send.byLightningInvoice'), icon: Zap },
                        { key: 'lightning_address', label: t('send.byLightningAddress'), icon: AtSign },
                        { key: 'qr', label: t('send.byQr'), icon: ScanLine },
                      ] as const
                    ).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (key === 'qr') {
                            setQrScannerOpen(true);
                          } else {
                            setLnMethod(key);
                            setRecipient('');
                            setResolved(null);
                          }
                        }}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                          (key !== 'qr' && lnMethod === key)
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))
                    : null}
                  {rail === 'onchain'
                    ? (
                      [
                        { key: 'bitcoin_address', label: t('send.byBitcoinAddress'), icon: FileText },
                        { key: 'qr', label: t('send.byQr'), icon: ScanLine },
                      ] as const
                    ).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (key === 'qr') {
                            setQrScannerOpen(true);
                          } else {
                            setOnchainMethod(key);
                            setRecipient('');
                          }
                        }}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                          (key !== 'qr' && onchainMethod === key)
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))
                    : null}
                </div>
              </div>

              {/* Recipient Input with Paste & QR Scan buttons */}
              <div>
                <div className="relative">
                  <Input
                    label={
                      rail === 'lightning'
                        ? lnMethod === 'phone'
                          ? t('send.recipientPhone')
                          : lnMethod === 'lightning_address'
                            ? t('send.byLightningAddress')
                            : t('send.byLightningInvoice')
                        : t('send.recipientAddress')
                    }
                    placeholder={
                      rail === 'lightning'
                        ? lnMethod === 'phone'
                          ? '+255 7XX XXX XXX'
                          : lnMethod === 'lightning_address'
                            ? t('send.lightningAddressPlaceholder')
                            : t('send.invoicePlaceholder')
                        : t('send.addressPlaceholder')
                    }
                    leftIcon={
                      rail === 'lightning' ? (
                        lnMethod === 'phone' ? (
                          <Phone className="h-4 w-4" />
                        ) : lnMethod === 'lightning_address' ? (
                          <AtSign className="h-4 w-4" />
                        ) : (
                          <Zap className="h-4 w-4 text-amber-500" />
                        )
                      ) : (
                        <FileText className="h-4 w-4" />
                      )
                    }
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value);
                      setResolved(null);
                    }}
                    onBlur={handleRecipientBlur}
                    error={validationError ?? undefined}
                    rightSlot={
                      <div className="flex items-center gap-1 pr-1.5">
                        <button
                          type="button"
                          onClick={handlePaste}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title={t('send.paste')}
                          aria-label={t('send.paste')}
                        >
                          <ClipboardPaste className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrScannerOpen(true)}
                          className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-50"
                          title={t('send.byQr')}
                          aria-label={t('send.byQr')}
                        >
                          <ScanLine className="h-4 w-4" />
                        </button>
                      </div>
                    }
                  />
                </div>

                {resolving && (
                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('common.loading')}
                  </p>
                )}
                {resolved && (
                  <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-brand-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{resolved.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {t('send.foundUser')}
                        {resolved.lightningAvailable ? ' · ' + t('send.lightningAvailable') : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sender's own Lightning address quick copy helper */}
                {rail === 'lightning' && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs">
                    <span className="truncate text-slate-500">
                      {t('send.copyYourLn')}: <strong className="font-mono text-slate-800">{DEMO_USER_LIGHTNING_ADDRESS}</strong>
                    </span>
                    <CopyButton value={DEMO_USER_LIGHTNING_ADDRESS} label={t('receive.copy')} className="shrink-0 text-xs" />
                  </div>
                )}
              </div>
              {/* Amount + note */}
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <Input
                  label={t('send.amount')}
                  inputMode="decimal"
                  placeholder={currency === 'TZS' ? '10,000' : '0.00004'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  rightSlot={
                    <span className="pr-2 text-sm font-bold text-slate-400">{currency}</span>
                  }
                />
                <SegmentedControl
                  options={[
                    { value: 'TZS', label: 'TZS' },
                    { value: 'BTC', label: 'BTC' },
                  ]}
                  value={currency}
                  onChange={setCurrency}
                />
              </div>
              {amountTzs > 0 && (
                <p className="tnum text-xs text-slate-500">
                  ≈ {currency === 'TZS' ? formatBtcShort(amountBtc) + ' BTC' : formatTzs(amountTzs)}
                </p>
              )}
              <Input label={t('send.note')} placeholder={t('send.notePlaceholder')} value={note} onChange={(e) => setNote(e.target.value)} />

              <Button size="lg" fullWidth onClick={goReview}>
                {t('common.continue')}
              </Button>
            </Card>
          )}
        </div>
      )}
      {phase === 'review' && rail && (
        <Card className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('send.review')}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.recipient')}</span>
              <span className="text-right text-sm font-bold text-slate-800">
                {resolved?.name ?? recipient}
                <span className="tnum block text-xs font-medium text-slate-400">{recipient}</span>
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.amount')}</span>
              <span className="tnum text-sm font-bold text-slate-800">{formatTzs(amountTzs)}</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.btcEquivalent')}</span>
              <span className="tnum text-sm font-bold text-slate-800">{formatBtcShort(amountBtc)} BTC</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.paymentMethod')}</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
                {rail === 'lightning' ? <Zap className="h-4 w-4 text-amber-500" /> : <FileText className="h-4 w-4 text-slate-500" />}
                {rail === 'lightning' ? t('tx.lightning') : t('tx.onchain')}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {rail === 'lightning' ? t('send.estimatedFee') : t('send.networkFee')}
              </span>
              <span className="tnum text-sm font-bold text-slate-800">
                {fee ? formatTzs(fee.tzs) : '…'}
              </span>
            </div>
            {rail === 'onchain' && (
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{t('send.confirTime')}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  {fee?.eta ?? t('send.confirmTimeValue')}
                </span>
              </div>
            )}
            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{t('send.total')}</span>
                <span className="tnum text-base font-extrabold text-slate-900">
                  {fee ? formatTzs(amountTzs + fee.tzs) : '…'}
                </span>
              </div>
            </div>
          </div>
          <Button size="lg" fullWidth onClick={confirmSend}>
            {rail === 'lightning' ? t('send.confirmSend') : t('send.confirmOnchain')}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setPhase('form')}>
            {t('common.back')}
          </Button>
        </Card>
      )}
      {phase === 'processing' && (
        <Card className="flex flex-col items-center py-14 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="mt-5 text-base font-bold text-slate-800">
            {rail === 'lightning' ? t('send.processing') : t('send.broadcasting')}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t('send.securing')}</p>
        </Card>
      )}

      {(phase === 'success' || phase === 'pending') && receipt && (
        <Card className="space-y-5 text-center">
          <div
            className={cn(
              'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
              phase === 'success' ? 'bg-brand-50 animate-pulse-ring' : 'bg-amber-50'
            )}
          >
            {phase === 'success' ? (
              <CheckCircle2 className="h-8 w-8 text-brand-600" />
            ) : (
              <Clock3 className="h-8 w-8 text-amber-500" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {phase === 'success' ? t('send.successTitle') : t('send.pendingTitle')}
            </h2>
            {phase === 'pending' && <p className="mt-1 text-sm text-slate-500">{t('send.pendingDesc')}</p>}
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.amount')}</span>
              <span className="tnum text-sm font-bold text-slate-800">{formatTzs(amountTzs)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">BTC</span>
              <span className="tnum text-sm font-bold text-slate-800">{formatBtcShort(amountBtc)} BTC</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.recipient')}</span>
              <span className="max-w-[60%] truncate text-right text-sm font-bold text-slate-800">
                {resolved?.name ?? recipient}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.paymentMethod')}</span>
              <span className="text-sm font-bold text-slate-800">
                {rail === 'lightning' ? t('tx.lightning') : t('tx.onchain')}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('send.txRef')}</span>
              <span className="tnum font-mono text-xs font-bold text-slate-800">{receipt.reference}</span>
            </div>
            {receipt.txid && (
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="shrink-0 text-sm font-medium text-slate-500">{t('tx.txid')}</span>
                <span className="tnum truncate font-mono text-[11px] text-slate-500">{receipt.txid}</span>
              </div>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => navigate('/transactions')}>
              {t('nav.transactions')}
            </Button>
            <Button
              onClick={() => {
                setPhase('form');
                setRecipient('');
                setAmount('');
                setNote('');
                setResolved(null);
                setReceipt(null);
              }}
            >
              {t('send.newPayment')}
            </Button>
          </div>
        </Card>
      )}

      {/* Interactive QR Scanner Modal */}
      <QrScannerModal
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScan={handleScanResult}
      />
    </div>
  );
}
