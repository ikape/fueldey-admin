'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStationStatusAction, deleteStationAction } from '@/lib/actions';

export function StationControls({ stationId, isActive, isOpen }: { stationId: string; isActive: boolean; isOpen: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => updateStationStatusAction(stationId, { isActive: !isActive }))}
        className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {isActive ? 'Deactivate station' : 'Activate station'}
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => updateStationStatusAction(stationId, { isOpen: !isOpen }))}
        className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {isOpen ? 'Mark closed' : 'Mark open'}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (!confirm('Delete this station? This cannot be undone.')) return;
          startTransition(async () => {
            await deleteStationAction(stationId);
            router.push('/dashboard/vendors');
          });
        }}
        className="rounded-full border border-danger/40 px-4 py-1.5 text-sm font-medium text-danger hover:bg-danger-bg disabled:opacity-50"
      >
        Delete station
      </button>
    </div>
  );
}
