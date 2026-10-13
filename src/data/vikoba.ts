import type { VikobaGroup, VikobaStats } from '../types';
import { tzsToBtc } from '../utils/money';

function daysAhead(d: number): string {
  return new Date(Date.now() + d * 86_400_000).toISOString();
}
function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

const ENEA =
  'https://images.unsplash.com/photo-1571371803785-ee5ad719ef0e?w=400&h=400&fit=crop&crop=faces&auto=format&q=70';
const AMANI =
  'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop&crop=faces&auto=format&q=70';
const NEEMA =
  'https://images.unsplash.com/photo-1589156280159-27683a05f9b5?w=400&h=400&fit=crop&crop=faces&auto=format&q=70';
const JUMA =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces&auto=format&q=70';
const BARAKA =
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=faces&auto=format&q=70';
const REHEMA =
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&crop=faces&auto=format&q=70';

export const DEMO_VIKOBA: VikobaGroup[] = [
  {
    id: 'vg-001',
    name: 'Kikapu cha Akiba',
    description: 'Weekly savings group with 12 colleagues from Sinza, Dar es Salaam.',
    contributionAmount: 10000,
    frequency: 'weekly',
    maxMembers: 12,
    startDate: '2025-09-01',
    balance: 585000,
    nextContribution: daysAhead(3),
    yourTotalContributed: 80000,
    members: [
      { id: 'vm-1', name: 'Enea Mushi', phone: '+255 712 345 678', avatar: ENEA, role: 'admin', contributed: 80000, expected: 80000, status: 'paid', isYou: true },
      { id: 'vm-2', name: 'Amani John', phone: '+255 714 220 331', avatar: AMANI, role: 'member', contributed: 60000, expected: 80000, status: 'pending' },
      { id: 'vm-3', name: 'Neema Mbwana', phone: '+255 767 884 210', avatar: NEEMA, role: 'member', contributed: 80000, expected: 80000, status: 'paid' },
      { id: 'vm-4', name: 'Juma Ally', phone: '+255 754 118 092', avatar: JUMA, role: 'member', contributed: 30000, expected: 80000, status: 'late' },
      { id: 'vm-5', name: 'Baraka Mtenga', phone: '+255 683 902 774', avatar: BARAKA, role: 'member', contributed: 80000, expected: 80000, status: 'paid' },
      { id: 'vm-6', name: 'Rehema Msigwa', phone: '+255 655 740 118', avatar: REHEMA, role: 'member', contributed: 40000, expected: 80000, status: 'late' },
    ],
    activity: [
      { id: 'va-1', type: 'contribution', memberName: 'Neema Mbwana', amount: 10000, timestamp: daysAgo(1) },
      { id: 'va-2', type: 'contribution', memberName: 'Enea Mushi', amount: 10000, timestamp: daysAgo(3) },
      { id: 'va-3', type: 'payout', memberName: 'Baraka Mtenga', amount: 120000, timestamp: daysAgo(8) },
      { id: 'va-4', type: 'joined', memberName: 'Rehema Msigwa', timestamp: daysAgo(14) },
      { id: 'va-5', type: 'created', memberName: 'Enea Mushi', timestamp: daysAgo(40) },
    ],
  },
  {
    id: 'vg-002',
    name: 'Umoja wa Vijana',
    description: 'Youth group saving for business capital in Temeke, Dar es Salaam.',
    contributionAmount: 5000,
    frequency: 'monthly',
    maxMembers: 20,
    startDate: '2025-10-01',
    balance: 165000,
    nextContribution: daysAhead(11),
    yourTotalContributed: 15000,
    members: [
      { id: 'vm-10', name: 'Baraka Mtenga', phone: '+255 683 902 774', avatar: BARAKA, role: 'admin', contributed: 15000, expected: 15000, status: 'paid' },
      { id: 'vm-11', name: 'Enea Mushi', phone: '+255 712 345 678', avatar: ENEA, role: 'member', contributed: 15000, expected: 15000, status: 'paid', isYou: true },
      { id: 'vm-12', name: 'Rehema Msigwa', phone: '+255 655 740 118', avatar: REHEMA, role: 'member', contributed: 5000, expected: 15000, status: 'pending' },
      { id: 'vm-13', name: 'Juma Ally', phone: '+255 754 118 092', avatar: JUMA, role: 'member', contributed: 0, expected: 15000, status: 'late' },
    ],
    activity: [
      { id: 'va-10', type: 'contribution', memberName: 'Baraka Mtenga', amount: 5000, timestamp: daysAgo(4) },
      { id: 'va-11', type: 'contribution', memberName: 'Enea Mushi', amount: 5000, timestamp: daysAgo(11) },
      { id: 'va-12', type: 'joined', memberName: 'Rehema Msigwa', timestamp: daysAgo(18) },
    ],
  },
];

/** Derive Vikoba stats from the groups so numbers always stay consistent. */
export function computeVikobaStats(groups: VikobaGroup[]): VikobaStats {
  const totalContributions = groups.reduce((sum, g) => sum + g.yourTotalContributed, 0);
  const totalBalance = groups.reduce((sum, g) => sum + g.balance, 0);
  const upcoming = groups
    .slice()
    .sort((a, b) => +new Date(a.nextContribution) - +new Date(b.nextContribution))[0];
  return {
    totalGroups: groups.length,
    totalContributions,
    totalBalance,
    nextContribution: upcoming
      ? { groupName: upcoming.name, amount: upcoming.contributionAmount, date: upcoming.nextContribution }
      : null,
  };
}

/** Balance history for analytics (30 days, TZS). */
export const DEMO_BALANCE_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const base = 180000 + (29 - day) * 2400 + Math.sin(i * 0.7) * 12000 + (i % 7 === 0 ? 9000 : 0);
  return {
    label: `${30 - i}`,
    value: Math.max(120000, Math.round(base)),
  };
});

/** Flow volume series for analytics charts. */
export const DEMO_FLOW_HISTORY = Array.from({ length: 14 }, (_, i) => ({
  label: `${14 - i}`,
  incoming: Math.round(Math.max(0, 8000 + Math.sin(i * 1.1) * 9000 + (i % 5 === 0 ? 14000 : 0))),
  outgoing: Math.round(Math.max(0, 5000 + Math.cos(i * 0.9) * 6000 + (i % 7 === 3 ? 11000 : 0))),
}));

/** Re-exported for consistency checks in services. */
export const DEMO_BTC_RATE_TZS = tzsToBtc(1);
