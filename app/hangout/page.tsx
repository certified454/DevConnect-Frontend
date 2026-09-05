'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  useToast,
} from '@/components/ui/toast';

interface HangoutHost {
  _id: string;
  username: string;
  profilePic?: string;
}

interface HangoutData {
  _id: string;
  host: HangoutHost;
  topic: string;
  channelName: string;
  status: 'Upcoming' | 'Live' | 'Ended';
  startedAt?: string;
  endedAt?: string;
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
}
type StatusFilter = 'Live' | 'Upcoming' | 'Ended';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const hangoutEndpoint = `${apiBaseUrl}/api/hangouts`;

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('authToken') ??
    window.sessionStorage.getItem('authToken') ??
    window.localStorage.getItem('token') ??
    ''
  );
}

function formatDuration(ms: number): string {
  const abs = Math.max(0, Math.abs(ms));
  const totalSeconds = Math.floor(abs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// ── Icons ──────────────────────────────────────────────────────────────
function CalendarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8Z" />
    </svg>
  );
}

function PlusIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function SignalIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 15v4M9 11v8M14 7v12M19 4v15" strokeLinecap="round" />
    </svg>
  );
}

function EmptyIllustration({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M4.5 20c1-3.4 4-5.4 7.5-5.4S18.5 16.6 19.5 20" strokeLinecap="round" />
    </svg>
  );
}

function DotGrid({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:20px_20px] ${className}`}
    />
  );
}

function StatChip({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'rose' | 'emerald';
}) {
  const toneClasses =
    tone === 'rose'
      ? 'border-rose-400/30 bg-rose-500/10 text-rose-300'
      : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300';
  return (
    <Box className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${toneClasses}`}>
      {tone === 'rose' ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> : null}
      <Text className={`font-mono text-xs font-semibold ${tone === 'rose' ? 'text-rose-300' : 'text-emerald-300'}`}>
        {value}
      </Text>
      <Text className={`text-xs ${tone === 'rose' ? 'text-rose-300/80' : 'text-emerald-300/80'}`}>{label}</Text>
    </Box>
  );
}

function AvatarBadge({ name, src, size = 'h-10 w-10' }: { name?: string; src?: string; size?: string }) {
  const initial = (name?.trim()?.[0] ?? 'D').toUpperCase();
  if (src) {
    return (
      <Avatar className={`${size} border border-slate-100 dark:border-slate-700`}>
        <AvatarImage source={{ uri: src }} />
      </Avatar>
    );
  }
  return (
    <Box
      className={`${size} flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10`}
    >
      <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{initial}</Text>
    </Box>
  );
}

function HangoutCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <Box className="flex-row items-center gap-3">
        <Box className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <Box className="flex-1 gap-2">
          <Box className="h-3 w-1/3 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <Box className="h-2.5 w-1/2 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </Box>
      </Box>
      <Box className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
      <Box className="mt-3 h-8 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
    </Card>
  );
}

function StatusPill({ status, scheduledAt, now }: { status: HangoutData['status']; scheduledAt: string; now: number }) {
  if (status === 'Live') {
    return (
      <Box className="flex-row items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 dark:bg-rose-500/10">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
        <Text className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Live now</Text>
      </Box>
    );
  }
  if (status === 'Upcoming') {
    const diff = new Date(scheduledAt).getTime() - now;
    return (
      <Box className="rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-500/10">
        <Text className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          {diff > 0 ? `starts in ${formatDuration(diff)}` : 'starting now'}
        </Text>
      </Box>
    );
  }
  return (
    <Box className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
      <Text className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ended</Text>
    </Box>
  );
}

function HangoutCard({
  hangout,
  now,
  onOpen,
}: {
  hangout: HangoutData;
  now: number;
  onOpen: (id: string, channelName: string) => void;
}) {
  const isEnded = hangout.status === 'Ended';
  const ctaLabel =
    hangout.status === 'Live'
      ? 'Join live'
      : hangout.status === 'Upcoming'
        ? 'View details'
        : 'View recap';

  const isLive = hangout.status === 'Live';

  return (
    <Card
      className={`w-full rounded-2xl bg-white p-4 shadow-md shadow-slate-200/50 transition hover:-translate-y-0.5 dark:bg-slate-900 dark:shadow-none ${
        isLive
          ? 'border border-l-4 border-l-rose-200/100 dark:border-rose-500/20 dark:border-l-rose-500'
          : 'border'
      } ${isEnded ? 'opacity-80' : ''}`}
    >
      <Box className="flex-row items-center justify-between gap-3">
        <Box className="flex-row items-center gap-3">
          <AvatarBadge name={hangout.host?.username} src={hangout.host?.profilePic} />
          <Box>
            <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {hangout.host?.username ?? 'DevConnect team'}
            </Text>
            <Text className="text-xs text-slate-400 dark:text-slate-500">Host</Text>
          </Box>
        </Box>
        <StatusPill status={hangout.status} scheduledAt={hangout.scheduledAt} now={now} />
      </Box>

      <Text className="mt-4 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
        {hangout.topic}
      </Text>

      <Box className="mt-4 flex-row items-center justify-between gap-3">
        <Box className="flex-row items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <CalendarIcon className="h-3.5 w-3.5" />
          <Text className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(hangout.scheduledAt).toLocaleString('en-NG', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </Box>
        <Button
          onPress={() => onOpen(hangout._id, hangout.channelName)}
          className={
            hangout.status === 'Live'
              ? 'rounded-full bg-rose-500 px-4 py-2'
              : hangout.status === 'Upcoming'
                ? 'rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                : 'rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800'
          }
        >
          <ButtonText
            className={
              hangout.status === 'Live'
                ? 'text-xs font-semibold text-white'
                : hangout.status === 'Upcoming'
                  ? 'text-xs font-semibold text-emerald-700 dark:text-emerald-300'
                  : 'text-xs font-semibold text-slate-500 dark:text-slate-400'
            }
          >
            {ctaLabel}
          </ButtonText>
        </Button>
      </Box>
    </Card>
  );
}

export default function HangoutListPage() {
  const [hangoutData, setHangoutData] = useState<HangoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusFilter>('Live');
  const [now, setNow] = useState(() => Date.now());
  const toast = useToast();
  const router = useRouter();

  const showToast = (title: string, message: string, action: 'success' | 'error') => {
    toast.show({
      render: ({ id }) => (
        <Toast
          key={id}
          action={action}
          className={`rounded-2xl border p-4 text-white shadow-2xl backdrop-blur-xl transition-all ${
            action === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/75 shadow-emerald-950/20'
              : 'border-red-500/40 bg-red-950/75 shadow-red-950/20'
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

  const redirectToCreateHangout = () => router.push('/hangout/create');
  const openHangout = (id: string, channelName: string) =>
    router.push(`/hangout/${id}?channelName=${encodeURIComponent(channelName)}`);

  const handleFetchCurrentUser = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/current-user`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      const user = data?.user ?? data;
      setIsAdmin(user.isAdmin ?? false);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleFetchHangoutData = async () => {
    setLoading(true);
    try {
      const response = await fetch(hangoutEndpoint, { method: 'GET' });
      const data = await response.json();

      if (!response.ok) {
        showToast('Error', data.message || 'Failed to fetch hangouts.', 'error');
        return;
      }

      const list = Array.isArray(data) ? data : (data.hangouts ?? []);
      setHangoutData(list);
    } catch (error) {
      console.error('Error fetching hangout data:', error);
      showToast('Error', 'An error occurred while fetching hangouts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchHangoutData();
    handleFetchCurrentUser();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const grouped = useMemo(() => {
    const live = hangoutData.filter((h) => h.status === 'Live');
    const upcoming = [...hangoutData.filter((h) => h.status === 'Upcoming')].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
    const ended = [...hangoutData.filter((h) => h.status === 'Ended')].sort(
      (a, b) => new Date(b.endedAt ?? b.scheduledAt).getTime() - new Date(a.endedAt ?? a.scheduledAt).getTime()
    );
    return { Live: live, Upcoming: upcoming, Ended: ended };
  }, [hangoutData]);

  useEffect(() => {
    if (loading) return;
    if (grouped.Live.length > 0) setActiveTab('Live');
    else if (grouped.Upcoming.length > 0) setActiveTab('Upcoming');
    else setActiveTab('Ended');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'Live', label: 'Live', count: grouped.Live.length },
    { key: 'Upcoming', label: 'Upcoming', count: grouped.Upcoming.length },
    { key: 'Ended', label: 'Ended', count: grouped.Ended.length },
  ];

  const visible = grouped[activeTab];

  const emptyCopy: Record<StatusFilter, { title: string; body: string }> = {
    Live: { title: 'No active channels right now', body: 'When a hangout goes live, it shows up here for everyone to join.' },
    Upcoming: {
      title: 'Nothing on the schedule',
      body: isAdmin ? 'Create one and it will appear here with a countdown.' : 'Check back soon — new hangouts get scheduled regularly.',
    },
    Ended: { title: 'No past hangouts yet', body: 'Recordings and recaps will show up here once a hangout wraps.' },
  };

  return (
    <Box className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-8 md:py-10">
      <Box className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Hero */}
        <Card className="relative w-full overflow-hidden border-none rounded-2xl bg-slate-900 p-6 text-white md:p-8">
          <DotGrid className="text-emerald-400" />
          <Box className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <Box className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Box className="max-w-xl">
              <Text className="mt-3 text-2xl font-bold leading-snug text-white md:text-3xl">
                DevConnect Hangouts
              </Text>
              <Text className="mt-1 text-xs text-slate-400 md:text-sm">
                Join live  Streams and experience the vibe, participate in discussions, or tune into scheduled streams.
              </Text>
              <Box className="mt-5 flex-row flex-wrap gap-2">
                <StatChip value={grouped.Live.length} label="live now" tone="rose" />
                <StatChip value={grouped.Upcoming.length} label="upcoming" tone="emerald" />
              </Box>
            </Box>

            {isAdmin ? (
              <Button
                onPress={redirectToCreateHangout}
                className="flex-row items-center gap-1.5 self-start rounded-full bg-emerald-500 px-5 py-3 transition hover:bg-emerald-400 md:self-auto"
              >
                <PlusIcon className="h-3.5 w-3.5 text-slate-950" />
                <ButtonText className="text-xs font-bold text-slate-950">Schedule Hangout</ButtonText>
              </Button>
            ) : null}
          </Box>
        </Card>

        {/* Tabs */}
        <Box className="inline-flex w-fit flex-row gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-300'
              }`}
            >
              <SignalIcon className="h-3 w-3" />
              {tab.label}
              <span
                className={`font-mono text-[10px] ${
                  activeTab === tab.key ? 'text-slate-950/70' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </Box>

        {/* List */}
        {loading ? (
          <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <HangoutCardSkeleton />
            <HangoutCardSkeleton />
          </Box>
        ) : visible.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 rounded-3xl border bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <Box className="flex h-14 w-14 items-center justify-center rounded-full border text-emerald-500 dark:border-emerald-500/30 dark:text-emerald-400">
              <EmptyIllustration />
            </Box>
            <Text className="text-base font-semibold text-slate-900 dark:text-slate-100">{emptyCopy[activeTab].title}</Text>
            <Text className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{emptyCopy[activeTab].body}</Text>
            {activeTab === 'Upcoming' && isAdmin ? (
              <Button onPress={redirectToCreateHangout} className="mt-1 rounded-full bg-emerald-500 px-4 py-2">
                <ButtonText className="text-sm font-semibold text-slate-950">Create Hangout</ButtonText>
              </Button>
            ) : null}
          </Card>
        ) : (
          <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visible.map((hangout) => (
              <HangoutCard key={hangout._id} hangout={hangout} now={now} onOpen={openHangout} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}