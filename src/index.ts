import { BrowserWindow, ipcMain, app } from 'electron'
import path from 'path'
class Main {
    static mainWindow: Electron.BrowserWindow | null
    static application: Electron.App
    static browserWindow = BrowserWindow;

    static onWindowAllClosed() {
        if (process.platform != 'darwin')
            Main.application.quit()
    }

    static onClose() {
        Main.mainWindow = null
    }

    static onReady() {
        const htmlPath = path.join("..", "assets", "index.html")
        Main.mainWindow = new Main.browserWindow({
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                backgroundThrottling: false,
                enableRemoteModule: true,
            },
            width: 800, height: 600,
            minWidth: 800,
            minHeight: 600,
            title: "Automatas"
        });
        Main.mainWindow.loadFile(htmlPath)
        Main.mainWindow.setMenuBarVisibility(false)
        Main.mainWindow.on('closed', Main.onClose)
    }
    static main(application: Electron.App) {
        Main.application = application;
        Main.application.on('window-all-closed', Main.onWindowAllClosed)
        Main.application.on('ready', Main.onReady)
    }


}

if (app)
    Main.main(app)
