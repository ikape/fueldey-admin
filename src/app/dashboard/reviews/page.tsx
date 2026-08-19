import { api, buildQuery } from '@/lib/api';
import { Paginated, AdminReview } from '@/lib/types';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { DeleteReviewButton } from '@/components/DeleteReviewButton';

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await api.get<Paginated<AdminReview>>(`/reviews/admin${buildQuery({ page })}`);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Reviews</h1>

      <div className="mt-4">
        <DataTable<AdminReview>
          rows={result.data}
          columns={[
            { header: 'Rating', render: (r) => '★'.repeat(r.rating) },
            { header: 'Comment', render: (r) => r.comment || '—' },
            { header: 'Station', render: (r) => r.stationId },
            { header: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
            { header: 'Actions', render: (r) => <DeleteReviewButton reviewId={r.id} /> },
          ]}
        />
        <Pagination page={result.page} limit={result.limit} total={result.total} basePath="/dashboard/reviews" searchParams={params} />
      </div>
    </div>
  );
}
