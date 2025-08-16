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

/**
 * 单实例锁机制
 * 防止应用重复启动，确保只有一个实例运行
 */
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
    // 如果无法获得单实例锁，说明已有实例在运行，直接退出
    app.quit();
} else {
    // 监听第二个实例启动事件
    app.on('second-instance', () => {
        if (win) {
            // 如果主窗口存在，恢复并聚焦到主窗口
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });
}

/**
 * 创建主窗口
 * @returns {BrowserWindow} 创建的主窗口实例
 */
function createWindow(): BrowserWindow {
    // 获取主显示器的可用工作区域尺寸
    const size = screen.getPrimaryDisplay().workAreaSize;

    // 创建主浏览器窗口
    win = new BrowserWindow({
        // 窗口位置：居中显示
        x: Math.round((size.width - size.width / 2) / 2),
        y: Math.round((size.height - size.height / 2) / 2),
        // 窗口尺寸：屏幕的一半
        width: size.width / 2,
        height: size.height / 2,
        show: false, // 初始隐藏窗口，等待内容加载完成后再显示
        webPreferences: {
            // 启用 Node.js 集成
            nodeIntegration: true,
            // 开发模式允许不安全内容
            allowRunningInsecureContent: serve,
            // 禁用上下文隔离
            contextIsolation: false,
            // 开发模式禁用 Web 安全策略
            webSecurity: !serve
        },
    });

    // 将主窗口引用传递给 IPC 管理器，用于窗口控制功能
    ipcManager.setMainWindow(win);

    // 监听窗口准备显示事件
    win.once('ready-to-show', () => {
        // 关闭加载窗口并显示主窗口
        winLoading?.close();
        win?.show();
    });

    // 根据运行模式加载不同的内容
    if (serve) {
        // 可选：启用调试工具（npm i -D electron-debug）
        // import('electron-debug').then(debug => {
        //     debug.default({isEnabled: true, showDevTools: true});
        // });

        // 可选：启用热重载（npm i -D electron-reloader）
        // import('electron-reloader').then(reloader => {
        //     const reloaderFn = (reloader as any).default || reloader;
        //     reloaderFn(module);
        // });

        // 开发阶段自动打开开发者工具
        win.webContents.openDevTools();
        // 加载 Angular 开发服务器地址
        win.loadURL('http://localhost:4200');
    } else {
        // 生产模式：加载打包后的静态文件
        // 优先加载打包后的 index.html，否则回退到本地 index.html
        const packedIndexPath = path.join(__dirname, '../browser/index.html');
        const fallbackIndexPath = path.join(__dirname, './index.html');
        const indexToLoad = fs.existsSync(packedIndexPath) ? packedIndexPath : fallbackIndexPath;
        win.loadFile(indexToLoad).then(() => {
            // ok
        }).finally(() => {
            // error
        })
    }

    // 监听窗口关闭事件
    win.on('closed', () => {
        // 清理窗口引用，防止内存泄漏
        // 注意：如果应用支持多窗口，应该将窗口存储在数组中并删除相应元素
        win = null;
    });
    return win;
}

/** 应用主逻辑 */
try {
    /**
     * 应用准备就绪事件
     * 当 Electron 完成初始化并准备好创建浏览器窗口时触发
     * 某些 API 必须在此事件发生后才能使用
     */
    app.whenReady().then(() => {
        // 生产模式下创建加载窗口
        if (!serve) {
            winLoading = createLoadingWindow();
        }

        /** 延迟创建主窗口
         * 开发模式：立即创建
         * 生产模式：延迟 400ms 以修复透明窗口黑色背景问题
         * 参考：https://github.com/electron/electron/issues/15947
         * */
        const showDelayMs = serve ? 0 : 400;
        setTimeout(createWindow, showDelayMs);
    });

    /**
     * 所有窗口关闭事件
     * 当应用的所有窗口都关闭时触发
     */
    app.on('window-all-closed', () => {
        // macOS 特殊处理：应用及其菜单栏保持活动状态，直到用户使用 Cmd + Q 明确退出
        // 注意：由于托盘功能，窗口关闭时不会退出应用，而是隐藏到托盘
        if (!isMac) {
            // 只有在没有托盘或用户明确要求退出时才退出应用
            // 这里可以根据需要调整逻辑
        }
    });

    /**
     * 应用激活事件（仅 macOS）
     * 当点击 Dock 图标且没有其他窗口打开时触发
     */
    app.on('activate', () => {
        // 如果没有主窗口，重新创建一个
        if (win === null) {
            createWindow();
        }
    });

} catch (e) {
    // 捕获并记录应用启动过程中的错误
    console.error('应用启动时发生错误:', e);
}

/**
 * 创建加载窗口
 * 在生产模式下显示应用启动进度
 * @returns {BrowserWindow} 创建的加载窗口实例
 */
function createLoadingWindow(): BrowserWindow {
    // 创建加载窗口
    winLoading = new BrowserWindow({
        width: 350,
        height: 350,
        frame: false,
        transparent: true,
        // 始终置顶
        alwaysOnTop: true,
        webPreferences: {
            // 启用 Node.js 集成
            nodeIntegration: true,
            // 禁用上下文隔离
            contextIsolation: false
        }
    });
    // 加载加载页面
    const loadingPath = path.join(__dirname, '../browser/loading.html');
    winLoading.loadFile(loadingPath).then(() => {
        // ok
    }).finally(() => {
        // error
    })
    return winLoading;
}
