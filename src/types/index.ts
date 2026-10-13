/**
 * Central type definitions for MeaBit Wallet.
 * These models are designed to map cleanly onto future backend APIs,
 * Bitcoin/Lightning node data, and payment provider responses.
 */

export type Language = 'en' | 'sw';

export type Currency = 'TZS' | 'BTC';

export type PaymentRail = 'lightning' | 'onchain';

export type TransactionType = 'sent' | 'received' | 'buy' | 'pay' | 'vikoba_contribution';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

/** Status of a Lightning send inside the Send flow (distinct from stored txns). */
export type FlowPhase = 'form' | 'review' | 'processing' | 'success' | 'failed';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  /** Internal MeaBit identity, e.g. MB-4F2A-8821 */
  meabitId: string;
  avatar: string;
  country: string;
  language: Language;
  createdAt: string;
}

export interface WalletBalances {
  lightningBtc: number;
  onchainBtc: number;
  /** Fiat reference used for TZS display of balances. */
  btcToTzsRate: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isMeaBitUser: boolean;
  lightningAvailable: boolean;
  lightningAddress?: string;
  lastInteraction?: string;
  favorite?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  rail: PaymentRail;
  status: TransactionStatus;
  /** Primary amount in BTC. */
  amountBtc: number;
  /** Fiat value at time of transaction. */
  amountTzs: number;
  feeBtc: number;
  feeTzs: number;
  counterpartyName: string;
  counterpartyHandle: string;
  timestamp: string;
  /** Human reference, e.g. LN-8821-DD4C */
  reference: string;
  /** On-chain txid placeholder (on-chain rail only). */
  txid?: string;
  /** Lightning invoice/payment reference placeholder. */
  invoiceRef?: string;
  note?: string;
  confirmations?: number;
}

export interface VikobaMember {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  role: 'admin' | 'member';
  contributed: number;
  expected: number;
  status: 'paid' | 'pending' | 'late';
  isYou?: boolean;
}

export interface VikobaActivity {
  id: string;
  type: 'contribution' | 'joined' | 'payout' | 'created';
  memberName: string;
  amount?: number;
  timestamp: string;
}

export interface VikobaGroup {
  id: string;
  name: string;
  description: string;
  contributionAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  maxMembers: number;
  startDate: string;
  balance: number;
  members: VikobaMember[];
  activity: VikobaActivity[];
  nextContribution: string;
  yourTotalContributed: number;
}

export interface VikobaDraft {
  name: string;
  description: string;
  contributionAmount: number;
  frequency: VikobaGroup['frequency'];
  maxMembers: number;
  startDate: string;
}

export interface VikobaStats {
  totalGroups: number;
  totalContributions: number;
  totalBalance: number;
  nextContribution: { groupName: string; amount: number; date: string } | null;
}

export interface AppNotification {
  id: string;
  category:
    | 'payment_received'
    | 'payment_sent'
    | 'confirmed'
    | 'failed'
    | 'vikoba_reminder'
    | 'vikoba_received'
    | 'security'
    | 'ai';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface BuyOrderDraft {
  amountTzs: number;
  method: 'mobile_payment' | 'bank' | 'other';
}

export interface SendDraft {
  rail: PaymentRail;
  method:
    | 'phone'
    | 'lightning_address'
    | 'lightning_invoice'
    | 'bitcoin_address'
    | 'qr';
  recipient: string;
  resolvedName?: string;
  amount: number;
  currency: Currency;
  note?: string;
}

export interface BuyOrder extends Transaction {
  buyMethod: BuyOrderDraft['method'];
}

export interface BalancePoint {
  label: string;
  value: number;
}
