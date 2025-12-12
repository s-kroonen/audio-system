// src/index.ts
import Fastify from "fastify";
import { registerRoutes } from "./routes";
import { AudioEngine } from "./core/audio-engine";
import { WebRtcEngine } from "./core/webrtc-engine";
import { RoutingTable } from "./core/routing-table";
import { SourceScanner } from "./core/source-scanner";

export const audioEngine = new AudioEngine();
export const routingTable = new RoutingTable();
export const sources = new SourceScanner();
export const webrtc = new WebRtcEngine(audioEngine);

// optional client registry for statusApi
export const clientRegistry: { [id: string]: { lastSeen: number } } = {};

const server = Fastify({ logger: true });
registerRoutes(server);

// start engines
audioEngine.start();
webrtc.start();

server.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
    console.log("Host running on :3000");
});
