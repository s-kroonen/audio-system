import { FastifyInstance } from "fastify";
import { routingTable, audioEngine } from "../index";

export default async function routingApi(server: FastifyInstance) {
    server.get("/", () => routingTable.getTable());

    server.post("/", async (req) => {
        const { sourceId, clientIds } = req.body as any;

        routingTable.setRouting(sourceId, clientIds);
        audioEngine.restartPipelines(routingTable.getTable());

        return { success: true };
    });

    server.delete("/:sourceId", async (req) => {
        const { sourceId } = req.params as any;

        routingTable.removeRouting(sourceId);
        audioEngine.stopPipeline(sourceId);

        return { success: true };
    });
}
