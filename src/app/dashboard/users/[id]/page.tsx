import Link from 'next/link';
import { api } from '@/lib/api';
import { AdminUser } from '@/lib/types';
import { Badge, statusTone } from '@/components/Badge';
import { UserSuspensionControls } from '@/components/UserSuspensionControls';
import { KycStatusControls } from '@/components/KycStatusControls';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await api.get<AdminUser>(`/users/admin/${id}`);

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-xl font-bold text-foreground">{user.fullName}</h1>
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

      <div className="mt-4">
        <p className="mb-1 text-xs text-muted">Manually override KYC status:</p>
        <KycStatusControls userId={user.id} />
      </div>
    </div>
  );
}
