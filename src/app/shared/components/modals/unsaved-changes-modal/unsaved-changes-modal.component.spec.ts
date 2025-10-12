import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnsavedChangesModalComponent } from './unsaved-changes-modal.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { APP_CONFIG, EnvironmentConfiguration } from '../../../../core/interfaces/environment-configuration';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UnsavedChangesModalComponent', () => {
  let component: UnsavedChangesModalComponent;
  let fixture: ComponentFixture<UnsavedChangesModalComponent>;
  let modalRefSpy: jasmine.SpyObj<NzModalRef>;

  const fakeConfig: EnvironmentConfiguration = {
    APP_FRONTEND_URL: '',
    APP_TITLE: 'Test App',
    APP_VERSION: '0.0.0',
    BASE_URL_SERVICE: '',
    APIGW_BASE_URL: '',
    BASE_URL: '',
    DEBUG_MODE: false,
    LAYOUT_STYLE: 'default' as any,
    MICROSOFT_TENANT: '',
    MSAL_CLIENT_ID: '',
    NODE_ENV: 'LOCAL' as any,
    EP_LAYOUT_URL: '',
  };
  beforeEach(async () => {
    modalRefSpy = jasmine.createSpyObj('NzModalRef', ['close', 'destroy']);
    await TestBed.configureTestingModule({
      imports: [UnsavedChangesModalComponent, HttpClientTestingModule],
      providers: [
        { provide: NzModalRef, useValue: modalRefSpy },
        { provide: APP_CONFIG, useValue: fakeConfig } // ✅ provide token
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UnsavedChangesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call modalRef.close(true) on submit', () => {
    component.onSubmit();
    expect(modalRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should call modalRef.destroy() on cancel', () => {
    component.onCancel();
    expect(modalRefSpy.destroy).toHaveBeenCalled();
  });

  it('should use default input values', () => {
    expect(component.title).toBe('Are you sure you want to leave this page?');
    expect(component.text).toBe('Unsaved data will be lost.');
    expect(component.btnSubmitText).toBe('Confirm');
    expect(component.btnCancelText).toBe('Cancel');
  });
});
