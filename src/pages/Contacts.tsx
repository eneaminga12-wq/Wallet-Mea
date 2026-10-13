import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Zap } from 'lucide-react';
import { Avatar, Button, Card, EmptyState, Input, Modal, PageHeader } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';

export default function Contacts() {
  const { t } = useLanguage();
  const { contacts, addContact } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filtered = useMemo(
    () =>
      contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.replace(/\s/g, '').includes(query.replace(/\s/g, ''))
      ),
    [contacts, query]
  );

  function handleAdd() {
    if (!newName.trim()) return;
    addContact({
      id: `c-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || '+255 7XX XXX XXX',
      avatar: '',
      isMeaBitUser: false,
      lightningAvailable: false,
    });
    showToast(t('contacts.added'), 'success');
    setAddOpen(false);
    setNewName('');
    setNewPhone('');
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <PageHeader
        title={t('contacts.title')}
        description={t('contacts.all')}
        right={
          <Button size="md" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4" /> {t('contacts.add')}
          </Button>
        }
      />

      <Input
        placeholder={t('contacts.search')}
        leftIcon={<Search className="h-4 w-4" />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />

      {filtered.length === 0 ? (
        <EmptyState title={t('contacts.empty')} />
      ) : (
        <Card padded={false} className="divide-y divide-slate-100">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
              <Avatar src={c.avatar} name={c.name} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-800">{c.name}</p>
                  {c.lightningAvailable && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                      <Zap className="h-3 w-3" /> {t('contacts.lightningAvailable')}
                    </span>
                  )}
                </div>
                <p className="tnum truncate text-xs text-slate-400">{c.phone}</p>
                <p className="text-[11px] font-semibold text-slate-400">
                  {c.isMeaBitUser ? t('contacts.meaBitUser') : t('contacts.notOnMeaBit')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => navigate('/send')}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  {t('contacts.send')}
                </button>
                <button
                  onClick={() => navigate('/pay')}
                  className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-800"
                >
                  {t('contacts.pay')}
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('contacts.add')}>
        <div className="space-y-4">
          <Input label={t('contacts.name')} placeholder={t('contacts.namePlaceholder')} value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input label={t('auth.phone')} placeholder="+255 7XX XXX XXX" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAdd}>{t('common.confirm')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
