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
          { header: 'Make/Model', render: (v) => [v.make, v.model].filter(Boolean).join(' ') || '—' },
          { header: 'Plate', render: (v) => v.licensePlate },
          { header: 'Owner', render: (v) => v.userId },
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
          { header: 'Name', render: (f) => f.name },
          { header: 'Description', render: (f) => f.description || '—' },
          { header: 'Owner', render: (f) => f.ownerId },
        ]}
      />
      <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/vehicles" searchParams={{ ...params, tab: 'fleets' }} />
    </>
  );
}
