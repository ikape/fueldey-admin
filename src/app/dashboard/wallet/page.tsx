import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminTransaction } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge, statusTone } from '@/components/Badge';
import { WithdrawalControls } from '@/components/WithdrawalControls';

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string; type?: string; status?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === 'transactions' ? 'transactions' : 'withdrawals';
  const page = Number(params.page) || 1;

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Wallet</h1>

      <div className="mt-4 flex gap-2 border-b border-border">
        <Link
          href="/dashboard/wallet?tab=withdrawals"
          className={`px-3 py-2 text-sm ${tab === 'withdrawals' ? 'border-b-2 border-primary font-semibold text-primary' : 'text-muted'}`}
        >
          Pending withdrawals
        </Link>
        <Link
          href="/dashboard/wallet?tab=transactions"
          className={`px-3 py-2 text-sm ${tab === 'transactions' ? 'border-b-2 border-primary font-semibold text-primary' : 'text-muted'}`}
        >
          All transactions
        </Link>
      </div>

      <div className="mt-4">
        {tab === 'withdrawals' ? (
          <PendingWithdrawals />
        ) : (
          <AllTransactions page={page} type={params.type} status={params.status} params={params} />
        )}
      </div>
    </div>
  );
}

async function PendingWithdrawals() {
  const withdrawals = await api.get<AdminTransaction[]>('/wallet/admin/withdrawals');
  return (
    <DataTable<AdminTransaction>
      rows={withdrawals}
      emptyMessage="No pending withdrawals."
      columns={[
        { header: 'Reference', render: (t) => t.reference },
        {
          header: 'Vendor',
          render: (t) => (
            <Link href={`/dashboard/users/${t.userId}`} className="text-primary hover:underline">
              View vendor
            </Link>
          ),
        },
        { header: 'Bank details', render: (t) => t.description || '—' },
        { header: 'Amount', render: (t) => `₦${Number(t.amount).toLocaleString()}` },
        { header: 'Requested', render: (t) => new Date(t.createdAt).toLocaleString() },
        { header: 'Actions', render: (t) => <WithdrawalControls transactionId={t.id} /> },
      ]}
    />
  );
}

async function AllTransactions({
  page,
  type,
  status,
  params,
}: {
  page: number;
  type?: string;
  status?: string;
  params: Record<string, string | undefined>;
}) {
  const result = await api.get<Paginated<AdminTransaction>>(
    `/wallet/admin/transactions${buildQuery({ page, type, status })}`,
  );

  return (
    <>
      <DataTable<AdminTransaction>
        rows={result.data}
        columns={[
          { header: 'Reference', render: (t) => t.reference },
          { header: 'Type', render: (t) => <Badge tone="blue">{t.type}</Badge> },
          { header: 'Amount', render: (t) => `₦${Number(t.amount).toLocaleString()}` },
          { header: 'Status', render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
          { header: 'Date', render: (t) => new Date(t.createdAt).toLocaleString() },
        ]}
      />
      <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/wallet" searchParams={{ ...params, tab: 'transactions' }} />
    </>
  );
}
