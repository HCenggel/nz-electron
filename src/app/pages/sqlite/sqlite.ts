import {Component, inject, OnInit, signal} from '@angular/core';
import {ElectronService} from '../../services/electron-service';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzModalService} from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-sqlite',
    imports: [
        NzFormModule, NzInputModule, NzButtonModule, ReactiveFormsModule,
        NzDividerModule, NzTagModule
    ],
    template: `
        <div class="p-10">
            <form nz-form [formGroup]="validateForm" class="login-form" (ngSubmit)="submitForm()">
                <nz-form-item>
                    <nz-form-label [nzSm]="6" [nzXs]="24" nzRequired nzFor="name">任务名称</nz-form-label>
                    <nz-form-control [nzSm]="14" [nzXs]="24" nzErrorTip="任务名称为必填字段!">
                        <input nz-input formControlName="name" id="name"/>
                    </nz-form-control>
                </nz-form-item>
                <nz-form-item>
                    <nz-form-label [nzSm]="6" [nzXs]="24" nzRequired nzFor="description">任务描述</nz-form-label>
                    <nz-form-control [nzSm]="14" [nzXs]="24" nzErrorTip="任务描述为必填字段!">
                        <textarea nz-input placeholder="请输入任务描述" formControlName="description" id="description"
                                  [nzAutosize]="{ minRows: 3, maxRows: 5 }"></textarea>
                    </nz-form-control>
                </nz-form-item>
                <div class="text-center">
                    <button nz-button class="login-form-button login-form-margin" [nzType]="'primary'">添加新任务
                    </button>
                </div>
            </form>
            <nz-divider nzText="任务列表"></nz-divider>
            @if (taskList().length) {
                <table class="w-full">
                    <tr>
                        <th class="text-left">任务名称</th>
                        <th class="text-left">任务描述</th>
                        <th class="text-left">是否完成</th>
                        <th class="text-left w-40">操作</th>
                    </tr>
                    @for (item of taskList(); track item.id) {
                        <tr>
                            <td>{{ item.name }}</td>
                            <td>{{ item.description }}</td>
                            <td>
                                @if (item.completed) {
                                    <nz-tag nzColor="success">完成</nz-tag>
                                } @else {
                                    <nz-tag nzColor="error">未完成</nz-tag>
                                }
                            </td>
                            <td>
                                <button class="mr-2" nz-button nzType="primary" nzSize="small"
                                        (click)="completeTaskModal(item)">完成
                                </button>
                                <button class="mr-2" nz-button nzType="primary" nzSize="small" nzDanger
                                        (click)="deleteTaskModal(item.id)">删除
                                </button>
                            </td>
                        </tr>
                    }
                </table>
            }
        </div>
    `,
    styles: `
        table { table-layout: fixed;
            td, th { border: 1px solid #ddd; padding: 8px;}
        }
    `
})
export default class Sqlite implements OnInit {
    // 所有的icp都需要引入这个
    private readonly electronService: ElectronService = inject(ElectronService);
    // 任务列表
    public taskList = signal<any[]>([]);
    // 表单相关
    private fb = inject(NonNullableFormBuilder);
    public validateForm = this.fb.group({
        name: this.fb.control('', [Validators.required]),
        description: this.fb.control('', [Validators.required]),
        completed: this.fb.control(false)
    });
    //
    public readonly modal: NzModalService = inject(NzModalService);

    ngOnInit(): void {
        this.getAllTasks()
    }

    // 表单提交
    async submitForm() {
        if (this.validateForm.valid) {
            this.createTask(this.validateForm.value);
        } else {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
        }
    }

    // 获取所有的任务列表
    getAllTasks() {
        this.electronService.ipcRenderer.invoke('task-get-all').then((res: any) => {
            console.log('getAllTasks', res.data);
            if (res.code === 200) {
                this.taskList.set(res.data);
            }
        })
    }

    // 创建一个任务
    createTask(data: any) {
        this.electronService.ipcRenderer.invoke('task-create', data).then((res: any) => {
            this.getAllTasks();
            this.validateForm.reset();
        })
    }

    // 更新一个任务
    updateTask(data: any) {
        this.electronService.ipcRenderer.invoke('task-update', data).then((res: any) => {
            this.getAllTasks();
        })
    }

    // 删除一个任务
    deleteTask(id: string) {
        this.electronService.ipcRenderer.invoke('task-delete', id).then((res: any) => {
            this.getAllTasks();
        })
    }


    completeTaskModal(data: any): void {
        this.modal.confirm({
            nzTitle: '<strong>确认</strong>',
            nzContent: '<b>要完成这个任务吗?</b>',
            nzOnOk: () => {
                data.completed = true;
                this.updateTask(data)
            }
        });
    }

    deleteTaskModal(id: string): void {
        this.modal.confirm({
            nzTitle: '删除确认',
            nzContent: '删除后数据不可恢复！',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => {
                this.deleteTask(id);
            },
            nzOnCancel: () => console.log('OK')
        });
    }
}
