import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { LogoutButton } from '@/components/LogoutButton';
import { SESSION_COOKIE, isValidAdminSession } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!isValidAdminSession(token)) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <header className="flex h-14 items-center justify-end border-b border-border bg-card px-6">
          <LogoutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
