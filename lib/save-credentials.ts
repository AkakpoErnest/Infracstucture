/**
 * Explicitly asks the browser to offer saving these credentials, via the
 * Credential Management API's PasswordCredential.
 *
 * Why this is needed: `autoComplete="new-password"` / `"current-password"`
 * (already set on the inputs) is necessary but not sufficient for Chrome's
 * automatic "Save password?" prompt. That heuristic primarily looks for a
 * native <form> submission followed by a real page navigation. This app's
 * sign-in/sign-up forms call `e.preventDefault()`, do the actual auth via
 * `fetch`/`signIn(..., { redirect: false })`, then navigate client-side via
 * Next.js's router (`history.pushState`, not a full page load) - Chrome
 * often fails to associate that pattern with a "successful login" and
 * silently skips the save prompt.
 *
 * `navigator.credentials.store()` sidesteps the heuristic entirely by
 * telling the browser directly, right when we already know the credentials
 * are valid (a successful sign-in/sign-up response).
 *
 * Only Chromium-based browsers (Chrome, Edge, Opera, Brave, ...) implement
 * `PasswordCredential` - Safari and Firefox never shipped it. Feature-
 * detected below, so this is always a safe no-op elsewhere, and never
 * blocks or delays the actual sign-in/sign-up flow (best-effort, fire-and-
 * forget from the caller's perspective).
 */
export async function offerToSaveCredentials(
  id: string,
  password: string,
  name?: string
): Promise<void> {
  if (typeof window === "undefined") return;

  const w = window as unknown as {
    PasswordCredential?: new (data: { id: string; password: string; name?: string }) => Credential;
  };

  if (!w.PasswordCredential || !navigator.credentials?.store) return;

  try {
    const credential = new w.PasswordCredential({ id, password, name });
    await navigator.credentials.store(credential);
  } catch {
    // Best-effort only - a rejected/unsupported call should never block or
    // surface an error in the actual sign-in/sign-up flow.
  }
}
