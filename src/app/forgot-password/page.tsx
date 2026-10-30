'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const INPUT_CLASS =
  'mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function post(url: string, body: Record<string, string>) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (step === 'email') {
        await post('/api/auth/forgot-password', { email });
        setStep('reset');
      } else {
        await post('/api/auth/reset-password', { email, otp, newPassword });
        router.push('/login?reset=1');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm">
        <Image src="/logo.png" alt="Que" width={48} height={48} className="mx-auto rounded-xl" />
        <h1 className="mt-4 text-center font-heading text-2xl font-extrabold text-foreground">Reset password</h1>
        <p className="mt-1 text-center text-sm text-muted">
          {step === 'email'
            ? 'Enter your admin email and we will send you a 5-digit code.'
            : 'If that email belongs to an admin, a code is on its way. Enter it below with your new password.'}
        </p>

        {error && <div className="mt-4 rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              disabled={step === 'reset'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          {step === 'reset' && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground">5-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">New password</label>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
                <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-primary px-3 py-2.5 font-heading text-sm font-bold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Please wait…' : step === 'email' ? 'Send code' : 'Reset password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
