/**
 * Money, Bitcoin and formatting utilities.
 *
 * A single source of truth for the BTC/TZS rate is used across the app so
 * every screen shows consistent conversions. In production this comes from
 * the backend price service.
 */

export const BTC_TZS_RATE = 245_000_000; // 1 BTC ≈ TZS 245,000,000 (simulated)

/** Format TZS with Tanzanian-style grouping: TZS 245,800 */
export function formatTzs(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `TZS ${Math.round(safe).toLocaleString('en-US')}`;
}

/** Format BTC with sensible precision, e.g. 0.00102 BTC */
export function formatBtc(amount: number, opts?: { compact?: boolean }): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  if (opts?.compact) {
    if (safe === 0) return '0 BTC';
    if (safe < 0.00001) return `${safe.toExponential(1)} BTC`;
    return `${safe.toFixed(safe < 0.001 ? 6 : 5)} BTC`;
  }
  return `${safe.toFixed(8)} BTC`;
}

/** Short BTC display, e.g. 0.00102100 → 0.001021 */
export function formatBtcShort(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const str = safe.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
  return str === '' ? '0' : str;
}

/** ≈ BTC line shown under TZS amounts */
export function btcEquivalentLine(btc: number): string {
  return `≈ ${formatBtcShort(btc)} BTC`;
}

/** Convert TZS → BTC at the simulated rate. */
export function tzsToBtc(tzs: number): number {
  return tzs / BTC_TZS_RATE;
}

/** Convert BTC → TZS at the simulated rate. */
export function btcToTzs(btc: number): number {
  return btc * BTC_TZS_RATE;
}

/** 1 BTC = 100,000,000 Satoshis */
export function btcToSats(btc: number): number {
  const safe = Number.isFinite(btc) ? btc : 0;
  return Math.round(safe * 100_000_000);
}

/** Satoshis → BTC */
export function satsToBtc(sats: number): number {
  const safe = Number.isFinite(sats) ? sats : 0;
  return safe / 100_000_000;
}

/** TZS → Satoshis */
export function tzsToSats(tzs: number): number {
  return btcToSats(tzsToBtc(tzs));
}

/** Satoshis → TZS */
export function satsToTzs(sats: number): number {
  return btcToTzs(satsToBtc(sats));
}

/** Format Sats with commas, e.g. "81,260 sats" */
export function formatSats(sats: number, withSuffix = true): string {
  const safe = Number.isFinite(sats) ? sats : 0;
  const num = Math.round(safe).toLocaleString('en-US');
  return withSuffix ? `${num} sats` : num;
}

/** Format a date like "12 Aug 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Format a time like "14:32" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** "Today", "Yesterday" or a date */
export function formatRelativeDay(iso: string, todayLabel: string, yesterdayLabel: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return todayLabel;
  if (diffDays === 1) return yesterdayLabel;
  return formatDate(iso);
}

/** Tanzanian phone formatting: +255 7XX XXX XXX */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const normalized = digits.startsWith('255')
    ? digits
    : digits.startsWith('0')
      ? `255${digits.slice(1)}`
      : digits;
  if (normalized.length < 4) return raw ? `+${digits}` : '';
  const cc = normalized.slice(0, 3);
  const rest = normalized.slice(3);
  const parts = rest.match(/.{1,3}/g) ?? [];
  return `+${cc} ${parts.join(' ')}`.trim();
}

/** Validate a Tanzanian mobile number (+255 6XX/7XX). */
export function isValidTzPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  const normalized = digits.startsWith('255')
    ? digits
    : digits.startsWith('0')
      ? `255${digits.slice(1)}`
      : digits;
  return /^255[67]\d{8}$/.test(normalized);
}

/** Validate a plausible Bitcoin address (bech32/base58 demo check). */
export function isValidBtcAddress(addr: string): boolean {
  const a = addr.trim();
  return /^(bc1[a-z0-9]{20,}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(a);
}

/** Validate a Lightning address like name@meabit.wallet. */
export function isValidLightningAddress(addr: string): boolean {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(addr.trim());
}

/** Validate a Lightning invoice (starts with lnbc). */
export function isValidLightningInvoice(inv: string): boolean {
  return /^lnbc[a-z0-9]+/i.test(inv.trim());
}

/** Generate a demo reference like LN-8821-DD4C */
export function makeReference(prefix: 'LN' | 'BC' | 'BUY' | 'PAY' | 'VK'): string {
  const rand = () => Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${prefix}-${rand()}-${rand()}`;
}

/** Generate a demo on-chain txid. */
export function makeTxid(): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 64; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

/** Truncate long addresses/txids: bc1q…8f2a */
export function truncateMiddle(value: string, keepStart = 8, keepEnd = 6): string {
  if (value.length <= keepStart + keepEnd + 1) return value;
  return `${value.slice(0, keepStart)}…${value.slice(-keepEnd)}`;
}
