import { ipcMain, BrowserWindow } from 'electron';

/**
 * IPC 通信管理类
 * 负责处理主进程与渲染进程之间的通信
 */
export class IpcManager {
    private mainWindow: BrowserWindow | null = null;

    constructor() {
        this.initializeIpcHandlers();
    }

    /**
     * 设置主窗口引用
     * @param window 主窗口实例
     */
    setMainWindow(window: BrowserWindow): void {
        this.mainWindow = window;
    }

    /**
     * 初始化所有 IPC 处理器
     */
    private initializeIpcHandlers(): void {
        this.setupRandomNumberHandler();
        this.setupWindowControlHandlers();
        this.setupSystemInfoHandlers();
    }

    /**
     * 设置随机数生成处理器
     */
    private setupRandomNumberHandler(): void {
        ipcMain.handle('getRandomNumbers', async (): Promise<number> => {
            try {
                return Math.ceil(Math.random() * 100000);
            } catch (error) {
                console.error('生成随机数时出错:', error);
                throw new Error('生成随机数失败');
            }
        });
    }

    /**
     * 设置窗口控制处理器
     */
    private setupWindowControlHandlers(): void {
        // 最小化窗口
        ipcMain.handle('minimizeWindow', async (): Promise<void> => {
            try {
                if (this.mainWindow) {
                    this.mainWindow.minimize();
                }
            } catch (error) {
                console.error('最小化窗口时出错:', error);
                throw new Error('最小化窗口失败');
            }
        });

        // 最大化/恢复窗口
        ipcMain.handle('toggleMaximize', async (): Promise<void> => {
            try {
                if (this.mainWindow) {
                    if (this.mainWindow.isMaximized()) {
                        this.mainWindow.unmaximize();
                    } else {
                        this.mainWindow.maximize();
                    }
                }
            } catch (error) {
                console.error('切换窗口最大化状态时出错:', error);
                throw new Error('切换窗口状态失败');
            }
        });

        // 关闭窗口
        ipcMain.handle('closeWindow', async (): Promise<void> => {
            try {
                if (this.mainWindow) {
                    this.mainWindow.close();
                }
            } catch (error) {
                console.error('关闭窗口时出错:', error);
                throw new Error('关闭窗口失败');
            }
        });
    }

    /**
     * 设置系统信息处理器
     */
    private setupSystemInfoHandlers(): void {
        // 获取应用版本
        ipcMain.handle('getAppVersion', async (): Promise<string> => {
            try {
                const { app } = require('electron');
                return app.getVersion();
            } catch (error) {
                console.error('获取应用版本时出错:', error);
                throw new Error('获取应用版本失败');
            }
        });

        // 获取平台信息
        ipcMain.handle('getPlatform', async (): Promise<string> => {
            try {
                return process.platform;
            } catch (error) {
                console.error('获取平台信息时出错:', error);
                throw new Error('获取平台信息失败');
            }
        });
    }

    /**
     * 清理所有 IPC 处理器
     */
    cleanup(): void {
        ipcMain.removeHandler('getRandomNumbers');
        ipcMain.removeHandler('minimizeWindow');
        ipcMain.removeHandler('toggleMaximize');
        ipcMain.removeHandler('closeWindow');
        ipcMain.removeHandler('getAppVersion');
        ipcMain.removeHandler('getPlatform');
    }
}

// 创建并导出 IPC 管理器实例
export const ipcManager = new IpcManager();
