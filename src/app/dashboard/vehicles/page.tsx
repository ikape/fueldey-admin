import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminVehicle, AdminFleetGroup } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === 'fleets' ? 'fleets' : 'vehicles';
  const page = Number(params.page) || 1;

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Vehicles & Fleets</h1>

      <div className="mt-4 flex gap-2 border-b border-border">
        <Link
          href="/dashboard/vehicles?tab=vehicles"
          className={`px-3 py-2 text-sm ${tab === 'vehicles' ? 'border-b-2 border-primary font-semibold text-primary' : 'text-muted'}`}
        >
          Vehicles
        </Link>
        <Link
          href="/dashboard/vehicles?tab=fleets"
          className={`px-3 py-2 text-sm ${tab === 'fleets' ? 'border-b-2 border-primary font-semibold text-primary' : 'text-muted'}`}
        >
          Fleet groups
        </Link>
      </div>

      <div className="mt-4">
        {tab === 'vehicles' ? <VehiclesTable page={page} params={params} /> : <FleetsTable page={page} params={params} />}
      </div>
    </div>
  );
}

async function VehiclesTable({ page, params }: { page: number; params: Record<string, string | undefined> }) {
  const result = await api.get<Paginated<AdminVehicle>>(`/vehicles/admin${buildQuery({ page })}`);
  return (
    <>
      <DataTable<AdminVehicle>
        rows={result.data}
        columns={[
          { header: 'Name', render: (v) => v.name || '—' },
          { header: 'Make/Model/Year', render: (v) => [v.make, v.model, v.year].filter(Boolean).join(' ') || '—' },
          { header: 'Plate', render: (v) => v.licensePlate },
          { header: 'Color', render: (v) => v.color || '—' },
          { header: 'Driver', render: (v) => v.driverName || '—' },
          {
            header: 'Owner',
            render: (v) =>
              v.user ? (
                <Link href={`/dashboard/users/${v.userId}`} className="text-primary hover:underline">
                  {v.user.fullName}
                </Link>
              ) : (
                '—'
              ),
          },
          {
            header: 'Fleet group',
            render: (v) =>
              v.fleetGroup ? (
                <Link href={`/dashboard/vehicles/fleets/${v.fleetGroup.id}`} className="text-primary hover:underline">
                  {v.fleetGroup.name}
                </Link>
              ) : (
                <span className="text-muted">Personal vehicle</span>
              ),
          },
        ]}
      />
      <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/vehicles" searchParams={{ ...params, tab: 'vehicles' }} />
    </>
  );
}

async function FleetsTable({ page, params }: { page: number; params: Record<string, string | undefined> }) {
  const result = await api.get<Paginated<AdminFleetGroup>>(`/vehicles/admin/fleets${buildQuery({ page })}`);
  return (
    <>
      <DataTable<AdminFleetGroup>
        rows={result.data}
        columns={[
          {
            header: 'Name',
            render: (f) => (
              <Link href={`/dashboard/vehicles/fleets/${f.id}`} className="font-medium text-primary hover:underline">
                {f.name}
              </Link>
            ),
          },
          { header: 'Description', render: (f) => f.description || '—' },
          {
            header: 'Owner',
            render: (f) =>
              f.owner ? (
                <Link href={`/dashboard/users/${f.ownerId}`} className="text-primary hover:underline">
                  {f.owner.fullName}
                </Link>
              ) : (
                '—'
              ),
          },
          { header: 'Vehicles', render: (f) => f.vehicleCount ?? 0 },
          { header: 'Members', render: (f) => f.memberCount ?? 0 },
          { header: 'Created', render: (f) => new Date(f.createdAt).toLocaleDateString() },
        ]}
      />
      <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/vehicles" searchParams={{ ...params, tab: 'fleets' }} />
    </>
  );
}
