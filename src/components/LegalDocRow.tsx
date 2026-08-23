'use client';

import { useState, useTransition } from 'react';
import { LegalDocument } from '@/lib/types';
import { deactivateLegalDocumentAction } from '@/lib/actions';
import { Badge } from '@/components/Badge';
import { LegalDocumentForm } from '@/components/LegalDocumentForm';

export function LegalDocRow({ doc }: { doc: LegalDocument }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading font-semibold text-foreground">{doc.title}</p>
          <p className="text-xs text-muted">
            {doc.type} · {doc.target} · v{doc.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={doc.isActive ? 'green' : 'gray'}>{doc.isActive ? 'Active' : 'Inactive'}</Badge>
          <button onClick={() => setIsEditing((v) => !v)} className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary">
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {doc.isActive && (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => deactivateLegalDocumentAction(doc.id))}
              className="rounded-full border border-danger/40 px-3 py-1 text-xs font-medium text-danger hover:bg-danger-bg disabled:opacity-50"
            >
              Deactivate
            </button>
          )}
        </div>
      </div>
      {isEditing && (
        <div className="mt-4">
          <LegalDocumentForm initial={doc} onDone={() => setIsEditing(false)} />
        </div>
      )}
    </div>
  );
}
