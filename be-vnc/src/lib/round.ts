// Sums can pick up float noise (0.1 + 0.2), so round report totals to 2 places.
export const round2 = (value: number) => Math.round(value * 100) / 100
