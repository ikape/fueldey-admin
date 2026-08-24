'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Re-fetches this route's data in place (via router.refresh()) instead of a
 * full browser reload — no white flash, no lost scroll position, and it
 * doesn't touch unrelated client-side UI state elsewhere on the page.
 */
export function RefreshButton({ label = 'Refresh' }: { label?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors duration-150 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
      >
        <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9c2.52 0 4.79 1.06 6.4 2.76" />
        <path d="M21 4v5h-5" />
      </svg>
    </button>
  );
}
