export class AudioEngine {
    private pipelines: Map<string, any> = new Map();

    init() {
        console.log("[AudioEngine] Initialized");
    }

    startPipeline(sourceId: string, clientIds: string[]) {
        console.log(`[AudioEngine] Create pipeline for ${sourceId} → ${clientIds.join(", ")}`);
        // TODO: spawn GStreamer process
    }

    stopPipeline(sourceId: string) {
        console.log(`[AudioEngine] Stop pipeline for ${sourceId}`);
        // TODO: kill pipeline
    }

    restartPipelines(routingTable: Map<string, string[]>) {
        console.log("[AudioEngine] Rebuilding pipelines...");
        // TODO: rebuild all pipelines based on routing changes
    }
}
