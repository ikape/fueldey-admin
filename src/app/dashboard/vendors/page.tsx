import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminStation } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/Badge';

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; isActive?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await api.get<Paginated<AdminStation>>(
    `/stations/admin${buildQuery({ page, isActive: params.isActive, search: params.search })}`,
  );

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Vendors & Stations</h1>

      <form className="mt-4 flex flex-wrap gap-2" method="GET">
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
        <button type="submit" className="rounded-full bg-primary px-4 py-1.5 font-heading text-sm font-bold text-primary-foreground hover:bg-primary-hover">
          Filter
        </button>
      </form>

      <div className="mt-4">
        <DataTable<AdminStation>
          rows={result.data}
          columns={[
            {
              header: 'Name',
              render: (s) => (
                <Link href={`/dashboard/vendors/${s.id}`} className="font-medium text-primary hover:underline">
                  {s.name}
                </Link>
              ),
            },
            { header: 'Address', render: (s) => s.address },
            { header: 'Active', render: (s) => (s.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Inactive</Badge>) },
            { header: 'Open', render: (s) => (s.isOpen ? <Badge tone="green">Open</Badge> : <Badge tone="gray">Closed</Badge>) },
          ]}
        />
        <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/vendors" searchParams={params} />
      </div>
    </div>
  );
}
