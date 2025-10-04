import {Routes} from '@angular/router';

export const routes: Routes = [
    {path: '', loadComponent: () => import('./pages/index')},
    {path: 'sqlite', loadComponent: () => import('./pages/sqlite/sqlite')}
];
