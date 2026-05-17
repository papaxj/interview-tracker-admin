export function formatDate(value?: string | null) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

export function formatSalary(min?: number, max?: number, months?: number) {
  if (min == null && max == null) return '-'
  const range = min != null && max != null ? `${min}k - ${max}k` : `${min ?? max}k`
  return months ? `${range} · ${months}薪` : range
}

export function formatMoney(value?: number) {
  if (value == null) return '-'
  return `${value.toLocaleString()} 元`
}
