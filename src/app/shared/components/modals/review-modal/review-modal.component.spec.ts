import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewModalComponent } from './review-modal.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { InjectionToken } from '@angular/core';
import { GlobalService } from '../../../../services/global.service';
import { EnvironmentConfigurationService } from '../../../../services/environment-configuration.service';

export const ENV_CONFIG = new InjectionToken<any>('env_config');

class MockGlobalService {
    getUserFullName = jasmine.createSpy('getUserFullName').and.returnValue('Test User');
}

describe('ReviewModalComponent', () => {
    let component: ReviewModalComponent;
    let fixture: ComponentFixture<ReviewModalComponent>;
    let modalRefSpy: jasmine.SpyObj<NzModalRef>;

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('NzModalRef', ['close', 'destroy']);

        await TestBed.configureTestingModule({
            imports: [ReviewModalComponent],
            providers: [
                { provide: NzModalRef, useValue: modalRefSpy },
                { provide: GlobalService, useClass: MockGlobalService },
                { provide: EnvironmentConfigurationService, useValue: {} },
                { provide: ENV_CONFIG, useValue: {} },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReviewModalComponent);
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
