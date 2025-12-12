// src/routes/api/clients.ts
import { FastifyInstance } from "fastify";
import { webrtc, clientRegistry } from "../index";

export default async function clientsApi(server: FastifyInstance) {

    // List WebRTC clients
    server.get("/", async () => {
        return webrtc.listClients();
    });

    // Client asks for an SDP offer
    server.post("/register", async (req, res) => {
        const { id } = req.body as any;
        if (!id) return res.status(400).send({ error: "Missing id" });

        try {
            const offer = await webrtc.createOfferForClient(id);
            clientRegistry[id] = { lastSeen: Date.now() };
            return offer;
        } catch (e: any) {
            return res.status(500).send({ error: e.message });
        }
    });

    // Client sends SDP answer
    server.post("/:id/answer", async (req, res) => {
        const { id } = req.params as any;
        const { sdp, type } = req.body as any;

        if (!sdp) return res.status(400).send({ error: "Missing SDP" });

        try {
            await webrtc.acceptClientAnswer(id, sdp, type || "answer");
            clientRegistry[id] = { lastSeen: Date.now() };
            return { success: true };
        } catch (e: any) {
            return res.status(500).send({ error: e.message });
        }
    });
}
