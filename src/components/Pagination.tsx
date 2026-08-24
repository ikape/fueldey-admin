export function Pagination({
  page,
  limit,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  limit: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && key !== 'page') params.set(key, value);
    }
    params.set('page', String(targetPage));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted">
      <span>
        Page {page} of {totalPages} ({total} total)
      </span>
      <div className="flex gap-2">
        <a
          aria-disabled={page <= 1}
          href={page > 1 ? hrefFor(page - 1) : undefined}
          className={`rounded-full border border-border px-3 py-1 font-medium transition-colors duration-150 ${page <= 1 ? 'pointer-events-none opacity-40' : 'hover:border-primary hover:text-primary'}`}
        >
          Previous
        </a>
        <a
          aria-disabled={page >= totalPages}
          href={page < totalPages ? hrefFor(page + 1) : undefined}
          className={`rounded-full border border-border px-3 py-1 font-medium transition-colors duration-150 ${page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:border-primary hover:text-primary'}`}
        >
          Next
        </a>
      </div>
    </div>
  );
}
