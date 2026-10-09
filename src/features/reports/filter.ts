const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function normalizeClientFilter(value?: string | string[]): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  const normalized = raw?.trim() ?? ''
  if (!normalized) return null
  if (!UUID_RE.test(normalized)) throw new Error('Invalid client filter. Expected a client UUID.')
  return normalized
}
