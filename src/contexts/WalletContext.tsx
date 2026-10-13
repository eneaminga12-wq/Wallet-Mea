import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppNotification, Contact, Transaction, User, VikobaGroup, VikobaDraft } from '../types';
import { DEMO_CONTACTS, DEMO_NOTIFICATIONS, DEMO_TRANSACTIONS } from '../data/mock';
import { lightningService } from '../services/lightningService';
import { INITIAL_BALANCES, computeBalances, walletService, type Balances } from '../services/walletService';
import { tzsToBtc } from '../utils/money';
import { vikobaService } from '../services/vikobaService';

interface WalletContextValue {
  balances: Balances;
  transactions: Transaction[];
  contacts: Contact[];
  notifications: AppNotification[];
  unreadCount: number;
  vikoba: VikobaGroup[];
  /** True while initial demo data loads. */
  initializing: boolean;
  /** True while a simulated payment is processing. */
  processing: boolean;
  recordSent: (tx: Transaction) => void;
  recordBuy: (tx: Transaction) => void;
  recordVikobaContribution: (tx: Transaction, groupId: string) => void;
  resolvePhone: (phone: string) => Promise<User | null>;
  lookupContact: (phone: string) => Promise<Contact | null>;
  addContact: (c: Contact) => void;
  markNotificationsRead: () => void;
  refreshVikoba: () => Promise<void>;
  createVikobaGroup: (draft: VikobaDraft) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<Balances>(() =>
    computeBalances(INITIAL_BALANCES.lightningBtc, INITIAL_BALANCES.onchainBtc)
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(DEMO_NOTIFICATIONS);
  const [vikoba, setVikoba] = useState<VikobaGroup[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [b, txs, groups] = await Promise.all([
        walletService.getBalances(),
        walletService.getTransactions(),
        vikobaService.getGroups(),
      ]);
      if (!mounted) return;
      setBalances(b);
      setTransactions(txs);
      setVikoba(groups);
      setInitializing(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const applyDebit = useCallback((amountTzs: number, feeTzs: number = 0) => {
    setBalances((prev) => {
      const lightning = Math.max(0, prev.lightningBtc - tzsToBtc(amountTzs + feeTzs));
      return computeBalances(lightning, prev.onchainBtc);
    });
  }, []);

  const applyCredit = useCallback((amountTzs: number) => {
    setBalances((prev) => computeBalances(prev.lightningBtc + tzsToBtc(amountTzs), prev.onchainBtc));
  }, []);

  const sortTx = (list: Transaction[]) =>
    [...list].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

  const recordSent = useCallback(
    (tx: Transaction) => {
      setProcessing(true);
      setTransactions((prev) => sortTx([tx, ...prev]));
      if (tx.rail === 'lightning' && tx.status === 'completed') {
        applyDebit(tx.amountTzs, tx.feeTzs);
      } else if (tx.rail === 'onchain') {
        setBalances((prev) => {
          const onchain = Math.max(0, prev.onchainBtc - tx.amountBtc - tx.feeBtc);
          return computeBalances(prev.lightningBtc, onchain);
        });
      }
      setTimeout(() => setProcessing(false), 1800);
    },
    [applyDebit]
  );

  const recordBuy = useCallback(
    (tx: Transaction) => {
      setTransactions((prev) => sortTx([tx, ...prev]));
      setBalances((prev) => computeBalances(prev.lightningBtc + tx.amountBtc, prev.onchainBtc));
    },
    []
  );

  const recordVikobaContribution = useCallback(
    (tx: Transaction, groupId: string) => {
      setTransactions((prev) => sortTx([tx, ...prev]));
      applyDebit(tx.amountTzs);
      setVikoba((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                balance: g.balance + tx.amountTzs,
                yourTotalContributed: g.yourTotalContributed + tx.amountTzs,
                members: g.members.map((m) =>
                  m.isYou
                    ? { ...m, contributed: m.contributed + tx.amountTzs, status: 'paid' as const }
                    : m
                ),
                activity: [
                  {
                    id: `va-${Date.now()}`,
                    type: 'contribution' as const,
                    memberName: 'Enea Mushi',
                    amount: tx.amountTzs,
                    timestamp: new Date().toISOString(),
                  },
                  ...g.activity,
                ],
              }
            : g
        )
      );
    },
    [applyDebit]
  );

  const resolvePhone = useCallback(async (phone: string) => walletService.resolvePhone(phone), []);
  const lookupContact = useCallback(
    async (phone: string) => lightningService.lookupContactByPhone(phone),
    []
  );

  const addContact = useCallback((c: Contact) => {
    setContacts((prev) => [c, ...prev]);
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const refreshVikoba = useCallback(async () => {
    const groups = await vikobaService.getGroups();
    setVikoba(groups);
  }, []);

  const createVikobaGroup = useCallback(async (draft: VikobaDraft) => {
    const creator = { name: 'Enea Mushi', phone: '+255 712 345 678', avatar: '' };
    const group = await vikobaService.createGroup(draft, creator);
    setVikoba((prev) => [group, ...prev]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({
      balances,
      transactions,
      contacts,
      notifications,
      unreadCount,
      vikoba,
      initializing,
      processing,
      recordSent,
      recordBuy,
      recordVikobaContribution,
      resolvePhone,
      lookupContact,
      addContact,
      markNotificationsRead,
      refreshVikoba,
      createVikobaGroup,
    }),
    [
      balances,
      transactions,
      contacts,
      notifications,
      unreadCount,
      vikoba,
      initializing,
      processing,
      recordSent,
      recordBuy,
      recordVikobaContribution,
      resolvePhone,
      lookupContact,
      addContact,
      markNotificationsRead,
      refreshVikoba,
      createVikobaGroup,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
