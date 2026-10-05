// Scripted motion, such as smooth scrolling, must check this itself; CSS uses `motion-safe:`.
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
