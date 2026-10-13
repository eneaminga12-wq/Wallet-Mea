import { useState } from 'react';
import { MessageSquareText, Phone, Radio } from 'lucide-react';
import { Button, Card, Input, PageHeader } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { SMS_USSD_FEATURES, smsUssdService } from '../services/smsUssdService';

export default function SmsUssd() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [phone, setPhone] = useState('');
  const [registered, setRegistered] = useState(false);

  async function handleNotify() {
    if (!phone.trim()) return;
    await smsUssdService.registerInterest(phone);
    setRegistered(true);
    showToast(t('sms.registered'), 'success');
  }

  return (
    <div className="animate-fade-in mx-auto max-w-xl">
      <PageHeader
        title={t('sms.title')}
        description={t('sms.desc')}
        right={
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
            {t('sms.badge')}
          </span>
        }
      />

      <Card className="mb-5 flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Radio className="h-5 w-5 text-slate-500" />
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{t('sms.worksAnywhere')}</p>
      </Card>

      <div className="mb-5 space-y-2.5">
        {SMS_USSD_FEATURES.map((f) => (
          <Card key={f.code} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                {f.code.startsWith('*') ? <Phone className="h-5 w-5 text-slate-500" /> : <MessageSquareText className="h-5 w-5 text-slate-500" />}
              </div>
              <div>
                <p className="tnum font-mono text-sm font-bold text-slate-800">{f.code}</p>
                <p className="text-xs text-slate-500">{f.label}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
              {t('settings.comingSoon')}
            </span>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">{t('sms.roadmap')}</h2>
        <ol className="space-y-2.5">
          {[
            { step: '1', label: t('sms.step1'), done: registered },
            { step: '2', label: t('sms.step2'), done: false },
            { step: '3', label: t('sms.step3'), done: false },
          ].map(({ step, label, done }) => (
            <li key={step} className="flex items-center gap-3">
              <span
                className={
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ' +
                  (done ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')
                }
              >
                {step}
              </span>
              <p className="text-sm text-slate-600">{label}</p>
            </li>
          ))}
        </ol>

        {!registered ? (
          <div className="flex gap-2">
            <Input
              placeholder={t('sms.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleNotify}>{t('sms.notify')}</Button>
          </div>
        ) : (
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">{t('sms.registered')}</p>
        )}
      </Card>
    </div>
  );
}
