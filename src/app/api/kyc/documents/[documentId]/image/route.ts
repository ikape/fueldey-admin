import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/api';
import { SESSION_COOKIE } from '@/lib/auth';

/**
 * Proxies a single KYC document image through our own server. The admin
 * browser never sees KYCAID's raw file URL or our KYCAID API key — both stay
 * server-side, on both the Next.js backend-for-frontend hop and the NestJS
 * backend hop (which does the actual KYCAID fetch).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const field = request.nextUrl.searchParams.get('field');
  if (!field) {
    return NextResponse.json({ message: 'field is required' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const res = await fetch(
    `${API_BASE_URL}/kycaid/admin/documents/${documentId}/image?field=${encodeURIComponent(field)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return NextResponse.json({ message: text || 'Failed to load document image' }, { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': res.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'no-store',
    },
  });
}
