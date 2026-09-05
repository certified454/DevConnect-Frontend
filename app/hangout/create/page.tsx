'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Toast, ToastTitle, ToastDescription, useToast } from '@/components/ui/toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('authToken') ??
    window.sessionStorage.getItem('authToken') ??
    window.localStorage.getItem('token') ??
    ''
  );
}

function minDateTimeLocal(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Icons — same visual language as the hangout list page ─────────────
function CalendarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8Z" />
    </svg>
  );
}

function MessageIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 3.6A7.96 7.96 0 0 1 21 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2 3 14h6l-1 8 11-14h-6l0-6Z" />
    </svg>
  );
}

function MicIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowLeftIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
      <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotGrid({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:20px_20px] ${className}`}
    />
  );
}

type AccessState = 'checking' | 'denied' | 'signedOut' | 'allowed';

// A trimmed-down echo of the real HangoutCard from /hangout — shows the
// admin exactly what they're about to publish before they publish it.
function SchedulePreview({ topic, scheduledAt }: { topic: string; scheduledAt: string }) {
  const hasTopic = topic.trim().length > 0;
  const hasDate = scheduledAt.length > 0;
  const scheduledDate = hasDate ? new Date(scheduledAt) : null;
  const isValidDate = scheduledDate && !Number.isNaN(scheduledDate.getTime());

  return (
    <Box className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
      <Box className="flex-row items-center justify-between">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Preview</Text>
        <Box className="rounded-full bg-emerald-500/10 px-2 py-0.5">
          <Text className="font-mono text-[10px] font-semibold text-emerald-300">upcoming</Text>
        </Box>
      </Box>

      <Text className={`mt-2.5 text-sm font-semibold leading-snug ${hasTopic ? 'text-white' : 'text-slate-600'}`}>
        {hasTopic ? topic : 'Your topic will appear here'}
      </Text>

      <Box className="mt-3 flex-row items-center gap-1.5 text-slate-500">
        <CalendarIcon className="h-3.5 w-3.5" />
        <Text className="font-mono text-xs text-slate-500">
          {isValidDate
            ? scheduledDate!.toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
            : 'pick a start time'}
        </Text>
      </Box>

      <Box className="mt-3">
        <span className="rounded-md border border-slate-800 bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
          #hangout-pending
        </span>
      </Box>
    </Box>
  );
}

export default function CreateHangoutPage() {
  const [access, setAccess] = useState<AccessState>('checking');
  const [topic, setTopic] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const floor = minDateTimeLocal();

  const showToast = (title: string, message: string, action: 'success' | 'error') => {
    toast.show({
      render: ({ id }) => (
        <Toast
          key={id}
          action={action}
          className={`rounded-2xl border p-4 text-white shadow-2xl backdrop-blur-xl transition-all ${
            action === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/85 shadow-emerald-950/30'
              : 'border-red-500/40 bg-red-950/85 shadow-red-950/30'
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

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAccess('signedOut');
      return;
    }
    fetch(`${apiBaseUrl}/api/auth/current-user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const user = data?.user ?? data;
        setAccess(user.isAdmin ? 'allowed' : 'denied');
      })
      .catch(() => setAccess('denied'));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!topic.trim()) {
      showToast('Missing topic', 'Give the hangout a topic before creating it.', 'error');
      return;
    }
    if (!scheduledAt) {
      showToast('Missing start time', 'Pick when the hangout should go live.', 'error');
      return;
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate.getTime() <= Date.now()) {
      showToast('Invalid start time', 'The start time has to be in the future.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch(`${apiBaseUrl}/api/hangouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          scheduledAt: scheduledDate.toISOString(),
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showToast('Could not create hangout', data?.message || 'Something went wrong.', 'error');
        return;
      }

      showToast('Hangout created', 'It will go live automatically at the scheduled time.', 'success');
      router.push('/hangout');
    } catch (error) {
      console.error('Create hangout error:', error);
      showToast('Connection error', 'Could not reach the server. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (access === 'checking') {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-950">
        <Text className="text-sm text-slate-400">Checking access…</Text>
      </Box>
    );
  }

  if (access === 'signedOut' || access === 'denied') {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <Card className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center backdrop-blur-xl shadow-2xl">
          <Text className="text-xl font-bold text-slate-100">
            {access === 'signedOut' ? 'Sign in required' : 'Admins only'}
          </Text>
          <Text className="mt-2 text-sm text-slate-400">
            {access === 'signedOut'
              ? 'Sign in with an admin account to host interactive developer sessions.'
              : "Your account doesn't have permission to schedule a hangout."}
          </Text>
          <Link
            href={access === 'signedOut' ? '/auth/signin' : '/hangout'}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            {access === 'signedOut' ? 'Sign in' : 'Back to hangouts'}
          </Link>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="flex min-h-screen items-center justify-center bg-emerald-950/10 px-4 py-8 dark:bg-slate-950">
      <Box className="mx-auto w-full max-w-5xl">
        <Card className="grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:grid-cols-12">
          {/* Left panel — same dark treatment as sign-in */}
          <Box className="relative flex flex-col justify-between overflow-hidden bg-slate-950 p-8 md:col-span-5">
            <DotGrid className="text-emerald-400" />
            <Box className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <Box className="relative z-10">
              <Box className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                DevConnect Audio
              </Box>
              <Text className="mt-6 text-2xl font-bold leading-tight text-white md:text-3xl">
                Host a session for the community
              </Text>
              <Text className="mt-3 text-xs leading-relaxed text-slate-400">
                Schedule topics, invite speakers, and bring developers together live.
              </Text>

              <Box className="mt-8 space-y-3">
                <Box className="flex-row items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
                  <Box className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <BoltIcon />
                  </Box>
                  <Box>
                    <Text className="text-xs font-semibold text-slate-200">Automatic go-live</Text>
                    <Text className="mt-0.5 text-[11px] text-slate-400">Rooms trigger live status on schedule automatically.</Text>
                  </Box>
                </Box>
                <Box className="flex-row items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
                  <Box className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <MicIcon />
                  </Box>
                  <Box>
                    <Text className="text-xs font-semibold text-slate-200">High-quality audio & video</Text>
                    <Text className="mt-0.5 text-[11px] text-slate-400">Stream seamlessly to audience members nationwide.</Text>
                  </Box>
                </Box>
              </Box>

              <Box className="mt-6">
                <SchedulePreview topic={topic} scheduledAt={scheduledAt} />
              </Box>
            </Box>

            <Link
              href="/hangout"
              className="relative z-10 mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-emerald-400"
            >
              <ArrowLeftIcon />
              Back to hangouts
            </Link>
          </Box>

          {/* Right panel — the form, styled like sign-in's form */}
          <Box className="flex flex-col justify-center p-6 md:col-span-7 md:p-10">
            <Box className="mb-6 flex items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                New Hangout
              </Text>
              <Link href="/hangout" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden">
                Cancel
              </Link>
            </Box>

            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">Schedule details</Text>
            <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Fill in the details below to set up your interactive hangout page.
            </Text>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <Box className="mb-1.5 flex-row items-center justify-between">
                  <label htmlFor="topic" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Topic or title
                  </label>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{topic.length}/140</span>
                </Box>
                <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <MessageIcon className="h-3.5 w-3.5" />
                  </span>
                  <input
                    id="topic"
                    type="text"
                    required
                    maxLength={140}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Building scalable Next.js apps in 2026"
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="scheduledAt" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Scheduled start time
                </label>
                <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CalendarIcon className="h-3.5 w-3.5" />
                  </span>
                  <input
                    id="scheduledAt"
                    type="datetime-local"
                    required
                    min={floor}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Creating hangout…
                  </>
                ) : (
                  'Schedule hangout'
                )}
              </button>
            </form>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}