import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelModalComponent } from './cancel-modal.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GlobalService } from '../../../../services/global.service';

class MockGlobalService {
    getUserFullName = jasmine.createSpy('getUserFullName').and.returnValue('Test User');
}

describe('CancelModalComponent', () => {
    let component: CancelModalComponent;
    let fixture: ComponentFixture<CancelModalComponent>;
    let modalRefSpy: jasmine.SpyObj<NzModalRef>;

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('NzModalRef', ['close', 'destroy']);

        await TestBed.configureTestingModule({
            imports: [CancelModalComponent],
            providers: [
                { provide: NzModalRef, useValue: modalRefSpy },
                { provide: GlobalService, useClass: MockGlobalService },
                { provide: 'env_config', useValue: {} }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CancelModalComponent);
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

    it('should call modalRef.destroy when onCancel is called', () => {
        component.onCancel();
        expect(modalRefSpy.destroy).toHaveBeenCalled();
    });
});
