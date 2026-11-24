export function getCookie(name: string): unknown {
  const row = document.cookie.split('; ').find((r) => r.startsWith(name + '='))
  if (!row) return null

  try {
    return JSON.parse(decodeURIComponent(row.split('=').slice(1).join('=')))
  } catch {
    return null
  }
}

export function setCookie(name: string, value: unknown): void {
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=31536000; SameSite=Lax`
}
