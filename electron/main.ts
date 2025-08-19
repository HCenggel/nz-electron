import {app, BrowserWindow, screen} from 'electron';
import {ipcManager} from './ipcManager';
import * as path from 'path';
import * as fs from 'fs';

// 全局窗口引用 - 主窗口
let win: BrowserWindow | null = null;
// 加载窗口
let winLoading: BrowserWindow | null = null;
// 命令行参数解析
const args = process.argv.slice(1);
// 是否为开发模式
const serve = args.some(val => val === '--serve');
// 是否为 macOS 系统
const isMac = process.platform === 'darwin';

function createWindow(): BrowserWindow {

    const size = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    win = new BrowserWindow({
        x: Math.round((size.width - size.width / 2) / 2),
        y: Math.round((size.height - size.height / 2) / 2),
        width: size.width / 2,
        height: size.height / 2,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: serve,
            contextIsolation: false,
            webSecurity: !serve
        },
    });

    // IPC
    ipcManager.setMainWindow(win);

    if (serve) {
        // import('electron-debug').then(debug => {
        //     debug.default({isEnabled: true, showDevTools: true});
        // });
        //
        // import('electron-reloader').then(reloader => {
        //     const reloaderFn = (reloader as any).default || reloader;
        //     reloaderFn(module);
        // });
        win.webContents.openDevTools();
        win.loadURL('http://localhost:4200');
    } else {
        // Path when running electron executable
        let pathIndex = './index.html';

        if (fs.existsSync(path.join(__dirname, '../browser/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../browser/index.html';
        }

        const fullPath = path.join(__dirname, pathIndex);
        const url = `file://${path.resolve(fullPath).replace(/\\/g, '/')}`;
        win.loadURL(url).then(() => {
            // ok
        }).finally(() => {
            // error
        })
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    return win;
}

try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    app.on('ready', () => setTimeout(createWindow, 400));

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });

} catch (e) {
    // Catch Error
    // throw e;
}
