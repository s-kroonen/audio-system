import { ClientStatus } from "@shared/types";

export class ClientManager {
    private clients = new Map<string, ClientStatus>();

    register(id: string) {
        this.clients.set(id, {
            id,
            online: true,
            latencyMs: 0,
            signalStrength: 0
        });
    }

    updateStatus(id: string, status: Partial<ClientStatus>) {
        const existing = this.clients.get(id);
        if (!existing) return;

        this.clients.set(id, { ...existing, ...status });
    }

    list() {
        return [...this.clients.values()];
    }
}
