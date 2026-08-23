import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminOrder } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { StatCard } from '@/components/StatCard';
import { Badge, statusTone } from '@/components/Badge';

interface OrderStats {
  total: number;
  completed: number;
  pending: number;
  revenue: number;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [stats, result] = await Promise.all([
    api.get<OrderStats>('/orders/admin/stats'),
    api.get<Paginated<AdminOrder>>(`/orders/admin${buildQuery({ page, status: params.status })}`),
  ]);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Orders</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total orders" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Revenue" value={`₦${stats.revenue.toLocaleString()}`} />
      </div>

      <form className="mt-6 flex gap-2" method="GET">
        <select name="status" defaultValue={params.status || ''} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="rounded-full bg-primary px-4 py-1.5 font-heading text-sm font-bold text-primary-foreground hover:bg-primary-hover">
          Filter
        </button>
      </form>

      <div className="mt-4">
        <DataTable<AdminOrder>
          rows={result.data}
          columns={[
            { header: 'Order', render: (o) => o.id.slice(0, 8) },
            { header: 'Amount', render: (o) => `₦${Number(o.amount).toLocaleString()}` },
            { header: 'Liters', render: (o) => o.liters },
            { header: 'Status', render: (o) => <Badge tone={statusTone(o.status)}>{o.status}</Badge> },
            { header: 'Date', render: (o) => new Date(o.createdAt).toLocaleString() },
          ]}
        />
        <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/orders" searchParams={params} />
      </div>
    </div>
  );
}
