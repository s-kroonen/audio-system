import { FastifyInstance } from "fastify";
import clientsApi from "./api/clients";
import routingApi from "./api/routing";
import sourcesApi from "./api/sources";
import statusApi from "./api/status";

export function registerRoutes(server: FastifyInstance) {
    server.register(clientsApi, { prefix: "/api/clients" });
    server.register(routingApi, { prefix: "/api/routing" });
    server.register(sourcesApi, { prefix: "/api/sources" });
    server.register(statusApi, { prefix: "/api/status" });
}
