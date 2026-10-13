/**
 * Vikoba service (simulated) — community savings groups.
 *
 * Replace internals with real group/contribution APIs later; the shapes map
 * to a straightforward REST model (groups, members, contributions).
 */
import type { VikobaDraft, VikobaGroup, VikobaMember } from '../types';
import { DEMO_VIKOBA, computeVikobaStats } from '../data/vikoba';
import { makeReference } from '../utils/money';
import { simulate } from './api';

export const vikobaService = {
  async getGroups(): Promise<VikobaGroup[]> {
    return simulate(DEMO_VIKOBA.map((g) => ({ ...g, members: [...g.members], activity: [...g.activity] })));
  },

  async createGroup(draft: VikobaDraft, creator: { name: string; phone: string; avatar: string }): Promise<VikobaGroup> {
    const group: VikobaGroup = {
      id: `vg-${Date.now()}`,
      name: draft.name,
      description: draft.description,
      contributionAmount: draft.contributionAmount,
      frequency: draft.frequency,
      maxMembers: draft.maxMembers,
      startDate: draft.startDate,
      balance: 0,
      nextContribution: new Date(draft.startDate).toISOString(),
      yourTotalContributed: 0,
      members: [
        {
          id: `vm-${Date.now()}`,
          name: creator.name,
          phone: creator.phone,
          avatar: creator.avatar,
          role: 'admin',
          contributed: 0,
          expected: 0,
          status: 'pending',
          isYou: true,
        },
      ],
      activity: [
        { id: `va-${Date.now()}`, type: 'created', memberName: creator.name, timestamp: new Date().toISOString() },
      ],
    };
    return simulate(group);
  },

  async contribute(groupId: string, amountTzs: number): Promise<{ ok: boolean; reference: string }> {
    return simulate({ ok: true, reference: makeReference('VK') });
  },
};
