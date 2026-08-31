const DEFAULT_APP_ID = '52bf03cde64e4ce099acbf90047639a8';
const DEFAULT_CHANNEL = 'devconnect-live';

let client = null;
let localAudioTrack = null;
let localVideoTrack = null;

export function getAgoraConfig() {
  if (typeof window === 'undefined') {
    return {
      appId: DEFAULT_APP_ID,
      channel: DEFAULT_CHANNEL,
      token: null,
      uid: 0,
    };
  }

  const appId = window.__DEVCONNECT_AGORA_APP_ID || DEFAULT_APP_ID;
  return {
    appId,
    channel: DEFAULT_CHANNEL,
    token: null,
    uid: 0,
  };
}

export async function initializeClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  const AgoraRTC = await import('agora-rtc-sdk-ng');
  client = AgoraRTC.default.createClient({ mode: 'live', codec: 'vp8', role: 'host' });

  client.on('user-published', async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === 'video' && user.videoTrack) {
      const container = document.getElementById('remote-video');
      if (container) {
        user.videoTrack.play(container);
      }
    }
  });

  return client;
}

export async function joinChannel() {
  if (!client) {
    await initializeClient();
  }

  const { appId, channel, token, uid } = getAgoraConfig();
  await client.join(appId, channel, token || null, uid);

  const AgoraRTC = await import('agora-rtc-sdk-ng');
  localAudioTrack = await AgoraRTC.default.createMicrophoneAudioTrack();
  localVideoTrack = await AgoraRTC.default.createCameraVideoTrack();
  await client.publish([localAudioTrack, localVideoTrack]);

  const localContainer = document.getElementById('local-video');
  if (localContainer && localVideoTrack) {
    localVideoTrack.play(localContainer);
  }

  return client;
}

export async function leaveChannel() {
  if (!client) return;

  if (localAudioTrack) {
    localAudioTrack.close();
  }

  if (localVideoTrack) {
    localVideoTrack.close();
  }

  await client.leave();
  client = null;
  localAudioTrack = null;
  localVideoTrack = null;
}
