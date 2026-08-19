import { Sidebar } from '@/components/Sidebar';
import { LogoutButton } from '@/components/LogoutButton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1">
        <header className="flex h-14 items-center justify-end border-b border-slate-200 bg-white px-6">
          <LogoutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
