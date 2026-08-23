import Link from 'next/link';

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

export function Sidebar() {
  return (
    <nav className="w-56 shrink-0 border-r border-border bg-card p-4">
      <p className="px-2 font-heading text-lg font-extrabold text-primary">FuelDey Admin</p>
      <ul className="mt-6 space-y-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-full px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-primary/10 hover:text-primary"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
