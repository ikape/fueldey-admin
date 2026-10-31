/** Outcome of an admin action. Expected failures (a rule the backend enforces, a missing reason) come back
 * as values so the UI can show them — thrown errors are masked in production builds. */
export type ActionResult = { ok: true } | { ok: false; error: string };
