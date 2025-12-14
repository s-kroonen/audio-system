import { ClientConfig } from "../main/config.js";

export async function startClient(config: ClientConfig) {
    console.log("Registering client:", config.clientId);

    // client.ts
    const reg = await fetch(`${config.host}/api/clients/register`, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
            id: config.clientId,
            channelCount: config.channels || 2, // client-reported
            // optional: sampleRate, preferredOutput, etc.
        })
    });


    if (!reg.ok) throw new Error("Register failed");

    const offer = await reg.json();
    if (!offer?.sdp) throw new Error("No offer from host");

    const pc = new RTCPeerConnection();

    // Receive-only audio
    pc.addTransceiver("audio", { direction: "recvonly" });

    // Logging ICE states
    pc.oniceconnectionstatechange = () => console.log("ICE state:", pc.iceConnectionState);
    pc.onicegatheringstatechange = () => console.log("ICE gathering:", pc.iceGatheringState);

    // Send ICE candidates to host as they are gathered
    pc.onicecandidate = async (event) => {
        console.log("ICE candidate", event);
        if (event.candidate) {
            try {
                await fetch(`${config.host}/api/clients/${config.clientId}/candidate`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ candidate: event.candidate })
                });
            } catch (err) {
                console.error("Failed to send ICE candidate:", err);
            }
        }
    };

    // Handle remote audio track
    pc.ontrack = async (ev) => {
        console.log("ontrack fired", ev.streams.length);

        // ev.streams may be empty when coming from nonstandard Node source
        const stream = ev.streams[0] || new MediaStream([ev.track]);

        const track = stream.getAudioTracks()[0];
        if (track) {
            track.onmute = () => console.warn("track muted");
            track.onunmute = () => console.log("track unmuted");
        }

        const audio = document.createElement("audio");
        audio.autoplay = true;
        audio.srcObject = stream;

        if (config.outputDevice && "setSinkId" in audio) {
            // @ts-ignore
            await audio.setSinkId(config.outputDevice);
        }

        document.body.appendChild(audio);
        try {
            await audio.play();
            console.log("Audio playback started");
        } catch (err) {
            console.error("Audio play() failed:", err);
        }
    };


    // Set remote offer from host
    await pc.setRemoteDescription({ type: "offer", sdp: offer.sdp });

    // Create and send local answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await fetch(`${config.host}/api/clients/${config.clientId}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(answer)
    });

    console.log("Client connected");
}
