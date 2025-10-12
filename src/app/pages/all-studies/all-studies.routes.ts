import { Routes } from '@angular/router';
import { AllStudiesModule } from '../../core/enums/all-studies.enum';

export const AllStudiesRoutes: Routes = [
  {
    path: AllStudiesModule.ALL_STUDIES,
    loadComponent: () =>
      import('./all-studies.component').then((m) => m.AllStudiesComponent),
    children: [],
  },
];
