import Link from 'next/link';
import { api, buildQuery } from '@/lib/api';
import { Paginated, KycHistoryEntry } from '@/lib/types';
import { DECISION_FILTERS, DECISION_LABEL, DECISION_TONE, decidedByLabel, historyDetail } from '@/lib/kycHistory';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';

const PAGE_SIZE = 20;

/** The permanent record of KYC: every submission, automatic approval, approval and decline. */
export async function KycHistory({ page, decision }: { page: number; decision?: string }) {
  const result = await api.get<Paginated<KycHistoryEntry>>(
    `/users/admin/kyc/history${buildQuery({ page, limit: PAGE_SIZE, decision })}`,
  );

  return (
    <section>
      <form className="flex flex-wrap gap-2" method="GET">
        <input type="hidden" name="tab" value="history" />
        <select
          name="decision"
          defaultValue={decision ?? ''}
          aria-label="Event"
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        >
          {DECISION_FILTERS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" className="font-heading">
          Filter
        </Button>
      </form>

      <p className="mt-3 text-xs text-muted">
        Every KYC submission and decision, newest first — including who decided and why. {result.total} event{result.total === 1 ? '' : 's'}.
      </p>

      <div className="mt-2">
        <DataTable<KycHistoryEntry>
          rows={result.data}
          emptyMessage="No KYC events recorded yet."
          columns={[
            { header: 'When', render: (e) => new Date(e.at).toLocaleString() },
            { header: 'Event', render: (e) => <Badge tone={DECISION_TONE[e.decision]}>{DECISION_LABEL[e.decision]}</Badge> },
            {
              header: 'Account',
              render: (e) =>
                e.user ? (
                  <Link href={`/dashboard/kyc/${e.user.id}`} className="font-medium text-primary hover:underline">
                    {e.user.fullName}
                  </Link>
                ) : (
                  <span className="text-muted">Account removed</span>
                ),
            },
            { header: 'Role', render: (e) => (e.user ? <Badge tone="blue">{e.user.role}</Badge> : '—') },
            { header: 'By', render: (e) => decidedByLabel(e) },
            { header: 'Details', render: (e) => <span className="whitespace-normal">{historyDetail(e)}</span> },
          ]}
        />
        <Pagination
          page={result.page}
          limit={result.limit}
          total={result.total}
          basePath="/dashboard/kyc"
          searchParams={{ tab: 'history', decision }}
        />
      </div>
    </section>
  );
}
