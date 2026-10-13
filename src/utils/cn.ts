/** Class-name joiner used across components. */
export function cn(...parts: Array<string | number | false | null | undefined>): string {
  return parts.filter((p) => p !== 0 && Boolean(p)).join(' ');
}
