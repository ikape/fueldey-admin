import Image from 'next/image';
import Link from 'next/link';
import { getPendingKycCount } from '@/lib/pendingKyc';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/commuters', label: 'Commuters' },
  { href: '/dashboard/vendors', label: 'Vendors' },
  { href: '/dashboard/stations', label: 'Stations' },
  { href: '/dashboard/kyc', label: 'KYC Review' },
  { href: '/dashboard/wallet', label: 'Wallet' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/vehicles', label: 'Vehicles & Fleets' },
  { href: '/dashboard/reviews', label: 'Reviews' },
  { href: '/dashboard/legal', label: 'Legal' },
];

export async function Sidebar() {
  const pendingKyc = await getPendingKycCount();

  return (
    <nav className="w-56 shrink-0 border-r border-border bg-card p-4">
      <div className="flex items-center gap-2 px-2">
        <Image src="/logo.png" alt="Que" width={28} height={28} className="rounded-lg" />
        <p className="font-heading text-lg font-extrabold text-primary">Que Admin</p>
      </div>
      <ul className="mt-6 space-y-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center justify-between rounded-full px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-primary/10 hover:text-primary"
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
        ))}
      </ul>
    </nav>
  );
}
