import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { CreateNewStudyComponent } from './create-new-study.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CreateStudyService } from '../../services/create-study/create-study.service';
import { AlertService } from '../../shared/services/alert.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CancelModalComponent } from '../../shared/components/modals/cancel-modal/cancel-modal.component';
import { CalculationService } from '../../services/calculation/calculation.service';
import { CalculationContextService } from '../calculation/CalculationContext.service';
import { InjectionToken } from '@angular/core';
import { APP_CONFIG } from '../../../app/core/interfaces/environment-configuration';
import { GlobalService } from '../../services/global.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('CreateNewStudyComponent', () => {
    let component: CreateNewStudyComponent;
    let fixture: ComponentFixture<CreateNewStudyComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockCreateStudyService: jasmine.SpyObj<CreateStudyService>;
    let mockAlertService: jasmine.SpyObj<AlertService>;
    let mockModalService: jasmine.SpyObj<NzModalService>;
    let mockCalculationService: jasmine.SpyObj<CalculationService>;
    let mockCalculationContextService: jasmine.SpyObj<CalculationContextService>;
    let fb: FormBuilder;
    const mockGlobalService = jasmine.createSpyObj('GlobalService', ['getUserFullName']);

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockCreateStudyService = jasmine.createSpyObj('CreateStudyService', ['getDropDownAsset', 'getDropDownLocation', 'postCreateStudy']);
        mockAlertService = jasmine.createSpyObj('AlertService', ['success']);
        mockModalService = jasmine.createSpyObj('NzModalService', ['create']);

        mockCalculationService = jasmine.createSpyObj('CalculationService', [
            'getPipingDataById',
            'saveDraftPipingData'
        ]);
        mockCalculationContextService = jasmine.createSpyObj('CalculationContextService', [
            'setPipingForm', 'setPositionTypePiping', 'getSelectPosition', 'selectPosition$',
            'setPipingValid'
        ]);
        mockCreateStudyService.getDropDownAsset.and.returnValue(of({ response: { data: [] } }));
        mockCreateStudyService.getDropDownLocation.and.returnValue(of({ response: { data: [] } }));

        await TestBed.configureTestingModule({
            declarations: [],
            imports: [CreateNewStudyComponent, ReactiveFormsModule, HttpClientTestingModule],
            providers: [
                FormBuilder,
                { provide: Router, useValue: mockRouter },
                { provide: CreateStudyService, useValue: mockCreateStudyService },
                { provide: AlertService, useValue: mockAlertService },
                { provide: NzModalService, useValue: mockModalService },
                { provide: CalculationService, useValue: mockCalculationService },
                { provide: CalculationContextService, useValue: mockCalculationContextService },
                { provide: APP_CONFIG, useValue: {} as any },
                { provide: GlobalService, useValue: mockGlobalService }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(CreateNewStudyComponent);
        component = fixture.componentInstance;
        fb = TestBed.inject(FormBuilder);


    });



    describe('ngOnInit', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });
        it('should clear sessionStorage and call dropdown fetch methods', () => {
            spyOn(sessionStorage, 'clear');

            component.ngOnInit();

            expect(sessionStorage.clear).toHaveBeenCalled();
            expect(mockCreateStudyService.getDropDownAsset).toHaveBeenCalled();
        });
    });

    describe('onCancel', () => {
        it('should open cancel modal and navigate if confirmed', fakeAsync(() => {
            const afterCloseSubject = of(true); // simulate modal closed with result=true

            mockModalService.create.and.returnValue({
                afterClose: afterCloseSubject
            } as any);

            component.onCancel();
            tick(); // flush observable

            expect(mockModalService.create).toHaveBeenCalledWith({
                nzContent: CancelModalComponent,
                nzFooter: null,
                nzWidth: 600
            });

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/all-studies']);
        }));
    });

    describe('onCreateOnly', () => {
        beforeEach(() => {
            // mockCreateStudyService.postCreateStudy.and.returnValue(of({ response: { id: 99, name: 'Default' } }));
            mockCreateStudyService.postCreateStudy.and.returnValue(
                of({ data: { studyId: 'abc-123', studyCode: 'WF-250908-004' } })
            );
        });

        it('should mark form as touched and not call API if form is invalid', () => {
            // Arrange: simulate invalid form using the injected fb
            component.form = fb.group({ // Use fb here
                studyName: ['', Validators.required], // Add Validators.required
                locationId: [null, Validators.required], // Add Validators.required
                assetId: [null, Validators.required] // Add Validators.required
            });

            spyOn(component.form, 'markAllAsTouched');

            component.onCreateOnly(); // Call the method under test

            // Assertions for invalid form path
            expect(component.form.markAllAsTouched).toHaveBeenCalled();
            expect(mockCreateStudyService.postCreateStudy).not.toHaveBeenCalled(); // API should NOT be called
        });
        it('should post study and navigate on success if form is valid', fakeAsync(() => {
            // const mockResponse = { response: { id: 1, name: 'New Study' } };

            // Arrange: simulate valid form using the injected fb
            component.form = fb.group({ // Use fb here
                studyName: ['Test Study', Validators.required], // Add Validators.required
                locationId: [{ id: 1, name: 'Location A' }, Validators.required], // Add Validators.required
                assetId: [{ id: 2, name: 'Asset B' }, Validators.required] // Add Validators.required
            });

            const mockResponse = { data: { studyId: 'abc-123', studyCode: 'WF-250908-004' } };
            mockCreateStudyService.postCreateStudy.and.returnValue(of(mockResponse));

            // mockCreateStudyService.postCreateStudy.and.returnValue(of(mockResponse)); // Override default mock for this test
            spyOn(sessionStorage, 'setItem');

            component.onCreateOnly();
            tick(); // flush observable

            expect(mockCreateStudyService.postCreateStudy).toHaveBeenCalledWith(jasmine.objectContaining({
                studyName: 'Test Study',
                locationId: 1, // Expect number
                assetId: 2     // Expect number
            }));

            expect(sessionStorage.setItem).toHaveBeenCalledWith('study', JSON.stringify(mockResponse));

            expect(mockAlertService.success).toHaveBeenCalledWith(
                'Study successfully created',
                'The study was saved with all required data'
            );
            // expect(mockRouter.navigate).toHaveBeenCalledWith(['/all-studies']);
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/study-details'],
                { queryParams: { id: jasmine.any(String) } }
            );
        }));

    });
    describe('onSubmit', () => {
        beforeEach(() => {
            // mockCreateStudyService.postCreateStudy.and.returnValue(of({ response: { id: 99, name: 'Default' } }));
            mockCreateStudyService.postCreateStudy.and.returnValue(
                of({ data: { studyId: 'abc-123', studyCode: 'WF-250908-004' } })
            );
        });
        it('should mark form as touched and not submit if form is invalid', () => {
            component.form = fb.group({
                studyName: ['', Validators.required], // invalid value with validator
                locationId: [null, Validators.required], // invalid value with validator
                assetId: [null, Validators.required]
            });

            spyOn(component.form, 'markAllAsTouched');

            component.onSubmit();

            expect(component.form.markAllAsTouched).toHaveBeenCalled();
            expect(mockCreateStudyService.postCreateStudy).not.toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('should post study and navigate to calculation page on success when form is valid', fakeAsync(() => {
            const mockResponse = {
                data: { // Data is now at the top level, matching component's `response?.data`
                    studyCode: 'STUDY-001'
                }
            };
            component.form = fb.group({
                studyName: ['Test Study', Validators.required],
                locationId: [{ id: 1, name: 'Location A' }, Validators.required],
                assetId: [{ id: 2, name: 'Asset B' }, Validators.required]
            });
            mockCreateStudyService.postCreateStudy.and.returnValue(of(mockResponse) as any); // Use `as any` if TypeScript complains

            spyOn(sessionStorage, 'setItem');

            component.onSubmit();
            tick();

            expect(mockCreateStudyService.postCreateStudy).toHaveBeenCalledWith(jasmine.objectContaining({
                studyName: 'Test Study',
                locationId: 1,
                assetId: 2
            }));

            // The component calls `JSON.stringify(response)` where `response` is `mockResponse`
            expect(sessionStorage.setItem).toHaveBeenCalledWith('study', JSON.stringify(mockResponse));

            expect(mockAlertService.success).toHaveBeenCalledWith(
                'Study successfully created',
                'The study was saved with all required data'
            );

            // Now `response?.data?.studyCode` will correctly resolve to 'STUDY-001' in the component
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/calculation', 'STUDY-001']);
        }));


    });

    describe('getAssetDropdown', () => {
        it('should fetch asset dropdown and assign to fieldAssets', fakeAsync(() => {
            const mockAssets = [{ id: '1', name: 'Asset A' }, { id: '2', name: 'Asset B' }];
            const mockResponse = { data: mockAssets };

            mockCreateStudyService.getDropDownAsset.and.returnValue(of(mockResponse) as any);

            component.getAssetDropDown();
            tick();

            // This expectation is now correct because `response.data` directly refers to `mockAssets`
            expect(component.fieldAssets).toEqual(mockAssets);
        }));
    });

    describe('getLocationDropDown', () => {
        it('should fetch location dropdown and assign to locations', fakeAsync(() => {
            // Arrange
            const mockLocations = [{ id: 'loc1', name: 'Location A' }, { id: 'loc2', name: 'Location B' }];
            const mockResponse = { data: mockLocations };
            const mockAssetId = 'asset-123';

            mockCreateStudyService.getDropDownLocation.and.returnValue(of(mockResponse) as any);

            // Act
            component.getLocationDropDown(mockAssetId);
            tick(); // simulate async

            // Assert
            expect(mockCreateStudyService.getDropDownLocation).toHaveBeenCalled();
            expect(component.locations).toEqual(mockLocations);
        }));
    })
});