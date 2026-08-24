import { api } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { RefreshButton } from '@/components/RefreshButton';

interface Overview {
  totalUsers: number;
  totalVendors: number;
  totalStations: number;
  pendingKycCount: number;
  pendingWithdrawalsCount: number;
  ordersLast30Days: number;
  transactionVolumeLast30Days: number;
}

export default async function OverviewPage() {
  const overview = await api.get<Overview>('/admin/overview');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">Overview</h1>
        <RefreshButton />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Commuters" value={overview.totalUsers} />
        <StatCard label="Vendors" value={overview.totalVendors} />
        <StatCard label="Stations" value={overview.totalStations} />
        <StatCard label="Pending KYC" value={overview.pendingKycCount} />
        <StatCard label="Pending withdrawals" value={overview.pendingWithdrawalsCount} />
        <StatCard label="Orders (30d)" value={overview.ordersLast30Days} />
        <StatCard label="Transaction volume (30d)" value={`₦${overview.transactionVolumeLast30Days.toLocaleString()}`} />
      </div>
    </div>
  );
}
