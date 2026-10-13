/**
 * Bitcoin on-chain service (simulated).
 *
 * In production this queries a node/explorer for addresses, UTXOs, fees and
 * broadcasts signed transactions. The MVP validates shapes and simulates
 * confirmation flow.
 */
import { isValidBtcAddress, makeReference, makeTxid, tzsToBtc } from '../utils/money';
import { simulate } from './api';

export type FeePriority = 'low' | 'medium' | 'high';

export interface OnchainFeeEstimate {
  priority: FeePriority;
  label: string;
  satPerVb: number;
  feeTzs: number;
  feeBtc: number;
  eta: string;
}

const FEE_TABLE: Record<FeePriority, { satPerVb: number; eta: string }> = {
  low: { satPerVb: 2, eta: '~60 min' },
  medium: { satPerVb: 8, eta: '~10–30 min' },
  high: { satPerVb: 21, eta: '~10 min' },
};

export const bitcoinService = {
  async estimateFees(amountTzs: number): Promise<OnchainFeeEstimate[]> {
    const rows = (['low', 'medium', 'high'] as FeePriority[]).map((p) => {
      const { satPerVb, eta } = FEE_TABLE[p];
      const feeTzs = Math.max(200, Math.round((amountTzs || 0) * 0.004) + satPerVb * 180);
      return {
        priority: p,
        label: p === 'low' ? 'Slow' : p === 'medium' ? 'Standard' : 'Fast',
        satPerVb,
        feeTzs,
        feeBtc: tzsToBtc(feeTzs),
        eta,
      };
    });
    return simulate(rows);
  },

  async broadcast(_params: {
    address: string;
    amountBtc: number;
    amountTzs: number;
    feeBtc: number;
  }): Promise<{ txid: string; reference: string }> {
    return simulate({ txid: makeTxid(), reference: makeReference('BC') });
  },

  validateAddress: isValidBtcAddress,
};
