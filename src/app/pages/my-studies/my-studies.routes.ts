import { Routes } from '@angular/router';
import { MySudiesModule } from '../../core/enums/all-studies.enum';

export const MyStudiesRoutes: Routes = [
    {
        path: MySudiesModule.MY_STUDIES,
        loadComponent: () => import('./my-studies.component').then(m => m.MyStudiesComponent),
        children: []
    },
];
