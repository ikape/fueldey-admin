import { unstable_rethrow } from 'next/navigation';

/** Run an optional dashboard fetch; null when it fails so one broken panel doesn't take the page down. */
export async function optional<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    // api.ts redirects to /login on an expired session by throwing; that has to keep going.
    unstable_rethrow(error);
    return null;
  }
}
