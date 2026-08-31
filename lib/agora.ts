import AgoraRTC from "agora-rtc-sdk-ng";

function getApiBase()  {
    return process.env.NEXT_AGORA_APP_ID || "";
}

let client: any = null;

export async function intializeClient() {
    client = AgoraRTC.createClient({ mode: "live", codec: "vp8", role: "host" });
}