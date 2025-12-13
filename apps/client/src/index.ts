// packages/client/src/client.ts
import fetch from "node-fetch";
import wrtc from "wrtc";
import Speaker from "speaker";
import { EventEmitter } from "events";

interface ClientConfig {
    host: string;
    clientId: string;
    outputDevice?: number; // optional speaker device index
    channels?: number;
    sampleRate?: number;
    bitDepth?: number;
    reconnectAttempts?: number;
    reconnectDelay?: number; // ms
}

const defaultConfig: ClientConfig = {
    host: process.env.HOST_URL || "http://localhost:3000",
    clientId: process.env.CLIENT_ID || "client1",
    channels: 1,
    bitDepth: 16,
    sampleRate: 48000,
    reconnectAttempts: 5,
    reconnectDelay: 3000,
};

class AudioClient extends EventEmitter {
    private config: ClientConfig;
    private speaker?: Speaker;
    private pc?: wrtc.RTCPeerConnection;
    private attempts = 0;

    constructor(config?: Partial<ClientConfig>) {
        super();
        this.config = { ...defaultConfig, ...config };
    }

    async start() {
        try {
            await this.connect();
        } catch (err) {
            console.error("Initial connection failed:", err);
            await this.tryReconnect();
        }
    }

    private async tryReconnect() {
        while (this.attempts < (this.config.reconnectAttempts || 0)) {
            this.attempts++;
            console.log(`Reconnect attempt ${this.attempts}...`);
            await new Promise((r) => setTimeout(r, this.config.reconnectDelay));
            try {
                await this.connect();
                console.log("Reconnected successfully!");
                return;
            } catch (err) {
                console.error("Reconnect failed:", err);
            }
        }
        console.error("All reconnect attempts failed. Exiting.");
        process.exit(1);
    }

    private async connect() {
        console.log("Registering client with host:", this.config.host);

        const reg = await fetch(`${this.config.host}/api/clients/register`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: this.config.clientId }),
        });

        if (!reg.ok) throw new Error("Register failed " + reg.statusText);

        const offer = await reg.json();
        if (!offer || !offer.sdp) throw new Error("No offer from host");

        this.pc = new wrtc.RTCPeerConnection({ iceServers: [] });
        this.pc.addTransceiver("audio", { direction: "recvonly" });

        this.speaker = new Speaker({
            channels: this.config.channels,
            bitDepth: this.config.bitDepth,
            sampleRate: this.config.sampleRate,
        });

        this.pc.ontrack = (ev: any) => {
            const track = ev.track || (ev.streams?.[0]?.getAudioTracks?.()?.[0]);
            if (!track) {
                console.warn("No audio track received", ev);
                return;
            }

            const nonstandard = (wrtc as any).nonstandard;
            const sink = new nonstandard.RTCAudioSink(track);

            sink.ondata = (data: any) => {
                try {
                    const buf = Buffer.from(data.samples.buffer);
                    this.speaker!.write(buf);
                } catch (err) {
                    console.error("Error writing audio to speaker:", err);
                }
            };

            track.onended = () => {
                sink.stop();
                console.log("Track ended");
            };
        };

        await this.pc.setRemoteDescription({ type: offer.type || "offer", sdp: offer.sdp });
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        const postAnswer = await fetch(`${this.config.host}/api/clients/${this.config.clientId}/answer`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ type: this.pc.localDescription?.type, sdp: this.pc.localDescription?.sdp }),
        });

        if (!postAnswer.ok) throw new Error("Posting answer failed " + postAnswer.statusText);

        console.log("Client connected and ready to receive audio.");
    }
}

// Example usage:
const client = new AudioClient({
    outputDevice: 0, // currently Speaker lib uses default device, can be extended later
    reconnectAttempts: 10,
});
client.start();
