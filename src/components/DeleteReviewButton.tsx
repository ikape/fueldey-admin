'use client';

import { useTransition } from 'react';
import { deleteReviewAction } from '@/lib/actions';

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm('Delete this review?')) return;
        startTransition(() => deleteReviewAction(reviewId));
      }}
      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      Delete
    </button>
  );
}
