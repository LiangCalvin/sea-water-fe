import { Observable, of, throwError } from 'rxjs';
import { ComponentCanDeactivate, unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
    let mockComponent: jasmine.SpyObj<ComponentCanDeactivate>;

    beforeEach(() => {
        mockComponent = jasmine.createSpyObj<ComponentCanDeactivate>('ComponentCanDeactivate', [
            'hasUnsavedChanges',
            'openUnsavedChangesModal'
        ]);
    });

    it('should return true if component is null', () => {
        expect(unsavedChangesGuard(mockComponent, null as any, null as any, null as any)).toBeTrue();
    });

    it('should return true if hasUnsavedChanges returns false', () => {
        mockComponent.hasUnsavedChanges.and.returnValue(false);
        expect(unsavedChangesGuard(mockComponent, null as any, null as any, null as any)).toBeTrue();
    });

    it('should open modal when there are unsaved changes', (done) => {
        mockComponent.hasUnsavedChanges.and.returnValue(true);
        mockComponent.openUnsavedChangesModal.and.returnValue(of(true));

        const result = unsavedChangesGuard(mockComponent, null as any, null as any, null as any);

        expect(result).toBeTruthy();
        if (result instanceof Observable) {
            result.subscribe((value) => {
                expect(value).toBeTrue();
                done();
            });
        }
    });

    it('should fallback to confirm when openUnsavedChangesModal is not defined', () => {
        spyOn(window, 'confirm').and.returnValue(true);

        mockComponent.hasUnsavedChanges.and.returnValue(true);
        (mockComponent.openUnsavedChangesModal as any) = undefined;

        const result = unsavedChangesGuard(mockComponent, null as any, null as any, null as any);
        expect(window.confirm).toHaveBeenCalledWith(
            'You have unsaved changes. Are you sure you want to leave?'
        );
        expect(result).toBeTrue();
    });

    it('should fallback to confirm when openUnsavedChangesModal does not return Observable', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        mockComponent.hasUnsavedChanges.and.returnValue(true);
        mockComponent.openUnsavedChangesModal.and.returnValue('not-an-observable' as any);

        const result = unsavedChangesGuard(mockComponent, null as any, null as any, null as any);
        expect(window.confirm).toHaveBeenCalledWith(
            'You have unsaved changes. Are you sure you want to leave?'
        );
        expect(result).toBeFalse();
    });

    it('should fallback to confirm if hasUnsavedChanges throws error', () => {
        spyOn(window, 'confirm').and.returnValue(true);

        mockComponent.hasUnsavedChanges.and.callFake(() => {
            throw new Error('Test error');
        });

        const result = unsavedChangesGuard(mockComponent, null as any, null as any, null as any);
        expect(window.confirm).toHaveBeenCalledWith(
            'An error occurred. Do you want to continue navigation?'
        );
        expect(result).toBeTrue();
    });
});