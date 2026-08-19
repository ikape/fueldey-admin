import { api } from '@/lib/api';
import { AdminUser } from '@/lib/types';
import { Badge, statusTone } from '@/components/Badge';
import { UserSuspensionControls } from '@/components/UserSuspensionControls';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await api.get<AdminUser>(`/users/admin/${id}`);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">{user.fullName}</h1>
      <p className="text-sm text-slate-500">{user.email}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <div>
          <p className="text-slate-500">Role</p>
          <p className="mt-1"><Badge tone="blue">{user.role}</Badge></p>
        </div>
        <div>
          <p className="text-slate-500">KYC status</p>
          <p className="mt-1"><Badge tone={statusTone(user.kycStatus)}>{user.kycStatus}</Badge></p>
        </div>
        <div>
          <p className="text-slate-500">Phone</p>
          <p className="mt-1">{user.phone || '—'}</p>
        </div>
        <div>
          <p className="text-slate-500">Location</p>
          <p className="mt-1">{[user.city, user.state].filter(Boolean).join(', ') || '—'}</p>
        </div>
        <div>
          <p className="text-slate-500">Joined</p>
          <p className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Account status</p>
          <p className="mt-1">
            {user.suspendedAt ? (
              <Badge tone="red">Suspended{user.suspensionReason ? `: ${user.suspensionReason}` : ''}</Badge>
            ) : (
              <Badge tone="green">Active</Badge>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <UserSuspensionControls userId={user.id} isSuspended={Boolean(user.suspendedAt)} />
      </div>
    </div>
  );
}
