import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteStudyModalComponent } from './delete-study-modal.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GlobalService } from '../../../../services/global.service';
import { EnvironmentConfigurationService } from '../../../../services/environment-configuration.service';
import { InjectionToken } from '@angular/core';


export const ENV_CONFIG = new InjectionToken<any>('env_config');

class MockGlobalService {
    getUserFullName = jasmine.createSpy('getUserFullName').and.returnValue('Test User');
}

describe('DeleteStudyModalComponent', () => {
    let component: DeleteStudyModalComponent;
    let fixture: ComponentFixture<DeleteStudyModalComponent>;
    let modalRefSpy: jasmine.SpyObj<NzModalRef>;

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('NzModalRef', ['close', 'destroy']);

        await TestBed.configureTestingModule({
            imports: [DeleteStudyModalComponent],
            providers: [
                { provide: NzModalRef, useValue: modalRefSpy },
                { provide: GlobalService, useClass: MockGlobalService },
                { provide: EnvironmentConfigurationService, useValue: {} },
                { provide: ENV_CONFIG, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteStudyModalComponent);
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
