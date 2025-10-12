import { Routes } from '@angular/router';
import { CalculationsModule } from '../../core/enums/calculation.enum';
import { CalculationComponent } from './calculation.component';
import { unsavedChangesGuard } from '../../guards/unsaved-changes.guard';

export const CalculationRoutes: Routes = [
    {
        path: `${CalculationsModule.CALCULATION}/:study_code`,
        children: [],
        component: CalculationComponent,
        canDeactivate: [unsavedChangesGuard],
    },
];
