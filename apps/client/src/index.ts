// packages/client/src/client.ts
import fetch from "node-fetch";
import wrtc from 'wrtc';

import Speaker from "speaker";

const HOST = process.env.HOST_URL || "http://localhost:3000";
const CLIENT_ID = process.env.CLIENT_ID || "client1";

async function runClient() {
    // 1) register -> get offer SDP
    const reg = await fetch(`${HOST}/api/clients/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: CLIENT_ID }),
    });
    if (!reg.ok) throw new Error("register failed " + reg.statusText);
    const offer = await reg.json();
    if (!offer || !offer.sdp) throw new Error("no offer from host");

    const pc = new wrtc.RTCPeerConnection({ iceServers: [] });


    // add recvonly transceiver
    pc.addTransceiver("audio", { direction: "recvonly" });

    // Prepare speaker for 48kHz mono 16-bit
    const speaker = new Speaker({ channels: 1, bitDepth: 16, sampleRate: 48000 });

    // handle incoming tracks: create RTCAudioSink on track and pipe to speaker
    pc.ontrack = (ev: any) => {
        // ev.track should exist (non-browser)
        const track = ev.track || (ev.streams && ev.streams[0] && ev.streams[0].getAudioTracks && ev.streams[0].getAudioTracks()[0]);
        if (!track) {
            console.warn("no audio track in event", ev);
            return;
        }

        const nonstandard = (wrtc as any).nonstandard;
        const sink = new nonstandard.RTCAudioSink(track);

        sink.ondata = (data: any) => {
            // data.samples is Int16Array
            const buf = Buffer.from(data.samples.buffer);
            speaker.write(buf);
        };

        track.onended = () => {
            sink.stop();
        };
    };

    // set remote (offer from host)
    await pc.setRemoteDescription({ type: offer.type || "offer", sdp: offer.sdp });

    // create and set local answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // post answer back to host
    const postAnswer = await fetch(`${HOST}/api/clients/${CLIENT_ID}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: pc.localDescription?.type, sdp: pc.localDescription?.sdp }),
    });
    if (!postAnswer.ok) throw new Error("posting answer failed " + postAnswer.statusText);

    console.log("Client connected and playing audio...");
}

runClient().catch((err) => {
    console.error("client error:", err);
    process.exit(1);
});
