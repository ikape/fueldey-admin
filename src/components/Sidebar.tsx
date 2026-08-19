import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/vendors', label: 'Vendors & Stations' },
  { href: '/dashboard/kyc', label: 'KYC Review' },
  { href: '/dashboard/wallet', label: 'Wallet' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/vehicles', label: 'Vehicles & Fleets' },
  { href: '/dashboard/reviews', label: 'Reviews' },
  { href: '/dashboard/legal', label: 'Legal' },
];

export function Sidebar() {
  return (
    <nav className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
      <p className="px-2 text-lg font-semibold text-slate-900">FuelDey Admin</p>
      <ul className="mt-6 space-y-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
