import Link from 'next/link';
import { api } from '@/lib/api';
import { AdminFleetGroupDetail } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';

export default async function FleetGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await api.get<AdminFleetGroupDetail>(`/vehicles/admin/fleets/${id}`);

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/vehicles?tab=fleets" className="text-sm text-primary hover:underline">
        &larr; Back to fleet groups
      </Link>

      <h1 className="mt-2 font-heading text-xl font-bold text-foreground">{group.name}</h1>
      <p className="text-sm text-muted">{group.description || 'No description provided.'}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Vehicles</p>
          <p className="mt-1 font-heading text-lg font-bold text-foreground">{group.vehicles.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Members</p>
          <p className="mt-1 font-heading text-lg font-bold text-foreground">{group.members.length}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Created</p>
          <p className="mt-1 font-heading text-lg font-bold text-foreground">
            {new Date(group.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm">
        <p className="text-xs font-semibold uppercase text-muted">Owner</p>
        {group.owner ? (
          <>
            <p className="mt-1">
              <Link href={`/dashboard/users/${group.ownerId}`} className="font-medium text-primary hover:underline">
                {group.owner.fullName}
              </Link>
            </p>
            <p className="mt-1 text-muted">{group.owner.email}</p>
            {group.owner.phone && <p className="mt-1 text-muted">{group.owner.phone}</p>}
          </>
        ) : (
          <p className="mt-1 text-muted">—</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-heading text-sm font-semibold text-foreground">Members</h2>
        <div className="mt-2">
          <DataTable
            rows={group.members}
            emptyMessage="No members in this fleet group."
            columns={[
              { header: 'Name', render: (m) => m.user?.fullName ?? '—' },
              { header: 'Email', render: (m) => m.user?.email ?? '—' },
              { header: 'Phone', render: (m) => m.user?.phone || '—' },
              { header: 'Role', render: (m) => <Badge tone={m.role === 'driver' ? 'blue' : 'gray'}>{m.role}</Badge> },
            ]}
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-heading text-sm font-semibold text-foreground">Vehicles</h2>
        <div className="mt-2">
          <DataTable
            rows={group.vehicles}
            emptyMessage="No vehicles assigned to this fleet group."
            columns={[
              { header: 'Name', render: (v) => v.name || '—' },
              { header: 'Make/Model/Year', render: (v) => [v.make, v.model, v.year].filter(Boolean).join(' ') || '—' },
              { header: 'Plate', render: (v) => v.licensePlate },
              { header: 'Color', render: (v) => v.color || '—' },
              { header: 'Fuel type', render: (v) => v.fuelType || '—' },
              { header: 'Driver', render: (v) => v.driverName || '—' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
