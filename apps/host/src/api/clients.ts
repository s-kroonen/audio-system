import { FastifyInstance } from "fastify";
import { ClientStatus } from "@shared/types";

const clients: ClientStatus[] = [];

export default async function clientsApi(server: FastifyInstance) {
    server.get("/", async () => clients);

    server.post("/register", async (req, res) => {
        const { id } = req.body as any;

        const status: ClientStatus = {
            id,
            online: true,
            latencyMs: 0,
            signalStrength: 0
        };

        clients.push(status);

        return { success: true };
    });
}
