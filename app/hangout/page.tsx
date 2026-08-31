'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

const HANGOUT_ID = 'devconnect-hangout-1';
const HANGOUT_STORAGE_KEY = 'devconnect-joined-hangouts';
const MAX_CONCURRENT_SCREEN_SHARES = 2;

// ── Agora config ──────────────────────────────────────────────────────────
// Put your App ID in .env.local as NEXT_PUBLIC_AGORA_APP_ID=xxxx
// (copy it from Console > Projects > DevConnect > Basic Settings > App ID).
// Never hardcode it directly in source that gets committed.
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? '';
const AGORA_CHANNEL = HANGOUT_ID;

// The SDK touches `window`, so it's loaded lazily inside effects instead of
// as a top-level import — this avoids Next.js SSR build errors.
let agoraSdkPromise: Promise<typeof import('agora-rtc-sdk-ng')> | null = null;
function loadAgoraSdk() {
  if (!agoraSdkPromise) {
    agoraSdkPromise = import('agora-rtc-sdk-ng');
  }
  return agoraSdkPromise;
}

// Your project currently has no App Certificate, so a null token works fine
// for testing (Console > Security shows "Add a Certificate", not added yet).
// Once you add a certificate, tokens become mandatory. Stand up a small
// server route (e.g. /api/agora-token) that uses Agora's Token Builder to
// mint a token server-side, and this function will start using it
// automatically — no other code needs to change.
async function fetchAgoraToken(channel: string, uid: number): Promise<string | null> {
  try {
    const res = await fetch(`/api/agora-token?channel=${encodeURIComponent(channel)}&uid=${uid}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.token ?? null;
  } catch {
    return null;
  }
}

type ChatMessage = {
  id: string;
  author: string;
  text: string;
  tone: 'system' | 'user' | 'admin';
};

type Participant = {
  id: string;
  name: string;
  skill: string;
  role: 'host' | 'speaker' | 'viewer';
  handRaised: boolean;
  muted: boolean;
  sharingScreen: boolean;
  canShareScreen: boolean;
};

type Spotlight = {
  id: string;
  name: string;
  skill: string;
  role: 'challenger' | 'speaker';
};

type QueueFilter = 'all' | 'raised' | 'speaking';
type RoomTab = 'chat' | 'people' | 'match';

const initialMessages: ChatMessage[] = [
  { id: 'm1', author: 'Devconnect team', text: 'Welcome to the live room. Mic access is controlled by the host.', tone: 'admin' },
  { id: 'm2', author: 'Mina', text: 'I am ready to share my progress on the auth flow.', tone: 'user' },
];

// NOTE: these are still demo/placeholder people, not real connected users.
// Real Agora participants show up separately under "Live connections" below,
// since there's no backend yet mapping Agora UIDs to names/roles.
const initialParticipants: Participant[] = [
  { id: 'host', name: 'Host Devconnect team', skill: 'Live host', role: 'host', handRaised: false, muted: false, sharingScreen: false, canShareScreen: true },
  { id: 'you', name: 'You', skill: 'Live collaboration', role: 'viewer', handRaised: false, muted: true, sharingScreen: false, canShareScreen: false },
  { id: 'mina', name: 'Mina', skill: 'Authentication flows', role: 'viewer', handRaised: true, muted: true, sharingScreen: false, canShareScreen: false },
  { id: 'tolu', name: 'Tolu', skill: 'Design systems', role: 'viewer', handRaised: true, muted: true, sharingScreen: false, canShareScreen: false },
  { id: 'bisi', name: 'Bisi', skill: 'Frontend performance', role: 'viewer', handRaised: false, muted: true, sharingScreen: false, canShareScreen: false },
];

const initialSpotlights: Spotlight[] = [
  { id: 's1', name: 'Ada', skill: 'AI agent orchestration', role: 'challenger' },
  { id: 's2', name: 'Timi', skill: 'Frontend performance', role: 'speaker' },
];

function getStoredJoinedHangouts() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(HANGOUT_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
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

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Plays any Agora local/remote video track into a div. Calling `.stop()` on
// unmount only detaches playback — it does not close the track or release
// the camera/mic device.
function AgoraVideoView({
  track,
  className,
  mirror,
}: {
  track: any;
  className?: string;
  mirror?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (track && containerRef.current) {
      track.play(containerRef.current, mirror ? { mirror: true } : undefined);
    }
    return () => {
      try {
        track?.stop();
      } catch {
        // no-op: track may already be closed
      }
    };
  }, [track, mirror]);

  return <div ref={containerRef} className={className} />;
}

export default function HangoutPage() {
  const [joined, setJoined] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [adminMuted, setAdminMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [spotlights, setSpotlights] = useState<Spotlight[]>(initialSpotlights);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [roomPanelOpen, setRoomPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RoomTab>('chat');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [lastReadCount, setLastReadCount] = useState(initialMessages.length);
  const [chromeHidden, setChromeHidden] = useState(false);

  // ── Agora state ──────────────────────────────────────────────────────
  const [agoraConnected, setAgoraConnected] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null); // camera, host only
  const [localScreenTrack, setLocalScreenTrack] = useState<any>(null); // screen share
  const [screenStreamOwnerId, setScreenStreamOwnerId] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Record<string, any>>({});

  const clientRef = useRef<any>(null); // main client: camera + mic
  const screenClientRef = useRef<any>(null); // secondary client: screen track only
  const localAudioTrackRef = useRef<any>(null);
  const uidRef = useRef<number>(Math.floor(Math.random() * 1_000_000) + 1);
  const screenUidRef = useRef<number>(uidRef.current + 1_000_000);

  useEffect(() => {
    const joinedHangouts = getStoredJoinedHangouts();
    setJoined(joinedHangouts.includes(HANGOUT_ID));
  }, []);

  useEffect(() => {
    if (roomPanelOpen && activeTab === 'chat') {
      setLastReadCount(messages.length);
    }
  }, [roomPanelOpen, activeTab, messages.length]);

  const handleJoinHangout = () => {
    const existing = getStoredJoinedHangouts();
    const updated = existing.includes(HANGOUT_ID) ? existing : [...existing, HANGOUT_ID];
    setJoined(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HANGOUT_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((current) => [
      ...current,
      { id: `m-${Date.now()}`, author: 'You', text: draft.trim(), tone: 'user' },
    ]);
    setDraft('');
  };

  const raiseHandNow = () => {
    if (handRaised) return;
    setHandRaised(true);
    setParticipants((current) =>
      current.map((p) => (p.id === 'you' ? { ...p, handRaised: true } : p))
    );
  };

  const admitSpeaker = (participantId: string) => {
    setParticipants((current) =>
      current.map((p) =>
        p.id !== participantId ? p : { ...p, role: 'speaker', handRaised: false, muted: false }
      )
    );
  };

  const muteParticipant = (participantId: string) => {
    // Real remote users can't be force-muted over plain RTC — that needs a
    // signaling channel (Agora RTM, or your own backend) to tell that
    // specific browser to disable its mic. This only affects the mock roster.
    setParticipants((current) =>
      current.map((p) => (p.id !== participantId ? p : { ...p, muted: !p.muted }))
    );
  };

  const toggleShareAccess = (participantId: string) => {
    setParticipants((current) =>
      current.map((p) => {
        if (p.id !== participantId) return p;
        const nextCanShare = !p.canShareScreen;
        return { ...p, canShareScreen: nextCanShare, sharingScreen: nextCanShare ? p.sharingScreen : false };
      })
    );
    if (screenStreamOwnerId === participantId) {
      void stopScreenShare(participantId);
    }
  };

  // ── Core Agora lifecycle: join/leave the channel ────────────────────
  const selfCanPublish = () => {
    const self = isAdmin
      ? participants.find((p) => p.id === 'host')
      : participants.find((p) => p.id === 'you');
    return isAdmin || self?.role !== 'viewer';
  };

  useEffect(() => {
    if (!joined || !isLive) return;

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

      client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
        setRemoteUsers((current) => ({ ...current, [String(user.uid)]: user }));
      });

      client.on('user-unpublished', (user: any) => {
        setRemoteUsers((current) => ({ ...current, [String(user.uid)]: user }));
      });

      client.on('user-left', (user: any) => {
        setRemoteUsers((current) => {
          const next = { ...current };
          delete next[String(user.uid)];
          return next;
        });
      });

      try {
        const role = selfCanPublish() ? 'host' : 'audience';
        await client.setClientRole(role);
        const token = await fetchAgoraToken(AGORA_CHANNEL, uidRef.current);
        await client.join(AGORA_APP_ID, AGORA_CHANNEL, token, uidRef.current);
        if (cancelled) return;
        setAgoraConnected(true);
        if (role === 'host') {
          await publishSelfMedia();
        }
      } catch (err) {
        console.error('Agora join failed', err);
        if (!cancelled) {
          setShareError('Could not connect to the live channel. Check your Agora App ID and network.');
        }
      }
    })();

    return () => {
      cancelled = true;
      void cleanupSelfMedia();
      void stopScreenShare(screenStreamOwnerId ?? undefined, { silent: true });
      const client = clientRef.current;
      if (client) {
        client.removeAllListeners();
        client.leave().catch(() => {});
      }
      clientRef.current = null;
      setAgoraConnected(false);
      setRemoteUsers({});
    };
    // Only re-run when join state changes — role changes are handled by the
    // effect below so we don't tear down and rejoin the whole channel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, isLive]);

  // React to role changes (viewer promoted to speaker, admin toggled) without
  // leaving and rejoining the channel.
  useEffect(() => {
    if (!agoraConnected || !clientRef.current) return;
    (async () => {
      const shouldPublish = selfCanPublish();
      try {
        await clientRef.current.setClientRole(shouldPublish ? 'host' : 'audience');
        if (shouldPublish) {
          await publishSelfMedia();
        } else {
          await cleanupSelfMedia();
        }
      } catch (err) {
        console.error('Failed to update Agora role', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, participants, agoraConnected]);

  useEffect(() => {
    localAudioTrackRef.current?.setEnabled(canSpeak);
  }, [micEnabled, adminMuted]);

  const publishSelfMedia = async () => {
    const client = clientRef.current;
    if (!client) return;
    const { default: AgoraRTC } = await loadAgoraSdk();

    const tracksToPublish: any[] = [];

    if (!localAudioTrackRef.current) {
      localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current.setEnabled(canSpeak);
    }
    tracksToPublish.push(localAudioTrackRef.current);

    if (isAdmin && !localVideoTrack) {
      const camTrack = await AgoraRTC.createCameraVideoTrack();
      setLocalVideoTrack(camTrack);
      tracksToPublish.push(camTrack);
    }

    const alreadyPublished = new Set(client.localTracks?.map((t: any) => t) ?? []);
    const newTracks = tracksToPublish.filter((t) => t && !alreadyPublished.has(t));
    if (newTracks.length) {
      await client.publish(newTracks);
    }
  };

  const cleanupSelfMedia = async () => {
    const client = clientRef.current;
    const tracks = [localAudioTrackRef.current, localVideoTrack].filter(Boolean);
    if (client && tracks.length) {
      try {
        await client.unpublish(tracks);
      } catch {
        // already unpublished
      }
    }
    localAudioTrackRef.current?.close();
    localAudioTrackRef.current = null;
    if (localVideoTrack) {
      localVideoTrack.close();
      setLocalVideoTrack(null);
    }
  };

  const toggleMic = () => {
    if (!joined) return;
    setMicEnabled((current) => !current);
  };

  // ── Screen share: a second Agora client publishes the screen track with
  // its own UID, so it can run alongside the camera+mic client. This is
  // Agora's own recommended pattern for simultaneous camera + screen share.
  const startScreenShare = async (ownerParticipantId: string) => {
    if (!AGORA_APP_ID) {
      setShareError('Missing Agora App ID — set NEXT_PUBLIC_AGORA_APP_ID in your environment.');
      return;
    }
    try {
      const { default: AgoraRTC } = await loadAgoraSdk();
      const created = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '1080p_1' }, 'auto');
      const videoTrack = Array.isArray(created) ? created[0] : created;
      const audioTrack = Array.isArray(created) ? created[1] : undefined;

      const screenClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      await screenClient.setClientRole('host');
      const token = await fetchAgoraToken(AGORA_CHANNEL, screenUidRef.current);
      await screenClient.join(AGORA_APP_ID, AGORA_CHANNEL, token, screenUidRef.current);
      await screenClient.publish(audioTrack ? [videoTrack, audioTrack] : [videoTrack]);

      videoTrack.on('track-ended', () => {
        void stopScreenShare(ownerParticipantId);
      });

      screenClientRef.current = screenClient;
      setLocalScreenTrack(videoTrack);
      setScreenStreamOwnerId(ownerParticipantId);
      setShareError(null);

      const owner = participants.find((p) => p.id === ownerParticipantId);
      setParticipants((current) => {
        const isCurrentlySharing = current.find((p) => p.id === ownerParticipantId)?.sharingScreen;
        if (isCurrentlySharing) return current;
        const otherSharers = current.filter((p) => p.sharingScreen && p.id !== ownerParticipantId);
        let next = current;
        if (otherSharers.length >= MAX_CONCURRENT_SCREEN_SHARES) {
          const [oldest] = otherSharers;
          next = next.map((p) => (p.id === oldest.id ? { ...p, sharingScreen: false } : p));
        }
        return next.map((p) =>
          p.id === ownerParticipantId ? { ...p, sharingScreen: true, role: 'speaker' } : p
        );
      });

      if (owner) {
        setSpotlights((current) => [
          ...current.filter((s) => s.id !== owner.id),
          { id: owner.id, name: owner.name, skill: owner.skill, role: 'speaker' },
        ]);
      }

      setMessages((current) => [
        ...current,
        {
          id: `m-${Date.now()}`,
          author: ownerParticipantId === 'host' ? 'Devconnect team' : 'You',
          text: 'You are now sharing your screen with the room.',
          tone: ownerParticipantId === 'host' ? 'admin' : 'user',
        },
      ]);
    } catch (err) {
      console.error('Screen share failed', err);
      setShareError('Screen share permission was denied or cancelled.');
    }
  };

  const stopScreenShare = async (ownerParticipantId?: string, opts?: { silent?: boolean }) => {
    const client = screenClientRef.current;
    if (client) {
      try {
        await client.leave();
      } catch {
        // already left
      }
    }
    screenClientRef.current = null;
    setLocalScreenTrack((current: any) => {
      current?.close();
      return null;
    });
    setScreenStreamOwnerId(null);
    if (!opts?.silent) setShareError(null);
    if (ownerParticipantId) {
      setParticipants((current) =>
        current.map((p) => (p.id === ownerParticipantId ? { ...p, sharingScreen: false } : p))
      );
    }
  };

  const toggleSelfScreenShare = async (selfId: string, allowed: boolean) => {
    if (!allowed) return;
    if (screenStreamOwnerId === selfId) {
      await stopScreenShare(selfId);
    } else {
      await startScreenShare(selfId);
    }
  };

  const toggleHostScreenShare = async () => {
    if (screenStreamOwnerId) {
      await stopScreenShare(screenStreamOwnerId);
    } else {
      await startScreenShare('host');
    }
  };

  // Admin-triggered "make this participant share" only works for a browser
  // you actually control (i.e. yourself). For a real remote participant to
  // start sharing on the admin's command, that participant's own browser
  // needs to receive the instruction — via Agora RTM or your backend's
  // realtime layer — and call startScreenShare() itself.
  const shareScreen = (participantId: string) => {
    if (participantId === (isAdmin ? 'host' : 'you')) {
      void toggleSelfScreenShare(participantId, true);
      return;
    }
    setParticipants((current) =>
      current.map((p) => (p.id === participantId ? { ...p, sharingScreen: !p.sharingScreen } : p))
    );
  };

  const toggleFullScreen = async () => {
    if (typeof window === 'undefined') return;
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const openPanel = (tab: RoomTab) => {
    setActiveTab(tab);
    setRoomPanelOpen(true);
  };

  const canSpeak = joined && micEnabled && !adminMuted;
  const hostParticipant = participants.find((p) => p.id === 'host') ?? participants[0];
  const screenSharers = participants.filter((p) => p.sharingScreen).slice(0, MAX_CONCURRENT_SCREEN_SHARES);
  const nonHostSharers = screenSharers.filter((p) => p.id !== 'host');
  const isFocusMode = nonHostSharers.length > 0;
  const focusedSharers = isFocusMode ? screenSharers : [];

  useEffect(() => {
    setChromeHidden(isFocusMode);
  }, [isFocusMode]);

  const showChrome = !isFocusMode || !chromeHidden;
  const selfParticipant = isAdmin ? hostParticipant : (participants.find((p) => p.id === 'you') ?? participants[1]);
  const selfCanShare = !!selfParticipant && (selfParticipant.id === 'host' || selfParticipant.canShareScreen);
  const selfIsSpeaker = selfParticipant?.role !== 'viewer';
  const selfIsSharing = !!selfParticipant && screenStreamOwnerId === selfParticipant.id;
  const handRaisedCount = participants.filter((p) => p.handRaised).length;
  const speakingCount = participants.filter((p) => p.role !== 'viewer').length;
  const unreadMessages = Math.max(0, messages.length - lastReadCount);
  const hostMicLabel = hostParticipant?.muted ? 'Mic muted' : canSpeak ? 'Mic live' : 'Mic muted';
  const remoteUsersList = Object.values(remoteUsers);

  const visibleParticipants = participants.filter((p) => {
    if (queueFilter === 'raised') return p.handRaised;
    if (queueFilter === 'speaking') return p.role !== 'viewer';
    return true;
  });

  const SelfControls = () => {
    if (!selfParticipant) return null;
    return (
      <Box className="flex flex-wrap gap-2">
        {selfIsSpeaker ? (
          <Button
            onPress={toggleMic}
            className={canSpeak ? 'rounded-full bg-slate-700 px-3 py-2' : 'rounded-full bg-emerald-600 px-3 py-2'}
          >
            <ButtonText className="text-sm font-semibold text-white">
              {micEnabled ? 'Turn mic off' : 'Turn mic on'}
            </ButtonText>
          </Button>
        ) : (
          <Button
            onPress={raiseHandNow}
            className={handRaised ? 'rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-2' : 'rounded-full bg-emerald-600 px-3 py-2'}
          >
            <ButtonText className="text-sm font-semibold text-white">
              {handRaised ? 'Hand raised' : 'Raise hand to speak'}
            </ButtonText>
          </Button>
        )}
        {selfCanShare ? (
          <Button
            onPress={() => toggleSelfScreenShare(selfParticipant.id, selfCanShare)}
            className={selfIsSharing ? 'rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-2' : 'rounded-full border border-slate-700 bg-slate-900 px-3 py-2'}
          >
            <ButtonText className="text-sm font-semibold text-white">
              {selfIsSharing ? 'Stop sharing' : 'Share my screen'}
            </ButtonText>
          </Button>
        ) : null}
        <Button onPress={toggleFullScreen} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2">
          <ButtonText className="text-sm font-semibold text-white">
            {isFullScreen ? 'Exit full screen' : 'Full screen'}
          </ButtonText>
        </Button>
      </Box>
    );
  };

  const renderSharerTile = (sharer: Participant, sizeClassName: string) => (
    <Box key={sharer.id} className={`flex flex-col rounded-[1.5rem] border border-emerald-500/30 bg-slate-900/70 p-4 ${sizeClassName}`}>
      <Box className="flex items-center justify-between gap-2">
        <Text className="text-sm font-semibold text-white">{sharer.name}&rsquo;s screen</Text>
        <Box className="rounded-full bg-emerald-500/15 px-2.5 py-1">
          <Text className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">Focused</Text>
        </Box>
      </Box>
      {sharer.id === screenStreamOwnerId && localScreenTrack ? (
        <AgoraVideoView track={localScreenTrack} className="mt-3 min-h-0 w-full flex-1 rounded-[1.1rem] object-cover" />
      ) : (
        <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
          <Text className="text-sm text-slate-300">
            {sharer.name} is sharing a coding screen, challenge board, and terminal output.
          </Text>
        </Box>
      )}
    </Box>
  );

  return (
    <Box className="min-h-screen bg-slate-950 text-slate-100">
      <Box className={`mx-auto flex max-w-[1700px] flex-col gap-4 ${isFocusMode && chromeHidden ? 'p-2' : 'p-3 md:p-5'}`}>

        {/* ── Pre-live header bar ── */}
        {!isLive ? (
          <Box className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/50 md:flex-row md:items-center md:justify-between">
            <Box>
              <Text className="text-sm uppercase tracking-[0.3em] text-emerald-400">Live hangout</Text>
              <Text className="mt-1 text-lg font-semibold text-white md:text-3xl">Developer showdown room</Text>
              <Text className="mt-2 max-w-2xl text-sm text-slate-400">
                Live hangout to watch developers compete in real time, share ideas, and discuss solutions.
              </Text>
            </Box>
            <Box className="flex flex-col gap-2 md:items-end">
              <Button
                onPress={handleJoinHangout}
                className={joined ? 'rounded-full bg-slate-700 px-4 py-2' : 'rounded-full bg-emerald-600 px-4 py-2'}
              >
                <ButtonText className="text-sm font-semibold text-white">
                  {joined ? 'Joined to this hangout' : 'Join hangout'}
                </ButtonText>
              </Button>
              <Box className="flex gap-2">
                <Button onPress={() => setIsLive((c) => !c)} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2">
                  <ButtonText className="text-sm font-semibold text-slate-200">
                    {isLive ? 'Live room' : 'Upcoming room'}
                  </ButtonText>
                </Button>
                <Button onPress={() => setIsAdmin((c) => !c)} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
                  <ButtonText className="text-sm font-semibold text-emerald-300">
                    {isAdmin ? 'Admin view' : 'Viewer view'}
                  </ButtonText>
                </Button>
              </Box>
            </Box>
          </Box>
        ) : null}

        {/* ── Gate: must join first ── */}
        {!joined ? (
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <Text className="text-xl font-semibold text-white">Join first to unlock the room</Text>
            <Button onPress={handleJoinHangout} className="mt-4 rounded-full bg-emerald-600 px-4 py-2">
              <ButtonText className="text-sm font-semibold text-white">Join now</ButtonText>
            </Button>
          </Card>

        ) : !isLive ? (
          /* ── Joined but not yet live ── */
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <Text className="mt-2 text-sm text-slate-400">
              The room is not live yet. Full access will be available once streaming starts.
            </Text>
            <Box className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <Text className="text-sm font-semibold text-emerald-300">Topic</Text>
              <Text className="mt-1 text-lg font-semibold text-white">Building a better developer community in Nigeria</Text>
              <Text className="mt-2 text-sm text-slate-400">Starting soon</Text>
            </Box>
          </Card>

        ) : (
          /* ── Joined + Live ── */
          <Box className="flex flex-col gap-3">

            {/* Top bar */}
            {showChrome ? (
              <Box className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                <Box className="flex items-center gap-3">
                  <Box className={`rounded-full px-3 py-1 ${agoraConnected ? 'bg-rose-500/20' : 'bg-slate-700/40'}`}>
                    <Text className={`text-xs font-semibold uppercase tracking-[0.25em] ${agoraConnected ? 'text-rose-300' : 'text-slate-400'}`}>
                      {agoraConnected ? 'Live' : 'Connecting…'}
                    </Text>
                  </Box>
                  <Text className="text-sm text-slate-400">
                    {screenSharers.length > 0 ? `${screenSharers.length} sharing screen` : 'No one sharing a screen yet'}
                    {remoteUsersList.length > 0 ? ` · ${remoteUsersList.length} real connection${remoteUsersList.length === 1 ? '' : 's'}` : ''}
                  </Text>
                </Box>
                <Box className="flex flex-wrap items-center gap-2">
                  {isAdmin ? (
                    <Button onPress={() => setAdminMuted((c) => !c)} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2">
                      <ButtonText className="text-sm font-semibold text-slate-200">
                        {adminMuted ? 'Unmute room' : 'Mute room'}
                      </ButtonText>
                    </Button>
                  ) : null}
                  <Button onPress={() => setIsAdmin((c) => !c)} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                    <ButtonText className="text-sm font-semibold text-emerald-300">
                      {isAdmin ? 'Admin controls' : 'Viewer controls'}
                    </ButtonText>
                  </Button>
                  {isFocusMode ? (
                    <Button onPress={() => setChromeHidden(true)} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2">
                      <ButtonText className="text-sm font-semibold text-slate-300">Hide, show screens only</ButtonText>
                    </Button>
                  ) : null}
                </Box>
              </Box>
            ) : (
              <Box className="flex justify-center">
                <Button onPress={() => setChromeHidden(false)} className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                  <Box className="flex items-center gap-1.5 text-slate-300">
                    <ChevronDownIcon />
                    <ButtonText className="text-xs font-semibold text-slate-300">Show room controls</ButtonText>
                  </Box>
                </Button>
              </Box>
            )}

            {/* Your status bar */}
            {showChrome ? (
              <Box className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                <Box>
                  <Text className="text-sm font-semibold text-white">Your status</Text>
                  <Text className="text-xs text-slate-400">
                    {isAdmin
                      ? 'You are hosting this room.'
                      : selfIsSpeaker
                        ? 'You are live — the admin can mute you at any time.'
                        : handRaised
                          ? 'Hand raised — waiting for the admin to bring you up.'
                          : 'You are watching. Raise your hand to ask to speak.'}
                  </Text>
                </Box>
                {!isAdmin ? <SelfControls /> : null}
              </Box>
            ) : null}

            {/* Stage */}
            {isFocusMode ? (
              <Box className={`flex flex-col gap-3 ${showChrome ? 'lg:h-[calc(100vh-250px)]' : 'lg:h-[calc(100vh-70px)]'}`}>
                <Box className={`flex flex-1 gap-3 ${focusedSharers.length > 1 ? 'lg:grid lg:grid-cols-2' : ''}`}>
                  {focusedSharers.map((sharer) => renderSharerTile(sharer, 'min-h-[420px] flex-1 lg:h-full'))}
                </Box>
                {showChrome && isAdmin ? (
                  <Box className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-800 bg-slate-900/70 p-3 sm:flex-row sm:items-center">
                    <Box className="flex min-w-0 flex-1 items-center gap-3">
                      <Box className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/70 px-1">
                        <Text className="text-center text-[10px] leading-tight text-slate-400">{hostParticipant?.name}</Text>
                      </Box>
                      <Box className="min-w-0">
                        <Text className="truncate text-sm font-semibold text-white">{hostParticipant?.name}</Text>
                        <Text className="text-xs text-slate-400">{hostMicLabel}</Text>
                      </Box>
                    </Box>
                    <SelfControls />
                  </Box>
                ) : null}
              </Box>
            ) : (
              <Box className="grid gap-3 lg:h-[calc(100vh-250px)] lg:grid-cols-3">
                {/* Host tile */}
                <Box className="flex min-h-[360px] flex-col justify-between gap-4 rounded-[1.5rem] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.24),_transparent_60%),linear-gradient(135deg,_rgba(30,41,59,0.98),_rgba(2,6,23,0.98))] p-5 lg:h-full">
                  <Box className="flex items-start justify-between">
                    <Box>
                      <Text className="text-lg font-semibold text-white">{hostParticipant?.name}</Text>
                      <Text className="text-sm text-slate-300">{hostParticipant?.skill}</Text>
                    </Box>
                    <Box className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                      <Text className="text-sm font-medium text-emerald-300">{hostMicLabel}</Text>
                    </Box>
                  </Box>
                  <Box className="flex flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                    {screenStreamOwnerId === 'host' && localScreenTrack ? (
                      <AgoraVideoView track={localScreenTrack} className="h-full w-full rounded-[1.1rem] object-cover" />
                    ) : isAdmin && localVideoTrack ? (
                      <AgoraVideoView track={localVideoTrack} className="h-full w-full rounded-[1.1rem] object-cover" mirror />
                    ) : (
                      <Text className="text-sm text-slate-300">{hostParticipant?.name} is live on camera and ready to speak.</Text>
                    )}
                  </Box>
                  {isAdmin ? <SelfControls /> : null}
                </Box>

                {/* Screen share slot 1 */}
                <Box className="flex min-h-[360px] flex-col rounded-[1.5rem] border border-slate-700 bg-slate-900/70 p-4 lg:h-full">
                  <Text className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {screenSharers[0] ? `${screenSharers[0].name}'s screen` : 'Screen share slot 1'}
                  </Text>
                  <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                    {screenSharers[0] && screenSharers[0].id === screenStreamOwnerId && localScreenTrack ? (
                      <AgoraVideoView track={localScreenTrack} className="h-full w-full rounded-[1.1rem] object-cover" />
                    ) : (
                      <Text className="text-sm text-slate-400">
                        {screenSharers[0]?.name ? `${screenSharers[0].name} is sharing their screen.` : 'Waiting for a challenger to share their screen.'}
                      </Text>
                    )}
                  </Box>
                </Box>

                {/* Screen share slot 2 */}
                <Box className="flex min-h-[360px] flex-col rounded-[1.5rem] border border-slate-700 bg-slate-900/70 p-4 lg:h-full">
                  <Text className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {screenSharers[1] ? `${screenSharers[1].name}'s screen` : 'Screen share slot 2'}
                  </Text>
                  <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                    {screenSharers[1] && screenSharers[1].id === screenStreamOwnerId && localScreenTrack ? (
                      <AgoraVideoView track={localScreenTrack} className="h-full w-full rounded-[1.1rem] object-cover" />
                    ) : (
                      <Text className="text-sm text-slate-400">
                        {screenSharers[1]?.name ? `${screenSharers[1].name} is sharing their screen.` : 'Waiting for a second challenger to share their screen.'}
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {/* Real Agora connections — separate from the mock roster above,
                since these are actual people who joined the channel. */}
            {remoteUsersList.length > 0 ? (
              <Box className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <Text className="text-sm font-semibold text-white">Live connections ({remoteUsersList.length})</Text>
                <Box className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {remoteUsersList.map((user: any) => (
                    <Box key={user.uid} className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                      <Text className="text-xs text-slate-400">Guest {user.uid}</Text>
                      {user.videoTrack ? (
                        <AgoraVideoView track={user.videoTrack} className="mt-1 h-24 w-full rounded-lg object-cover" />
                      ) : (
                        <Box className="mt-1 flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-700">
                          <Text className="text-[11px] text-slate-500">Audio only</Text>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : null}

            {shareError ? <Text className="text-sm text-amber-300">{shareError}</Text> : null}
          </Box>
        )}

        {/* ── Floating Room button ── */}
        {joined && isLive ? (
          <Box className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
            <Button onPress={() => openPanel('chat')} className="relative rounded-full bg-emerald-600 px-5 py-3 shadow-2xl shadow-emerald-950/60">
              <Box className="flex items-center gap-2 text-white">
                <HamburgerIcon />
                <ButtonText className="text-sm font-semibold text-white">Room</ButtonText>
              </Box>
              {unreadMessages > 0 ? (
                <Box className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1">
                  <Text className="text-[11px] font-bold text-white">{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
                </Box>
              ) : null}
            </Button>
          </Box>
        ) : null}

        {/* ── Slide-out room drawer ── */}
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

              {/* Tabs */}
              <Box className="flex gap-2 border-b border-slate-800 p-3">
                {(
                  [
                    { key: 'chat', label: 'Chat' },
                    { key: 'people', label: `People (${participants.length})` },
                    { key: 'match', label: 'Challenge' },
                  ] as { key: RoomTab; label: string }[]
                ).map((tab) => (
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
                {/* Chat tab */}
                {activeTab === 'chat' ? (
                  <Box className="flex h-full flex-col gap-3">
                    <Box className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      {messages.map((message) => (
                        <Box key={message.id} className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                          <Text className="text-xs uppercase tracking-[0.24em] text-emerald-400">{message.author}</Text>
                          <Text className="mt-1 text-sm text-slate-200">{message.text}</Text>
                        </Box>
                      ))}
                    </Box>
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write in the live stream"
                        className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                      />
                      <button type="submit" className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                        Send
                      </button>
                    </form>
                  </Box>
                ) : null}

                {/* People tab */}
                {activeTab === 'people' ? (
                  <Box className="flex flex-col gap-3">
                    <Text className="text-sm text-slate-400">
                      {participants.length} in the room &bull; {handRaisedCount} hand{handRaisedCount === 1 ? '' : 's'} raised &bull; {speakingCount} on stage
                    </Text>
                    <Box className="flex flex-wrap gap-2">
                      {(
                        [
                          { key: 'all', label: `All (${participants.length})` },
                          { key: 'raised', label: `Hands raised (${handRaisedCount})` },
                          { key: 'speaking', label: `On stage (${speakingCount})` },
                        ] as { key: QueueFilter; label: string }[]
                      ).map((filter) => (
                        <Button
                          key={filter.key}
                          onPress={() => setQueueFilter(filter.key)}
                          className={queueFilter === filter.key ? 'rounded-full bg-emerald-600 px-3 py-1.5' : 'rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5'}
                        >
                          <ButtonText className="text-xs font-semibold text-white">{filter.label}</ButtonText>
                        </Button>
                      ))}
                    </Box>
                    <Box className="flex flex-col gap-2">
                      {visibleParticipants.length === 0 ? (
                        <Box className="p-4 text-center">
                          <Text className="text-sm text-slate-400">No one matches this filter right now.</Text>
                        </Box>
                      ) : (
                        visibleParticipants.map((participant) => (
                          <Box key={participant.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                            <Box className="flex items-center justify-between gap-2">
                              <Box>
                                <Text className="font-semibold text-white">{participant.name}</Text>
                                <Text className="text-sm text-slate-400">{participant.skill}</Text>
                              </Box>
                              <Box className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1">
                                <Text className="text-[11px] uppercase tracking-[0.25em] text-slate-300">{participant.role}</Text>
                              </Box>
                            </Box>
                            <Box className="mt-3 flex flex-wrap gap-2">
                              {isAdmin ? (
                                participant.id === 'host' ? (
                                  <Box className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2">
                                    <Text className="text-sm text-slate-400">This is you (host)</Text>
                                  </Box>
                                ) : (
                                  <>
                                    <Button onPress={() => admitSpeaker(participant.id)} className="rounded-full bg-emerald-600 px-3 py-2">
                                      <ButtonText className="text-sm font-semibold text-white">Bring up</ButtonText>
                                    </Button>
                                    <Button onPress={() => muteParticipant(participant.id)} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2">
                                      <ButtonText className="text-sm font-semibold text-slate-200">{participant.muted ? 'Unmute' : 'Mute'}</ButtonText>
                                    </Button>
                                    <Button onPress={() => shareScreen(participant.id)} className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                                      <ButtonText className="text-sm font-semibold text-amber-300">
                                        {participant.sharingScreen ? 'Stop screen' : 'Share screen'}
                                      </ButtonText>
                                    </Button>
                                  </>
                                )
                              ) : (
                                <Box className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2">
                                  <Text className="text-sm text-slate-300">{participant.handRaised ? 'Requested to speak' : 'Watching'}</Text>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                ) : null}

                {/* Match/Challenge tab */}
                {activeTab === 'match' ? (
                  <Box className="flex flex-col gap-3">
                    <Text className="text-sm text-slate-400">
                      Admin can bring up matching challengers and let them share their screen while the audience watches the competition unfold.
                    </Text>
                    {spotlights.map((spotlight) => (
                      <Box key={spotlight.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <Text className="font-semibold text-white">{spotlight.name}</Text>
                        <Text className="mt-1 text-sm text-slate-400">{spotlight.skill}</Text>
                        <Text className="mt-2 text-xs uppercase tracking-[0.24em] text-amber-400">{spotlight.role}</Text>
                      </Box>
                    ))}
                  </Box>
                ) : null}
              </Box>
            </Box>
          </Box>
        ) : null}

      </Box>
    </Box>
  );
}