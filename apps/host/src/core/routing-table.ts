export class RoutingTable {
    private table = new Map<string, string[]>(); // sourceId -> clientIds[]

    getTable() {
        return this.table;
    }

    getClientsForSource(sourceId: string) {
        return this.table.get(sourceId) || [];
    }

    setRouting(sourceId: string, clientIds: string[]) {
        this.table.set(sourceId, clientIds);
    }

    removeRouting(sourceId: string) {
        this.table.delete(sourceId);
    }
}
