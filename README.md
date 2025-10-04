# NZ_Electron

一个基于 Electron + Angular + NG-ZORRO + Tailwindcss 的现代化桌面应用开发模板，集成了完整的开发工具链和最佳实践。

## 计划

- [x] 引入 TypeORM（经过验证TypeORM是目前开箱即用级别）【完成】
  - [x] SQLite 【内置】【完成】

  - [ ] PostgreSQL【未开始】

  - [ ] MySQL【未开始】
- [ ] 使用文档【正在进行中】
- [ ] 多语言配置【内置】【未开始】
- [ ] 优化IPC【内置】【未开始】
- [ ] 窗口管理【封装开箱即用】【未开始】
- [ ] 文件操作【封装开箱即用】【未开始】
- [ ] 热更新【未确定】


## 🚀 项目特性

### 核心技术栈
- **Electron v37** - 跨平台桌面应用框架
- **Angular v20** - 现代化的前端框架
- **NG-ZORRO v20** - 企业级 UI 组件库
- **Tailwind CSS v4** - 实用优先的 CSS 框架

## 📦 安装和运行

### 环境要求

- Node.js >= 22.16.0

### 快速开始

```shell
# 1. 克隆项目
git clone https://github.com/HCenggel/nz-electron.git
cd nz-electron

# 2. 安装依赖
npm i / yarn
```

### 开发模式

```shell
## 启动Angular
ng serve
## 启动Electron
npm run electron
```

### 生产构建

```shell
npm run electron:build
```

## 🏗️ 项目结构

```
ElectronAngular/
├── dist/                	 # 打包目录
│   ├── app              	 # Electron打包产物
│   ├── browser              # Angular打包产物
│   └── electron             # Electron 相关编译产物
├── electron/                # Electron 主进程代码
│   ├── main.ts              # 主进程入口文件
│   ├── ipcManager.ts        # IPC 通信管理器
│   └── package.json         # Electron 依赖配置
├── src/                     # Angular 应用源码
│   ├── app/                 # 应用主模块
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # 服务层
│   │   └── app.config.ts    # 应用配置
│   ├── main.ts              # Angular 入口文件
│   └── styles.scss          # 全局样式
├── public/                  # 静态资源
│   ├── icons/               # 应用图标
│   └── loading.html         # 加载页面
├── angular.json             # Angular 配置
├── electron-builder.json    # Electron 打包配置
└── package.json             # 项目依赖配置
```

## 🔧 核心功能

### IPC 通信系统
需要在electron/ipcManager.ts中写，具体请看案例代码！

### 使用IPC通信
```typescript
@Component({
    selector: 'app-index',
    imports: [NzIconModule, NzButtonModule],
    template:`
        <button nz-button nzType="primary" (click)="testFun1()">Click Me!</button>
    `
})
export default class Index {
    public readonly electronService: ElectronService = inject(ElectronService);

    async testFun1() {
        const data1 = await this.electronService.ipcRenderer.invoke('getRandomNumbers');
        console.log(data1);
    }
}

```

## 🙏 致谢

感谢以下开源项目的支持：

- [Angular](https://github.com/angular/angular) - 现代化的前端框架
- [NG-ZORRO](https://github.com/NG-ZORRO/ng-zorro-antd) - 企业级 UI 组件库
- [Electron](https://github.com/electron/electron) - 跨平台桌面应用框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [angular-electron](https://github.com/maximegris/angular-electron) - 本项目大部分灵感(code)来自此项目

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
