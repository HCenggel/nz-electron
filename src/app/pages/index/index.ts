import {Component, inject} from '@angular/core';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ElectronService} from '../../services/electron-service';
import {NzButtonModule} from 'ng-zorro-antd/button';

@Component({
    selector: 'app-index',
    imports: [NzIconModule, NzButtonModule],
    templateUrl: './index.html',
    styleUrl: './index.scss'
})
export default class Index {
    public readonly electronService: ElectronService = inject(ElectronService);

    async testFun1() {
        const data1 = await this.electronService.ipcRenderer.invoke('getRandomNumbers');
        console.log(data1);
    }
}
