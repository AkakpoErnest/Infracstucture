/**
 * Renders the post-login welcome greeting. Falls back to a plain "Welcome
 * back" (no trailing text) when there's no name to show, rather than
 * printing "undefined"/"null" - defensive only, since signup requires a
 * name today so this branch shouldn't be reachable in practice.
 */
export function greetingText(name: string | null | undefined): string {
  return name ? `Welcome back, ${name}` : "Welcome back";
}
