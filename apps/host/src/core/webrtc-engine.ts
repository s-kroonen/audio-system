// packages/host/src/webRtcEngine.ts
import * as wrtc from '@koush/wrtc';

import { AudioEngine } from "./audio-engine";


type ClientEntry = {
    id: string;
    pc: wrtc.RTCPeerConnection;
    audioSource: any; // nonstandard RTCAudioSource
    track: any;
    registeredAt: string;
};

export class WebRtcEngine {
    private clients = new Map<string, ClientEntry>();
    private audioEngine: AudioEngine;

    constructor(audioEngine: AudioEngine) {
        this.audioEngine = audioEngine;

        // feed audio frames from audio engine to all clients' audioSource
        this.audioEngine.on("frame", (samples: Int16Array) => {
            for (const [, entry] of this.clients.entries()) {
                try {
                    entry.audioSource.onData({
                        samples,
                        sampleRate: 48000,
                        bitsPerSample: 16,
                        channelCount: 1,
                    });
                } catch (e) {
                    // ignore per-client failures
                    // console.warn("audio feed err", entry.id, e);
                }
            }
        });
    }

    start() {
        console.log("[WebRTC] Engine started");
        // audio engine start is managed externally (server bootstrap)
    }

    createOfferForClient = async (clientId: string) => {
        // cleanup if already exists
        if (this.clients.has(clientId)) {
            try {
                const prev = this.clients.get(clientId)!;
                prev.pc.close();
            } catch {}
            this.clients.delete(clientId);
        }

        const pc = new wrtc.RTCPeerConnection({ iceServers: [] });

        // create RTCAudioSource (nonstandard)
        const nonstandard = (wrtc as any).nonstandard;
        const audioSource = new nonstandard.RTCAudioSource();
        const track = audioSource.createTrack();
        pc.addTrack(track);

        pc.onconnectionstatechange = () => {
            console.log(`[WebRTC] client ${clientId} connectionState=${pc.connectionState}`);
            if (pc.connectionState === "failed" || pc.connectionState === "closed") {
                try { track.stop(); } catch {}
                this.clients.delete(clientId);
            }
        };

        // create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // store client entry
        this.clients.set(clientId, {
            id: clientId,
            pc,
            audioSource,
            track,
            registeredAt: new Date().toISOString(),
        });

        // return SDP offer
        const localDesc = pc.localDescription!;
        return { sdp: localDesc.sdp, type: localDesc.type };
    };

    acceptClientAnswer = async (clientId: string, sdp: string, type = "answer") => {
        const entry = this.clients.get(clientId);
        if (!entry) throw new Error("client not found");
        await entry.pc.setRemoteDescription({ type, sdp });
    };

    listClients() {
        return Array.from(this.clients.values()).map((c) => ({
            id: c.id,
            registeredAt: c.registeredAt,
        }));
    }

    stopClient(clientId: string) {
        const e = this.clients.get(clientId);
        if (!e) return;
        try {
            e.pc.close();
            e.track?.stop();
        } catch {}
        this.clients.delete(clientId);
    }
}
