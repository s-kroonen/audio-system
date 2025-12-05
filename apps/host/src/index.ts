import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";

import { registerRoutes } from "./routes";
import { startSyncClock } from "./core/sync-clock";
import { AudioEngine } from "./core/audio-engine";
import { ClientManager } from "./services/client-manager";
import { SourceManager } from "./services/source-manager";
import { GroupManager } from "./services/group-manager";
import { RoutingTable } from "./core/routing-table";

// GLOBAL SINGLETONS
export const audioEngine = new AudioEngine();
export const clients = new ClientManager();
export const sources = new SourceManager();
export const groups = new GroupManager();
export const routingTable = new RoutingTable();

async function main() {
    const server = Fastify({ logger: true });

    await server.register(fastifyWebsocket);
    await server.register(fastifyCors, { origin: "*" });

    audioEngine.init();
    startSyncClock();

    registerRoutes(server);

    server.listen({ port: 8080, host: "0.0.0.0" });
}

main();
