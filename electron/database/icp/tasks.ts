import {BrowserWindow, ipcMain} from 'electron';
import {AppDataSource} from '../config';
import {Tasks} from '../entity/Tasks';

const tasksRepo = AppDataSource.getRepository(Tasks);

class TasksService {

    private mainWindow: BrowserWindow | null = null;

    constructor() {
        // 初始化icp
        this.init();
    }

    /** 设置主窗口引用 */
    setMainWindow(window: BrowserWindow): void {
        this.mainWindow = window;
    }

    init() {
        // 获取所有的任务列表
        ipcMain.handle('task-get-all', async () => {
            const data = await tasksRepo.find({
                where: {isDeleted: false},
                order: {createdAt: 'ASC'}
            });
            return {code: 200, data};
        });

        // 以id查询单条数据
        ipcMain.handle('task-find-one', async (event, id) => {
            const agent: any = await tasksRepo.findOneBy({id});
            return agent
                ? {code: 200, data: agent}
                : {code: 400, msg: '数据不存在'};
        });

        // 创建新的任务
        ipcMain.handle('task-create', async (event, data) => {
            try {
                console.log(data)
                delete data.id;
                const createData = await tasksRepo.save(data);
                return {code: 200, msg: '新建成功！', data: createData};
            } catch (e) {
                return {code: 400, msg: '新建失败！'};
            }
        });

        // 更新任务信息
        ipcMain.handle('task-update', async (event, data) => {
            try {
                await tasksRepo.update({id: data.id}, data);
                const updated = await tasksRepo.findOneBy({id: data.id});
                return {code: 200, msg: '更新成功！', data: updated};
            } catch {
                return {code: 400, msg: '更新失败！'};
            }
        });

        // 删除任务
        ipcMain.handle('task-delete', async (event, id) => {
            try {
                if (!id) return {code: 400, msg: '删除需要有id！'};
                await tasksRepo.delete(id);
                return {code: 200, msg: '删除成功！'};
            } catch {
                return {code: 400, msg: '删除失败！'};
            }
        });
    }
}

export const tasksService = new TasksService();
