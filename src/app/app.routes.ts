import { Routes } from '@angular/router';
import { CalculationComponent } from './pages/calculation/calculation.component';
import { AllStudiesModule } from './core/enums/all-studies.enum';
import { RoleEnum } from './core/enums/role.enum';
import { AllStudiesRoutes } from './pages/all-studies/all-studies.routes';
import { CreateNewStudyRoutes } from './pages/create-new-study/create-new-study.routes';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';
import { CalculationRoutes } from './pages/calculation/calculation.routes';
import { MyStudiesRoutes } from './pages/my-studies/my-studies.routes';
import { StudyDetailsRoutes } from './pages/study-details/study-details.routes';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: '',
        redirectTo: AllStudiesModule.ALL_STUDIES,
        pathMatch: 'full', // Required for exact matching on root path
    },
    {
        path: '',
        // canActivate: [permissionGuard],
        data: {
            roles: [RoleEnum.FULL_ACCESS, RoleEnum.USER]
        },
        children: [
            ...AllStudiesRoutes,
            ...CreateNewStudyRoutes.map(route => ({
                ...route,
                canDeactivate: [unsavedChangesGuard]
            })),
            ...CalculationRoutes.map(route => ({
                ...route,
                canDeactivate: [unsavedChangesGuard]
            })),
            ...MyStudiesRoutes.map(route => ({
                ...route,
                canDeactivate: [unsavedChangesGuard]
            })),
            ...StudyDetailsRoutes.map(route => ({
                ...route,
                canDeactivate: [unsavedChangesGuard]
            })),
            {
                path: 'calculation/:study_code',
                component: CalculationComponent,
                canDeactivate: [unsavedChangesGuard]
            },
        ]
    },
    // {
    //     path: 'access-denied',
    //     loadComponent: () =>
    //         import('./pages/access-denied/access-denied.component').then(
    //             (m) => m.AccessDeniedComponent,
    //         ),
    // },
    // {
    //     path: 'credentials-not-found',
    //     loadComponent: () =>
    //         import(
    //             './pages/credentials-not-found/credentials-not-found.component'
    //         ).then((m) => m.CredentialsNotFoundComponent),
    // },
    // {
    //     path: 'page-not-found',
    //     loadComponent: () =>
    //         import('./pages/page-not-found/page-not-found.component').then(
    //             (m) => m.PageNotFoundComponent,
    //         ),
    // },
    { path: '**', redirectTo: 'calculation' },
];
