import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminUser } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge, statusTone } from '@/components/Badge';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string; kycStatus?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await api.get<Paginated<AdminUser>>(
    `/users/admin${buildQuery({ page, role: params.role, kycStatus: params.kycStatus, search: params.search })}`,
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Users</h1>

      <form className="mt-4 flex flex-wrap gap-2" method="GET">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search name, email, phone"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <select name="role" defaultValue={params.role || ''} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All roles</option>
          <option value="commuter">Commuter</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
        <select name="kycStatus" defaultValue={params.kycStatus || ''} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All KYC statuses</option>
          <option value="not_submitted">Not submitted</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white">
          Filter
        </button>
      </form>

      <div className="mt-4">
        <DataTable<AdminUser>
          rows={result.data}
          columns={[
            {
              header: 'Name',
              render: (u) => (
                <Link href={`/dashboard/users/${u.id}`} className="font-medium text-slate-900 hover:underline">
                  {u.fullName}
                </Link>
              ),
            },
            { header: 'Email', render: (u) => u.email },
            { header: 'Role', render: (u) => <Badge tone="blue">{u.role}</Badge> },
            { header: 'KYC', render: (u) => <Badge tone={statusTone(u.kycStatus)}>{u.kycStatus}</Badge> },
            { header: 'Status', render: (u) => (u.suspendedAt ? <Badge tone="red">Suspended</Badge> : <Badge tone="green">Active</Badge>) },
          ]}
        />
        <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/users" searchParams={params} />
      </div>
    </div>
  );
}
