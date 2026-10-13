import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Mail, Phone, ShieldCheck, RotateCcw } from 'lucide-react';
import { Avatar, Button, Card, Input, PageHeader } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { formatDate, truncateMiddle } from '../utils/money';
import { DEMO_USER_BTC_ADDRESS } from '../data/mock';

export default function Profile() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever user in context updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
      setEmail(user.email);
      setAvatar(user.avatar);
    }
  }, [user]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('Picha isizidi 4MB / Photo must be under 4MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        showToast('Picha imepakiwa! Bonyeza "Hifadhi mabadiliko" kuthibitisha.', 'info');
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      showToast('Tafadhali weka majina yako / Please enter your name', 'error');
      return;
    }
    setSaving(true);
    updateUser({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      avatar: avatar.trim(),
    });
    setTimeout(() => {
      setSaving(false);
      showToast(t('profile.saved'), 'success');
    }, 200);
  }

  function handleReset() {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
      setEmail(user.email);
      setAvatar(user.avatar);
      showToast('Mabadiliko yamefutwa / Reset to current info', 'info');
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <PageHeader title={t('profile.title')} />

      {/* Main Profile Header Card */}
      <Card className="mb-5 text-center">
        <div className="relative mx-auto inline-block">
          <Avatar
            src={avatar || user?.avatar}
            name={fullName || user?.fullName || 'MeaBit User'}
            size="xl"
            className="mx-auto ring-4 ring-brand-100"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-white shadow-md hover:bg-brand-800 transition-transform active:scale-95"
            title="Badilisha picha / Change photo"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <h2 className="mt-3 text-lg font-extrabold text-slate-900">{fullName || user?.fullName}</h2>
        <p className="tnum text-sm text-slate-400">{phone || user?.phone}</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            {t('profile.meaBitId')}: {user?.meabitId}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {t('profile.memberSince')} {user ? formatDate(user.createdAt) : '—'}
          </span>
        </div>
      </Card>

      {/* Edit Form Card */}
      <Card className="mb-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">{t('profile.editProfile')}</h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Rudisha / Reset</span>
            </button>
          </div>

          <Input
            label={t('profile.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Weka majina yako kamili"
            required
          />

          <Input
            label={t('profile.phone')}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+255 7XX XXX XXX"
            leftIcon={<Phone className="h-4 w-4" />}
          />

          <Input
            label={t('profile.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="barua-pepe@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">{t('profile.language')}</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-500">
                English / Kiswahili
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">{t('profile.currency')}</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-500">
                TZS + BTC
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={saving} fullWidth size="lg">
              <Check className="h-4 w-4 mr-1.5" />
              {t('profile.save')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Address Card */}
      <Card className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
        <div>
          <p className="text-sm font-bold text-slate-800">{t('settings.security')}</p>
          <p className="tnum mt-0.5 text-xs text-slate-500">
            {t('receive.bitcoinAddress')}: {truncateMiddle(DEMO_USER_BTC_ADDRESS, 12, 8)}
          </p>
        </div>
      </Card>
    </div>
  );
}
