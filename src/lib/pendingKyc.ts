import { unstable_rethrow } from 'next/navigation';
import { api } from './api';

/** How many users are waiting for a KYC decision, for the sidebar badge. Returns null when it can't
 * be loaded — a badge is not worth failing every dashboard page over. */
export async function getPendingKycCount(): Promise<number | null> {
  try {
    const overview = await api.get<{ pendingKycCount?: number }>('/admin/overview');
    return typeof overview.pendingKycCount === 'number' ? overview.pendingKycCount : null;
  } catch (error) {
    // api.ts redirects to /login on an expired session by throwing; that has to keep going.
    unstable_rethrow(error);
    return null;
  }
}
