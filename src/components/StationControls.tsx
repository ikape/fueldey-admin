'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStationStatusAction, deleteStationAction } from '@/lib/actions';
import { Button } from '@/components/Button';

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
      <Button
        variant="outline"
        disabled={isActivePending}
        onClick={() => startActiveTransition(() => updateStationStatusAction(stationId, { isActive: !isActive }))}
      >
        {isActive ? 'Deactivate station' : 'Activate station'}
      </Button>
      <Button
        variant="outline"
        disabled={isOpenPending}
        onClick={() => startOpenTransition(() => updateStationStatusAction(stationId, { isOpen: !isOpen }))}
      >
        {isOpen ? 'Mark closed' : 'Mark open'}
      </Button>
      <Button
        variant="dangerOutline"
        disabled={isDeletePending}
        onClick={() => {
          if (!confirm('Delete this station? This cannot be undone.')) return;
          startDeleteTransition(async () => {
            await deleteStationAction(stationId);
            router.push('/dashboard/stations');
          });
        }}
      >
        Delete station
      </Button>
    </div>
  );
}
