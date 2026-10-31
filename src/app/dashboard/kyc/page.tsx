import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminUser, AdminDocument } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { DocumentReviewControls } from '@/components/DocumentReviewControls';
import { Badge, statusTone } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { RefreshButton } from '@/components/RefreshButton';
import { KycHistory } from '@/components/KycHistory';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Declined' },
  { value: 'not_submitted', label: 'Not submitted' },
  { value: 'all', label: 'Any status' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'All account types' },
  { value: 'vendor', label: 'Vendors' },
  { value: 'commuter', label: 'Commuters' },
];

export default async function KycReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; role?: string; search?: string; tab?: string; decision?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const tab = params.tab === 'history' ? 'history' : 'queue';
  const header = (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">KYC review</h1>
        <RefreshButton />
      </div>
      <div className="mt-4 flex gap-2 border-b border-border">
        <Link
          href="/dashboard/kyc"
          className={`px-3 py-2 text-sm ${tab === 'queue' ? 'border-b-2 border-primary font-semibold text-primary' : 'text-muted'}`}
        >
          Review queue
        </Link>
        <Link
          href="/dashboard/kyc?tab=history"
          className={`px-3 py-2 text-sm ${tab === 'history' ? 'border-b-2 border-primary font-semibold text-primary' : 'text-muted'}`}
        >
          Decision history
        </Link>
      </div>
    </>
  );

  if (tab === 'history') {
    return (
      <div>
        {header}
        <div className="mt-4">
          <KycHistory page={page} decision={params.decision} />
        </div>
      </div>
    );
  }

  // The queue opens on what needs a decision.
  const status = params.status || 'pending';

  const [users, pendingDocuments] = await Promise.all([
    api.get<Paginated<AdminUser>>(
      `/users/admin${buildQuery({
        page,
        limit: PAGE_SIZE,
        kycStatus: status === 'all' ? undefined : status,
        role: params.role,
        search: params.search,
      })}`,
    ),
    api.get<Paginated<AdminDocument>>('/documents/admin/pending?limit=50'),
  ]);

  const heading = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? 'Requests';

  return (
    <div>
      {header}

      <form className="mt-4 flex flex-wrap gap-2" method="GET">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search name, email, phone"
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        />
        <select name="status" defaultValue={status} aria-label="KYC status" className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="role" defaultValue={params.role || ''} aria-label="Account type" className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" className="font-heading">
          Filter
        </Button>
      </form>

      <section className="mt-6">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          {heading} ({users.total})
        </h2>
        <p className="mt-1 text-xs text-muted">
          Vendors submit their CAC registration number and wait here for your decision. Commuters are approved automatically
          when their BVN/NIN matches their account name; open one to override that.
        </p>
        <div className="mt-2">
          <DataTable<AdminUser>
            rows={users.data}
            emptyMessage={status === 'pending' ? 'Nothing waiting for review.' : 'No users match these filters.'}
            columns={[
              {
                header: 'Name',
                render: (u) => (
                  <Link href={`/dashboard/kyc/${u.id}`} className="font-medium text-primary hover:underline">
                    {u.fullName}
                  </Link>
                ),
              },
              { header: 'Email', render: (u) => u.email },
              { header: 'Role', render: (u) => <Badge tone="blue">{u.role}</Badge> },
              {
                header: 'Business (CAC)',
                render: (u) =>
                  u.kycBusiness ? (
                    <span>
                      {u.kycBusiness.companyName || '—'} <span className="text-muted">· {u.kycBusiness.companyType} {u.kycBusiness.rcNumber}</span>
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  ),
              },
              { header: 'KYC', render: (u) => <Badge tone={statusTone(u.kycStatus)}>{u.kycStatus.replace('_', ' ')}</Badge> },
              {
                header: 'Submitted',
                render: (u) => new Date(u.kycBusiness?.checkedAt ?? u.updatedAt ?? u.createdAt).toLocaleDateString(),
              },
              {
                header: 'Actions',
                render: (u) => (
                  <Link
                    href={`/dashboard/kyc/${u.id}`}
                    className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {u.kycStatus === 'pending' ? 'Review →' : 'Open →'}
                  </Link>
                ),
              },
            ]}
          />
          <Pagination
            page={users.page}
            limit={users.limit}
            total={users.total}
            basePath="/dashboard/kyc"
            searchParams={{ status: params.status, role: params.role, search: params.search }}
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-foreground">Documents pending manual review ({pendingDocuments.total})</h2>
          <RefreshButton />
        </div>
        <p className="mt-1 text-xs text-muted">Separate document-collection system (proof of address, business license, etc.) — approving here does not change the account&apos;s KYC status above.</p>
        <div className="mt-2">
          <DataTable<AdminDocument>
            rows={pendingDocuments.data}
            emptyMessage="No documents pending review."
            columns={[
              { header: 'Applicant', render: (d) => d.user?.fullName || d.userId },
              { header: 'Document', render: (d) => d.name },
              { header: 'Type', render: (d) => d.type },
              {
                header: 'File',
                render: (d) => (d.fileUrl ? <a href={d.fileUrl} target="_blank" className="text-primary hover:underline">View</a> : '—'),
              },
              { header: 'Actions', render: (d) => <DocumentReviewControls documentId={d.id} /> },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
