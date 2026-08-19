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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-900">{doc.title}</p>
          <p className="text-xs text-slate-500">
            {doc.type} · {doc.target} · v{doc.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={doc.isActive ? 'green' : 'gray'}>{doc.isActive ? 'Active' : 'Inactive'}</Badge>
          <button onClick={() => setIsEditing((v) => !v)} className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {doc.isActive && (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => deactivateLegalDocumentAction(doc.id))}
              className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
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
