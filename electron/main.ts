import {app, BrowserWindow, screen} from 'electron';
const ipc = require('./ipc');
import * as path from 'path';
import * as fs from 'fs';

let win: BrowserWindow | null = null;
let winLoading: BrowserWindow | null = null;
const args = process.argv.slice(1);
// 开发的时候为tree
const serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

    const size = screen.getPrimaryDisplay().workAreaSize;

    // 创建浏览器窗口。
    win = new BrowserWindow({
        x: Math.round((size.width - size.width/2) / 2),
        y: Math.round((size.height - size.height/2) / 2),
        width: size.width/2,
        height: size.height/2,
        show: false, // 在加载完成前不要显示主窗口
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: serve,
            contextIsolation: false,
            webSecurity: !serve
        },
    });

    // 在主窗口加载完成后，关闭加载窗口并显示主窗口
    win.once('ready-to-show', () => {
        winLoading?.close();
        win?.show();
    });

    if (serve) {
        // 如果需要安装 electron-debug
        // import('electron-debug').then(debug => {
        //     debug.default({isEnabled: true, showDevTools: true});
        // });
        // 如果需要安装 electron-reloader
        // import('electron-reloader').then(reloader => {
        //     const reloaderFn = (reloader as any).default || reloader;
        //     reloaderFn(module);
        // });
        win.loadURL('http://localhost:4200');
    } else {
        // 运行 Electron 可执行文件的路径
        let pathIndex = './index.html';

        if (fs.existsSync(path.join(__dirname, '../browser/index.html'))) {
            // 在本地文件夹中运行 Electron 时的路径
            pathIndex = '../browser/index.html';
        }

        const fullPath = path.join(__dirname, pathIndex);
        const url = `file://${path.resolve(fullPath).replace(/\\/g, '/')}`;
        win.loadURL(url);
    }

    // 当窗口关闭时发出。
    win.on('closed', () => {
        // 取消引用窗口对象。通常情况下，如果你的应用支持多窗口，你会将窗口存储在一个数组中。这时，你应该删除相应的元素。
        win = null;
    });

    // 关闭加载窗口
    return win;
}

try {
    // 当 Electron 完成初始化并准备好创建浏览器窗口时，将调用此方法。
    // 某些 API 必须在此事件发生后才能使用。
    // 增加了 400 毫秒的延迟，以修复使用透明窗口时黑色背景的问题。更多详情请访问 https://github.com/electron/electron/issues/15947
    app.on('ready', () => {
        winLoading = createLoadingWindow();
        setTimeout(createWindow, 1000);
    });

    // 当所有窗口都关闭时退出。
    app.on('window-all-closed', () => {
        // 在 OS X 上，应用程序及其菜单栏通常会保持活动状态，直到用户使用 Cmd + Q 明确退出
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // 在 OS X 上，当点击 Dock 图标且没有其他窗口打开时，通常会在应用中重新创建一个窗口。
        if (win === null) {
            createWindow();
        }
    });

} catch (e) {
    // 捕获错误抛出 e;
}

// 加载器
function createLoadingWindow(): BrowserWindow {
    winLoading = new BrowserWindow({
        width: 350,
        height: 350,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    const loadingPath = path.join(__dirname, '../browser/loading.html');
    winLoading.loadFile(loadingPath);
    return winLoading;
}
