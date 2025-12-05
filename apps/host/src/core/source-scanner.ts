import {AudioSource} from "@shared/types";

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
