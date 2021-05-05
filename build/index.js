"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.onWindowAllClosed = function () {
        if (process.platform != 'darwin')
            Main.application.quit();
    };
    Main.onClose = function () {
        Main.mainWindow = null;
    };
    Main.onReady = function () {
        var htmlPath = path_1.default.join("..", "assets", "index.html");
        Main.mainWindow = new Main.browserWindow({
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                backgroundThrottling: false,
                enableRemoteModule: true,
                webviewTag: true
            },
            width: 800, height: 600,
            minWidth: 800,
            minHeight: 600,
            icon: __dirname + '/resources/osborn.png',
            fullscreenable: true,
            title: "Prime Link"
        });
        Main.mainWindow.maximize();
        Main.mainWindow.loadFile(htmlPath);
        Main.mainWindow.setMenuBarVisibility(true);
        Main.mainWindow.on('closed', Main.onClose);
    };
    Main.main = function (application) {
        Main.application = application;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    };
    Main.browserWindow = electron_1.BrowserWindow;
    return Main;
}());
if (electron_1.app)
    Main.main(electron_1.app);
