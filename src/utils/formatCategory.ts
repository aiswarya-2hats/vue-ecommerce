/** Turn API slug `home-decoration` into display label `Home Decoration`. */
export function formatCategory(category: string | null | undefined): string {
  if (!category) return ''
  return String(category)
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
