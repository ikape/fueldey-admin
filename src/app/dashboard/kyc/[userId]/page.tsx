import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { AdminUser } from '@/lib/types';
import { companyTypeLabel, matchingDirectors } from '@/lib/kyc';
import { Badge, statusTone } from '@/components/Badge';
import { KycStatusControls } from '@/components/KycStatusControls';
import { RefreshButton } from '@/components/RefreshButton';

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '—');

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className="mt-1 text-foreground">{children || '—'}</p>
    </div>
  );
}

export default async function KycReviewDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  let user: AdminUser;
  try {
    user = await api.get<AdminUser>(`/users/admin/${userId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const isVendor = user.role === 'vendor';
  const business = user.kycBusiness;
  const matches = business ? matchingDirectors(user.fullName, business.directors) : [];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/kyc" className="text-sm text-primary hover:underline">
          &larr; Back to KYC review
        </Link>
        <RefreshButton />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-xl font-bold text-foreground">{user.fullName}</h1>
        <Badge tone={statusTone(user.kycStatus)}>{user.kycStatus.replace('_', ' ')}</Badge>
      </div>
      <p className="text-sm text-muted">{user.email}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-3">
        <Field label="Account type">
          <Badge tone="blue">{user.role}</Badge>
        </Field>
        <Field label="Phone">{user.phone}</Field>
        <Field label="Location">{[user.city, user.state].filter(Boolean).join(', ')}</Field>
        <Field label="Joined">{formatDate(user.createdAt)}</Field>
        <Field label="Account">
          {user.deletedAt ? <Badge tone="red">Deleted</Badge> : user.suspendedAt ? <Badge tone="red">Suspended</Badge> : <Badge tone="green">Active</Badge>}
        </Field>
        <Field label="Prembly reference">{user.kycReference && <span className="break-all font-mono text-xs">{user.kycReference}</span>}</Field>
      </div>

      {isVendor ? (
        business ? (
          <section className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-sm font-semibold text-foreground">Business registration (CAC)</h2>
              <Badge tone={business.companyStatus === 'ACTIVE' ? 'green' : 'yellow'}>{business.companyStatus || 'unknown'}</Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <Field label="Registered name">{business.companyName}</Field>
              <Field label="Registration number">
                {business.rcNumber} <span className="text-muted">· {companyTypeLabel(business.companyType)}</span>
              </Field>
              <Field label="Registered on">{formatDate(business.registrationDate)}</Field>
              <Field label="Checked with CAC">{formatDate(business.checkedAt)}</Field>
              <div className="col-span-2">
                <Field label="Registered address">{business.address}</Field>
              </div>
            </div>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Directors on record</h3>
            {business.directors.length === 0 ? (
              <p className="mt-2 text-sm text-muted">CAC returned no directors for this business.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {business.directors.map((director) => (
                  <li key={director} className="flex items-center gap-2 text-foreground">
                    {director}
                    {matches.includes(director) && <Badge tone="green">matches account owner</Badge>}
                  </li>
                ))}
              </ul>
            )}

            <p
              role="note"
              className={`mt-4 rounded-xl px-3 py-2 text-xs ${matches.length > 0 ? 'bg-success-bg text-primary' : 'bg-warning-bg text-accent-foreground'}`}
            >
              {matches.length > 0
                ? `The account owner, ${user.fullName}, matches a director of this business.`
                : business.directors.length === 0
                  ? `CAC lists no directors, so ${user.fullName} can't be matched to this business. Confirm they own it before approving.`
                  : `None of the directors match the account owner, ${user.fullName}. RC numbers are public, so confirm they really own this business before approving.`}
            </p>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted">
            This vendor has not submitted a CAC registration number yet, so there is no business record to review.
          </section>
        )
      ) : (
        <section className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted">
          Commuters verify with a BVN or NIN, checked by Prembly against the account name. A match is approved automatically,
          so a decision here is only needed to override that result.
        </section>
      )}

      {isVendor && (
        <p className="mt-3 text-sm">
          <Link href={`/dashboard/stations?vendorId=${user.id}`} className="font-medium text-primary hover:underline">
            View this vendor&apos;s stations →
          </Link>
        </p>
      )}

      <div className="mt-8 border-t border-border pt-4">
        <p className="mb-2 text-xs text-muted">Decision:</p>
        <KycStatusControls userId={user.id} status={user.kycStatus} subject={isVendor ? 'business' : 'identity'} />
      </div>
    </div>
  );
}
