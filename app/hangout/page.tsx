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
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenStreamOwnerId, setScreenStreamOwnerId] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [roomPanelOpen, setRoomPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RoomTab>('chat');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [lastReadCount, setLastReadCount] = useState(initialMessages.length);
  const [chromeHidden, setChromeHidden] = useState(false);

  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const joinedHangouts = getStoredJoinedHangouts();
    setJoined(joinedHangouts.includes(HANGOUT_ID));
  }, []);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    return () => {
      screenStream?.getTracks().forEach((track) => track.stop());
    };
  }, [screenStream]);

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

  const toggleMic = () => {
    if (!joined) return;
    setMicEnabled((current) => !current);
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
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setScreenStreamOwnerId(null);
    }
  };

  const shareScreen = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;

    setParticipants((current) => {
      const isCurrentlySharing = current.find((p) => p.id === participantId)?.sharingScreen;
      if (isCurrentlySharing) {
        return current.map((p) => (p.id === participantId ? { ...p, sharingScreen: false } : p));
      }
      const otherSharers = current.filter((p) => p.sharingScreen && p.id !== participantId);
      let next = current;
      if (otherSharers.length >= MAX_CONCURRENT_SCREEN_SHARES) {
        const [oldest] = otherSharers;
        next = next.map((p) => (p.id === oldest.id ? { ...p, sharingScreen: false } : p));
      }
      return next.map((p) =>
        p.id === participantId ? { ...p, sharingScreen: true, role: 'speaker' } : p
      );
    });

    setSpotlights((current) => [
      ...current.filter((s) => s.id !== participant.id),
      { id: participant.id, name: participant.name, skill: participant.skill, role: 'speaker' },
    ]);
  };

  const stopStream = (ownerId: string) => {
    screenStream?.getTracks().forEach((t) => t.stop());
    setScreenStream(null);
    setScreenStreamOwnerId(null);
    setShareError(null);
    setParticipants((current) =>
      current.map((p) => (p.id === ownerId ? { ...p, sharingScreen: false } : p))
    );
  };

  const startStream = async (selfId: string) => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setShareError('Screen sharing is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setScreenStream(stream);
      setScreenStreamOwnerId(selfId);
      setShareError(null);
      setParticipants((current) =>
        current.map((p) =>
          p.id === selfId
            ? { ...p, sharingScreen: true, role: p.role === 'viewer' ? 'speaker' : p.role }
            : p
        )
      );
      setMessages((current) => [
        ...current,
        {
          id: `m-${Date.now()}`,
          author: selfId === 'host' ? 'Devconnect team' : 'You',
          text: 'You are now sharing your screen with the room.',
          tone: selfId === 'host' ? 'admin' : 'user',
        },
      ]);
    } catch {
      setShareError('Screen share permission was denied or cancelled.');
    }
  };

  const toggleSelfScreenShare = async (selfId: string, allowed: boolean) => {
    if (!allowed) return;
    if (screenStream) { stopStream(selfId); return; }
    await startStream(selfId);
  };

  const toggleHostScreenShare = async () => {
    if (screenStream) { stopStream(screenStreamOwnerId ?? 'host'); return; }
    await startStream('host');
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
  const selfIsSharing = !!selfParticipant && screenStreamOwnerId === selfParticipant.id && !!screenStream;
  const handRaisedCount = participants.filter((p) => p.handRaised).length;
  const speakingCount = participants.filter((p) => p.role !== 'viewer').length;
  const unreadMessages = Math.max(0, messages.length - lastReadCount);
  const hostMicLabel = hostParticipant?.muted ? 'Mic muted' : canSpeak ? 'Mic live' : 'Mic muted';

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
            className={screenStream ? 'rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-2' : 'rounded-full border border-slate-700 bg-slate-900 px-3 py-2'}
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
      {sharer.id === screenStreamOwnerId && screenStream ? (
        <video ref={screenVideoRef} autoPlay playsInline muted className="mt-3 min-h-0 w-full flex-1 rounded-[1.1rem] object-cover" />
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
                  <Box className="rounded-full bg-rose-500/20 px-3 py-1">
                    <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-300">Live</Text>
                  </Box>
                  <Text className="text-sm text-slate-400">
                    {screenSharers.length > 0 ? `${screenSharers.length} sharing screen` : 'No one sharing a screen yet'}
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
                    {screenStreamOwnerId === 'host' && screenStream ? (
                      <video ref={screenVideoRef} autoPlay playsInline muted className="h-full w-full rounded-[1.1rem] object-cover" />
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
                    <Text className="text-sm text-slate-400">
                      {screenSharers[0]?.name ? `${screenSharers[0].name} is sharing their screen.` : 'Waiting for a challenger to share their screen.'}
                    </Text>
                  </Box>
                </Box>

                {/* Screen share slot 2 */}
                <Box className="flex min-h-[360px] flex-col rounded-[1.5rem] border border-slate-700 bg-slate-900/70 p-4 lg:h-full">
                  <Text className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {screenSharers[1] ? `${screenSharers[1].name}'s screen` : 'Screen share slot 2'}
                  </Text>
                  <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                    <Text className="text-sm text-slate-400">
                      {screenSharers[1]?.name ? `${screenSharers[1].name} is sharing their screen.` : 'Waiting for a second challenger to share their screen.'}
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}

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