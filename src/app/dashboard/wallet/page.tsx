import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminTransaction, AdminWithdrawal, Money, WalletSummary } from '@/lib/types';
import {
  formatAge,
  formatNaira,
  needsKycWarning,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  WITHDRAWAL_TABS,
} from '@/lib/wallet';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge, statusTone } from '@/components/Badge';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/StatCard';
import { WithdrawalControls } from '@/components/WithdrawalControls';
import { RefreshButton } from '@/components/RefreshButton';

type Params = {
  tab?: string;
  page?: string;
  status?: string;
  type?: string;
  search?: string;
  from?: string;
  to?: string;
  userId?: string;
};

export default async function WalletPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const tab = params.tab === 'transactions' ? 'transactions' : 'withdrawals';
  const page = Number(params.page) || 1;
  const summary = await api.get<WalletSummary>('/wallet/admin/summary');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">Wallet</h1>
        <RefreshButton />
      </div>

      <Overview summary={summary} />

      <div className="mt-6 flex gap-2 border-b border-border">
        <Link
          href="/dashboard/wallet?tab=withdrawals"
          className={`px-3 py-2 text-sm ${tab === 'withdrawals' ? 'border-b-2 border-primary font-semibold text-primary' : 'text-muted'}`}
        >
          Withdrawals
        </Link>
        <Link
          href="/dashboard/wallet?tab=transactions"
          className={`px-3 py-2 text-sm ${tab === 'transactions' ? 'border-b-2 border-primary font-semibold text-primary' : 'text-muted'}`}
        >
          All transactions
        </Link>
      </div>

      <div className="mt-4">
        {tab === 'withdrawals' ? <Withdrawals status={params.status} /> : <Transactions page={page} params={params} />}
      </div>
    </div>
  );
}

const amountLine = (m: Money) => `${m.count} · ${formatNaira(m.amount)}`;

function Overview({ summary }: { summary: WalletSummary }) {
  const { withdrawals, last30Days } = summary;
  const oldest = withdrawals.pending.oldestAt ? `oldest ${formatAge(withdrawals.pending.oldestAt)}` : null;

  return (
    <section className="mt-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Held in wallets" value={formatNaira(summary.totalBalance)} />
        <StatCard label="Awaiting a decision" value={amountLine(withdrawals.pending)} />
        <StatCard label="Being paid out" value={amountLine(withdrawals.processing)} />
        <StatCard label="Wallets" value={summary.walletCount} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {oldest ? `The oldest withdrawal waiting is ${oldest.replace('oldest ', '')}. ` : ''}
        {summary.totalPendingBalance > 0 ? `${formatNaira(summary.totalPendingBalance)} of wallet money is locked in withdrawals. ` : ''}
        Money held is what the platform owes its users.
      </p>

      <h2 className="mt-5 font-heading text-sm font-semibold text-foreground">Last 30 days</h2>
      <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Top-ups" value={amountLine(last30Days.topUps)} />
        <StatCard label="Fuel purchases" value={amountLine(last30Days.purchases)} />
        <StatCard label="Refunds" value={amountLine(last30Days.refunds)} />
        <StatCard label="Withdrawals paid" value={amountLine(last30Days.withdrawalsPaid)} />
        <StatCard label="Withdrawals failed" value={amountLine(last30Days.withdrawalsFailed)} />
      </div>
      <p className="mt-2 text-xs text-muted">Each figure is the number of transactions, then their total.</p>
    </section>
  );
}

async function Withdrawals({ status }: { status?: string }) {
  const active = WITHDRAWAL_TABS.some((t) => t.value === status) ? (status as string) : 'pending';
  const withdrawals = await api.get<AdminWithdrawal[]>(`/wallet/admin/withdrawals${buildQuery({ status: active })}`);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {WITHDRAWAL_TABS.map((t) => (
          <Link
            key={t.value}
            href={`/dashboard/wallet?tab=withdrawals&status=${t.value}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              active === t.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-primary'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-3">
        <DataTable<AdminWithdrawal>
          rows={withdrawals}
          emptyMessage={active === 'pending' ? 'No withdrawals waiting for a decision.' : 'No withdrawals in this state.'}
          columns={[
            {
              header: 'Vendor',
              render: (t) => (
                <div>
                  {t.user ? (
                    <Link href={`/dashboard/users/${t.userId}`} className="font-medium text-primary hover:underline">
                      {t.user.fullName}
                    </Link>
                  ) : (
                    <span className="text-muted">Account removed</span>
                  )}
                  {t.user && <div className="text-xs text-muted">{t.user.email}</div>}
                </div>
              ),
            },
            {
              header: 'KYC',
              render: (t) =>
                t.user ? (
                  <Badge tone={needsKycWarning(t.user.kycStatus) ? 'yellow' : 'green'}>
                    {needsKycWarning(t.user.kycStatus) ? `${t.user.kycStatus.replace('_', ' ')} — check` : 'verified'}
                  </Badge>
                ) : (
                  '—'
                ),
            },
            {
              header: 'Pay to',
              render: (t) =>
                t.bankAccount ? (
                  <div>
                    <div>{t.bankAccount.bankName} ••••{t.bankAccount.accountNumberLast4}</div>
                    <div className="text-xs text-muted">{t.bankAccount.accountName}</div>
                  </div>
                ) : (
                  <span className="text-muted">Bank account missing</span>
                ),
            },
            { header: 'Amount', render: (t) => <span className="font-semibold">{formatNaira(t.amount)}</span> },
            { header: 'Wallet balance', render: (t) => (t.walletBalance == null ? '—' : formatNaira(t.walletBalance)) },
            {
              header: 'Requested',
              render: (t) => (
                <div>
                  <div>{formatAge(t.createdAt)}</div>
                  <div className="text-xs text-muted">{new Date(t.createdAt).toLocaleString()}</div>
                </div>
              ),
            },
            { header: 'Status', render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
            {
              header: 'Decision',
              render: (t) =>
                t.status === 'pending' ? (
                  <WithdrawalControls transactionId={t.id} amount={t.amount} vendor={t.user?.fullName ?? 'the vendor'} />
                ) : (
                  <span className="text-xs text-muted">{t.reference}</span>
                ),
            },
          ]}
        />
      </div>
    </>
  );
}

async function Transactions({ page, params }: { page: number; params: Params }) {
  const result = await api.get<Paginated<AdminTransaction> & { totals: Money }>(
    `/wallet/admin/transactions${buildQuery({
      page,
      type: params.type,
      status: params.status,
      search: params.search,
      from: params.from,
      to: params.to,
      userId: params.userId,
    })}`,
  );
  const select = 'rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none';

  return (
    <>
      <form className="flex flex-wrap items-center gap-2" method="GET">
        <input type="hidden" name="tab" value="transactions" />
        {params.userId && <input type="hidden" name="userId" value={params.userId} />}
        <input type="text" name="search" defaultValue={params.search} placeholder="Reference, name or email" className={`${select} w-60`} />
        <select name="type" defaultValue={params.type ?? ''} aria-label="Type" className={select}>
          {TRANSACTION_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? ''} aria-label="Status" className={select}>
          {TRANSACTION_STATUSES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-xs text-muted">
          From <input type="date" name="from" defaultValue={params.from} className={select} />
        </label>
        <label className="flex items-center gap-1 text-xs text-muted">
          To <input type="date" name="to" defaultValue={params.to} className={select} />
        </label>
        <Button type="submit" variant="primary" className="font-heading">
          Filter
        </Button>
        {(params.search || params.type || params.status || params.from || params.to || params.userId) && (
          <Link href="/dashboard/wallet?tab=transactions" className="text-xs font-medium text-primary hover:underline">
            Clear
          </Link>
        )}
      </form>

      <p className="mt-3 text-xs text-muted">
        {result.totals.count.toLocaleString()} transaction{result.totals.count === 1 ? '' : 's'} matching, worth{' '}
        <span className="font-semibold text-foreground">{formatNaira(result.totals.amount)}</span> in total.
        {params.userId ? ' Showing one account only.' : ''}
      </p>

      <div className="mt-2">
        <DataTable<AdminTransaction>
          rows={result.data}
          emptyMessage="No transactions match these filters."
          columns={[
            { header: 'Date', render: (t) => new Date(t.createdAt).toLocaleString() },
            {
              header: 'Account',
              render: (t) =>
                t.user ? (
                  <Link href={`/dashboard/users/${t.userId}`} className="font-medium text-primary hover:underline">
                    {t.user.fullName}
                  </Link>
                ) : (
                  <span className="text-muted">Account removed</span>
                ),
            },
            { header: 'Type', render: (t) => <Badge tone="blue">{t.type.replace('_', ' ')}</Badge> },
            { header: 'Amount', render: (t) => formatNaira(t.amount) },
            { header: 'Status', render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
            { header: 'Reference', render: (t) => <span className="font-mono text-xs">{t.reference}</span> },
            { header: 'Details', render: (t) => <span className="whitespace-normal text-xs text-muted">{t.description || '—'}</span> },
          ]}
        />
        <Pagination
          page={result.page}
          limit={result.limit}
          total={result.total}
          basePath="/dashboard/wallet"
          searchParams={{ ...params, tab: 'transactions' }}
        />
      </div>
    </>
  );
}
