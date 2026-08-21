'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get('email') ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const toast = useToast();
  const router = useRouter();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const verifyUrl = `${apiBaseUrl}/api/auth/verify-otp`;
  const resendUrl = `${apiBaseUrl}/api/auth/resend-otp`;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const showToast = (title: string, message: string, action: 'success' | 'error') => {
    toast.show({
      render: ({ id }) => (
        <Toast
          key={id}
          action={action}
          className={`backdrop-blur-xl border shadow-2xl rounded-2xl p-4 text-white transition-all ${
            action === 'success'
              ? 'bg-emerald-950/75 border-emerald-500/40 shadow-emerald-950/20'
              : 'bg-red-950/75 border-red-500/40 shadow-red-950/20'
          }`}
        >
          <ToastTitle className={`text-sm font-semibold ${action === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {title}
          </ToastTitle>
          <ToastDescription className="text-xs opacity-90">{message}</ToastDescription>
        </Toast>
      ),
      placement: 'top',
      duration: 5000,
    });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      showToast('Missing info', 'Please enter your email and verification code.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showToast('Verification failed', data?.message || 'Unable to verify code.', 'error');
        return;
      }

      showToast('Verified', data?.message || 'Your account has been verified.', 'success');
      router.push('/auth/signin');
    } catch (error) {
      showToast(
        'Network error',
        error instanceof Error ? error.message : 'Unable to reach the server.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      showToast('Missing email', 'Please enter your email to resend the code.', 'error');
      return;
    }

    setIsResending(true);

    try {
      const res = await fetch(resendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showToast('Resend failed', data?.message || 'Unable to resend verification code.', 'error');
        return;
      }

      showToast('Code sent', data?.message || 'A new verification code was sent to your email.', 'success');
      setSecondsLeft(60);
    } catch (error) {
      showToast(
        'Network error',
        error instanceof Error ? error.message : 'Unable to reach the server.',
        'error'
      );
    } finally {
      setIsResending(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:p-10">
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Verify account</p>
            </div>
            <Link href="/auth/signin" className="rounded-full text-center border mt-6 border-slate-200 bg-slate-50 px-4 py-2 w-[10em] md:w-[15em] text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
              Back to sign in
            </Link>
          </div>

          <p className="mb-8 max-w-2xl text-sm leading-7 text-slate-600">
            A verification code was sent to your email. Enter the code below to complete registration. If you did not receive the code, you can use the resend verification code at the bottom.
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
              <label htmlFor="verify-email" className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
              <label htmlFor="verification-code" className="mb-2 block text-sm font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="verification-code"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter code here"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto"
              >
                {isLoading ? 'Verifying...' : 'Verify account'}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={secondsLeft > 0 || isResending}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isResending ? 'Resending...' : secondsLeft > 0 ? `Resend in ${formatCountdown(secondsLeft)}` : 'Resend verification code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm">
        Loading page verification...
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}