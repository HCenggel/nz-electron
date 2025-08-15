import {Injectable} from '@angular/core';
import {ipcRenderer, webFrame} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

@Injectable({
    providedIn: 'root'
})
export class ElectronService {
    public ipcRenderer!: typeof ipcRenderer;
    public webFrame!: typeof webFrame;
    public childProcess!: typeof childProcess;
    public fs!: typeof fs;

    constructor() {
        if (this.isElectron) {
            this.ipcRenderer = (window as any).require('electron').ipcRenderer;
            this.webFrame = (window as any).require('electron').webFrame;

            this.fs = (window as any).require('fs');

            this.childProcess = (window as any).require('child_process');
            this.childProcess.exec('node -v', (error, stdout, stderr) => {
                if (error) {
                    console.error(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout:\n${stdout}`);
            });

            // 注意事项：
            // * 使用 'window.require' 导入的 NodeJS 依赖项必须同时存在于 `app/package.json` 和 `package.json (root folder)` 的 `dependencies` 中，才能在 Electron 的渲染进程（src 文件夹）中正常工作，
            // 因为 Electron 会在运行时加载它。
            // * 使用 TS 模块导入（例如：import { Dropbox } from 'dropbox'）导入的 NodeJS 依赖项只能存在于
            // `package.json (root folder)` 的 `dependencies` 中，因为它会在构建阶段加载，无需
            // 出现在最终的 bundle 中。提醒：仅当 Electron 的主进程（app 文件夹）中未使用时才需要。

            // 如果您想在渲染进程中使用 NodeJS 第三方依赖项，
            // ipcRenderer.invoke 可以满足许多常见用例。
            // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
        }
    }

    get isElectron(): boolean {
        return !!(window && window.process && window.process.type);
    }
}
