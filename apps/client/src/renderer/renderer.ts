import { startClient } from "./client.js"

declare global {
    interface Window {
        api: {
            getConfig(): Promise<any>
        }
    }
}

async function boot() {
    const status = document.getElementById("status")!

    try {
        const config = await window.api.getConfig()
        status.textContent = "Connecting to host…"
        await startClient(config)
        status.textContent = "Connected"
    } catch (err) {
        console.error(err)
        status.textContent = "Failed to start client"
    }
}

boot()
