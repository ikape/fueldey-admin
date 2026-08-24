import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminStation } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/Badge';
import { RefreshButton } from '@/components/RefreshButton';
import { Button } from '@/components/Button';

export default async function StationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; isActive?: string; search?: string; vendorId?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await api.get<Paginated<AdminStation>>(
    `/stations/admin${buildQuery({ page, isActive: params.isActive, search: params.search, vendorId: params.vendorId })}`,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">Stations</h1>
        <RefreshButton />
      </div>

      {params.vendorId && (
        <p className="mt-2 text-sm text-muted">
          Showing stations for one vendor —{' '}
          <Link href="/dashboard/stations" className="text-primary hover:underline">
            clear filter
          </Link>
        </p>
      )}

      <form className="mt-4 flex flex-wrap gap-2" method="GET">
        {params.vendorId && <input type="hidden" name="vendorId" value={params.vendorId} />}
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search name or address"
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        />
        <select name="isActive" defaultValue={params.isActive || ''} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <Button type="submit" variant="primary" className="font-heading">
          Filter
        </Button>
      </form>

      <div className="mt-4">
        <DataTable<AdminStation>
          rows={result.data}
          columns={[
            {
              header: 'Name',
              render: (s) => (
                <Link href={`/dashboard/stations/${s.id}`} className="font-medium text-primary hover:underline">
                  {s.name}
                </Link>
              ),
            },
            { header: 'Address', render: (s) => s.address },
            {
              header: 'Vendor',
              render: (s) => (
                <Link href={`/dashboard/users/${s.vendorId}`} className="text-primary hover:underline">
                  View vendor
                </Link>
              ),
            },
            { header: 'Active', render: (s) => (s.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Inactive</Badge>) },
            { header: 'Open', render: (s) => (s.isOpen ? <Badge tone="green">Open</Badge> : <Badge tone="gray">Closed</Badge>) },
          ]}
        />
        <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/stations" searchParams={params} />
      </div>
    </div>
  );
}
