'use client';

import { useEffect, useRef, useState } from 'react';

export default function DiscussionPage() {
  const [status, setStatus] = useState('Ready to join');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clientRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const tracksRef = useRef<{ audio: any; video: any } | null>(null);

  useEffect(() => {
    return () => {
      if (tracksRef.current) {
        tracksRef.current.audio?.close();
        tracksRef.current.video?.close();
      }

      if (clientRef.current) {
        clientRef.current.leave().catch(() => undefined);
      }
    };
  }, []);

  const getAgoraClient = async () => {
    const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || process.env.NEXT_AGORA_APP_ID;

    if (!appId) {
      throw new Error('Add NEXT_PUBLIC_AGORA_APP_ID to your .env file before joining the stream.');
    }

    if (!clientRef.current) {
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8', role: 'host' });

      client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }

        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.on('user-left', () => {
        setStatus('Remote participant left the stream');
      });

      clientRef.current = client;
    }

    return clientRef.current;
  };

  const handleJoin = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const client = await getAgoraClient();
      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || process.env.NEXT_AGORA_APP_ID;
      const channelName = 'devconnect-live';

      await client.join(appId, channelName, null, 0);

      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      tracksRef.current = { audio: audioTrack, video: videoTrack };
      await client.publish([audioTrack, videoTrack]);

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      setJoined(true);
      setStatus('Streaming live to the DevConnect channel');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not join the Agora channel.';
      setError(message);
      setStatus('Join failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!clientRef.current) {
      setJoined(false);
      setStatus('Ready to join');
      return;
    }

    try {
      if (tracksRef.current) {
        tracksRef.current.audio?.close();
        tracksRef.current.video?.close();
        tracksRef.current = null;
      }

      await clientRef.current.leave();
      setJoined(false);
      setStatus('Left the stream');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not leave the stream.';
      setError(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Agora live</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">DevConnect streaming room</h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleJoin}
              disabled={loading || joined}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {loading ? 'Joining...' : joined ? 'Joined' : 'Join stream'}
            </button>
            <button
              type="button"
              onClick={handleLeave}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Leave
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
          Status: <span className="font-medium text-white">{status}</span>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-amber-700 bg-amber-500/10 p-3 text-sm text-amber-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Local feed</div>
            <div ref={localVideoRef} className="h-[280px] w-full rounded-2xl border border-dashed border-slate-700 bg-slate-950" />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Remote feed</div>
            <div ref={remoteVideoRef} className="h-[280px] w-full rounded-2xl border border-dashed border-slate-700 bg-slate-950" />
          </div>
        </div>
      </div>
    </main>
  );
}