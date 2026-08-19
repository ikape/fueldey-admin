import { api } from '@/lib/api';
import { AdminStation } from '@/lib/types';
import { Badge } from '@/components/Badge';
import { StationControls } from '@/components/StationControls';
import { DataTable } from '@/components/DataTable';

export default async function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const station = await api.get<AdminStation>(`/stations/${id}`);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">{station.name}</h1>
      <p className="text-sm text-slate-500">{station.address}</p>

      <div className="mt-6 flex gap-2">
        <Badge tone={station.isActive ? 'green' : 'red'}>{station.isActive ? 'Active' : 'Inactive'}</Badge>
        <Badge tone={station.isOpen ? 'green' : 'gray'}>{station.isOpen ? 'Open' : 'Closed'}</Badge>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p><span className="text-slate-500">Phone:</span> {station.phone || '—'}</p>
        <p className="mt-1"><span className="text-slate-500">Vendor ID:</span> {station.vendorId}</p>
      </div>

      {station.inventory && station.inventory.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-slate-700">Fuel inventory</h2>
          <div className="mt-2">
            <DataTable
              rows={station.inventory.map((i) => ({ ...i }))}
              columns={[
                { header: 'Fuel type', render: (i) => i.fuelType },
                { header: 'Price/L', render: (i) => `₦${i.pricePerLiter}` },
                { header: 'Available', render: (i) => (i.isAvailable ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">No</Badge>) },
              ]}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <StationControls stationId={station.id} isActive={station.isActive} isOpen={station.isOpen} />
      </div>
    </div>
  );
}
