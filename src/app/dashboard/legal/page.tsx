import { api } from '@/lib/api';
import { LegalDocument } from '@/lib/types';
import { LegalDocRow } from '@/components/LegalDocRow';
import { LegalDocumentForm } from '@/components/LegalDocumentForm';

export default async function LegalPage() {
  const documents = await api.get<LegalDocument[]>('/legal');

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-xl font-bold text-foreground">Legal documents</h1>

      <div className="mt-4 space-y-3">
        {documents.length === 0 && (
          <p className="text-sm text-muted">No legal documents published yet.</p>
        )}
        {documents.map((doc) => (
          <LegalDocRow key={doc.id} doc={doc} />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-sm font-semibold text-foreground">Publish a new document</h2>
        <p className="text-xs text-muted">Publishing auto-deactivates the previous active document of the same type and target.</p>
        <div className="mt-2">
          <LegalDocumentForm />
        </div>
      </div>
    </div>
  );
}
