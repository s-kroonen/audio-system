import { FastifyInstance } from "fastify";
import { clients, sources, routingTable } from "../index";

export default async function statusApi(server: FastifyInstance) {
    server.get("/", () => ({
        clients: clients.list(),
        sources: sources.list(),
        routing: Object.fromEntries(routingTable.getTable()),
        uptime: process.uptime(),
        timestamp: Date.now()
    }));
}
