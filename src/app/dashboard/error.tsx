'use client';

// 401s are handled centrally in src/lib/api.ts (redirects to /login before
// this boundary ever sees them). This only catches genuine unexpected
// errors — bad responses, network failures, render bugs.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-heading text-lg font-semibold text-foreground">Something went wrong</p>
      <p className="max-w-md text-sm text-muted">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
