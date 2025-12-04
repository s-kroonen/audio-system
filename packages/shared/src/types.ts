export interface ClientStatus {
    id: string;
    online: boolean;
    latencyMs: number;
    signalStrength: number;
}

export interface AudioSource {
    id: string;
    type: "spotify" | "airplay" | "bluetooth" | "linein";
}

export interface RoutingMap {
    sourceId: string;
    clientIds: string[];
}
