export function startSyncClock() {
    setInterval(() => {
        const now = Date.now();
        // Later: broadcast via WebSocket
        // client adjusts audio clock based on RTT
    }, 250);
}
