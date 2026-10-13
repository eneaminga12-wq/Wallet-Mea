/**
 * Payments service — Buy Bitcoin and everyday Pay flows (simulated).
 *
 * Mobile-money / bank / card providers plug in here later. The MVP makes it
 * explicit everywhere that no real payment is processed.
 */
import type { Transaction } from '../types';
import { makeReference, tzsToBtc } from '../utils/money';
import { delay, simulate } from './api';

export type BuyMethod = 'mobile_payment' | 'bank' | 'other';

export interface BuyQuote {
  amountTzs: number;
  feeTzs: number;
  feeBtc: number;
  btcAmount: number;
  /** BTC you actually receive after fees. */
  btcReceived: number;
  rate: number;
}

export const BUY_FEE_RATE = 0.025;

export const paymentService = {
  /** Simulated quote: 2.5% service fee. */
  async quoteBuy(amountTzs: number): Promise<BuyQuote> {
    const feeTzs = Math.round(amountTzs * BUY_FEE_RATE);
    const btcAmount = tzsToBtc(amountTzs);
    return simulate({
      amountTzs,
      feeTzs,
      feeBtc: tzsToBtc(feeTzs),
      btcAmount,
      btcReceived: tzsToBtc(amountTzs - feeTzs),
      rate: 245_000_000,
    });
  },

  async executeBuy(params: { amountTzs: number; method: BuyMethod }): Promise<Transaction> {
    await delay(1400);
    const quote = await this.quoteBuy(params.amountTzs);
    const tx: Transaction = {
      id: `tx-buy-${Date.now()}`,
      type: 'buy',
      rail: 'lightning',
      status: 'completed',
      amountBtc: quote.btcReceived,
      amountTzs: params.amountTzs,
      feeTzs: quote.feeTzs,
      feeBtc: quote.feeBtc,
      counterpartyName: 'MeaBit Buy',
      counterpartyHandle: 'buy@meabit.wallet',
      timestamp: new Date().toISOString(),
      reference: makeReference('BUY'),
      invoiceRef: 'lnbc…(demo)',
      note: `Buy via ${params.method}`,
    };
    return simulate(tx, { failRate: 0 });
  },

  async executePay(params: {
    recipient: string;
    amountTzs: number;
    note?: string;
  }): Promise<Transaction> {
    const tx: Transaction = {
      id: `tx-pay-${Date.now()}`,
      type: 'pay',
      rail: 'lightning',
      status: 'completed',
      amountBtc: tzsToBtc(params.amountTzs),
      amountTzs: params.amountTzs,
      feeTzs: 0,
      feeBtc: 0,
      counterpartyName: params.recipient,
      counterpartyHandle: params.recipient,
      timestamp: new Date().toISOString(),
      reference: makeReference('PAY'),
      invoiceRef: 'lnbc…(demo)',
      note: params.note,
    };
    return simulate(tx, { failRate: 0 });
  },
};
