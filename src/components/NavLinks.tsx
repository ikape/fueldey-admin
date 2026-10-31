'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items, pendingKyc }: { items: NavItem[]; pendingKyc: number | null }) {
  const pathname = usePathname();

  return (
    <ul className="mt-6 space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-between rounded-full px-3 py-2 text-sm font-medium ${
                active
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-foreground/80 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {item.label}
              {item.href === '/dashboard/kyc' && pendingKyc ? (
                <span
                  aria-label={`${pendingKyc} pending KYC requests`}
                  className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground"
                >
                  {pendingKyc}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
