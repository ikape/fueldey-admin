const TONES: Record<string, string> = {
  green: 'bg-success-bg text-primary',
  red: 'bg-danger-bg text-danger',
  yellow: 'bg-warning-bg text-accent-foreground',
  gray: 'bg-border/60 text-muted',
  blue: 'bg-primary/10 text-primary',
};

export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
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
