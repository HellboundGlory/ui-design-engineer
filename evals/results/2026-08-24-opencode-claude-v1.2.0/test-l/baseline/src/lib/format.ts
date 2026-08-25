export function formatTimeTick(t: number): string {
  const d = new Date(t)
  return d.toLocaleTimeString(undefined, { hour12: false, minute: '2-digit', second: '2-digit' })
}

export function formatTimeFull(t: number): string {
  const d = new Date(t)
  return d.toLocaleTimeString(undefined, { hour12: false })
}

export function formatNumber(n: number, digits = 0): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
