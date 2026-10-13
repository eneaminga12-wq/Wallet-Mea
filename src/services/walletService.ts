/**
 * Wallet service (simulated).
 *
 * Balances, phone-number resolution and transaction history. In production,
 * phone resolution asks the MeaBit backend to map a phone number to a payment
 * identity (LNURL / internal account) — the phone number itself is never a
 * blockchain address.
 */
import type { Transaction, User } from '../types';
import { DEMO_CONTACTS, DEMO_TRANSACTIONS, DEMO_USER } from '../data/mock';
import { BTC_TZS_RATE, btcToTzs } from '../utils/money';
import { simulate } from './api';

export interface Balances {
  lightningBtc: number;
  onchainBtc: number;
  totalBtc: number;
  totalTzs: number;
  rate: number;
}

function computeBalances(lightning: number, onchain: number): Balances {
  const totalBtc = lightning + onchain;
  return {
    lightningBtc: lightning,
    onchainBtc: onchain,
    totalBtc,
    totalTzs: btcToTzs(totalBtc),
    rate: BTC_TZS_RATE,
  };
}

export const INITIAL_BALANCES = { lightningBtc: 0.0008126, onchainBtc: 0.0001912 };

export const walletService = {
  async getBalances(): Promise<Balances> {
    return simulate(computeBalances(INITIAL_BALANCES.lightningBtc, INITIAL_BALANCES.onchainBtc));
  },

  /**
   * Resolve a phone number to a MeaBit payment identity.
   * Returns `null` when the number is not registered.
   */
  async resolvePhone(phone: string): Promise<User | null> {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('0') ? `255${digits.slice(1)}` : digits;
    const match = DEMO_CONTACTS.find((c) => {
      const cd = c.phone.replace(/\D/g, '').replace(/^0/, '255');
      return cd === normalized;
    });
    return simulate(match ? DEMO_USER : null, { failRate: 0 });
  },

  async getTransactions(): Promise<Transaction[]> {
    return simulate([...DEMO_TRANSACTIONS].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)));
  },
};

export { computeBalances };
