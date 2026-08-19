const TONES: Record<string, string> = {
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  gray: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-50 text-blue-700',
};

export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof TONES {
  const normalized = status.toLowerCase();
  if (['approved', 'completed', 'active', 'open'].includes(normalized)) return 'green';
  if (['rejected', 'failed', 'suspended', 'cancelled'].includes(normalized)) return 'red';
  if (['pending', 'processing'].includes(normalized)) return 'yellow';
  return 'gray';
}
