import { Routes } from '@angular/router';
import { AllStudiesModule } from '../../core/enums/all-studies.enum';


export const StudyDetailsRoutes: Routes = [
    {
        path: AllStudiesModule.STUDY_DETAILS,
        loadComponent: () =>
            import('./study-details.component').then((m) => m.StudyDetailsComponent),
        children: [],
    },
];
