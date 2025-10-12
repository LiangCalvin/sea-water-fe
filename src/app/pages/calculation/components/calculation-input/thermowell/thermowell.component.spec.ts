import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ThermowellComponent } from './thermowell.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../../CalculationContext.service';
import { CalculationDataService } from '../../../services/calculation-data.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { PipingFormControls } from '../../../../../core/models/calculation/thermowell.model';

describe('ThermowellComponent', () => {
    let component: ThermowellComponent;
    let fixture: ComponentFixture<ThermowellComponent>;
    let fb: FormBuilder;

    const mockCalculationService = jasmine.createSpyObj('CalculationService', [
        'getThermowellData', 'fetchInsertionLenght', 'saveDraftThermowell', 'saveThermowellData', 'getInsertionLengthBySize'
    ]);

    const mockCalculationContextService = jasmine.createSpyObj('CalculationContextService', [
        'getSession', 'getTransaction', 'setThermowellValid'
    ]);

    const mockCalculationDataService = jasmine.createSpyObj('CalculationDataService', ['thermowellData']);

    const mockAlertService = jasmine.createSpyObj('AlertService', ['error', 'getErrorMessage']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, ThermowellComponent],
            providers: [
                FormBuilder,
                { provide: CalculationService, useValue: mockCalculationService },
                { provide: CalculationContextService, useValue: mockCalculationContextService },
                { provide: CalculationDataService, useValue: mockCalculationDataService },
                { provide: AlertService, useValue: mockAlertService },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ThermowellComponent);
        component = fixture.componentInstance;
        fb = TestBed.inject(FormBuilder);

        component.form = fb.group({
            pipingSize: [null],
            pipingClass: [null],
            innerDiameter: [null],
            nozzleLength: [null],
            thickNess: [null],
            insulationThickness: [0],
            stemType: ['tapered'],
            insertionLength: [0],
            wellLength: [0],
            thermowellMaterial: ['316l_ss'],
            youngModulus: [187000000000],
            rootDiameter: [26.5],
            tipDiameter: [18],
            boreDiameter: [6.6],
            avg: [18],
            connectionType: ['flange']
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getThermowell', () => {
        const studyId = 'test-study';
        const transactionId = 'test-transaction';
        let mapSpy: jasmine.Spy;
        let initSpy: jasmine.Spy;

        beforeEach(() => {
            mockCalculationService.getThermowellData.calls.reset();
            // Spies on private methods
            mapSpy = spyOn(component as any, 'mapFetchedDataToForm').and.stub();
            initSpy = spyOn(component as any, 'initializeDefaultForm').and.stub();
            // Reset thermowellData
            (mockCalculationDataService as any).thermowellData = null;
        });

        it('should call mapFetchedDataToForm with API data if data exists and thermowellData is null', (done) => {
            mockCalculationService.getThermowellData.and.returnValue(of({ data: { stemType: 'tapered' } }));

            component.getThermowell(studyId, transactionId);

            setTimeout(() => {
                expect(mockCalculationService.getThermowellData).toHaveBeenCalledWith(studyId, transactionId);
                expect(mapSpy).toHaveBeenCalledWith({ stemType: 'tapered' });
                expect(initSpy).not.toHaveBeenCalled();
                done();
            });
        });

        it('should call initializeDefaultForm if API returns empty data and thermowellData is null', (done) => {
            mockCalculationService.getThermowellData.and.returnValue(of({ data: {} }));

            component.getThermowell(studyId, transactionId);

            setTimeout(() => {
                expect(initSpy).toHaveBeenCalled();
                expect(mapSpy).not.toHaveBeenCalled();
                done();
            });
        });

        it('should log error if API fails', (done) => {
            const error = new Error('API failure');
            mockCalculationService.getThermowellData.and.returnValue(throwError(() => error));
            spyOn(console, 'error');

            component.getThermowell(studyId, transactionId);

            setTimeout(() => {
                expect(console.error).toHaveBeenCalledWith('API Error:', error);
                done();
            });
        });
    });

    describe('saveDraft', () => {
        it('should call saveDraftThermowell and resolve', async () => {
            mockCalculationService.saveDraftThermowell.and.returnValue(of({ success: true }));

            await expectAsync(component.saveDraft()).toBeResolved();
            expect(mockCalculationService.saveDraftThermowell).toHaveBeenCalled();
        });

        it('should reject if API fails', async () => {
            mockCalculationService.saveDraftThermowell.and.returnValue(throwError(() => new Error('Server error')));
            spyOn(console, 'error');

            await expectAsync(component.saveDraft()).toBeRejectedWithError('Something went wrong');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('saveThermowellData', () => {
        it('should call saveThermowellData and return true', async () => {
            mockCalculationService.saveThermowellData.and.returnValue(of({ success: true }));

            const result = await component.saveThermowellData();
            expect(result).toBeTrue();
            expect(mockCalculationService.saveThermowellData).toHaveBeenCalled();
        });
    });

    describe('watchFormChanges', () => {
        let pipingFormSubject: BehaviorSubject<FormGroup<PipingFormControls>>;
        let fb: FormBuilder;

        beforeEach(() => {
            fb = new FormBuilder();

            const initialForm: FormGroup<PipingFormControls> = new FormGroup({
                pipingSize: new FormControl(6),
                pipingClass: new FormControl(150),
                innerDiameter: new FormControl(52),
                nozzleLength: new FormControl(100),
                thickNess: new FormControl(12),
            });


            pipingFormSubject = new BehaviorSubject<FormGroup<PipingFormControls>>(initialForm);
            mockCalculationContextService.pipingForm$ = pipingFormSubject.asObservable();


            component.form.patchValue({
                pipingSize: 10,
                pipingClass: 300,
                innerDiameter: 60,
                nozzleLength: 110,
                thickNess: 14
            }, { emitEvent: false });
        });

        it('should patch values without emitting on initial load', fakeAsync(() => {
            const calcSpy = spyOn(component, 'calculateAndUpdateWellLength' as keyof typeof component);
            const fetchSpy = spyOn(component, 'fetchInsertionLenght' as keyof typeof component);

            component.form.patchValue({ insertionLength: 0 }, { emitEvent: false });
            (component as any).initialPipingDataHandled = false;

            component.watchFormChanges();
            pipingFormSubject.next(pipingFormSubject.getValue());
            tick(300);

            expect(component.form.get('pipingSize')?.value).toBe(6);
            expect(calcSpy).toHaveBeenCalled();
            expect(fetchSpy).toHaveBeenCalledWith(6);
        }));

        it('should call fetchInsertionLenght on subsequent changes', fakeAsync(() => {
            const fetchSpy = spyOn(component, 'fetchInsertionLenght' as keyof typeof component);

            component.watchFormChanges();
            pipingFormSubject.next(pipingFormSubject.getValue());
            tick(300);


            const newGroup: FormGroup<PipingFormControls> = new FormGroup({
                pipingSize: new FormControl(10),
                pipingClass: new FormControl(300),
                innerDiameter: new FormControl(60),
                nozzleLength: new FormControl(110),
                thickNess: new FormControl(14),
            });
            pipingFormSubject.next(newGroup);
            tick(300);

            expect(component.form.get('pipingSize')?.value).toBe(10);
            expect(fetchSpy).toHaveBeenCalledWith(10);
        }));
    });

    describe('ngOnDestroy', () => {
        it('should save form data to calculationDataService and complete destroy$', () => {
            component.form.patchValue({ insertionLength: 123, wellLength: 456 });
            spyOn(component['destroy$'], 'next').and.callThrough();
            spyOn(component['destroy$'], 'complete').and.callThrough();

            component.ngOnDestroy();

            expect(mockCalculationDataService.thermowellData).toEqual(component.form.getRawValue());
            expect(component['destroy$'].next).toHaveBeenCalled();
            expect(component['destroy$'].complete).toHaveBeenCalled();
        });
    });

    describe('loadSessionData', () => {
        beforeEach(() => {
            // Mock sessionStorage.getItem
            spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
                if (key === 'study') return JSON.stringify({ data: { studyId: '123' } });
                if (key === 'transactionId') return JSON.stringify({ data: { transactionId: '456' } });
                return null;
            });
        });

        it('should load study and transactionId from sessionStorage', () => {
            // Call private method using `any`
            (component as any).loadSessionData();

            expect(component.study).toEqual({ data: { studyId: '123' } });
            expect(component.transactionId).toEqual({ data: { transactionId: '456' } });
            expect(sessionStorage.getItem).toHaveBeenCalledWith('study');
            expect(sessionStorage.getItem).toHaveBeenCalledWith('transactionId');
        });

        it('should default to empty object if sessionStorage returns null', () => {
            // Override getItem to return null
            (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);

            (component as any).loadSessionData();

            expect(component.study).toEqual({});
            expect(component.transactionId).toEqual({});
        });
    });

    describe('setupInsertionLengthWatcher', () => {
        beforeEach(() => {
            // Ensure form controls exist
            component.form = fb.group({
                insertionLength: [0],
                nozzleLength: [10],
                thickNess: [5],
                wellLength: [0]
            });

            // Call the private method
            (component as any).setupInsertionLengthWatcher();
        });

        it('should update wellLength when insertionLength changes', fakeAsync(() => {
            const wellLengthControl = component.form.get('wellLength');

            // Change insertionLength
            component.form.get('insertionLength')?.setValue(20);

            // debounceTime is 300ms, so simulate passage of time
            tick(300);

            // wellLength = insertionLength + nozzleLength + thickNess = 20 + 10 + 5
            expect(wellLengthControl?.value).toBe(35);

            // Test with null nozzleLength
            component.form.get('nozzleLength')?.setValue(null);
            component.form.get('insertionLength')?.setValue(15);
            tick(300);

            // wellLength = 15 + 0 + 5 = 20
            expect(wellLengthControl?.value).toBe(20);
        }));

        it('should handle undefined or empty values safely', fakeAsync(() => {
            component.form.get('nozzleLength')?.setValue('');
            component.form.get('thickNess')?.setValue(undefined);
            component.form.get('insertionLength')?.setValue(null);
            tick(300);

            // wellLength = 0 + 0 + 0 = 0
            expect(component.form.get('wellLength')?.value).toBe(0);
        }));
    });

    describe('setupNozzleLengthWatcher', () => {
        beforeEach(() => {
            // Ensure form controls exist
            component.form = fb.group({
                insertionLength: [10],
                nozzleLength: [0],
                thickNess: [5],
                wellLength: [0]
            });

            // Call the private method
            (component as any).setupNozzleLengthWatcher();
        });

        it('should update wellLength when nozzleLength changes', fakeAsync(() => {
            const wellLengthControl = component.form.get('wellLength');

            // Change nozzleLength
            component.form.get('nozzleLength')?.setValue(20);
            tick(300);

            // wellLength = insertionLength + nozzleLength + thickNess = 10 + 20 + 5
            expect(wellLengthControl?.value).toBe(35);

            // Test with null insertionLength
            component.form.get('insertionLength')?.setValue(null);
            component.form.get('nozzleLength')?.setValue(15);
            tick(300);

            // wellLength = 0 + 15 + 5 = 20
            expect(wellLengthControl?.value).toBe(20);
        }));

        it('should handle undefined or empty values safely', fakeAsync(() => {
            component.form.get('insertionLength')?.setValue(undefined);
            component.form.get('thickNess')?.setValue('');
            component.form.get('nozzleLength')?.setValue(null);
            tick(300);

            // wellLength = 0 + 0 + 0 = 0
            expect(component.form.get('wellLength')?.value).toBe(0);
        }));
    });

    describe('mapFetchedDataToForm', () => {
        const apiData = {
            insulationThickness: 12,
            stemType: 'straight',
            insertionLength: 50,
            wellLength: 100,
            thermowellMaterial: 'super_duplex',
            youngModulus: 191000000000,
            rootDiameter: 30,
            tipDiameter: 20,
            boreDiameter: 10,
            avgDiam: 15,
            connectionType: 'threaded',
            innerDiameterUnit: 'mm',
            nozzleLength: 25
        };

        beforeEach(() => {
            spyOn(component as any, 'setupMaterialChangeWatcher');
            spyOn(component as any, 'setupInsertionLengthWatcher');
            spyOn(component as any, 'setupNozzleLengthWatcher');
            spyOn(component as any, 'watchFormChanges');
        });

        it('should map API data to form correctly and call watchers', () => {
            (component as any).mapFetchedDataToForm(apiData);
            const formValue = component.form.getRawValue();

            expect(formValue).toEqual(jasmine.objectContaining({
                insulationThickness: '12',
                stemType: 'straight',
                insertionLength: 50,
                wellLength: 100,
                thermowellMaterial: 'super_duplex',
                youngModulus: 191000000000,
                rootDiameter: 30,
                tipDiameter: 20,
                boreDiameter: 10,
                avgDiam: 15,
                connectionType: 'threaded',
                innerDiameterUnit: 'mm',
                nozzleLength: 25,
                pipingSize: 0,
                pipingClass: 0,
                thickNess: 0
            }));
            expect(formValue.insulationThickness).toBe('12'); // string
            expect(formValue.stemType).toBe('straight');
            expect(formValue.insertionLength).toBe(50);
            expect(formValue.wellLength).toBe(100);
            expect(formValue.thermowellMaterial).toBe('super_duplex');
            expect(formValue.youngModulus).toBe(191000000000);
            expect(formValue.rootDiameter).toBe(30);
            expect(formValue.tipDiameter).toBe(20);
            expect(formValue.boreDiameter).toBe(10);
            expect(formValue.avgDiam).toBe(15);
            expect(formValue.connectionType).toBe('threaded');
            expect(formValue.innerDiameterUnit).toBe('mm');
            expect(formValue.nozzleLength).toBe(25);
            expect(formValue.pipingSize).toBe(0);
            expect(formValue.pipingClass).toBe(0);
            expect(formValue.thickNess).toBe(0);

            expect((component as any).setupMaterialChangeWatcher).toHaveBeenCalled();
            expect((component as any).setupInsertionLengthWatcher).toHaveBeenCalled();
            expect((component as any).setupNozzleLengthWatcher).toHaveBeenCalled();
            expect((component as any).watchFormChanges).toHaveBeenCalled();
        });

        it('should set default values if API data is missing', () => {
            const emptyData = {};
            (component as any).mapFetchedDataToForm(emptyData);

            const formValue = component.form.getRawValue();
            expect(formValue.stemType).toBe('tapered');
            expect(formValue.thermowellMaterial).toBe('316l_ss');
            expect(formValue.youngModulus).toBe((component as any).getYoungModulusForMaterial('316l_ss'));
            expect(formValue.insulationThickness).toBeNull();
            expect(formValue.insertionLength).toBe(0);
            expect(formValue.wellLength).toBe(0);
            expect(formValue.innerDiameterUnit).toBe('inch');
        });
    });

    describe('insertionLengthValidator', () => {
        let validatorFn: ValidatorFn;

        beforeEach(() => {
            // Ensure the component has a form for the validator to use
            component.form = fb.group({
                pipingSize: [10],
            });

            // Access the private validator function
            validatorFn = (component as any).insertionLengthValidator();
        });

        it('should return null for empty or null value', () => {
            const control = new FormControl(null);
            expect(validatorFn(control)).toBeNull();

            control.setValue(null);
            expect(validatorFn(control)).toBeNull();
        });

        it('should return invalidNumber if value is not a number', () => {
            const control = new FormControl('abc');
            expect(validatorFn(control)).toEqual({ invalidNumber: true });
        });

        it('should return null if pipingSize is 0 or undefined', () => {
            component.form.get('pipingSize')?.setValue(0);
            const control = new FormControl(50);
            expect(validatorFn(control)).toBeNull();

            component.form.get('pipingSize')?.setValue(null);
            expect(validatorFn(control)).toBeNull();
        });

        it('should return min error if value is below the piping size range', () => {
            component.form.get('pipingSize')?.setValue(10); // range 83-167
            const control = new FormControl(50);
            expect(validatorFn(control)).toEqual({ min: { actual: 50, min: 83 } });
        });

        it('should return max error if value is above the piping size range', () => {
            component.form.get('pipingSize')?.setValue(10); // range 83-167
            const control = new FormControl(200);
            expect(validatorFn(control)).toEqual({ max: { actual: 200, max: 167 } });
        });

        it('should return null if value is within the piping size range', () => {
            component.form.get('pipingSize')?.setValue(10); // range 83-167
            const control = new FormControl(100);
            expect(validatorFn(control)).toBeNull();
        });

        it('should return null if no range defined for piping size', () => {
            component.form.get('pipingSize')?.setValue(999); // no range defined
            spyOn(console, 'warn');
            const control = new FormControl(50);
            expect(validatorFn(control)).toBeNull();
            expect(console.warn).toHaveBeenCalledWith('No range defined for pipingSize: 999');
        });
    });

    describe('watchFormChanges', () => {
        let pipingFormSubject: BehaviorSubject<FormGroup<any>>;

        beforeEach(() => {
            const fb = new FormBuilder();
            const initialForm = fb.group({
                pipingSize: [10],
                pipingClass: [150],
                innerDiameter: [50],
                innerDiameterUnit: ['inch'],
                nozzleLength: [100],
                thickness: [10]
            });

            pipingFormSubject = new BehaviorSubject(initialForm);
            mockCalculationContextService.pipingForm$ = pipingFormSubject.asObservable();

            component.form = fb.group({
                pipingSize: [null],
                pipingClass: [null],
                innerDiameter: [null],
                innerDiameterUnit: ['inch'],
                nozzleLength: [null],
                thickNess: [0],
                insertionLength: [0]
            });

            (component as any).initialPipingDataHandled = false;

            spyOn((component as any), 'calculateAndUpdateWellLength');
            spyOn((component as any), 'fetchInsertionLenght');
            spyOn((component as any), 'validateThermowell');
        });

        it('should patch form values on initial load and call calculateAndUpdateWellLength', fakeAsync(() => {
            component.watchFormChanges();
            pipingFormSubject.next(pipingFormSubject.getValue());
            tick(300);

            expect((component as any).initialPipingDataHandled).toBeTrue();
            expect(component.form.get('pipingSize')?.value).toBe(10);
            expect(component.form.get('nozzleLength')?.value).toBe(100);
            expect((component as any).calculateAndUpdateWellLength).toHaveBeenCalled();
            expect((component as any).fetchInsertionLenght).toHaveBeenCalledWith(10);
        }));

        it('should patch form values on subsequent changes and call fetchInsertionLenght if pipingSize changed', fakeAsync(() => {
            (component as any).initialPipingDataHandled = true;
            component.form.get('pipingSize')?.setValue(10);

            component.watchFormChanges();

            const newForm = new FormBuilder().group({
                pipingSize: [20],
                pipingClass: [300],
                innerDiameter: [60],
                innerDiameterUnit: ['inch'],
                nozzleLength: [120],
                thickness: [12]
            });

            pipingFormSubject.next(newForm);
            tick(300);

            expect(component.form.get('pipingSize')?.value).toBe(20);
            expect(component.form.get('nozzleLength')?.value).toBe(120);
            expect((component as any).fetchInsertionLenght).toHaveBeenCalledWith(20);
        }));

        it('should call validateThermowell on form valueChanges', fakeAsync(() => {
            component.watchFormChanges();

            component.form.patchValue({ thickNess: 15 });
            tick(0);

            expect(component.validateThermowell).toHaveBeenCalled();
        }));

        it('should not call fetchInsertionLenght if pipingSize did not change', fakeAsync(() => {
            (component as any).initialPipingDataHandled = true;
            component.form.get('pipingSize')?.setValue(10);

            component.watchFormChanges();

            const newForm = new FormBuilder().group({
                pipingSize: [10],
                pipingClass: [300],
                innerDiameter: [60],
                innerDiameterUnit: ['inch'],
                nozzleLength: [120],
                thickness: [12]
            });

            pipingFormSubject.next(newForm);
            tick(300);

            expect((component as any).fetchInsertionLenght).not.toHaveBeenCalled();
        }));
    });

    describe('calculateAndUpdateWellLength', () => {
        beforeEach(() => {
            component.form = fb.group({
                insertionLength: [10],
                nozzleLength: [20],
                thickNess: [5],
                wellLength: [0]
            });
            // spy on parseNumber if you want to ensure numeric parsing
            spyOn(component as any, 'parseNumber').and.callFake((val: any) => Number(val));
        });

        it('should calculate wellLength correctly and patch the form', () => {
            (component as any).calculateAndUpdateWellLength();

            expect(component.form.get('wellLength')?.value).toBe(35); // 10 + 20 + 5
            expect((component as any).parseNumber).toHaveBeenCalledWith(10);
            expect((component as any).parseNumber).toHaveBeenCalledWith(20);
            expect((component as any).parseNumber).toHaveBeenCalledWith(5);
        });

        it('should handle string numbers correctly', () => {
            component.form.patchValue({
                insertionLength: '15',
                nozzleLength: '25',
                thickNess: '5'
            });

            (component as any).calculateAndUpdateWellLength();

            expect(component.form.get('wellLength')?.value).toBe(45); // 15 + 25 + 5
        });
    });

    describe('Option Getters', () => {
        beforeEach(() => {
            component.stemTypeOptions = [
                { id: 'tapered', name: 'Tapered' },
                { id: 'straight', name: 'Straight' }
            ];

            component.thermowellMaterialOptions = [
                { id: '316l_ss', name: '316L Stainless Steel' },
                { id: 'carbon_steel', name: 'Carbon Steel' }
            ];

            component.connectionTypeOptions = [
                { id: 'flange', name: 'Flange' },
                { id: 'threaded', name: 'Threaded' }
            ];
        });

        describe('getStemTypeOption', () => {
            it('should return correct option for valid id', () => {
                expect(component.getStemTypeOption('tapered')).toEqual({ id: 'tapered', name: 'Tapered' });
            });

            it('should return null for invalid or null/undefined id', () => {
                expect(component.getStemTypeOption('nonexistent')).toBeNull();
                expect(component.getStemTypeOption(null)).toBeNull();
                expect(component.getStemTypeOption(undefined)).toBeNull();
            });
        });

        describe('getThermowellMaterialOption', () => {
            it('should return correct option for valid id', () => {
                expect(component.getThermowellMaterialOption('316l_ss')).toEqual({ id: '316l_ss', name: '316L Stainless Steel' });
            });

            it('should return null for invalid or null/undefined id', () => {
                expect(component.getThermowellMaterialOption('unknown')).toBeNull();
                expect(component.getThermowellMaterialOption(null)).toBeNull();
                expect(component.getThermowellMaterialOption(undefined)).toBeNull();
            });
        });

        describe('getConnectionTypeOption', () => {
            it('should return correct option for valid id', () => {
                expect(component.getConnectionTypeOption('flange')).toEqual({ id: 'flange', name: 'Flange' });
            });

            it('should return null for invalid or null/undefined id', () => {
                expect(component.getConnectionTypeOption('unknown')).toBeNull();
                expect(component.getConnectionTypeOption(null)).toBeNull();
                expect(component.getConnectionTypeOption(undefined)).toBeNull();
            });
        });
    });

    describe('Material & Item Helpers', () => {
        beforeEach(() => {
            // Set up the materialYoungModulusMap for testing
            (component as any).materialYoungModulusMap = {
                '316l_ss': 200000000000,
                'carbon_steel': 150000000000
            };
        });

        describe('getYoungModulusForMaterial', () => {
            it('should return correct Young Modulus if material exists in map', () => {
                expect(component['getYoungModulusForMaterial']('316l_ss')).toBe(200000000000);
                expect(component['getYoungModulusForMaterial']('carbon_steel')).toBe(150000000000);
            });

            it('should return default Young Modulus if material does not exist in map', () => {
                expect(component['getYoungModulusForMaterial']('unknown_material')).toBe(187000000000);
            });
        });

        describe('getItemKey', () => {
            it('should return "default"', () => {
                expect(component.getItemKey()).toBe('default');
            });
        });
    });

    describe('setupMaterialChangeWatcher', () => {
        beforeEach(() => {
            // Set initial form values
            component.form = fb.group({
                thermowellMaterial: ['316l_ss'],
                youngModulus: [0]
            });

            // Set the map for Young Modulus
            (component as any).materialYoungModulusMap = {
                '316l_ss': 200000000000,
                'carbon_steel': 150000000000
            };
        });

        it('should update youngModulus when thermowellMaterial changes with string value', () => {
            component['setupMaterialChangeWatcher']();

            component.form.get('thermowellMaterial')?.setValue('carbon_steel');
            expect(component.form.get('youngModulus')?.value).toBe(150000000000);
        });

        it('should update youngModulus when thermowellMaterial changes with object value', () => {
            component['setupMaterialChangeWatcher']();

            component.form.get('thermowellMaterial')?.setValue({ id: '316l_ss' });
            expect(component.form.get('youngModulus')?.value).toBe(200000000000);
        });

        it('should default to 187000000000 if material not in map', () => {
            component['setupMaterialChangeWatcher']();

            component.form.get('thermowellMaterial')?.setValue('unknown_material');
            expect(component.form.get('youngModulus')?.value).toBe(187000000000);
        });
    });

    describe('fetchInsertionLenght', () => {
        const size = 10;

        beforeEach(() => {
            component.form = fb.group({
                insertionLength: [0],
                wellLength: [0]
            });
            component.isLoadingPipingDetails = false;
            spyOn(component as any, 'updateFormWithThermowellData');
            spyOn(console, 'error');
        });

        it('should call calculationService.getInsertionLengthBySize and update form on success', fakeAsync(() => {
            const responseData = { data: { insertionLength: 50, wellLength: 100 } };
            mockCalculationService.getInsertionLengthBySize.and.returnValue(of(responseData));

            component['fetchInsertionLenght'](size);
            tick();

            expect(component.isLoadingPipingDetails).toBeFalse();
            expect(mockCalculationService.getInsertionLengthBySize).toHaveBeenCalledWith(size);
            expect((component as any).updateFormWithThermowellData).toHaveBeenCalledWith(responseData.data);
        }));

        it('should set form values to null and log error on API error', fakeAsync(() => {
            const error = new Error('API failure');
            mockCalculationService.getInsertionLengthBySize.and.returnValue(throwError(() => error));

            component['fetchInsertionLenght'](size);
            tick();

            expect(component.isLoadingPipingDetails).toBeFalse();
            expect(component.form.get('insertionLength')?.value).toBeNull();
            expect(component.form.get('wellLength')?.value).toBeNull();
            expect(console.error).toHaveBeenCalledWith('Error fetching piping details:', error);
        }));
    });
});
