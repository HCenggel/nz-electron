import "reflect-metadata";
import {DataSource} from "typeorm";
import {Tasks} from './entity/Tasks';
import {app} from 'electron';
import * as path from 'path';

const userDataPath = app.getPath('userData')
console.log(userDataPath)
export const AppDataSource = new DataSource({
    type: "sqlite",
    // 在用户信息目录创建数据库文件
    database: path.join(userDataPath, "AppData/db/sqlite.db"),
    // 开发阶段自动建表
    synchronize: true,
    entities: [
        Tasks
    ],
});
