import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Users, Wallet } from 'lucide-react';
import { Avatar, Button, Card, EmptyState, Input, Modal, PageHeader } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { computeVikobaStats } from '../data/vikoba';
import { formatTzs } from '../utils/money';
import type { VikobaGroup } from '../types';

export default function Vikoba() {
  const { t } = useLanguage();
  const { vikoba, createVikobaGroup } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const stats = computeVikobaStats(vikoba);

  const [form, setForm] = useState({
    name: '',
    description: '',
    contributionAmount: '10000',
    frequency: 'weekly' as VikobaGroup['frequency'],
    maxMembers: '10',
    startDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
  });

  async function handleCreate() {
    if (!form.name.trim() || !form.contributionAmount) {
      showToast(t('auth.fillAllFields'), 'error');
      return;
    }
    await createVikobaGroup({
      name: form.name.trim(),
      description: form.description.trim(),
      contributionAmount: parseInt(form.contributionAmount, 10),
      frequency: form.frequency,
      maxMembers: parseInt(form.maxMembers, 10) || 10,
      startDate: form.startDate,
    });
    showToast(t('vikoba.created'), 'success');
    setCreateOpen(false);
    setForm({ ...form, name: '', description: '' });
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('vikoba.title')}
        description={t('vikoba.desc')}
        right={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> {t('vikoba.create')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('vikoba.totalGroups'), value: String(stats.totalGroups), icon: Users },
          { label: t('vikoba.totalContributions'), value: formatTzs(stats.totalContributions), icon: ArrowRight },
          { label: t('vikoba.totalBalance'), value: formatTzs(stats.totalBalance), icon: Wallet },
          {
            label: t('vikoba.upcoming'),
            value: stats.nextContribution ? formatTzs(stats.nextContribution.amount) : '—',
            icon: ArrowRight,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50">
              <Icon className="h-5 w-5 text-brand-700" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="tnum truncate text-base font-extrabold text-slate-900">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Groups */}
      <div className="mt-6 space-y-4">
        {vikoba.length === 0 ? (
          <EmptyState
            title={t('vikoba.noGroups')}
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> {t('vikoba.create')}
              </Button>
            }
          />
        ) : (
          vikoba.map((g) => {
            const paid = g.members.filter((m) => m.status === 'paid').length;
            return (
              <Card key={g.id} className="transition-colors hover:border-brand-300">
                <button onClick={() => navigate(`/vikoba/${g.id}`)} className="w-full text-left">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white">
                        <Users className="h-5.5 w-5.5" />
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-slate-900">{g.name}</p>
                        <p className="mt-0.5 max-w-md truncate text-xs text-slate-500">{g.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                            {t('vikoba.contributionAmount')}: {formatTzs(g.contributionAmount)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                            {g.frequency === 'weekly' ? t('vikoba.weekly') : g.frequency === 'biweekly' ? t('vikoba.biweekly') : t('vikoba.monthly')}
                          </span>
                          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                            {paid}/{g.members.length} {t('vikoba.statusPaid')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('vikoba.groupBalance')}</p>
                      <p className="tnum text-lg font-extrabold text-slate-900">{formatTzs(g.balance)}</p>
                      <p className="tnum text-[11px] text-slate-400">
                        {g.members.length}/{g.maxMembers} {t('vikoba.members')}
                      </p>
                    </div>
                  </div>
                </button>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-500">
                    {t('vikoba.nextContribution')}:{' '}
                    <span className="font-bold text-slate-700">
                      {new Date(g.nextContribution).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </p>
                  <button
                    onClick={() => navigate(`/vikoba/${g.id}`)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800"
                  >
                    {t('contacts.viewProfile')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('vikoba.createTitle')}>
        <div className="space-y-4">
          <Input label={t('vikoba.groupName')} placeholder={t('vikoba.groupNamePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label={t('vikoba.description')} placeholder="…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('vikoba.contributionAmount')} inputMode="numeric" value={form.contributionAmount} onChange={(e) => setForm({ ...form, contributionAmount: e.target.value.replace(/[^0-9]/g, '') })} />
            <Input label={t('vikoba.maxMembers')} inputMode="numeric" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: e.target.value.replace(/[^0-9]/g, '') })} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">{t('vikoba.frequency')}</p>
            <div className="grid grid-cols-3 gap-2">
              {(['weekly', 'biweekly', 'monthly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setForm({ ...form, frequency: f })}
                  className={
                    form.frequency === f
                      ? 'rounded-xl border-2 border-brand-600 bg-brand-50 px-2 py-2 text-xs font-bold text-brand-800'
                      : 'rounded-xl border-2 border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-600'
                  }
                >
                  {f === 'weekly' ? t('vikoba.weekly') : f === 'biweekly' ? t('vikoba.biweekly') : t('vikoba.monthly')}
                </button>
              ))}
            </div>
          </div>
          <Input type="date" label={t('vikoba.startDate')} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <Button size="lg" fullWidth onClick={handleCreate}>
            {t('vikoba.create')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
