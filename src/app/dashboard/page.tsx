import Link from 'next/link';
import { api } from '@/lib/api';
import { optional } from '@/lib/safeApi';
import { formatAge, formatNaira } from '@/lib/wallet';
import { DECISION_LABEL, DECISION_TONE, decidedByLabel } from '@/lib/kycHistory';
import type {
  AdminStation,
  AdminTransaction,
  AdminUser,
  KycHistoryEntry,
  Paginated,
  WalletSummary,
} from '@/lib/types';
import { StatCard } from '@/components/StatCard';
import { RefreshButton } from '@/components/RefreshButton';
import { Badge, statusTone } from '@/components/Badge';

interface Overview {
  totalUsers: number;
  totalVendors: number;
  totalStations: number;
  pendingKycCount: number;
  pendingWithdrawalsCount: number;
  ordersLast30Days: number;
  transactionVolumeLast30Days: number;
}

interface OrderStats {
  total: number;
  completed: number;
  pending: number;
  revenue: number;
}

export default async function OverviewPage() {
  const [overview, wallet, orders, stations, transactions, kycHistory, signups] = await Promise.all([
    api.get<Overview>('/admin/overview'),
    optional(api.get<WalletSummary>('/wallet/admin/summary')),
    optional(api.get<OrderStats>('/orders/admin/stats')),
    optional(api.get<Paginated<AdminStation>>('/stations/admin?limit=100')),
    optional(api.get<Paginated<AdminTransaction>>('/wallet/admin/transactions?limit=6')),
    optional(api.get<Paginated<KycHistoryEntry>>('/users/admin/kyc/history?limit=6')),
    optional(api.get<Paginated<AdminUser>>('/users/admin?limit=20')),
  ]);

  // Station health is only exact when every station fits in the one page we asked for.
  const allStationsLoaded = stations ? stations.data.length >= stations.total : false;
  const inactiveStations = allStationsLoaded ? stations!.data.filter((s) => !s.isActive).length : null;
  const closedStations = allStationsLoaded ? stations!.data.filter((s) => s.isActive && !s.isOpen).length : null;
  const oldestPending = wallet?.withdrawals.pending.oldestAt;

  const latestSignups = (signups?.data ?? [])
    .filter((u) => u.role !== 'admin')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">Overview</h1>
        <RefreshButton />
      </div>

      <h2 className="mt-6 font-heading text-sm font-bold uppercase tracking-wide text-muted">Needs your attention</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AttentionCard
          href="/dashboard/kyc"
          label="KYC awaiting review"
          count={overview.pendingKycCount}
          hint="Review documents and decide"
        />
        <AttentionCard
          href="/dashboard/wallet?tab=withdrawals"
          label="Withdrawals awaiting decision"
          count={overview.pendingWithdrawalsCount}
          hint={
            wallet && overview.pendingWithdrawalsCount > 0
              ? `${formatNaira(wallet.withdrawals.pending.amount)}${oldestPending ? ` · oldest ${formatAge(oldestPending)}` : ''}`
              : 'Vendor payouts to approve'
          }
        />
        <AttentionCard
          href="/dashboard/orders?status=pending"
          label="Pending orders"
          count={orders?.pending ?? null}
          hint="Orders not yet fulfilled"
        />
        <AttentionCard
          href="/dashboard/stations?isActive=false"
          label="Inactive stations"
          count={inactiveStations}
          hint={closedStations ? `${closedStations} active but closed right now` : 'Deactivated by an admin'}
        />
      </div>

      <h2 className="mt-8 font-heading text-sm font-bold uppercase tracking-wide text-muted">Platform</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Commuters" value={overview.totalUsers} />
        <StatCard label="Vendors" value={overview.totalVendors} />
        <StatCard label="Stations" value={overview.totalStations} />
        <StatCard label="Orders (30d)" value={overview.ordersLast30Days} />
        <StatCard label="Transaction volume (30d)" value={formatNaira(overview.transactionVolumeLast30Days)} />
        {wallet && <StatCard label="Money held in wallets" value={formatNaira(wallet.totalBalance)} />}
        {wallet && <StatCard label="Top-ups (30d)" value={formatNaira(wallet.last30Days.topUps.amount)} />}
        {wallet && <StatCard label="Paid out to vendors (30d)" value={formatNaira(wallet.last30Days.withdrawalsPaid.amount)} />}
      </div>

      <h2 className="mt-8 font-heading text-sm font-bold uppercase tracking-wide text-muted">Recent activity</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Latest transactions" href="/dashboard/wallet?tab=transactions" empty={!transactions?.data.length}>
          {transactions?.data.map((t) => (
            <Row
              key={t.id}
              title={`${t.user?.fullName ?? 'Unknown account'} · ${t.type.replace('_', ' ')}`}
              meta={formatAge(t.createdAt)}
              right={
                <>
                  <span className="font-semibold text-foreground">{formatNaira(t.amount)}</span>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                </>
              }
            />
          ))}
        </Panel>
        <Panel title="KYC activity" href="/dashboard/kyc" empty={!kycHistory?.data.length}>
          {kycHistory?.data.map((e) => (
            <Row
              key={e.id}
              title={e.user?.fullName ?? 'Unknown user'}
              meta={`${decidedByLabel(e)} · ${formatAge(e.at)}`}
              right={<Badge tone={DECISION_TONE[e.decision]}>{DECISION_LABEL[e.decision]}</Badge>}
            />
          ))}
        </Panel>
        <Panel title="Newest sign-ups" href="/dashboard/commuters" empty={latestSignups.length === 0}>
          {latestSignups.map((u) => (
            <Row
              key={u.id}
              title={u.fullName}
              meta={`${u.role} · ${formatAge(u.createdAt)}`}
              right={<Badge tone={statusTone(u.kycStatus)}>{u.kycStatus}</Badge>}
            />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function AttentionCard({ href, label, count, hint }: { href: string; label: string; count: number | null; hint: string }) {
  const urgent = (count ?? 0) > 0;
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-4 transition-colors duration-150 hover:border-primary ${
        urgent ? 'border-accent bg-warning-bg' : 'border-border bg-card'
      }`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold text-foreground">{count ?? '—'}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Link>
  );
}

function Panel({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
        <Link href={href} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      {empty ? (
        <p className="mt-4 text-sm text-muted">Nothing to show yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">{children}</ul>
      )}
    </section>
  );
}

function Row({ title, meta, right }: { title: string; meta: string; right: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium capitalize text-foreground">{title}</p>
        <p className="truncate text-xs text-muted">{meta}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-sm">{right}</div>
    </li>
  );
}
