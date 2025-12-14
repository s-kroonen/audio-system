import { ipcMain } from "electron"
import { loadConfig } from "./config.js"

export function registerIpc() {
    ipcMain.handle("get-config", async () => {
        return loadConfig()
    })
}
