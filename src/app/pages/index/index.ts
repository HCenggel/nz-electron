import {Component, inject} from '@angular/core';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ElectronService} from '../../services/electron-service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'app-index',
    imports: [NzIconModule, NzButtonModule, RouterLink],
    templateUrl: './index.html',
    styleUrl: './index.scss'
})
export default class Index {
    public readonly electronService: ElectronService = inject(ElectronService);
    public num: number = 0;

    async testFun1() {
        this.num = await this.electronService.ipcRenderer.invoke('getRandomNumbers');
    }
}
