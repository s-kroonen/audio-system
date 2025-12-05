export interface Group {
    id: string;
    name: string;
    clientIds: string[];
}

export class GroupManager {
    private groups = new Map<string, Group>();

    list() {
        return [...this.groups.values()];
    }

    create(group: Group) {
        this.groups.set(group.id, group);
    }

    update(id: string, data: Partial<Group>) {
        const g = this.groups.get(id);
        if (!g) return;
        this.groups.set(id, { ...g, ...data });
    }
}
