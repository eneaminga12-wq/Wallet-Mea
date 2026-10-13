import { useState } from 'react';
import { Bell, Bot, Globe, KeyRound, Laptop, Lock, ShieldCheck, Wallet } from 'lucide-react';
import { Card, PageHeader, Toggle, SegmentedControl } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../utils/cn';

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { showToast } = useToast();

  const [push, setPush] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [vikobaReminders, setVikobaReminders] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [twoFa, setTwoFa] = useState(false);
  const [defaultRail, setDefaultRail] = useState<'lightning' | 'onchain'>('lightning');

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <PageHeader title={t('settings.title')} description={t('settings.desc')} />

      <div className="space-y-5">
        {/* Language & currency */}
        <Card className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Globe className="h-4.5 w-4.5 text-brand-700" /> {t('settings.language')} & {t('settings.currency')}
          </h2>
          <SegmentedControl
            options={[
              { value: 'en', label: 'English' },
              { value: 'sw', label: 'Kiswahili' },
            ]}
            value={language}
            onChange={(v) => setLanguage(v)}
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-500">{t('settings.currency')}</span>
            <span className="text-sm font-bold text-slate-800">TZS + BTC</span>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Bell className="h-4.5 w-4.5 text-brand-700" /> {t('settings.notifications')}
          </h2>
          <Toggle checked={push} onChange={setPush} label={t('settings.pushNotifications')} description={t('settings.pushDesc')} />
          <Toggle checked={vikobaReminders} onChange={setVikobaReminders} label={t('settings.vikobaReminders')} description={t('settings.vikobaRemindersDesc')} />
          <Toggle checked={marketing} onChange={setMarketing} label={t('settings.marketing')} description={t('settings.marketingDesc')} />
        </Card>

        {/* Payment preferences */}
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Wallet className="h-4.5 w-4.5 text-brand-700" /> {t('settings.paymentPrefs')}
          </h2>
          <p className="text-sm font-medium text-slate-700">{t('settings.defaultRail')}</p>
          <div className="grid grid-cols-2 gap-2">
            {(['lightning', 'onchain'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDefaultRail(r)}
                className={cn(
                  'rounded-xl border-2 px-3 py-3 text-sm font-bold transition-colors',
                  defaultRail === r ? 'border-brand-600 bg-brand-50/60 text-brand-800' : 'border-slate-200 text-slate-600'
                )}
              >
                {r === 'lightning' ? t('tx.lightning') : t('tx.onchain')}
              </button>
            ))}
          </div>
          <Toggle checked={hideBalance} onChange={setHideBalance} label={t('settings.hideBalance')} description={t('settings.hideBalanceDesc')} />
        </Card>

        {/* AI preferences */}
        <Card className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Bot className="h-4.5 w-4.5 text-brand-700" /> {t('settings.aiPrefs')}
          </h2>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-500">{t('settings.aiLanguage')}</span>
            <span className="text-sm font-bold text-slate-800">{t('settings.aiSameAsApp')}</span>
          </div>
          <Toggle checked={voiceReplies} onChange={setVoiceReplies} label={t('settings.voiceReplies')} description={t('settings.voiceRepliesDesc')} />
        </Card>

        {/* Security */}
        <Card className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ShieldCheck className="h-4.5 w-4.5 text-brand-700" /> {t('settings.security')}
          </h2>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.changePassword')}</p>
              <p className="text-xs text-slate-400">••••••••</p>
            </div>
            <button
              onClick={() => showToast(t('settings.saved') + ' (simulated)', 'info')}
              className="text-sm font-bold text-brand-700 hover:text-brand-800"
            >
              {t('common.confirm')}
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.pin')}</p>
              <p className="text-xs text-slate-400">{t('settings.pinDesc')}</p>
            </div>
            <Toggle checked={pinEnabled} onChange={setPinEnabled} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.twoFa')}</p>
              <p className="text-xs text-slate-400">{t('settings.twoFaDesc')}</p>
            </div>
            <Toggle checked={twoFa} onChange={setTwoFa} />
          </div>
        </Card>

        {/* Privacy */}
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Lock className="h-4.5 w-4.5 text-brand-700" /> {t('settings.privacy')}
          </h2>
          <Toggle checked={shareAnalytics} onChange={setShareAnalytics} label={t('settings.shareAnalytics')} description={t('settings.shareAnalyticsDesc')} />
        </Card>

        {/* Sessions */}
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Laptop className="h-4.5 w-4.5 text-brand-700" /> {t('settings.sessions')}
          </h2>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <Laptop className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.currentDevice')}</p>
                <p className="text-xs font-semibold text-brand-600">{t('settings.sessionActive')}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => showToast(t('settings.signedOut'), 'info')}
            className="text-sm font-bold text-red-600 hover:text-red-700"
          >
            {t('settings.signOutOthers')}
          </button>
        </Card>
      </div>
    </div>
  );
}
