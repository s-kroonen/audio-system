import { FastifyInstance } from "fastify";
import { sources } from "../index";

export default async function sourcesApi(server: FastifyInstance) {
    server.get("/", () => sources.listSources());
}
