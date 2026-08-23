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
      className="rounded-full border border-danger/40 px-3 py-1 text-xs font-medium text-danger hover:bg-danger-bg disabled:opacity-50"
    >
      Delete
    </button>
  );
}
