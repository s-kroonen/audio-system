// packages/host/src/audioEngine.ts
import { EventEmitter } from "events";

/**
 * AudioEngine: generates a sine tone and emits PCM frames (Int16Array).
 * Frame size: 480 samples (10ms @ 48kHz) mono, signed 16-bit
 */
export class AudioEngine extends EventEmitter {
    private sampleRate = 48000;
    private frameSamples = 480; // 10ms frames
    private freq = 440;
    private phase = 0;
    private running = false;
    private intervalId?: NodeJS.Timeout;

    start() {
        if (this.running) return;
        this.running = true;

        const step = (2 * Math.PI * this.freq) / this.sampleRate;

        const emitFrame = () => {
            const buf = new Int16Array(this.frameSamples);
            for (let i = 0; i < this.frameSamples; i++, this.phase += step) {
                // simple sine wave - amplitude scaled to int16
                const s = Math.sin(this.phase);
                buf[i] = Math.max(-1, Math.min(1, s)) * 0.6 * 0x7fff;
            }
            // emit 'frame' event with Int16Array
            this.emit("frame", buf);
        };

        // schedule at roughly 10ms
        this.intervalId = setInterval(emitFrame, 10);
    }

    stop() {
        this.running = false;
        if (this.intervalId) clearInterval(this.intervalId);
    }
}
