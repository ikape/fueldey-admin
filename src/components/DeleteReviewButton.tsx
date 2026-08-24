'use client';

import { useTransition } from 'react';
import { deleteReviewAction } from '@/lib/actions';
import { Button } from '@/components/Button';

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="dangerOutline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm('Delete this review?')) return;
        startTransition(() => deleteReviewAction(reviewId));
      }}
    >
      Delete
    </Button>
  );
}
