import Link from 'next/link';
import { api } from '@/lib/api';
import { AdminUser, UserWalletView } from '@/lib/types';
import { formatNaira } from '@/lib/wallet';
import { Badge, statusTone } from '@/components/Badge';
import { UserSuspensionControls } from '@/components/UserSuspensionControls';
import { KycStatusControls } from '@/components/KycStatusControls';
import { RefreshButton } from '@/components/RefreshButton';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await api.get<AdminUser>(`/users/admin/${id}`);
  // Context only: a failure to load the wallet must not hide the person.
  const walletView = await api.get<UserWalletView>(`/wallet/admin/users/${id}`).catch(() => null);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">{user.fullName}</h1>
        <RefreshButton />
      </div>
      <p className="text-sm text-muted">{user.email}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-4 text-sm">
        <div>
          <p className="text-muted">Role</p>
          <p className="mt-1"><Badge tone="blue">{user.role}</Badge></p>
        </div>
        <div>
          <p className="text-muted">KYC status</p>
          <p className="mt-1"><Badge tone={statusTone(user.kycStatus)}>{user.kycStatus}</Badge></p>
        </div>
        <div>
          <p className="text-muted">Phone</p>
          <p className="mt-1">{user.phone || '—'}</p>
        </div>
        <div>
          <p className="text-muted">Location</p>
          <p className="mt-1">{[user.city, user.state].filter(Boolean).join(', ') || '—'}</p>
        </div>
        <div>
          <p className="text-muted">Joined</p>
          <p className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-muted">Account status</p>
          <p className="mt-1">
            {user.deletedAt ? (
              <Badge tone="red">Deleted</Badge>
            ) : user.suspendedAt ? (
              <Badge tone="red">Suspended{user.suspensionReason ? `: ${user.suspensionReason}` : ''}</Badge>
            ) : (
              <Badge tone="green">Active</Badge>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <UserSuspensionControls
          userId={user.id}
          isSuspended={Boolean(user.suspendedAt)}
          isDeleted={Boolean(user.deletedAt)}
        />
        {user.role === 'vendor' && (
          <Link href={`/dashboard/stations?vendorId=${user.id}`} className="text-sm font-medium text-primary hover:underline">
            View stations →
          </Link>
        )}
      </div>

      {walletView && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-foreground">Wallet</h2>
            <Link href={`/dashboard/wallet?tab=transactions&userId=${user.id}`} className="text-xs font-medium text-primary hover:underline">
              All transactions →
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-4">
            <div>
              <p className="text-muted">Balance</p>
              <p className="mt-1 font-semibold text-foreground">{formatNaira(walletView.wallet?.balance)}</p>
            </div>
            <div>
              <p className="text-muted">Locked in withdrawals</p>
              <p className="mt-1">{formatNaira(walletView.wallet?.pendingBalance)}</p>
            </div>
            <div>
              <p className="text-muted">Fuel tokens</p>
              <p className="mt-1">
                {walletView.tokens.active.count} active · {walletView.tokens.used.count} used
              </p>
            </div>
          </div>

          {walletView.recentTransactions.length === 0 ? (
            <p className="mt-3 text-xs text-muted">No transactions yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {walletView.recentTransactions.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2">
                  <Badge tone="blue">{t.type.replace('_', ' ')}</Badge>
                  <span className="font-medium">{formatNaira(t.amount)}</span>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                  <span className="ml-auto text-xs text-muted">{new Date(t.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mt-4">
        <div className="mb-1 flex items-center gap-3">
          <p className="text-xs text-muted">KYC decision:</p>
          <Link href={`/dashboard/kyc/${user.id}`} className="text-xs font-medium text-primary hover:underline">
            Open full KYC review →
          </Link>
        </div>
        <KycStatusControls
          userId={user.id}
          status={user.kycStatus}
          subject={user.role === 'vendor' ? 'business' : 'identity'}
        />
      </div>
    </div>
  );
}
