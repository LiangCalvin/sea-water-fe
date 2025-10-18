import { Routes } from '@angular/router';
import { CreateNewStudyComponent } from './create-new-study.component';
import { unsavedChangesGuard } from '../../guards/unsaved-changes.guard';
import { ChatComponent } from '../calculation/components/recommendation/component/chat/chat.component';

export const CreateNewStudyRoutes: Routes = [
  {
    path: 'create-new-study',
    children: [],
    component: ChatComponent,
    canDeactivate: [unsavedChangesGuard]
  },
];
