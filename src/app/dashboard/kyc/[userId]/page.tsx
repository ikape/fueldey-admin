import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { AdminUser, KycaidDocument } from '@/lib/types';
import { Badge } from '@/components/Badge';
import { KycStatusControls } from '@/components/KycStatusControls';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  GOVERNMENT_ID: 'Government-issued ID (e.g. NIN slip, voter’s card)',
  PASSPORT: 'International passport',
  DOMESTIC_PASSPORT: 'Domestic passport',
  FOREIGN_CITIZEN_PASSPORT: 'Foreign citizen passport',
  DRIVERS_LICENSE: "Driver's license",
  PERMANENT_RESIDENCE_PERMIT: 'Permanent residence permit',
  REFUGEE_CARD: 'Refugee card',
  BANK_STATEMENT: 'Bank statement',
  FINANCIAL_DOCUMENT: 'Financial document',
  CREDIT_CARD: 'Credit card',
  SELFIE_IMAGE: 'Selfie / liveness photo',
  SELFIE_WITH_CREDIT_CARD: 'Selfie with credit card',
};

const IMAGE_FIELDS = ['portrait', 'front_side', 'back_side', 'other_side_1', 'other_side_2', 'other_side_3'] as const;
const IMAGE_FIELD_LABELS: Record<(typeof IMAGE_FIELDS)[number], string> = {
  portrait: 'Extracted portrait',
  front_side: 'Front side',
  back_side: 'Back side',
  other_side_1: 'Additional page 1',
  other_side_2: 'Additional page 2',
  other_side_3: 'Additional page 3',
};

function documentStatusTone(status?: string | null): 'green' | 'red' | 'yellow' | 'gray' {
  if (status === 'valid') return 'green';
  if (status === 'invalid') return 'red';
  if (status === 'new') return 'yellow';
  return 'gray';
}

export default async function KycDocumentReviewPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = await api.get<AdminUser>(`/users/admin/${userId}`);

  let documents: KycaidDocument[] = [];
  let documentsError: string | null = null;
  try {
    documents = await api.get<KycaidDocument[]>(`/kycaid/admin/${userId}/documents`);
  } catch (error) {
    documentsError =
      error instanceof ApiError && error.status === 404
        ? 'This user has no KYCAID verification on record yet.'
        : 'Could not load KYC documents from the provider right now.';
  }

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/kyc" className="text-sm text-primary hover:underline">
        &larr; Back to KYC review
      </Link>

      <h1 className="mt-2 font-heading text-xl font-bold text-foreground">{user.fullName}</h1>
      <p className="text-sm text-muted">{user.email}</p>
      <p className="mt-1 text-xs text-muted">
        Review the documents below before approving or rejecting &mdash; approving without checking them defeats the point of KYC.
      </p>

      <div className="mt-6 space-y-6">
        {documentsError && (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">{documentsError}</div>
        )}

        {!documentsError && documents.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
            No documents were returned for this verification.
          </div>
        )}

        {documents.map((doc) => (
          <div key={doc.document_id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-sm font-semibold text-foreground">
                {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
              </h2>
              <Badge tone={documentStatusTone(doc.status)}>{doc.status || 'unknown'}</Badge>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
              {doc.document_number && (
                <>
                  <dt>Document number</dt>
                  <dd className="text-foreground">{doc.document_number}</dd>
                </>
              )}
              {doc.issuing_authority && (
                <>
                  <dt>Issuing authority</dt>
                  <dd className="text-foreground">{doc.issuing_authority}</dd>
                </>
              )}
              {doc.expiry_date && (
                <>
                  <dt>Expiry date</dt>
                  <dd className="text-foreground">{doc.expiry_date}</dd>
                </>
              )}
            </dl>

            {doc.decline_reasons && doc.decline_reasons.length > 0 && (
              <p className="mt-2 text-xs text-danger">Decline reasons: {doc.decline_reasons.join(', ')}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4">
              {IMAGE_FIELDS.filter((field) => doc[field]).map((field) => (
                <figure key={field} className="w-56">
                  {/* eslint-disable-next-line @next/next/no-img-element -- proxied, non-static provider image */}
                  <img
                    src={`/api/kyc/documents/${doc.document_id}/image?field=${field}`}
                    alt={`${DOCUMENT_TYPE_LABELS[doc.type] || doc.type} — ${IMAGE_FIELD_LABELS[field]}`}
                    className="w-full rounded-xl border border-border object-cover"
                  />
                  <figcaption className="mt-1 text-center text-xs text-muted">{IMAGE_FIELD_LABELS[field]}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-4">
        <p className="mb-2 text-xs text-muted">Decision:</p>
        <KycStatusControls userId={user.id} />
      </div>
    </div>
  );
}
