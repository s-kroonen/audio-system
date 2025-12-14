// packages/host/src/webRtcEngine.ts
import * as wrtc from 'wrtc';
import { AudioEngine } from "./audio-engine";

type ClientEntry = {
    id: string;
    pc: wrtc.RTCPeerConnection;
    audioSource: any; // nonstandard RTCAudioSource
    track: any;
    channelCount: number;
    currentChannel: number;
    frameCounter: number; // for cycling channels
    registeredAt: string;
    pendingCandidates: any[]; // ICE candidates before remoteDescription
};

export class WebRtcEngine {
    private clients = new Map<string, ClientEntry>();
    private audioEngine: AudioEngine;

    constructor(audioEngine: AudioEngine) {
        this.audioEngine = audioEngine;

        this.audioEngine.on("frame", (samples: Int16Array) => {
            for (const [, entry] of this.clients.entries()) {
                const chCount = entry.channelCount || 2;
                const interleaved = new Int16Array(samples.length * chCount);

                // Fill all channels: only current channel has full amplitude, others silent
                for (let i = 0; i < samples.length; i++) {
                    for (let ch = 0; ch < chCount; ch++) {
                        interleaved[i * chCount + ch] = samples[i] * (ch === entry.currentChannel ? 1 : 0.2);
                    }
                }

                try {
                    entry.audioSource.onData({
                        samples: interleaved,
                        sampleRate: 48000,
                        bitsPerSample: 16,
                        channelCount: chCount,
                    });
                } catch (e) {
                    console.warn("audio feed err", entry.id, e);
                }

                // Cycle channel every N frames for audible effect
                entry.frameCounter = (entry.frameCounter || 0) + 1;
                const framesPerCycle = (48000 / 480) * 1; // ~1 second per channel
                if (entry.frameCounter % framesPerCycle === 0) {
                    entry.currentChannel = (entry.currentChannel + 1) % chCount;
                }
            }
        });
    }

    start() {
        console.log("[WebRTC] Engine started");
    }

    createOfferForClient = async (clientId: string, channelCount: number = 2) => {
        if (this.clients.has(clientId)) {
            const prev = this.clients.get(clientId)!;
            try { prev.pc.close(); } catch {}
            this.clients.delete(clientId);
        }

        const pc = new wrtc.RTCPeerConnection({ iceServers: [] });
        const nonstandard = (wrtc as any).nonstandard;
        const audioSource = new nonstandard.RTCAudioSource();
        const track = audioSource.createTrack({
            trackId: `audio-${clientId}`,
            streamId: `stream-${clientId}`,
            channelCount
        });
        pc.addTrack(track);

        const entry: ClientEntry = {
            id: clientId,
            pc,
            audioSource,
            track,
            channelCount,
            currentChannel: 0,
            frameCounter: 0,
            registeredAt: new Date().toISOString(),
            pendingCandidates: []
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) entry.pendingCandidates.push(event.candidate);
        };

        pc.onconnectionstatechange = () => {
            console.log(`[WebRTC] client ${clientId} connectionState=${pc.connectionState}`);
            if (pc.connectionState === "failed" || pc.connectionState === "closed") {
                try { track.stop(); } catch {}
                this.clients.delete(clientId);
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`[WebRTC] client ${clientId} ICEState=${pc.iceConnectionState}`);
        };

        const offer = await pc.createOffer({ offerToReceiveAudio: true });
        await pc.setLocalDescription(offer);

        this.clients.set(clientId, entry);

        console.log(`[WebRTC] Offer created for ${clientId}`);
        console.log("Offer SDP preview:", offer.sdp?.slice(0, 200));

        return { sdp: offer.sdp, type: offer.type };
    };

    acceptClientAnswer = async (clientId: string, sdp: string, type = "answer") => {
        const entry = this.clients.get(clientId);
        if (!entry) throw new Error("client not found");

        await entry.pc.setRemoteDescription({ type, sdp });

        // Add ICE candidates gathered before remoteDescription
        for (const c of entry.pendingCandidates) {
            try { await entry.pc.addIceCandidate(c); } catch (e) {
                console.warn("Failed to add ICE candidate", e);
            }
        }
        entry.pendingCandidates = [];
    };

    addIceCandidate = async (clientId: string, candidate: any) => {
        const entry = this.clients.get(clientId);
        if (!entry) return;
        try { await entry.pc.addIceCandidate(candidate); } catch (e) {
            console.warn("Error adding ICE candidate", e);
        }
    };

    listClients() {
        return Array.from(this.clients.values()).map(c => ({
            id: c.id,
            registeredAt: c.registeredAt,
            channelCount: c.channelCount
        }));
    }

    stopClient(clientId: string) {
        const e = this.clients.get(clientId);
        if (!e) return;
        try { e.pc.close(); e.track?.stop(); } catch {}
        this.clients.delete(clientId);
    }
}
