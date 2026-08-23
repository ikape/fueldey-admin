import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';
import { SESSION_COOKIE, decodeJwtPayload } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ message: data?.message || 'Login failed' }, { status: res.status });
  }

  const payload = decodeJwtPayload(data.accessToken);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ message: 'This account does not have admin access.' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(payload.exp * 1000),
  });
  return response;
}
