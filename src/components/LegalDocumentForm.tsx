'use client';

import { useState, useTransition } from 'react';
import { createLegalDocumentAction, updateLegalDocumentAction } from '@/lib/actions';
import { LegalDocument } from '@/lib/types';
import { Button } from '@/components/Button';

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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      {!initial && (
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
            <option value="terms_of_service">Terms of service</option>
            <option value="privacy_policy">Privacy policy</option>
          </select>
          <select value={target} onChange={(e) => setTarget(e.target.value as typeof target)} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
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
        className="w-full rounded-full border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <input
        type="text"
        required
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        placeholder="Version (e.g. 1.0)"
        className="w-full rounded-full border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <textarea
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        rows={6}
        className="w-full rounded-2xl border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <Button type="submit" variant="primary" disabled={isPending} className="font-heading">
        {initial ? 'Save changes' : 'Publish document'}
      </Button>
    </form>
  );
}
