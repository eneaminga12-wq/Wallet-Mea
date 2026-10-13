/**
 * Simulated network layer.
 *
 * Every service call flows through here so that swapping to a real backend
 * later means replacing `simulate` with `fetch`/`axios` calls — the rest of
 * the app does not change.
 */

const MIN_LATENCY = 500;
const MAX_LATENCY = 1100;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulate network latency and return a payload, or reject with a message. */
export async function simulate<T>(
  payload: T,
  opts?: { failRate?: number; errorMessage?: string }
): Promise<T> {
  await delay(MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY));
  if (opts?.failRate && Math.random() < opts.failRate) {
    throw new Error(opts.errorMessage ?? 'Network request failed (simulated).');
  }
  return payload;
}
