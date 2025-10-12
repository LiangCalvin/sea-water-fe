import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  hasUnsavedChanges: () => boolean;
  openUnsavedChangesModal: () => Observable<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = (
  component: ComponentCanDeactivate
): boolean | Observable<boolean> => {

  if (!component || typeof component.hasUnsavedChanges !== 'function') {
    return true;
  }
  try {
    const hasUnsaved = component.hasUnsavedChanges();
    if (hasUnsaved) {
      if (typeof component.openUnsavedChangesModal === 'function') {
        const modalResult = component.openUnsavedChangesModal();

        if (modalResult instanceof Observable) {
          return modalResult;
        } else {
          return confirm('You have unsaved changes. Are you sure you want to leave?');
        }
      } else {
        return confirm('You have unsaved changes. Are you sure you want to leave?');
      }
    }
    return true;
  } catch (error) {
    return confirm('An error occurred. Do you want to continue navigation?');
  }
};
