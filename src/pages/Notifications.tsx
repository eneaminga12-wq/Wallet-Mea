import { useMemo } from 'react';
import {
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Users,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Button, Card, EmptyState, PageHeader } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { cn } from '../utils/cn';
import type { AppNotification } from '../types';

const CATEGORY_META: Record<AppNotification['category'], { icon: typeof Bell; tone: string }> = {
  payment_received: { icon: ArrowDownLeft, tone: 'bg-brand-50 text-brand-700' },
  payment_sent: { icon: ArrowUpRight, tone: 'bg-slate-100 text-slate-600' },
  confirmed: { icon: CheckCircle2, tone: 'bg-brand-50 text-brand-700' },
  failed: { icon: XCircle, tone: 'bg-red-50 text-red-500' },
  vikoba_reminder: { icon: Clock3, tone: 'bg-amber-50 text-amber-600' },
  vikoba_received: { icon: Users, tone: 'bg-brand-50 text-brand-700' },
  security: { icon: ShieldCheck, tone: 'bg-slate-100 text-slate-600' },
  ai: { icon: Bot, tone: 'bg-violet-50 text-violet-600' },
};

export default function Notifications() {
  const { t } = useLanguage();
  const { notifications, markNotificationsRead } = useWallet();

  const timeAgo = (iso: string) => {
    const mins = Math.round((Date.now() - +new Date(iso)) / 60000);
    if (mins < 1) return t('notif.justNow');
    if (mins < 60) return `${mins} ${t('notif.minutesAgo')}`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} ${t('notif.hoursAgo')}`;
    return `${Math.round(hours / 24)} ${t('notif.daysAgo')}`;
  };

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    [notifications]
  );

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <PageHeader
        title={t('notif.title')}
        right={
          <Button variant="secondary" size="md" onClick={markNotificationsRead}>
            {t('notif.markAllRead')}
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState icon={Bell} title={t('notif.empty')} />
      ) : (
        <div className="space-y-2.5">
          {sorted.map((n) => {
            const { icon: Icon, tone } = CATEGORY_META[n.category];
            return (
              <Card
                key={n.id}
                className={cn('flex items-start gap-3.5 transition-colors', !n.read && 'border-brand-200 bg-brand-50/40')}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{n.title}</p>
                    <span className="shrink-0 text-[11px] font-semibold text-slate-400">{timeAgo(n.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.body}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
