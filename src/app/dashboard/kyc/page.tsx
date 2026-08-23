import Link from 'next/link';
import { api } from '@/lib/api';
import { Paginated, AdminUser, AdminDocument } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { DocumentReviewControls } from '@/components/DocumentReviewControls';

export default async function KycReviewPage() {
  const [pendingUsers, pendingDocuments] = await Promise.all([
    api.get<Paginated<AdminUser>>('/users/admin?kycStatus=pending&limit=50'),
    api.get<Paginated<AdminDocument>>('/documents/admin/pending?limit=50'),
  ]);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">KYC review</h1>

      <section className="mt-6">
        <h2 className="font-heading text-sm font-semibold text-foreground">Users awaiting KYCAID verification ({pendingUsers.total})</h2>
        <div className="mt-2">
          <DataTable<AdminUser>
            rows={pendingUsers.data}
            emptyMessage="No users currently pending verification."
            columns={[
              {
                header: 'Name',
                render: (u) => (
                  <Link href={`/dashboard/users/${u.id}`} className="font-medium text-primary hover:underline">
                    {u.fullName}
                  </Link>
                ),
              },
              { header: 'Email', render: (u) => u.email },
              { header: 'Submitted', render: (u) => new Date(u.createdAt).toLocaleDateString() },
            ]}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-sm font-semibold text-foreground">Documents pending manual review ({pendingDocuments.total})</h2>
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
