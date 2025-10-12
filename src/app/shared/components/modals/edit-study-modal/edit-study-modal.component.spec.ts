import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { EditStudyModalComponent } from './edit-study-modal.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { EnvironmentConfigurationService } from '../../../../services/environment-configuration.service';
import { Environment } from '../../../../core/enums/environments.enum';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CreateStudyService } from '../../../../services/create-study/create-study.service';


describe('EditStudyModalComponent', () => {
  let mockConfigService: jasmine.SpyObj<EnvironmentConfigurationService>;
  let mockModalRef: jasmine.SpyObj<NzModalRef>;
  let component: EditStudyModalComponent;
  let fixture: ComponentFixture<EditStudyModalComponent>;
  let mockCreateStudyService: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockConfigService = jasmine.createSpyObj(
      'EnvironmentConfigurationService',
      ['getEnvConfig', 'getBaseUrl', 'getBaseAPIGW', 'getSequenceFlow'],
    );
    mockConfigService.getBaseUrl.and.returnValue('https://example.com');
    mockConfigService.getBaseAPIGW.and.returnValue('https://example.com');
    mockConfigService.getSequenceFlow.and.returnValue(['1,2,3']);
    mockConfigService.getEnvConfig.and.returnValue({
      BASE_URL: 'https://example.com',
      APIGW_BASE_URL: 'https://api.example.com',
      NODE_ENV: Environment.local,
      APIGW_SERVICE_NAME: '',
      MSAL_CLIENT_ID: '',
      MICROSOFT_TENANT: '',
      APP_FRONTEND_URL: '',
      APP_TITLE: '',
      APP_VERSION: '',
      BASE_URL_SERVICE: '',
      DEBUG_MODE: false,
      LAYOUT_STYLE: {},
      EP_LAYOUT_URL: '',
      SEQUENCE_FLOW: []
    });
    mockModalRef = jasmine.createSpyObj('NzModalRef', ['destroy', 'close']);
    mockCreateStudyService = jasmine.createSpyObj('CreateStudyService', ['getDropDownAsset', 'getDropDownLocation']);


    await TestBed.configureTestingModule({
      imports: [EditStudyModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: EnvironmentConfigurationService,
          useValue: mockConfigService,
        },
        {
          provide: NzModalRef,
          useValue: {
            destroy: jasmine.createSpy('destroy')
          }
        },
        { provide: CreateStudyService, useValue: mockCreateStudyService }

      ]
    }).compileComponents();
    fixture = TestBed.createComponent(EditStudyModalComponent);
    component = fixture.componentInstance;

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch assets and initialize form with data', fakeAsync(() => {
      const mockAssets = [{ id: 'asset1', name: 'Asset 1' }];
      const mockLocations = [{ id: 'loc1', name: 'Location 1' }];

      // Mock service responses using `of()`
      mockCreateStudyService.getDropDownAsset.and.returnValue(of({ data: mockAssets }));
      mockCreateStudyService.getDropDownLocation.and.returnValue(of({ data: mockLocations }));

      // Set the data input before ngOnInit
      component.data = {
        studyName: 'Study 1',
        assetName: mockAssets[0],
        locationName: mockLocations[0]
      };

      // Call ngOnInit()
      component.ngOnInit();

      // First tick() to resolve the `getDropDownAsset` call in ngOnInit
      tick();

      // The form fields should be populated from the input data
      expect(component.form.get('studyName')?.value).toBe('Study 1');
      expect(component.form.get('asset')?.value).toEqual(mockAssets[0]);

      // Now, we need to manually trigger the asset's valueChanges subscription
      // which will, in turn, call getDropDownLocation.
      // Note: The `setValue` needs to be done *after* the initial tick()
      // to ensure the form is initialized.
      component.form.get('asset')?.setValue({ id: 'asset1' });

      // Tick again to resolve the `getDropDownLocation` call
      tick();

      // Check if the location dropdown was populated
      // expect(component.fieldLocations).toEqual(mockLocations);
      // Verify that the getDropDownLocation method was called with the correct parameter
      expect(mockCreateStudyService.getDropDownLocation).toHaveBeenCalledWith('asset1');
      // The location field should also be set to the initial value
      expect(component.form.get('location')?.value).toEqual(mockLocations[0]);
      expect(component.form.get('location')?.enabled).toBeTrue();

      // Make sure the view is updated
      fixture.detectChanges();
    }));
  });

  describe('initForm', () => {

    // Test case for when the selected asset has an ID
    it('should initialize form and fetch location dropdown when asset has an ID', fakeAsync(async () => {
      // Mock data
      const mockAssetWithId = { id: 'asset1', name: 'Asset 1' };
      const mockLocationWithId = { id: 'loc1', name: 'Location 1' };
      const mockStudyData = {
        studyName: 'Test Study',
        assetName: mockAssetWithId,
        locationName: mockLocationWithId,
      };

      // Set up initial component state
      component.fieldAssets = [mockAssetWithId];
      component.data = mockStudyData;
      component.form.get('location')?.disable(); // Ensure location is disabled initially

      // Mock the service call for getLocationDropDown
      mockCreateStudyService.getDropDownLocation.and.returnValue(of({ data: [mockLocationWithId] }));

      // Call the method
      await component.initForm();

      // Resolve the getLocationDropDown Promise
      tick();

      // Resolve the setTimeout
      tick();

      // Assertions
      expect(mockCreateStudyService.getDropDownLocation).toHaveBeenCalledWith('asset1');
      expect(component.form.get('studyName')?.value).toBe('Test Study');
      expect(component.form.get('asset')?.value).toEqual(mockAssetWithId);
      expect(component.form.get('location')?.value).toEqual(mockLocationWithId);
      expect(component.form.get('location')?.enabled).toBeTrue();
    }));

    // Test case for when the selected asset does not have an ID
    it('should initialize form without fetching locations when asset does not have an ID', fakeAsync(() => {
      // Mock data
      const mockAssetWithoutId = { name: 'New Asset' };
      const mockStudyData = {
        studyName: 'Test Study',
        assetName: mockAssetWithoutId,
        locationName: null,
      };

      // Set up initial component state
      component.fieldAssets = [];
      component.data = mockStudyData;
      component.form.get('location')?.disable(); // Ensure location is disabled initially

      // Call the method
      component.initForm();

      // Resolve the setTimeout
      tick();

      // Assertions
      expect(mockCreateStudyService.getDropDownLocation).not.toHaveBeenCalled();
      expect(component.form.get('studyName')?.value).toBe('Test Study');
      expect(component.form.get('asset')?.value).toEqual(mockAssetWithoutId);
      expect(component.form.get('location')?.value).toBeNull();
      expect(component.form.get('location')?.enabled).toBeTrue();
    }));
  });

  describe('onSubmit', () => {
    let modalRefSpy: jasmine.SpyObj<NzModalRef>;

    beforeEach(() => {
      modalRefSpy = jasmine.createSpyObj('NzModalRef', ['close', 'destroy']);
      (component as any).modalRef = modalRefSpy;

      component.form.patchValue({
        studyName: 'Test Study',
        asset: { id: 'asset1', name: 'Asset 1' },
        location: { id: 'loc1', name: 'Location 1' }
      });
    });

    it('should mark all controls as touched if form is invalid', () => {
      component.form.get('studyName')?.setValue(''); // invalid
      spyOn(component.form, 'markAllAsTouched');

      component.onSubmit();

      expect(component.form.markAllAsTouched).toHaveBeenCalled();
      expect(modalRefSpy.close).not.toHaveBeenCalled();
    });

    it('should close the modal with CreateStudyRequest if form is valid', () => {
      component.form.get('studyName')?.setValue('Valid Study'); // valid

      component.onSubmit();

      expect(modalRefSpy.close).toHaveBeenCalledWith({
        studyName: 'Valid Study',
        assetId: 'asset1',
        locationId: 'loc1'
      });
    });
  });

  describe('getAssetDropDown', () => {
    it('should fetch assets and assign to fieldAssets', async () => {
      const mockResponse = { data: [{ id: 'asset1', name: 'Asset 1' }] };
      mockCreateStudyService.getDropDownAsset.and.returnValue({
        subscribe: (callbacks: any) => callbacks.next(mockResponse)
      });

      await component.getAssetDropDown();

      expect(component.fieldAssets).toEqual(mockResponse.data);
    });

    it('should reject promise on error', async () => {
      mockCreateStudyService.getDropDownAsset.and.returnValue({
        subscribe: (callbacks: any) => callbacks.error('API Error')
      });

      await expectAsync(component.getAssetDropDown()).toBeRejectedWith('API Error');
    });
  });

  describe('getLocationDropDown', () => {
    it('should resolve immediately if assetId is not provided', async () => {
      await expectAsync(component.getLocationDropDown()).toBeResolved();
      expect(component.locations).toEqual([]);
    });

    it('should fetch locations and assign to locations', async () => {
      const mockResponse = { data: [{ id: 'loc1', name: 'Location 1' }] };
      mockCreateStudyService.getDropDownLocation.and.returnValue({
        subscribe: (callbacks: any) => callbacks.next(mockResponse)
      });

      await component.getLocationDropDown('asset1');

      expect(component.locations).toEqual(mockResponse.data);
    });

    it('should reject promise on error', async () => {
      mockCreateStudyService.getDropDownLocation.and.returnValue({
        subscribe: (callbacks: any) => callbacks.error('API Error')
      });

      await expectAsync(component.getLocationDropDown('asset1')).toBeRejectedWith('API Error');
    });
  });

});
