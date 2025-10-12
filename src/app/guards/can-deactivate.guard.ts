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
    if (component.hasUnsavedChanges()) {
      if (typeof component.openUnsavedChangesModal === 'function') {
        return component.openUnsavedChangesModal();
      }
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  } catch (error) {
    console.warn('Error in unsavedChangesGuard:', error);
    return true;
  }
};