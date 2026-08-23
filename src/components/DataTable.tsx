export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({ columns, rows, emptyMessage = 'No results.' }: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-background">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-2 text-left font-medium text-muted">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-3 whitespace-nowrap text-foreground">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
