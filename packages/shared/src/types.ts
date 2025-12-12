export type SourceType = "spotify" | "airplay" | "bluetooth" | "linein" | "client";

export interface AudioSource {
    id: string;
    name: string;
    type: SourceType;
    meta?: Record<string, unknown>;
    // playback state:
    playing?: boolean;
    positionMs?: number;
}

export interface ClientStatus  {
    id: string;
    ip: string;
    rtpPort: number;
    online: boolean;
    latencyMs: number;
    signalStrength: number;
};

export interface ClientInfo {
    id: string;
    name: string;
    host: string; // ip/url
    lastSeen: string; // ISO string
    latencyMs: number;
    offsetMs: number; // manual / calibration offset
    online: boolean;
    capabilities?: {
        a2dpInput?: boolean;
        outputDevices?: string[];
    };
}

export interface RoutingMap {
    id: string; // unique id for mapping
    sourceId: string;
    clientIds: string[]; // which clients should play this source
    volume?: number; // 0-1 per-map
    muted?: boolean;
}
