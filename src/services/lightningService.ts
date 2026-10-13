/**
 * Lightning Network service (simulated).
 *
 * In production this talks to an LND/CLN/Phoenixd backend or a wallet
 * infrastructure provider. Phone numbers resolve to a MeaBit payment
 * identity (e.g. LNURL) — the phone number itself is never used as a
 * blockchain address.
 */
import type { Contact } from '../types';
import { DEMO_CONTACTS } from '../data/mock';
import { isValidLightningAddress, isValidLightningInvoice, makeReference, tzsToBtc } from '../utils/money';
import { simulate } from './api';

export interface LnPaymentQuote {
  /** Fee shown before sending. */
  feeTzs: number;
  feeBtc: number;
  routeHint: string;
}

export const lightningService = {
  /** Quote a Lightning payment fee (simulated: ~0.2%, min TZS 1). */
  async quoteFee(amountTzs: number): Promise<LnPaymentQuote> {
    const feeTzs = Math.max(1, Math.round(amountTzs * 0.002));
    return simulate({
      feeTzs,
      feeBtc: tzsToBtc(feeTzs),
      routeHint: 'via 3 hops · median liquidity',
    });
  },

  async send(params: {
    amountTzs: number;
    amountBtc: number;
    recipient: string;
    note?: string;
  }): Promise<{ reference: string; invoiceRef: string }> {
    return simulate({
      reference: makeReference('LN'),
      invoiceRef: `lnbc${Math.max(1, Math.round(params.amountTzs / 100))}n1pmeabit${Date.now()
        .toString(16)
        .slice(-8)}`,
    });
  },

  async createInvoice(amountTzs: number, _memo?: string): Promise<{ invoice: string }> {
    return simulate({
      invoice: `lnbc${Math.max(1, Math.round(amountTzs / 100))}n1pmeabit${Date.now()
        .toString(16)
        .slice(-10)}smeabitwalletdemo`,
    });
  },

  /** Used by Send-by-phone to show who the number belongs to. */
  async lookupContactByPhone(phone: string): Promise<Contact | null> {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('0') ? `255${digits.slice(1)}` : digits;
    const match = DEMO_CONTACTS.find((c) => {
      const cd = c.phone.replace(/\D/g, '').replace(/^0/, '255');
      return cd === normalized;
    });
    return simulate(match ?? null, { failRate: 0 });
  },

  validateLightningAddress: isValidLightningAddress,
  validateInvoice: isValidLightningInvoice,
};
