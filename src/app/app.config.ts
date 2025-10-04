import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {zh_CN, provideNzI18n} from 'ng-zorro-antd/i18n';
import {LocationStrategy, HashLocationStrategy, registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient} from '@angular/common/http';
import {NzModalService} from 'ng-zorro-antd/modal';

registerLocaleData(zh);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideNzI18n(zh_CN),
        importProvidersFrom(FormsModule),
        provideAnimationsAsync(),
        provideHttpClient(),
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        NzModalService
    ]
};
