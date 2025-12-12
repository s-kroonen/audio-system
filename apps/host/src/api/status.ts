import { FastifyInstance } from "fastify";
import { sources, routingTable, webrtc, clientRegistry } from "../index";

export default async function statusApi(server: FastifyInstance) {
    server.get("/", () => ({
        webrtcClients: webrtc.listClients(),
        sources: sources.listSources(),
        routing: Object.fromEntries(routingTable.getTable()),
        uptime: process.uptime(),
        timestamp: Date.now()
    }));
}
