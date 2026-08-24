'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStationStatusAction, deleteStationAction } from '@/lib/actions';

export function StationControls({ stationId, isActive, isOpen }: { stationId: string; isActive: boolean; isOpen: boolean }) {
  // Separate transitions per button — sharing one flag across all three
  // meant clicking any one of them visually disabled the other two
  // completely unrelated actions.
  const [isActivePending, startActiveTransition] = useTransition();
  const [isOpenPending, startOpenTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={isActivePending}
        onClick={() => startActiveTransition(() => updateStationStatusAction(stationId, { isActive: !isActive }))}
        className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {isActive ? 'Deactivate station' : 'Activate station'}
      </button>
      <button
        disabled={isOpenPending}
        onClick={() => startOpenTransition(() => updateStationStatusAction(stationId, { isOpen: !isOpen }))}
        className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {isOpen ? 'Mark closed' : 'Mark open'}
      </button>
      <button
        disabled={isDeletePending}
        onClick={() => {
          if (!confirm('Delete this station? This cannot be undone.')) return;
          startDeleteTransition(async () => {
            await deleteStationAction(stationId);
            router.push('/dashboard/stations');
          });
        }}
        className="rounded-full border border-danger/40 px-4 py-1.5 text-sm font-medium text-danger hover:bg-danger-bg disabled:opacity-50"
      >
        Delete station
      </button>
    </div>
  );
}
