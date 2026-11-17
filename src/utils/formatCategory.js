/** Turn API slug `home-decoration` into display label `Home Decoration`. */
export function formatCategory(category) {
  if (!category) return ''
  return String(category)
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
