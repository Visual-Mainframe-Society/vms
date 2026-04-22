/** ₹ with null handling — use this everywhere (replaces inline formatINR) */
export const formatPrice = (p: number | null): string =>
  p == null ? '—' : `₹${p.toLocaleString('en-IN')}`

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })

export function formatCount(n: number): string {
  if (n < 1000) return n.toString()
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K'
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
}
