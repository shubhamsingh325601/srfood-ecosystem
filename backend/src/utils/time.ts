const UNIT_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/** Parses simple durations like "1h", "7d", "30s", "10m" into milliseconds. */
export function parseDurationMs(input: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(input.trim());
  if (!match) throw new Error(`Invalid duration format: "${input}"`);
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}
