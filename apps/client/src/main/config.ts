import fs from "fs"
import path from "path"

export interface ClientConfig {
    host: string
    clientId: string
    channels: number
    sampleRate: number
    outputDevice?: string
    headless: boolean
}

const DEFAULT_CONFIG: ClientConfig = {
    host: "http://localhost:3000",
    clientId: "client-1",
    channels: 1,
    sampleRate: 48000,
    headless: false
}

const CONFIG_FILE = "client.json"

function getConfigPath() {
    // Works for:
    // - pnpm dev
    // - electron .
    // - extracted ZIP
    return path.join(process.cwd(), CONFIG_FILE)
}

export function loadConfig(): ClientConfig {
    const configPath = getConfigPath()

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(
            configPath,
            JSON.stringify(DEFAULT_CONFIG, null, 2),
            "utf-8"
        )
        console.log(`Created default config at ${configPath}`)
        return DEFAULT_CONFIG
    }

    try {
        const raw = fs.readFileSync(configPath, "utf-8")
        const parsed = JSON.parse(raw)

        // Merge with defaults to allow partial configs
        return {
            ...DEFAULT_CONFIG,
            ...parsed
        }
    } catch (err) {
        console.error("Failed to load config, using defaults:", err)
        return DEFAULT_CONFIG
    }
}
