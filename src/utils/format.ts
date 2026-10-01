/** Parses YYYY-MM-DD as a local date (avoids the UTC off-by-one of `new Date('2026-09-30')`). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!iso) return '—'
  return parseDate(iso).toLocaleDateString('en-US', opts)
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
