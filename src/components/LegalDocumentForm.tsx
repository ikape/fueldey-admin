'use client';

import { useState, useTransition } from 'react';
import { createLegalDocumentAction, updateLegalDocumentAction } from '@/lib/actions';
import { LegalDocument } from '@/lib/types';

export function LegalDocumentForm({ initial, onDone }: { initial?: LegalDocument; onDone?: () => void }) {
  const [type, setType] = useState(initial?.type || 'terms_of_service');
  const [target, setTarget] = useState(initial?.target || 'both');
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [version, setVersion] = useState(initial?.version || '');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (initial) {
        await updateLegalDocumentAction(initial.id, { title, content, version });
      } else {
        await createLegalDocumentAction({ type, target, title, content, version });
        setTitle('');
        setContent('');
        setVersion('');
      }
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      {!initial && (
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
            <option value="terms_of_service">Terms of service</option>
            <option value="privacy_policy">Privacy policy</option>
          </select>
          <select value={target} onChange={(e) => setTarget(e.target.value as typeof target)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
            <option value="both">Both</option>
            <option value="users">Users</option>
            <option value="vendors">Vendors</option>
          </select>
        </div>
      )}
      <input
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
      <input
        type="text"
        required
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        placeholder="Version (e.g. 1.0)"
        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
      <textarea
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        rows={6}
        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
      <button type="submit" disabled={isPending} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50">
        {initial ? 'Save changes' : 'Publish document'}
      </button>
    </form>
  );
}
