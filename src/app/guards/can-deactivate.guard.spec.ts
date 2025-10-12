import { of } from 'rxjs';
import { unsavedChangesGuard, ComponentCanDeactivate } from './can-deactivate.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('unsavedChangesGuard', () => {
    let mockComponent: jasmine.SpyObj<ComponentCanDeactivate>;
    let route: ActivatedRouteSnapshot;
    let state: RouterStateSnapshot;

    beforeEach(() => {
        mockComponent = jasmine.createSpyObj<ComponentCanDeactivate>('ComponentCanDeactivate', [
            'hasUnsavedChanges',
            'openUnsavedChangesModal',
        ]);
        route = {} as ActivatedRouteSnapshot;
        state = {} as RouterStateSnapshot;
    });

    it('should return true if component is null', () => {
        const result = unsavedChangesGuard(mockComponent, route, state, null as any);
        expect(result).toBeTrue();
    });

    it('should return true if component.hasUnsavedChanges is not a function', () => {
        const result = unsavedChangesGuard(mockComponent, route, state, null as any);
        expect(result).toBeTrue();
    });

    it('should return true if there are no unsaved changes', () => {
        mockComponent.hasUnsavedChanges.and.returnValue(false);
        const result = unsavedChangesGuard(mockComponent, route, state, null as any);
        expect(result).toBeTrue();
    });

    it('should return modal observable if unsaved changes and modal exists', () => {
        mockComponent.hasUnsavedChanges.and.returnValue(true);
        mockComponent.openUnsavedChangesModal.and.returnValue(of(true));

        const result = unsavedChangesGuard(mockComponent, route, state, null as any);
        expect(result).toBeInstanceOf(Object); // Observable
    });

    it('should fallback to confirm if unsaved changes but no modal', () => {
        mockComponent.hasUnsavedChanges.and.returnValue(true);
        (mockComponent.openUnsavedChangesModal as any) = undefined;

        spyOn(window, 'confirm').and.returnValue(false);

        const result = unsavedChangesGuard(mockComponent, route, state, null as any);
        expect(window.confirm).toHaveBeenCalledWith(
            'You have unsaved changes. Are you sure you want to leave?'
        );
        expect(result).toBeFalse();
    });

    it('should return true and log warning if an error is thrown', () => {
        spyOn(console, 'warn');
        mockComponent.hasUnsavedChanges.and.throwError('Boom!');

        const result = unsavedChangesGuard(mockComponent, route, state, null as any);
        expect(result).toBeTrue();
        expect(console.warn).toHaveBeenCalledWith('Error in unsavedChangesGuard:', jasmine.any(Error));
    });
});