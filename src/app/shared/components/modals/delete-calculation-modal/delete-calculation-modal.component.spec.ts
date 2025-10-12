import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteCalculationModalComponent } from './delete-calculation-modal.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { InjectionToken } from '@angular/core';
import { GlobalService } from '../../../../services/global.service';
import { EnvironmentConfigurationService } from '../../../../services/environment-configuration.service';

export const ENV_CONFIG = new InjectionToken<any>('env_config');
class MockGlobalService {
    getUserFullName = jasmine.createSpy('getUserFullName').and.returnValue('Test User');
}
describe('DeleteCalculationModalComponent', () => {
    let component: DeleteCalculationModalComponent;
    let fixture: ComponentFixture<DeleteCalculationModalComponent>;
    let modalRefSpy: jasmine.SpyObj<NzModalRef>;

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('NzModalRef', ['close', 'destroy']);

        await TestBed.configureTestingModule({
            imports: [DeleteCalculationModalComponent],
            providers: [
                { provide: NzModalRef, useValue: modalRefSpy },
                { provide: GlobalService, useClass: MockGlobalService },
                { provide: EnvironmentConfigurationService, useValue: {} },
                { provide: ENV_CONFIG, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteCalculationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call modalRef.close(true) when onSubmit is called', () => {
        component.onSubmit();
        expect(modalRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should call modalRef.destroy() when onCancel is called', () => {
        component.onCancel();
        expect(modalRefSpy.destroy).toHaveBeenCalled();
    });
});
