import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

export async function POST(request: NextRequest) {
  const { email, otp, newPassword } = await request.json();

  const res = await fetch(`${API_BASE_URL}/auth/admin/reset-password-with-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    return NextResponse.json({ message: message || 'Could not reset password' }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
