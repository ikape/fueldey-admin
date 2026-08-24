import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminUser } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge, statusTone } from '@/components/Badge';
import { UserSuspensionControls } from '@/components/UserSuspensionControls';
import { RefreshButton } from '@/components/RefreshButton';
import { Button } from '@/components/Button';

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kycStatus?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await api.get<Paginated<AdminUser>>(
    `/users/admin${buildQuery({ page, role: 'vendor', kycStatus: params.kycStatus, search: params.search })}`,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">Vendors</h1>
        <RefreshButton />
      </div>

      <form className="mt-4 flex flex-wrap gap-2" method="GET">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search name, email, phone"
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        />
        <select name="kycStatus" defaultValue={params.kycStatus || ''} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
          <option value="">All KYC statuses</option>
          <option value="not_submitted">Not submitted</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <Button type="submit" variant="primary" className="font-heading">
          Filter
        </Button>
      </form>

      <div className="mt-4">
        <DataTable<AdminUser>
          rows={result.data}
          columns={[
            {
              header: 'Name',
              render: (u) => (
                <Link href={`/dashboard/users/${u.id}`} className="font-medium text-primary hover:underline">
                  {u.fullName}
                </Link>
              ),
            },
            { header: 'Email', render: (u) => u.email },
            { header: 'KYC', render: (u) => <Badge tone={statusTone(u.kycStatus)}>{u.kycStatus}</Badge> },
            {
              header: 'Status',
              render: (u) =>
                u.deletedAt ? (
                  <Badge tone="red">Deleted</Badge>
                ) : u.suspendedAt ? (
                  <Badge tone="red">Suspended</Badge>
                ) : (
                  <Badge tone="green">Active</Badge>
                ),
            },
            {
              header: 'Stations',
              render: (u) => (
                <Link href={`/dashboard/stations?vendorId=${u.id}`} className="text-primary hover:underline">
                  View stations
                </Link>
              ),
            },
            {
              header: 'Actions',
              render: (u) => (
                <UserSuspensionControls
                  userId={u.id}
                  isSuspended={Boolean(u.suspendedAt)}
                  isDeleted={Boolean(u.deletedAt)}
                  compact
                />
              ),
            },
          ]}
        />
        <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/vendors" searchParams={params} />
      </div>
    </div>
  );
}
