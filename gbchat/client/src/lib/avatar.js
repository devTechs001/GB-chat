/**
 * Avatar identity helpers, kept out of Avatar.jsx so that file exports only a
 * component (react-refresh requires it) and these stay unit-testable.
 */

export const initialsOf = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Deterministic hue pair from the name — same person, same colours, forever. */
export const gradientFor = (name = '') => {
  let hash = 7
  for (const char of String(name)) hash = (hash * 31 + char.charCodeAt(0)) % 360
  const from = hash
  const to = (hash + 42) % 360
  return `linear-gradient(135deg, hsl(${from} 76% 56%), hsl(${to} 70% 44%))`
}
