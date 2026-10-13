import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, Loader2, Wallet, Zap } from 'lucide-react';
import { Avatar, Button, Card, Modal, StatusBadge } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { formatBtcShort, formatTzs, makeReference, tzsToBtc } from '../utils/money';
import { cn } from '../utils/cn';
import type { Transaction } from '../types';

export default function VikobaDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { vikoba, recordVikobaContribution } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const group = vikoba.find((g) => g.id === id);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [method, setMethod] = useState<'lightning' | 'bitcoin'>('lightning');
  const [phase, setPhase] = useState<'idle' | 'processing' | 'done'>('idle');

  const stats = useMemo(() => {
    if (!group) return null;
    const paid = group.members.filter((m) => m.status === 'paid').length;
    return { paid, total: group.members.length };
  }, [group]);

  if (!group) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-in">
        <Card className="p-8 text-center text-sm text-slate-500">{t('vikoba.noGroups')}</Card>
      </div>
    );
  }

  async function handleContribute() {
    setPhase('processing');
    await new Promise((r) => setTimeout(r, 1400));
    const tx: Transaction = {
      id: `tx-vk-${Date.now()}`,
      type: 'vikoba_contribution',
      rail: method === 'lightning' ? 'lightning' : 'onchain',
      status: method === 'lightning' ? 'completed' : 'pending',
      amountBtc: tzsToBtc(group!.contributionAmount),
      amountTzs: group!.contributionAmount,
      feeTzs: 0,
      feeBtc: 0,
      counterpartyName: group!.name,
      counterpartyHandle: `vikoba/${group!.id}`,
      timestamp: new Date().toISOString(),
      reference: makeReference('VK'),
      note: 'Vikoba contribution',
    };
    recordVikobaContribution(tx, group!.id);
    setPhase('done');
    showToast(t('vikoba.contributionSuccess'), 'success');
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/vikoba')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> {t('vikoba.title')}
      </button>

      <Card className="mb-5 bg-brand-800 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-200">{t('vikoba.groupBalance')}</p>
            <p className="tnum mt-1 text-3xl font-extrabold tracking-tight">{formatTzs(group.balance)}</p>
            <p className="mt-2 text-sm text-brand-100">
              {group.members.length}/{group.maxMembers} {t('vikoba.members')} ·{' '}
              {group.frequency === 'weekly' ? t('vikoba.weekly') : group.frequency === 'biweekly' ? t('vikoba.biweekly') : t('vikoba.monthly')}
            </p>
          </div>
          <Button variant="bitcoin" size="lg" onClick={() => { setContributeOpen(true); setPhase('idle'); }}>
            {t('vikoba.contribute')}
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Members */}
        <Card padded={false}>
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">{t('vikoba.membersList')}</h2>
            <span className="tnum rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
              {stats?.paid}/{stats?.total} {t('vikoba.statusPaid')}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {group.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar src={m.avatar} name={m.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {m.name}
                    {m.isYou && <span className="ml-1.5 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">YOU</span>}
                    {m.role === 'admin' && !m.isYou && (
                      <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        {t('vikoba.youAreAdmin').split(' ').pop()}
                      </span>
                    )}
                  </p>
                  <p className="tnum truncate text-xs text-slate-400">{m.phone}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        m.status === 'paid' ? 'bg-brand-600' : m.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                      )}
                      style={{ width: `${Math.min(100, (m.contributed / Math.max(1, m.expected)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="tnum text-sm font-extrabold text-slate-800">{formatTzs(m.contributed)}</p>
                  <p
                    className={cn(
                      'text-[11px] font-bold',
                      m.status === 'paid' ? 'text-brand-600' : m.status === 'pending' ? 'text-amber-600' : 'text-red-500'
                    )}
                  >
                    {m.status === 'paid' ? t('vikoba.statusPaid') : m.status === 'pending' ? t('vikoba.statusPending') : t('vikoba.statusLate')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card padded={false}>
          <div className="px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">{t('vikoba.activity')}</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {group.activity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    a.type === 'payout' ? 'bg-amber-50 text-amber-600' : a.type === 'joined' ? 'bg-slate-100 text-slate-500' : 'bg-brand-50 text-brand-700'
                  )}
                >
                  {a.type === 'payout' ? <Wallet className="h-4 w-4" /> : a.type === 'joined' ? <Clock3 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {a.memberName}{' '}
                    <span className="font-normal text-slate-500">
                      {a.type === 'contribution'
                        ? 'contributed'
                        : a.type === 'payout'
                          ? 'received a payout of'
                          : a.type === 'joined'
                            ? 'joined the group'
                            : 'created the group'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(a.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                {a.amount ? <p className="tnum text-sm font-extrabold text-slate-800">{formatTzs(a.amount)}</p> : null}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Contribute modal */}
      <Modal open={contributeOpen} onClose={() => setContributeOpen(false)} title={`${t('vikoba.contributeTitle')} ${group.name}`}>
        {phase === 'done' ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" />
            <p className="mt-3 text-base font-extrabold text-slate-900">{t('vikoba.contributionSuccess')}</p>
            <p className="tnum mt-1 text-sm text-slate-500">{formatTzs(group.contributionAmount)} · {formatBtcShort(tzsToBtc(group.contributionAmount))} BTC</p>
            <Button className="mt-5" fullWidth onClick={() => setContributeOpen(false)}>
              {t('common.close')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('vikoba.contributionOf')}</p>
              <p className="tnum mt-1 text-2xl font-extrabold text-slate-900">{formatTzs(group.contributionAmount)}</p>
              <p className="tnum text-xs text-slate-400">≈ {formatBtcShort(tzsToBtc(group.contributionAmount))} BTC</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">{t('vikoba.method')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod('lightning')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-bold',
                    method === 'lightning' ? 'border-brand-600 bg-brand-50/60 text-brand-800' : 'border-slate-200 text-slate-600'
                  )}
                >
                  <Zap className="h-4 w-4 text-amber-500" /> {t('tx.lightning')}
                </button>
                <button
                  onClick={() => setMethod('bitcoin')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-bold',
                    method === 'bitcoin' ? 'border-brand-600 bg-brand-50/60 text-brand-800' : 'border-slate-200 text-slate-600'
                  )}
                >
                  ₿ {t('tx.onchain')}
                </button>
              </div>
            </div>
            <Button size="lg" fullWidth loading={phase === 'processing'} onClick={handleContribute}>
              {phase === 'processing' ? t('send.processing') : t('vikoba.confirmContribution')}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
