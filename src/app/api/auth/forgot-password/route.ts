import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  const res = await fetch(`${API_BASE_URL}/auth/admin/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json({ message: data?.message || 'Could not send the code' }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
