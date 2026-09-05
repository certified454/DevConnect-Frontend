'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

const FALLBACK_AVATAR =
  'https://th.bing.com/th/id/OIP.AhjRvsXgcvfCcr8Zj07lcgHaE7?w=280&h=187&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3';
const MAX_CONCURRENT_SCREEN_SHARES = 2;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? '';

// ── Types ────────────────────────────────────────────────────────────────
interface HangoutUser {
  _id: string;
  username: string;
  profilePic?: string;
}
interface HangoutParticipant {
  user: HangoutUser;
  role: 'host' | 'speaker' | 'viewer';
  handRaised: boolean;
  muted: boolean;
  sharingScreen: boolean;
  canShareScreen: boolean;
}
interface HangoutMessage {
  _id: string;
  user: HangoutUser;
  text: string;
  createdAt: string;
}
interface HangoutDetail {
  _id: string;
  host: HangoutUser;
  topic: string;
  channelName: string;
  status: 'Upcoming' | 'Live' | 'Ended';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  participant: HangoutParticipant[];
  messages: HangoutMessage[];
}
interface CurrentUser {
  id: string;
  username: string;
  role?: string;
  profilePic?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('authToken') ??
    window.sessionStorage.getItem('authToken') ??
    window.localStorage.getItem('token') ??
    ''
  );
}

function authHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${days > 0 ? `${days}d ` : ''}${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
}

let agoraSdkPromise: Promise<typeof import('agora-rtc-sdk-ng')> | null = null;
function loadAgoraSdk() {
  if (!agoraSdkPromise) agoraSdkPromise = import('agora-rtc-sdk-ng');
  return agoraSdkPromise;
}
let socketPromise: Promise<typeof import('socket.io-client')> | null = null;
function loadSocketIo() {
  if (!socketPromise) socketPromise = import('socket.io-client');
  return socketPromise;
}

async function fetchAgoraToken(channel: string, uid: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${apiBaseUrl}/api/agora-token?channelName=${encodeURIComponent(channel)}&uid=${encodeURIComponent(uid)}`,
      { headers: authHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.token ?? null;
  } catch {
    return null;
  }
}

function AgoraVideoView({
  track,
  className,
  mirror,
  objectFit = 'cover',
}: {
  track: any;
  className?: string;
  mirror?: boolean;
  objectFit?: 'contain' | 'cover';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (track && containerRef.current) {
      track.play(containerRef.current, { fit: objectFit, mirror: !!mirror });
      const video = containerRef.current.querySelector('video');
      if (video) video.style.objectFit = objectFit;
    }
    return () => {
      try {
        track?.stop();
      } catch {
        // Track might already be closed
      }
    };
  }, [track, mirror, objectFit]);
  return <div ref={containerRef} className={className} />;
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MicOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9V6a3 3 0 0 0-5.12-2.12M5 11a7 7 0 0 0 12.73 4.05M5 5l14 14M12 19v3M8 22h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function HangoutRoomPage() {
  const params = useParams<{ id: string }>();
  const hangoutId = params.id;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [hangout, setHangout] = useState<HangoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Agora
  const [agoraConnected, setAgoraConnected] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localScreenTrack, setLocalScreenTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<Record<string, any>>({});
  const [micEnabled, setMicEnabled] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Room UI
  const [roomPanelOpen, setRoomPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'people'>('chat');
  const [draft, setDraft] = useState('');
  const [chromeHidden, setChromeHidden] = useState(false);

  const clientRef = useRef<any>(null);
  const screenClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  // ── Auth ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthChecked(true);
      return;
    }
    fetch(`${apiBaseUrl}/api/auth/current-user`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const user = data?.user ?? data;
        setCurrentUser({ id: user._id ?? user.id, username: user.username, role: user.role, profilePic: user.profilePic });
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // ── Fetch hangout ────────────────────────────────────────────────────
  const fetchHangout = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}`);
      const data = await res.json();
      if (res.ok && data.hangout) setHangout(data.hangout);
    } catch (err) {
      console.error('fetchHangout error:', err);
    } finally {
      setLoading(false);
    }
  }, [hangoutId]);

  useEffect(() => {
    fetchHangout();
  }, [fetchHangout]);

  useEffect(() => {
    if (!currentUser || !hangout || hangout.status === 'Ended') return;
    const alreadyIn = hangout.participant.some((p) => p.user._id === currentUser.id);
    if (alreadyIn) return;
    fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/join`, { method: 'POST', headers: authHeaders() })
      .then(() => fetchHangout())
      .catch((err) => console.error('auto-join error:', err));
  }, [currentUser, hangout, hangoutId, fetchHangout]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Socket ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hangoutId) return;
    let cancelled = false;

    (async () => {
      const { io } = await loadSocketIo();
      if (cancelled) return;
      const socket = io(apiBaseUrl!, { transports: ['websocket'] });
      socketRef.current = socket;
      socket.emit('join-hangout', hangoutId);

      socket.on('hangout-action', (event: { action: string; payload: any }) => {
        if (event.action === 'new-message') {
          setHangout((current) =>
            current ? { ...current, messages: [...current.messages, event.payload] } : current
          );
          return;
        }
        fetchHangout();
      });
    })();

    return () => {
      cancelled = true;
      socketRef.current?.emit('leave-hangout', hangoutId);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [hangoutId, fetchHangout]);

  // ── Derived state ─────────────────────────────────────────────────────
  const selfParticipant = hangout?.participant.find((p) => p.user._id === currentUser?.id) ?? null;
  const isRoomHost = !!currentUser && hangout?.host._id === currentUser.id;
  const isHostOrAdmin =
    !!currentUser && (hangout?.host._id === currentUser.id || currentUser.role === 'admin');
  const isViewer = !isRoomHost && selfParticipant?.role === 'viewer';
  const canSpeak =
    !!selfParticipant &&
    (isRoomHost || (selfParticipant.role !== 'viewer' && !selfParticipant.muted)) &&
    micEnabled;

  const screenSharers = hangout?.participant.filter((p) => p.sharingScreen).slice(0, MAX_CONCURRENT_SCREEN_SHARES) ?? [];
  const isFocusMode = screenSharers.length > 0;
  const showChrome = !isFocusMode || !chromeHidden;

  useEffect(() => {
    setChromeHidden(isFocusMode);
  }, [isFocusMode]);

  // ── Agora Connections ────────────────────────────────────────────────
  const publishSelfMedia = async () => {
    const client = clientRef.current;
    if (!client || !currentUser) return;
    const { default: AgoraRTC } = await loadAgoraSdk();

    const tracksToPublish: any[] = [];
    if (!localAudioTrackRef.current) {
      localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
    }
    localAudioTrackRef.current.setEnabled(true);
    tracksToPublish.push(localAudioTrackRef.current);

    if (hangout?.host._id === currentUser.id && !localVideoTrack) {
      const camTrack = await AgoraRTC.createCameraVideoTrack();
      setLocalVideoTrack(camTrack);
      tracksToPublish.push(camTrack);
    }

    const already = new Set(client.localTracks ?? []);
    const fresh = tracksToPublish.filter((t) => t && !already.has(t));
    if (fresh.length) await client.publish(fresh);
    localAudioTrackRef.current.setEnabled(canSpeak);
  };

  const cleanupSelfMedia = async () => {
    const client = clientRef.current;
    const tracks = [localAudioTrackRef.current, localVideoTrack].filter(Boolean);
    if (client && tracks.length) {
      try {
        await client.unpublish(tracks);
      } catch {
        // Ignore unpublish errors on teardown
      }
    }
    localAudioTrackRef.current?.close();
    localAudioTrackRef.current = null;
    if (localVideoTrack) {
      localVideoTrack.close();
      setLocalVideoTrack(null);
    }
  };

  useEffect(() => {
    if (!hangout || hangout.status !== 'Live' || !currentUser || !selfParticipant) return;
    if (!AGORA_APP_ID) {
      setShareError('Missing Agora App ID — set NEXT_PUBLIC_AGORA_APP_ID in your environment.');
      return;
    }

    let cancelled = false;

    (async () => {
      const { default: AgoraRTC } = await loadAgoraSdk();
      if (cancelled) return;

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      client.on('token-privilege-will-expire', async () => {
        const freshToken = await fetchAgoraToken(hangout.channelName, currentUser.id);
        if (freshToken) await client.renewToken(freshToken);
      });

      client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') user.audioTrack?.play();
        setRemoteUsers((cur) => ({ ...cur, [String(user.uid)]: user }));
      });
      client.on('user-unpublished', (user: any) => {
        setRemoteUsers((cur) => ({ ...cur, [String(user.uid)]: user }));
      });
      client.on('user-left', (user: any) => {
        setRemoteUsers((cur) => {
          const next = { ...cur };
          delete next[String(user.uid)];
          return next;
        });
      });

      try {
        const role = isRoomHost || selfParticipant.role !== 'viewer' ? 'host' : 'audience';
        await client.setClientRole(role);
        const token = await fetchAgoraToken(hangout.channelName, currentUser.id);
        await client.join(AGORA_APP_ID, hangout.channelName, token, currentUser.id);
        if (cancelled) return;
        setAgoraConnected(true);
        if (role === 'host') await publishSelfMedia();
      } catch (err) {
        console.error('Agora join failed', err);
        if (!cancelled) setShareError('Could not connect to the live channel.');
      }
    })();

    return () => {
      cancelled = true;
      void cleanupSelfMedia();
      const client = clientRef.current;
      if (client) {
        client.removeAllListeners();
        client.leave().catch(() => {});
      }
      clientRef.current = null;
      setAgoraConnected(false);
      setRemoteUsers({});
    };
  }, [hangout?.status, hangout?.channelName, currentUser?.id]);

  useEffect(() => {
    if (!agoraConnected || !clientRef.current || !selfParticipant) return;
    (async () => {
      const shouldPublish = isRoomHost || selfParticipant.role !== 'viewer';
      if (shouldPublish && !selfParticipant.muted) setMicEnabled(true);
      try {
        await clientRef.current.setClientRole(shouldPublish ? 'host' : 'audience');
        if (shouldPublish) await publishSelfMedia();
        else await cleanupSelfMedia();
      } catch (err) {
        console.error('Failed to update Agora role', err);
      }
    })();
  }, [selfParticipant?.role, agoraConnected]);

  useEffect(() => {
    localAudioTrackRef.current?.setEnabled(canSpeak);
  }, [canSpeak]);

  // ── Screen Share Handler ─────────────────────────────────────────────
  const startMyScreenShare = async () => {
    if (!currentUser || !hangout) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/start-screen-share`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setShareError(data?.message || 'Could not start screen share.');
        return;
      }

      const { default: AgoraRTC } = await loadAgoraSdk();
      const created = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '1080p_1' }, 'auto');
      const videoTrack = Array.isArray(created) ? created[0] : created;
      const audioTrack = Array.isArray(created) ? created[1] : undefined;

      const screenUid = `${currentUser.id}-screen`;
      const screenClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      await screenClient.setClientRole('host');
      const token = await fetchAgoraToken(hangout.channelName, screenUid);
      await screenClient.join(AGORA_APP_ID, hangout.channelName, token, screenUid);
      await screenClient.publish(audioTrack ? [videoTrack, audioTrack] : [videoTrack]);

      videoTrack.on('track-ended', () => void stopMyScreenShare());

      screenClientRef.current = screenClient;
      setLocalScreenTrack(videoTrack);
      setShareError(null);
      fetchHangout();
    } catch (err) {
      console.error('Screen share failed', err);
      setShareError('Screen share permission was denied or cancelled.');
      fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/stop-screen-share`, { method: 'POST', headers: authHeaders() }).catch(() => {});
    }
  };

  const stopMyScreenShare = async () => {
    const client = screenClientRef.current;
    if (client) {
      try {
        await client.leave();
      } catch {
        // Ignore leave errors
      }
    }
    screenClientRef.current = null;
    setLocalScreenTrack((cur: any) => {
      cur?.close();
      return null;
    });
    try {
      await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/stop-screen-share`, { method: 'POST', headers: authHeaders() });
    } catch (err) {
      console.error('stop-screen-share error:', err);
    }
    fetchHangout();
  };

  // ── Control Actions ──────────────────────────────────────────────────
  const raiseHand = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/raise-hand`, { method: 'POST', headers: authHeaders() });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error('raiseHand failed:', res.status, data);
      }
      fetchHangout();
    } catch (err) {
      console.error('raiseHand error:', err);
    }
  };

  const admitSpeaker = async (userId: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/admit-speaker/${userId}`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error('admitSpeaker failed:', res.status, data);
      }
    } catch (err) {
      console.error('admitSpeaker error:', err);
    }
    fetchHangout();
  };

  const toggleMuteRemote = async (userId: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/toggle-mute/${userId}`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error('toggleMuteRemote failed:', res.status, data);
      }
    } catch (err) {
      console.error('toggleMuteRemote error:', err);
    }
    fetchHangout();
  };

  const setScreenAccess = async (userId: string, allow: boolean) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/set-screen-share-access/${userId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ allow }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error('setScreenAccess failed:', res.status, data);
      }
    } catch (err) {
      console.error('setScreenAccess error:', err);
    }
    fetchHangout();
  };

  const endHangout = async () => {
    await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/end-hangout`, { method: 'PATCH', headers: authHeaders() });
    fetchHangout();
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft('');
    try {
      await fetch(`${apiBaseUrl}/api/hangouts/${hangoutId}/post-message`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      console.error('postMessage error:', err);
    }
  };

  const toggleMic = () => setMicEnabled((cur) => !cur);

  const findScreenTrack = (userId: string) => {
    if (userId === currentUser?.id) return localScreenTrack;
    return remoteUsers[`${userId}-screen`]?.videoTrack ?? null;
  };

  // ── Render States ────────────────────────────────────────────────────
  if (!authChecked || loading) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Text className="text-sm text-slate-400">Loading hangout…</Text>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <Card className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sign in required</Text>
          <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to join this hangout.</Text>
          <Link
            href="/auth/signin"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Sign in
          </Link>
        </Card>
      </Box>
    );
  }

  if (!hangout) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <Card className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">Hangout not found</Text>
          <Link
            href="/hangout"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Back to hangouts
          </Link>
        </Card>
      </Box>
    );
  }

  if (hangout.status === 'Upcoming') {
    const diff = new Date(hangout.scheduledAt).getTime() - now;
    return (
      <Box className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.1),_transparent_55%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
        <Card className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white/90 p-8 text-center backdrop-blur dark:border-emerald-500/20 dark:bg-slate-900/80">
          <Avatar className="mx-auto h-14 w-14 border-2 border-white shadow-sm dark:border-slate-700">
            <AvatarImage source={{ uri: hangout.host?.profilePic ?? FALLBACK_AVATAR }} />
          </Avatar>
          <Text className="mt-3 text-xs font-semibold tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            NOT LIVE YET
          </Text>
          <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{hangout.topic}</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hosted by @{hangout.host?.username}</Text>
          <Text className="mt-6 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {diff > 0 ? formatClock(diff) : 'Starting any moment'}
          </Text>
          <Text className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            It goes live automatically — this page updates on its own, no need to refresh.
          </Text>
          <Link
            href="/hangout"
            className="mt-6 inline-block text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            ← Back to hangouts
          </Link>
        </Card>
      </Box>
    );
  }

  if (hangout.status === 'Ended') {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <Card className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Box className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Text className="text-sm font-semibold text-slate-400">•</Text>
          </Box>
          <Text className="mt-3 text-xs font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500">ENDED</Text>
          <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{hangout.topic}</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hosted by @{hangout.host?.username}</Text>
          <Text className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            {hangout.participant.length} people joined this hangout.
          </Text>
          <Link
            href="/hangout"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Back to hangouts
          </Link>
        </Card>
      </Box>
    );
  }

  // Render sharer tile: prevents infinite mirror when local user shares
  const renderSharerTile = (sharer: HangoutParticipant) => {
    const isSelfSharing = sharer.user._id === currentUser?.id;
    const track = findScreenTrack(sharer.user._id);

    return (
      <Box key={sharer.user._id} className="flex min-h-[360px] w-full flex-col rounded-[1.5rem] border border-emerald-500/30 bg-slate-900/70 p-4">
        <Box className="flex items-center justify-between gap-2">
          <Text className="text-sm font-semibold text-white">{sharer.user.username}&rsquo;s screen</Text>
          <Box className="rounded-full bg-emerald-500/15 px-2.5 py-1">
            <Text className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">Live Share</Text>
          </Box>
        </Box>
        
        {isSelfSharing ? (
          <Box className="mt-3 flex flex-1 flex-col items-center justify-center rounded-[1.1rem] border border-dashed border-emerald-500/40 bg-slate-950/80 p-6 text-center">
            <Text className="text-base font-semibold text-emerald-400">You are sharing your screen</Text>
            <Text className="mt-1 text-xs text-slate-400">To prevent screen echo, your preview is paused here.</Text>
            <Button onPress={stopMyScreenShare} className="mt-4 rounded-full bg-rose-600 px-4 py-2">
              <ButtonText className="text-xs font-semibold text-white">Stop Sharing</ButtonText>
            </Button>
          </Box>
        ) : track ? (
          <AgoraVideoView
            track={track}
            className="mt-3 min-h-0 w-full flex-1 overflow-hidden rounded-[1.1rem]"
            objectFit="contain"
          />
        ) : (
          <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
            <Text className="text-sm text-slate-300">Connecting feed…</Text>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box className="min-h-screen bg-slate-950 text-slate-100">
      <Box className={`mx-auto flex w-full max-w-[1700px] flex-col gap-4 ${isFocusMode && chromeHidden ? 'p-2' : 'p-3 md:p-5'}`}>
        
        {/* Top bar controls */}
        <Box className="flex w-full flex-row flex-wrap gap-4">
          {showChrome ? (
            <Box className="flex flex-1 min-w-[260px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <Box className="flex items-center gap-3">
                <Box className={`rounded-full px-3 py-1 ${agoraConnected ? 'bg-rose-500/20' : 'bg-slate-700/40'}`}>
                  <Text className={`text-xs font-semibold uppercase tracking-[0.25em] ${agoraConnected ? 'text-rose-300' : 'text-slate-400'}`}>
                    {agoraConnected ? 'Live' : 'Connecting…'}
                  </Text>
                </Box>
                <Text className="text-sm text-slate-400">{hangout.topic}</Text>
              </Box>
              {isHostOrAdmin ? (
                <Button onPress={endHangout} className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-2">
                  <ButtonText className="text-sm font-semibold text-center text-rose-300">End stream</ButtonText>
                </Button>
              ) : null}
            </Box>
          ) : (
            <Box className="flex flex-1 justify-center">
              <Button onPress={() => setChromeHidden(false)} className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                <ButtonText className="text-xs font-semibold text-slate-300">Show room controls</ButtonText>
              </Button>
            </Box>
          )}

          {showChrome ? (
            <Box className="flex flex-1 min-w-[260px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <Box className="flex flex-wrap gap-2">
                {isViewer ? (
                  <>
                    <Button
                      onPress={raiseHand}
                      disabled={selfParticipant.handRaised}
                      className={selfParticipant.handRaised ? 'rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-2' : 'rounded-full bg-emerald-600 px-3 py-2'}
                    >
                      <ButtonText className="text-sm font-semibold text-white">
                        {selfParticipant.handRaised ? 'Hand raised' : 'Raise hand to speak'}
                      </ButtonText>
                    </Button>
                    <Button
                      disabled
                      aria-label="Microphone available after admission"
                      className="rounded-full border border-slate-700 bg-slate-900 p-2 opacity-60"
                    >
                      <Box className="text-slate-300"><MicOffIcon /></Box>
                    </Button>
                  </>
                ) : (
                  <Button onPress={toggleMic} className={canSpeak ? 'rounded-full bg-slate-700 px-3 py-2' : 'rounded-full bg-emerald-600 px-3 py-2'}>
                    <ButtonText className="text-sm font-semibold text-white">{micEnabled ? 'Turn mic off' : 'Turn mic on'}</ButtonText>
                  </Button>
                )}
                {isRoomHost || selfParticipant?.canShareScreen ? (
                  <Button
                    onPress={() => (localScreenTrack ? stopMyScreenShare() : startMyScreenShare())}
                    className={localScreenTrack ? 'rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-2' : 'rounded-full border border-slate-700 bg-slate-900 px-3 py-2'}
                  >
                    <ButtonText className="text-sm font-semibold text-center text-white">{localScreenTrack ? 'End share' : 'Share screen'}</ButtonText>
                  </Button>
                ) : null}
              </Box>
            </Box>
          ) : null}
        </Box>

        {/* Stage layout supporting multiple concurrent screens */}
        {isFocusMode ? (
          <Box className={`flex flex-col gap-3 ${showChrome ? 'lg:h-[calc(120vh-220px)]' : 'lg:h-[calc(120vh-80px)]'}`}>
            <Box className={`grid flex-1 gap-4 ${screenSharers.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {screenSharers.map((sharer) => renderSharerTile(sharer))}
            </Box>
          </Box>
        ) : (
          <Box className="flex w-full gap-3 min-h-[70vh] lg:h-[calc(120vh-200px)]">
            <Box className="flex w-full flex-1 flex-col justify-between gap-4 rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-5">
              <Box className="flex items-start justify-between">
                <Box>
                  <Text className="text-lg font-semibold text-white">{hangout.host.username}</Text>
                  <Text className="text-sm text-slate-300">Host</Text>
                </Box>
              </Box>
              <Box className="flex flex-1 items-center justify-center overflow-hidden rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-0 text-center">
                {currentUser.id === hangout.host._id && localVideoTrack ? (
                  <AgoraVideoView track={localVideoTrack} className="h-full w-full rounded-[1.1rem] object-cover" mirror />
                ) : remoteUsers[hangout.host._id]?.videoTrack ? (
                  <AgoraVideoView track={remoteUsers[hangout.host._id].videoTrack} className="h-full w-full rounded-[1.1rem] object-cover" />
                ) : (
                  <Text className="p-4 text-sm text-center text-slate-300">{hangout.host.username} is live</Text>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {shareError ? <Text className="text-sm text-amber-300">{shareError}</Text> : null}
      </Box>

      {/* Floating room button */}
      <Box className="fixed bottom-6 right-6 z-40">
        <Button onPress={() => setRoomPanelOpen(true)} className="rounded-full bg-emerald-600 px-5 py-3 shadow-2xl shadow-emerald-950/60">
          <Box className="flex items-center gap-2 text-white">
            <HamburgerIcon />
            <ButtonText className="text-sm font-semibold text-white">Room</ButtonText>
          </Box>
        </Button>
      </Box>

      {/* Slide-out drawer */}
      {roomPanelOpen ? (
        <Box className="fixed inset-0 z-50 flex justify-end">
          <button onClick={() => setRoomPanelOpen(false)} className="absolute inset-0 bg-black/60" />
          <Box className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
            <Box className="flex items-center justify-between border-b border-slate-800 p-4">
              <Text className="text-lg font-semibold text-white">Room</Text>
              <Button onPress={() => setRoomPanelOpen(false)} className="rounded-full border border-slate-700 bg-slate-900 p-2">
                <Box className="text-slate-200"><CloseIcon /></Box>
              </Button>
            </Box>

            <Box className="flex gap-2 border-b border-slate-800 p-3">
              {([
                { key: 'chat', label: 'Chat' },
                { key: 'people', label: `People (${hangout.participant.length})` },
              ] as const).map((tab) => (
                <Button
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  className={activeTab === tab.key ? 'rounded-full bg-emerald-600 px-3 py-1.5' : 'rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5'}
                >
                  <ButtonText className="text-xs font-semibold text-white">{tab.label}</ButtonText>
                </Button>
              ))}
            </Box>

            <Box className="flex-1 overflow-y-auto p-4">
              {activeTab === 'chat' ? (
                <Box className="flex h-full flex-col gap-3">
                  <Box className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                    {hangout.messages.map((message) => (
                      <Box key={message._id} className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                        <Text className="text-xs uppercase tracking-[0.24em] text-emerald-400">{message.user?.username ?? 'User'}</Text>
                        <Text className="mt-1 text-sm text-slate-200">{message.text}</Text>
                      </Box>
                    ))}
                  </Box>
                  <form onSubmit={sendMessage} className="flex flex-col gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Drop a thought"
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                    />
                    <button type="submit" className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                      Send
                    </button>
                  </form>
                </Box>
              ) : (
                <Box className="flex flex-col gap-2">
                  {hangout.participant.map((participant) => (
                    <Box key={participant.user._id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <Box className="flex items-center justify-between gap-2">
                        <Box>
                          <Text className="font-semibold text-white">{participant.user.username}</Text>
                          <Text className="text-xs text-slate-400">{participant.role}</Text>
                        </Box>
                        {participant.handRaised ? (
                          <Box className="rounded-full bg-amber-500/10 px-2.5 py-1">
                            <Text className="text-[11px] font-semibold text-amber-300">Hand raised</Text>
                          </Box>
                        ) : null}
                      </Box>
                      {isHostOrAdmin && participant.user._id !== hangout.host._id ? (
                        <Box className="mt-3 flex flex-wrap gap-2">
                          {participant.role === 'viewer' && participant.handRaised ? (
                            <Button onPress={() => admitSpeaker(participant.user._id)} className="rounded-full bg-emerald-600 px-3 py-2">
                              <ButtonText className="text-sm font-semibold text-white">Bring up</ButtonText>
                            </Button>
                          ) : null}
                          {participant.role !== 'viewer' ? (
                            <Button onPress={() => toggleMuteRemote(participant.user._id)} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2">
                              <ButtonText className="text-sm font-semibold text-slate-200">{participant.muted ? 'Unmute' : 'Mute'}</ButtonText>
                            </Button>
                          ) : null}
                          <Button
                            onPress={() => setScreenAccess(participant.user._id, !participant.canShareScreen)}
                            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2"
                          >
                            <ButtonText className="text-sm font-semibold text-amber-300">
                              {participant.canShareScreen ? 'Revoke screen' : 'Allow screen'}
                            </ButtonText>
                          </Button>
                        </Box>
                      ) : null}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}