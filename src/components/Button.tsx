import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'danger' | 'dangerOutline' | 'outline' | 'ghost';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  danger: 'bg-danger text-white hover:opacity-90',
  dangerOutline: 'border border-danger/40 text-danger hover:bg-danger-bg',
  outline: 'border border-border bg-card text-foreground hover:border-primary hover:text-primary',
  ghost: 'text-foreground hover:bg-border/40',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-1.5 text-sm',
};

/** Shared button style so every admin action (approve/reject, suspend/delete,
 * pagination, etc.) reads as one consistent, deliberately-designed system
 * instead of ad-hoc Tailwind strings copied across components. */
export function Button({
  variant = 'outline',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold tracking-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
