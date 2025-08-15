import {ipcMain} from 'electron';

class ipc {

}

// 生成随机数
ipcMain.handle('getRandomNumbers', async () => {
    return Math.ceil(Math.random() * 100000);
});

module.exports = ipc;
