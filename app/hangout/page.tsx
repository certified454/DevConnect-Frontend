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
  { id: 'm1', author: ' Devconnect team', text: 'Welcome to the live room. Mic access is controlled by the host.', tone: 'admin' },
  { id: 'm2', author: 'Mina', text: 'I am ready to share my progress on the auth flow.', tone: 'user' },
];

const initialParticipants: Participant[] = [
  { id: 'host', name: 'Host Devconnect team', skill: 'Live host', role: 'host', handRaised: false, muted: false, sharingScreen: false },
  { id: 'you', name: 'You', skill: 'Live collaboration', role: 'viewer', handRaised: false, muted: true, sharingScreen: false },
  { id: 'mina', name: 'Mina', skill: 'Authentication flows', role: 'viewer', handRaised: true, muted: true, sharingScreen: false },
  { id: 'tolu', name: 'Tolu', skill: 'Design systems', role: 'viewer', handRaised: true, muted: true, sharingScreen: false },
  { id: 'bisi', name: 'Bisi', skill: 'Frontend performance', role: 'viewer', handRaised: false, muted: true, sharingScreen: false },
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
  const [shareError, setShareError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Everything that isn't the video stage — chat, the roster, the challenge
  // card — lives behind one slide-out drawer so the stage can own the whole
  // window. This mirrors the app's own nav drawer pattern.
  const [roomPanelOpen, setRoomPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RoomTab>('chat');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [lastReadCount, setLastReadCount] = useState(initialMessages.length);

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

  // Keep the unread-chat badge accurate: whenever the drawer is open on the
  // Chat tab, treat every message as read.
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
      {
        id: `m-${Date.now()}`,
        author: 'You',
        text: draft.trim(),
        tone: 'user',
      },
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
    setParticipants((current) => current.map((participant) => participant.id === 'you' ? { ...participant, handRaised: true } : participant));
  };

  const admitSpeaker = (participantId: string) => {
    setParticipants((current) =>
      current.map((participant) => {
        if (participant.id !== participantId) return participant;

        return { ...participant, role: 'speaker', handRaised: false, muted: false };
      }),
    );
  };

  const muteParticipant = (participantId: string) => {
    setParticipants((current) =>
      current.map((participant) => {
        if (participant.id !== participantId) return participant;

        return { ...participant, muted: !participant.muted };
      }),
    );
  };

  // Up to MAX_CONCURRENT_SCREEN_SHARES participants can share a screen at
  // once (the two live challengers). Toggling a new sharer past the cap
  // bumps the earliest sharer off so the stage never overflows.
  const shareScreen = (participantId: string) => {
    const participant = participants.find((entry) => entry.id === participantId);
    if (!participant) return;

    setParticipants((current) => {
      const isCurrentlySharing = current.find((entry) => entry.id === participantId)?.sharingScreen;

      if (isCurrentlySharing) {
        return current.map((entry) => (entry.id === participantId ? { ...entry, sharingScreen: false } : entry));
      }

      const otherSharers = current.filter((entry) => entry.sharingScreen && entry.id !== participantId);
      let next = current;

      if (otherSharers.length >= MAX_CONCURRENT_SCREEN_SHARES) {
        const [oldestSharer] = otherSharers;
        next = next.map((entry) => (entry.id === oldestSharer.id ? { ...entry, sharingScreen: false } : entry));
      }

      return next.map((entry) =>
        entry.id === participantId ? { ...entry, sharingScreen: true, role: 'speaker' } : entry,
      );
    });

    setSpotlights((current) => [
      ...current.filter((entry) => entry.id !== participant.id),
      {
        id: participant.id,
        name: participant.name,
        skill: participant.skill,
        role: 'speaker',
      },
    ]);
  };

  const toggleHostScreenShare = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setShareError('Screen sharing is not supported in this browser.');
      return;
    }

    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setShareError(null);
      setParticipants((current) => current.map((entry) => (entry.id === 'host' ? { ...entry, sharingScreen: false } : entry)));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setScreenStream(stream);
      setShareError(null);
      setIsAdmin(true);
      setParticipants((current) => current.map((entry) => (entry.id === 'host' ? { ...entry, sharingScreen: true } : entry)));
      setMessages((current) => [
        ...current,
        {
          id: `m-${Date.now()}`,
          author: 'Devconnect team',
          text: 'You are now sharing your screen with the room.',
          tone: 'admin',
        },
      ]);
    } catch {
      setShareError('Screen share permission was denied or cancelled.');
    }
  };

  const toggleFullScreen = async () => {
    if (typeof window === 'undefined') return;

    const target = document.documentElement;

    if (!document.fullscreenElement) {
      await target.requestFullscreen();
      setIsFullScreen(true);
      return;
    }

    await document.exitFullscreen();
    setIsFullScreen(false);
  };

  const openPanel = (tab: RoomTab) => {
    setActiveTab(tab);
    setRoomPanelOpen(true);
  };

  const canSpeak = joined && micEnabled && !adminMuted;
  const hostParticipant = participants.find((entry) => entry.id === 'host') ?? participants[0];
  const screenSharers = participants.filter((entry) => entry.sharingScreen).slice(0, MAX_CONCURRENT_SCREEN_SHARES);

  const handRaisedCount = participants.filter((entry) => entry.handRaised).length;
  const speakingCount = participants.filter((entry) => entry.role !== 'viewer').length;
  const unreadMessages = Math.max(0, messages.length - lastReadCount);
  const visibleParticipants = participants.filter((entry) => {
    if (queueFilter === 'raised') return entry.handRaised;
    if (queueFilter === 'speaking') return entry.role !== 'viewer';
    return true;
  });

  return (
    <Box className="min-h-screen bg-slate-950 text-slate-100">
      <Box className="mx-auto flex max-w-[1700px] flex-col gap-4 p-3 md:p-5">
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
                <Button
                  onPress={() => setIsLive((current) => !current)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2"
                >
                  <ButtonText className="text-sm font-semibold text-slate-200">
                    {isLive ? 'Live room' : 'Upcoming room'}
                  </ButtonText>
                </Button>
                <Button
                  onPress={() => setIsAdmin((current) => !current)}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2"
                >
                  <ButtonText className="text-sm font-semibold text-emerald-300">
                    {isAdmin ? 'Admin view' : 'Viewer view'}
                  </ButtonText>
                </Button>
              </Box>
            </Box>
          </Box>
        ) : null}

        {!joined ? (
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <Text className="text-xl font-semibold text-white">Join first to unlock the room</Text>
            <Button onPress={handleJoinHangout} className="mt-4 rounded-full bg-emerald-600 px-4 py-2">
              <ButtonText className="text-sm font-semibold text-white">Join now</ButtonText>
            </Button>
          </Card>
        ) : !isLive ? (
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <Text className="mt-2 text-sm text-slate-400">
              The room is not live yet. Full access to live will be available once streaming starts
            </Text>
            <Box className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <Text className="text-sm font-semibold text-emerald-300">Topic</Text>
              <Text className="mt-1 text-lg font-semibold text-white">Building a better developer community in Nigeria</Text>
              <Text className="mt-2 text-sm text-slate-400">Starting soon </Text>
            </Box>
          </Card>
        ) : (
          <Box className="flex flex-col gap-3">
            {/* Slim top bar — everything else moved into the drawer below */}
            <Box className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <Box className="flex items-center gap-3">
                <Box className="rounded-full bg-rose-500/20 px-3 py-1">
                  <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-300">Live</Text>
                </Box>
                <Text className="text-sm text-slate-400">
                  {screenSharers.length > 0 ? `${screenSharers.length} sharing screen` : 'No one sharing a screen yet'}
                </Text>
              </Box>

              <Box className="flex flex-wrap gap-2">
                <Button onPress={() => setAdminMuted((current) => !current)} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2">
                  <ButtonText className="text-sm font-semibold text-slate-200">
                    {adminMuted ? 'Unmute room' : 'Mute room'}
                  </ButtonText>
                </Button>
                <Button onPress={() => setIsAdmin((current) => !current)} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                  <ButtonText className="text-sm font-semibold text-emerald-300">
                    {isAdmin ? 'Admin controls' : 'Viewer controls'}
                  </ButtonText>
                </Button>
              </Box>
            </Box>

            {/*
              The stage: the entire remaining window height, split evenly
              across the 3 live feeds (admin camera + 2 challenger screens).
              This is the whole point of the room, so it gets almost all
              the space.
            */}
            <Box className="grid gap-3 lg:h-[calc(100vh-190px)] lg:grid-cols-3">
              {/* Admin / host live camera */}
              <Box className="flex min-h-[360px] flex-col justify-between gap-4 rounded-[1.5rem] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.24),_transparent_60%),linear-gradient(135deg,_rgba(30,41,59,0.98),_rgba(2,6,23,0.98))] p-5 lg:h-full">
                <Box className="flex items-start justify-between">
                  <Box>
                    <Text className="text-lg font-semibold text-white">{hostParticipant?.name}</Text>
                    <Text className="text-sm text-slate-300">{hostParticipant?.skill}</Text>
                  </Box>
                  <Box className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                    <Text className="text-sm font-medium text-emerald-300">
                      {hostParticipant?.muted ? 'Mic muted' : canSpeak ? 'Mic live' : 'Mic muted'}
                    </Text>
                  </Box>
                </Box>

                <Box className="flex flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                  <Text className="text-sm text-slate-300">{hostParticipant?.name} is live on camera and ready to speak.</Text>
                </Box>

                <Box className="flex flex-wrap gap-2">
                  <Button onPress={toggleMic} className={canSpeak ? 'rounded-full bg-slate-700 px-3 py-2' : 'rounded-full bg-emerald-600 px-3 py-2'}>
                    <ButtonText className="text-sm font-semibold text-white">
                      {micEnabled ? 'Turn mic off' : 'Turn mic on'}
                    </ButtonText>
                  </Button>
                  <Button onPress={toggleHostScreenShare} className={screenStream ? 'rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-2' : 'rounded-full border border-slate-700 bg-slate-900 px-3 py-2'}>
                    <ButtonText className="text-sm font-semibold text-white">
                      {screenStream ? 'Stop sharing' : 'Share my screen'}
                    </ButtonText>
                  </Button>
                  <Button onPress={toggleFullScreen} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2">
                    <ButtonText className="text-sm font-semibold text-white">{isFullScreen ? 'Exit full screen' : 'Full screen'}</ButtonText>
                  </Button>
                </Box>
              </Box>

              {/* Screen share tile 1 */}
              <Box className="flex min-h-[360px] flex-col rounded-[1.5rem] border border-slate-700 bg-slate-900/70 p-4 lg:h-full">
                <Text className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  {screenSharers[0] ? `${screenSharers[0].name}'s screen` : 'Screen share slot 1'}
                </Text>
                {screenSharers[0]?.id === 'host' && screenStream ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="mt-3 min-h-0 w-full flex-1 rounded-[1.1rem] object-cover"
                  />
                ) : screenSharers[0] ? (
                  <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                    <Text className="text-sm text-slate-300">
                      {screenSharers[0].name} is sharing a coding screen, challenge board, and terminal output.
                    </Text>
                  </Box>
                ) : (
                  <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                    <Text className="text-sm text-slate-400">Waiting for a challenger to share their screen.</Text>
                  </Box>
                )}
              </Box>

              {/* Screen share tile 2 */}
              <Box className="flex min-h-[360px] flex-col rounded-[1.5rem] border border-slate-700 bg-slate-900/70 p-4 lg:h-full">
                <Text className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  {screenSharers[1] ? `${screenSharers[1].name}'s screen` : 'Screen share slot 2'}
                </Text>
                {screenSharers[1] ? (
                  <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                    <Text className="text-sm text-slate-300">
                      {screenSharers[1].name} is sharing a coding screen, challenge board, and terminal output.
                    </Text>
                  </Box>
                ) : (
                  <Box className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.1rem] border border-dashed border-slate-700 bg-slate-950/70 p-4 text-center">
                    <Text className="text-sm text-slate-400">Waiting for a second challenger to share their screen.</Text>
                  </Box>
                )}
              </Box>
            </Box>

            {shareError ? <Text className="text-sm text-amber-300">{shareError}</Text> : null}
          </Box>
        )}
      </Box>

      {/* Floating launcher for chat / people / challenge match — stays out
          of the way of the stage until someone wants it. */}
      {joined && isLive ? (
        <Box className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          <Button
            onPress={() => openPanel('chat')}
            className="relative rounded-full bg-emerald-600 px-5 py-3 shadow-2xl shadow-emerald-950/60"
          >
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

      {/* Slide-out drawer with the rest of the room: chat, roster, challenge */}
      {roomPanelOpen ? (
        <Box className="fixed inset-0 z-50 flex justify-end">
          <Box onClick={() => setRoomPanelOpen(false)} className="absolute inset-0 bg-black/60" />

          <Box className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
            <Box className="flex items-center justify-between border-b border-slate-800 p-4">
              <Text className="text-lg font-semibold text-white">Room</Text>
              <Button onPress={() => setRoomPanelOpen(false)} className="rounded-full border border-slate-700 bg-slate-900 p-2">
                <Box className="text-slate-200">
                  <CloseIcon />
                </Box>
              </Button>
            </Box>

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
                  className={
                    activeTab === tab.key
                      ? 'rounded-full bg-emerald-600 px-3 py-1.5'
                      : 'rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5'
                  }
                >
                  <ButtonText className="text-xs font-semibold text-white">{tab.label}</ButtonText>
                </Button>
              ))}
            </Box>

            <Box className="flex-1 overflow-y-auto p-4">
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
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Write in the live stream"
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                    />
                    <button type="submit" className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                      Send
                    </button>
                  </form>
                </Box>
              ) : null}

              {activeTab === 'people' ? (
                <Box className="flex flex-col gap-3">
                  <Text className="text-sm text-slate-400">
                    {participants.length} in the room • {handRaisedCount} hand{handRaisedCount === 1 ? '' : 's'} raised • {speakingCount} on stage
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
                        className={
                          queueFilter === filter.key
                            ? 'rounded-full bg-emerald-600 px-3 py-1.5'
                            : 'rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5'
                        }
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
  );
}