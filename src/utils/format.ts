/** Parses YYYY-MM-DD as a local date (avoids the UTC off-by-one of `new Date('2026-09-30')`). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!iso) return '—'
  return parseDate(iso).toLocaleDateString('en-US', opts)
}

export function daysSince(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - parseDate(iso).getTime()) / 86_400_000)
}

export function relativeDate(iso: string): string {
  const d = daysSince(iso)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d === -1) return 'Tomorrow'
  if (d > 1 && d < 7) return `${d} days ago`
  if (d < -1 && d > -7) return `In ${-d} days`
  if (d >= 7 && d < 30) return `${Math.floor(d / 7)} wk ago`
  return formatDate(iso)
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function pluralize(n: number, word: string, plural = word + 's') {
  return `${n} ${n === 1 ? word : plural}`
}
