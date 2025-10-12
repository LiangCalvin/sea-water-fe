import { Routes } from '@angular/router';
import { CreateNewStudyComponent } from './create-new-study.component';
import { unsavedChangesGuard } from '../../guards/unsaved-changes.guard';

export const CreateNewStudyRoutes: Routes = [
    {
        path: 'create-new-study',
        children: [],
        component: CreateNewStudyComponent,
        canDeactivate: [unsavedChangesGuard]
    },
];
