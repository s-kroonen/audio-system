import { app, BrowserWindow } from "electron"
import path from "path"
import { registerIpc } from "./ipc.js"
import { fileURLToPath } from "url"


let win: BrowserWindow | null = null

async function createWindow() {
    registerIpc()
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    win = new BrowserWindow({
        show: !process.argv.includes("--headless"),
        width: 700,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    await win.loadFile(path.join(__dirname, "../../index.html"))
}
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required")


app.whenReady().then(createWindow)
