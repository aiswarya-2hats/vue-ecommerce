export function getCookie(name) {
  // Read card data from cookie
  const row = document.cookie.split('; ').find((r) => r.startsWith(name + '='))
  if (!row) return null

  try {
    return JSON.parse(decodeURIComponent(row.split('=').slice(1).join('=')))
  } catch {
    return null
  }
}

export function setCookie(name, value) {
  // Set card data in cookie
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=31536000; SameSite=Lax`
}
