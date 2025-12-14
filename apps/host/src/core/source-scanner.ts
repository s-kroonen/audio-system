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

export class SourceScanner {
    private sources: AudioSource[] = [
        {id: "spotify", name: "Spotify", type: "spotify"},
        {id: "airplay-1", name: "Air Play", type: "airplay"},
        {id: "linein-1", name: "LineIN", type: "linein"}
    ];

    listSources(): AudioSource[] {
        return this.sources;
    }

    addSource(src: AudioSource) {
        this.sources.push(src);
    }
}
