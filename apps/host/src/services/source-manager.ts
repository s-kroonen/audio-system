import { AudioSource } from "@shared/types";
import { SourceScanner } from "../core/source-scanner";

export class SourceManager {
    private scanner = new SourceScanner();

    list() {
        return this.scanner.listSources();
    }

    add(src: AudioSource) {
        this.scanner.addSource(src);
    }
}
