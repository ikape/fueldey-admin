'use client';

import { useState, useTransition } from 'react';
import { LegalDocument } from '@/lib/types';
import { deactivateLegalDocumentAction } from '@/lib/actions';
import { Badge } from '@/components/Badge';
import { LegalDocumentForm } from '@/components/LegalDocumentForm';
import { Button } from '@/components/Button';

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
          <Button variant="outline" size="sm" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {doc.isActive && (
            <Button
              variant="dangerOutline"
              size="sm"
              disabled={isPending}
              onClick={() => startTransition(() => deactivateLegalDocumentAction(doc.id))}
            >
              Deactivate
            </Button>
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
