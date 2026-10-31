import Image from 'next/image';
import { NavLinks } from './NavLinks';
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
      <NavLinks items={NAV_ITEMS} pendingKyc={pendingKyc} />
    </nav>
  );
}
