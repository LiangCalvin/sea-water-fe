import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ProcessInformationComponent } from './process-information.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../../CalculationContext.service';
import { ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../shared/services/alert.service';
import { GlobalService } from '../../../../../services/global.service';
import { GlobalTemplateService } from '../../../../../services/global-template.service';
import { FetchedDataItem, FormValues, Position, ProcessInformationComponentPrivate, RebuildFormsComponentPrivate, SelectionMaps } from '../../../../../core/models/calculation/process-information.mode';

describe('ProcessInformationComponent', () => {
    let component: ProcessInformationComponent;
    let fixture: ComponentFixture<ProcessInformationComponent>;

    let mockCalculationService: Partial<CalculationService>;
    let mockCalculationContextService: Partial<CalculationContextService>;
    let mockRoute: Partial<ActivatedRoute>;
    let mockAlertService: Partial<AlertService>;
    let mockGlobalService: Partial<GlobalService>;
    let mockTemplateService: Partial<GlobalTemplateService>;

    const mockParamMap: ParamMap = {
        get: (key: string): string | null => null,
        getAll: (key: string): string[] => [],
        has: (key: string): boolean => false,
        keys: []
    };
    let selectPositionSubject: Subject<any>;


    beforeEach(async () => {
        selectPositionSubject = new Subject<any>();

        mockCalculationService = {};
        mockCalculationContextService = {
            selectPosition$: selectPositionSubject.asObservable(),
            getSelectPosition: () => ({ sequenceFlow: '1,2,3,4' }),
            setProcessForm: jasmine.createSpy(),
            setPosition: jasmine.createSpy(),
            setProcessValid: jasmine.createSpy(),
            setProcessInfoForm: jasmine.createSpy(),
        };
        mockAlertService = { error: jasmine.createSpy('error') };
        mockGlobalService = {
            getUserFullName: jasmine.createSpy().and.returnValue('Test Owner'),
            hasPermissionSync: jasmine.createSpy().and.returnValue(true),
        };
        mockTemplateService = { getTemplate: jasmine.createSpy().and.returnValue('Loading...') };
        const mockRoute = {
            snapshot: {
                paramMap: mockParamMap
            }
        };

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, ProcessInformationComponent, CommonModule],
            providers: [
                FormBuilder,
                { provide: ActivatedRoute, useValue: mockRoute },
                { provide: CalculationService, useValue: mockCalculationService },
                { provide: CalculationContextService, useValue: mockCalculationContextService },
                { provide: ActivatedRoute, useValue: mockRoute },
                { provide: CalculationService, useValue: mockCalculationService },
                { provide: CalculationContextService, useValue: mockCalculationContextService },
                { provide: AlertService, useValue: mockAlertService },
                { provide: GlobalService, useValue: mockGlobalService },
                { provide: GlobalTemplateService, useValue: mockTemplateService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProcessInformationComponent);
        component = fixture.componentInstance;

        spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'study') {
                return JSON.stringify({ data: { study_id: 'study123' } });
            }
            if (key === 'transactionId') {
                return JSON.stringify({ data: { transaction_id: 'txn456' } });
            }
            return null;
        });
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should call loadSessionData and observeSequenceFlowChanges on ngOnInit', () => {
            spyOn(
                component as unknown as { loadSessionData: () => void },
                'loadSessionData'
            );

            spyOn(
                component as unknown as { observeSequenceFlowChanges: () => void },
                'observeSequenceFlowChanges'
            );

            component.ngOnInit();
            expect((component as unknown as { loadSessionData: () => void }).loadSessionData).toHaveBeenCalled();
            expect((component as unknown as { observeSequenceFlowChanges: () => void }).observeSequenceFlowChanges).toHaveBeenCalled();

        });
    });

    describe('ngOnDestroy', () => {
        it('should clean up subscription', () => {
            component['destroy$'] = new Subject<void>();
            const destroySpy = spyOn(component['destroy$'], 'next').and.callThrough();
            const completeSpy = spyOn(component['destroy$'], 'complete').and.callThrough();

            component.ngOnDestroy();

            expect(destroySpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });
    });

    describe('handleSequenceFlowChange', () => {
        it('should update fetchedData and rebuild forms', () => {
            component.sequenceFlow = '1,2,3';

            spyOn(
                component as unknown as { preserveCurrentFormData: () => void },
                'preserveCurrentFormData'
            );

            spyOn(
                component as unknown as { getPositionsForSequenceFlow: (seq: string) => { position: number; subPosition: string }[] },
                'getPositionsForSequenceFlow'
            ).and.returnValue([
                { position: 1, subPosition: 'a' },
                { position: 2, subPosition: 'b' }
            ]);

            spyOn(
                component as unknown as { rebuildFormsForSequenceFlow: () => void },
                'rebuildFormsForSequenceFlow'
            );

            component['handleSequenceFlowChange']();

            expect(component['preserveCurrentFormData']).toHaveBeenCalled();
            expect(component['getPositionsForSequenceFlow']).toHaveBeenCalledWith('1,2,3');
            expect(component.fetchedData).toEqual([
                { position: 1, subPosition: 'a' },
                { position: 2, subPosition: 'b' }
            ]);
            expect(component['rebuildFormsForSequenceFlow']).toHaveBeenCalled();
        });
    });

    describe('observeSequenceFlowChanges', () => {
        it('should handle sequence flow change when selectPosition$ emits', fakeAsync(() => {
            const mockPosition = {
                sequenceFlow: '1,2,3',
                position: 'pos1',
                subPosition: 'sub1'
            };

            const handleSpy = spyOn(
                component as unknown as { handleSequenceFlowChange: () => void },
                'handleSequenceFlowChange'
            ).and.callThrough();

            (component as unknown as { observeSequenceFlowChanges: () => void })
                .observeSequenceFlowChanges();

            selectPositionSubject.next(mockPosition);
            tick();

            expect(handleSpy).toHaveBeenCalled();
        }));
    });

    describe('rebuildFormsForSequenceFlow', () => {
        let typedComponent: RebuildFormsComponentPrivate;
    
        beforeEach(() => {
            typedComponent = component as unknown as RebuildFormsComponentPrivate;
    
            typedComponent.sequenceFlow = '1,2,3';
            typedComponent.editMode = true;
    
            typedComponent.getPositionsForSequenceFlow = (sequenceFlow: string) => [
                { position: 1, subPosition: 'a' },
                { position: 2, subPosition: 'b' }
            ];
    
            typedComponent.defaultFormValues = {
                gas: 0, condensateType: '', condensateValue: 0, cgrValue: 0,
                waterType: '', waterValue: 0, wgrValue: 0, h2s: 0, co2: 0,
                exportTemperature: 0, exportPressure: 0
            };
    
            typedComponent.allFormData = {
                '1-a': {
                    gas: 5, condensateType: '', condensateValue: 100, cgrValue: 50,
                    waterType: '', waterValue: 200, wgrValue: 10, h2s: 1, co2: 2,
                    exportTemperature: 30, exportPressure: 10
                },
                '2-b': {
                    gas: 10, condensateType: '', condensateValue: 150, cgrValue: 70,
                    waterType: '', waterValue: 250, wgrValue: 20, h2s: 3, co2: 4,
                    exportTemperature: 40, exportPressure: 20
                }
            };
    
            typedComponent.allSelections = { '1-a': 'custom', '2-b': 'same_as_1' };
            typedComponent.allPositionTypes = { '1-a': 'custom', '2-b': 'same_as_1' };
    
            typedComponent.itemPreSelections = {};
            typedComponent.positionTypes = {};
            typedComponent.formGroups = {
                '1-a': { disabled: false },
                '2-b': { disabled: false }
            };
        });
    
        it('should fallback to default when selection is invalid or missing', () => {
            typedComponent.allSelections['2-b'] = 'invalid_value';
            typedComponent.allPositionTypes['2-b'] = 'invalid_value';
    
            typedComponent.rebuildFormsForSequenceFlow();
    
            const fg2 = typedComponent.formGroups['2-b'];
    
            expect(typedComponent.itemPreSelections['2-b']).toBe('same_as_1');
            expect(typedComponent.positionTypes['2-b']).toBe('same_as_1');
            expect(typedComponent.allSelections['2-b']).toBe('same_as_1');
            expect(typedComponent.allPositionTypes['2-b']).toBe('same_as_1');
            expect(fg2.disabled).toBeTrue();
        });
    
        it('should disable all forms if not in editMode', () => {
            typedComponent.editMode = false;
            typedComponent.rebuildFormsForSequenceFlow();
    
            const fg1 = typedComponent.formGroups['1-a'];
            const fg2 = typedComponent.formGroups['2-b'];
    
            expect(fg1.disabled).toBeTrue();
            expect(fg2.disabled).toBeTrue();
        });
    });
    describe('getPositionsForSequenceFlow', () => {
        beforeEach(() => {
            Object.defineProperty(component, 'defaultPositions', {
                value: [
                    { position: 1, subPosition: 1 },
                    { position: 2, subPosition: 2 }
                ] as Position[],
                writable: false
            });
        });

        it('should return only position 1 when sequenceFlow hides position 2', () => {
            const getPositions = component as unknown as { getPositionsForSequenceFlow: (seq: string) => Position[] };
            const result = getPositions.getPositionsForSequenceFlow('1,3,4');
            expect(result).toEqual([{ position: 1, subPosition: 1 }]);
        });

        it('should return all default positions when sequenceFlow includes position 2', () => {
            const getPositions = component as unknown as { getPositionsForSequenceFlow: (seq: string) => Position[] };
            const result = getPositions.getPositionsForSequenceFlow('1,2,3,4');
            expect(result).toEqual([
                { position: 1, subPosition: 1 },
                { position: 2, subPosition: 2 }
            ]);
        });

        it('should return all default positions for unknown sequenceFlow', () => {
            const getPositions = component as unknown as { getPositionsForSequenceFlow: (seq: string) => Position[] };
            const result = getPositions.getPositionsForSequenceFlow('unknown');
            expect(result).toEqual([
                { position: 1, subPosition: 1 },
                { position: 2, subPosition: 2 }
            ]);
        });

    });

    describe('numberRangeValidator', () => {
        let validator: ValidatorFn;

        beforeEach(() => {
            const getValidator = component as unknown as {
                numberRangeValidator: (min: number, max: number) => ValidatorFn
            };

            validator = getValidator.numberRangeValidator(10, 100);
        });

        it('should return null if the value is empty (let required validator handle it)', () => {
            expect(validator(new FormControl(null))).toBeNull();
            expect(validator(new FormControl(undefined))).toBeNull();
            expect(validator(new FormControl(''))).toBeNull();
        });

        it('should return error if the value is not a number', () => {
            expect(validator(new FormControl('abc'))).toEqual({
                invalidNumber: { value: 'abc', expected: 'number' }
            });
        });

        it('should strip commas and validate correctly', () => {
            expect(validator(new FormControl('1,000'))).toEqual({
                max: { max: 100, actual: 1000 }
            });
        });

        it('should return error if number is less than min', () => {
            expect(validator(new FormControl('5'))).toEqual({
                min: { min: 10, actual: 5 }
            });
        });

        it('should return error if number is greater than max', () => {
            expect(validator(new FormControl(150))).toEqual({
                max: { max: 100, actual: 150 }
            });
        });

        it('should return null if number is within range', () => {
            expect(validator(new FormControl(50))).toBeNull();
            expect(validator(new FormControl('25'))).toBeNull();
            expect(validator(new FormControl('75'))).toBeNull();
        });
    });

    describe('createFormGroup', () => {
        let mockValues: FormValues;

        beforeEach(() => {
            component.editMode = true;

            spyOn(
                component as unknown as { numberRangeValidator: (min: number, max: number) => ValidatorFn },
                'numberRangeValidator'
            ).and.callFake(() => () => null);

            mockValues = {
                gas: 100,
                condensateType: 'Light',
                condensateValue: 5000,
                cgrValue: 300,
                waterType: 'Fresh',
                waterValue: 7000,
                wgrValue: 150,
                h2s: 50,
                co2: 20,
                exportTemperature: 80,
                exportPressure: 45,
            };
        });

        it('should create a FormGroup with correct controls and values', () => {
            const formGroup = (component as unknown as {
                createFormGroup: (values: FormValues) => FormGroup;
            }).createFormGroup(mockValues);

            expect(formGroup).toBeTruthy();
            expect(formGroup instanceof FormGroup).toBeTrue();

            const controlNames = Object.keys(mockValues) as (keyof FormValues)[];

            controlNames.forEach((name) => {
                expect(formGroup.contains(name)).toBeTrue();
                expect(formGroup.get(name)?.value).toEqual(mockValues[name]);
                expect(formGroup.get(name)?.disabled).toBeFalse();
            });

            expect(component['numberRangeValidator']).toHaveBeenCalledWith(0, 300);
            expect(component['numberRangeValidator']).toHaveBeenCalledWith(0, 20000);
            expect(component['numberRangeValidator']).toHaveBeenCalledWith(0, 500);
            expect(component['numberRangeValidator']).toHaveBeenCalledWith(0, 200);
            expect(component['numberRangeValidator']).toHaveBeenCalledWith(0, 100);
            expect(component['numberRangeValidator']).toHaveBeenCalledWith(0, 135);
            expect(component['numberRangeValidator']).toHaveBeenCalledWith(0, 91);
        });

        it('should disable controls when editMode is false', () => {
            component.editMode = false;

            const formGroup = (component as unknown as {
                createFormGroup: (values: FormValues) => FormGroup;
            }).createFormGroup(mockValues);

            Object.keys(mockValues).forEach((key) => {
                expect(formGroup.get(key)?.disabled).toBeTrue();
            });
        });
    });


    describe('mapFetchedDataToForm', () => {
        it('should map fetched data to form and initialize internal state correctly', () => {
            const mockData = [
                {
                    position: 1,
                    subPosition: 1,
                    flowRate: {
                        gas: 500,
                        condensate: { type: 'CGR', value: 20 },
                        water: { type: 'WGR', value: 5 }
                    },
                    composition: { h2s: 1, co2: 0.5 },
                    temperature: { export: 100, pressure: 50 },
                    positionType: 'custom'
                },
                {
                    position: 2,
                    subPosition: 1,
                    flowRate: {
                        gas: 300,
                        condensate: { type: 'CGR', value: 10 },
                        water: { type: 'WGR', value: 3 }
                    },
                    composition: { h2s: 0.8, co2: 0.4 },
                    temperature: { export: 90, pressure: 40 },
                    positionType: 'same_as_1'
                }
            ];

            spyOn(
                component as unknown as { getPositionsForSequenceFlow: (seq: string) => { position: number; subPosition: number }[] },
                'getPositionsForSequenceFlow'
            ).and.returnValue([
                { position: 1, subPosition: 1 },
                { position: 2, subPosition: 1 }
            ]);
            (component as unknown as { mapFetchedDataToForm: (data: FetchedDataItem[]) => void })
                .mapFetchedDataToForm(mockData);
            const key1 = '1-1';
            const key2 = '2-1';

            expect(component.formGroups[key1]).toBeDefined();
            expect(component.formGroups[key2]).toBeDefined();

            expect(component.formGroups[key1].enabled).toBeFalse();
            expect(component.formGroups[key2].enabled).toBeFalse();

            const form1Value = component.formGroups[key1].value;
            expect(form1Value.gas).toBe(500);
            expect(form1Value.condensateValue).toBe(20);
            expect(form1Value.waterValue).toBe(5);
            expect(form1Value.h2s).toBe(1);
            expect(form1Value.co2).toBe(0.5);
            expect(form1Value.exportTemperature).toBe(100);
            expect(form1Value.exportPressure).toBe(50);

            expect(component.positionTypes[key1]).toBe('custom');
            expect(component.positionTypes[key2]).toBe('same_as_1');

        });
    });

    describe('parseNumber', () => {
        it('should parse numeric strings with commas correctly', () => {
            expect(component.parseNumber('1,234.56')).toBeCloseTo(1234.56);
            expect(component.parseNumber('100')).toBe(100);
            expect(component.parseNumber('0')).toBe(0);
        });

        it('should return number directly if input is a number', () => {
            expect(component.parseNumber(123)).toBe(123);
            expect(component.parseNumber(0)).toBe(0);
            expect(component.parseNumber(-50)).toBe(-50);
        });

        it('should return 0 for non-string and non-number input', () => {
            expect(component.parseNumber(null)).toBe(0);
            expect(component.parseNumber(undefined)).toBe(0);
            expect(component.parseNumber({})).toBe(0);
            expect(component.parseNumber([])).toBe(0);
            expect(component.parseNumber(true)).toBe(0);
        });
    });

    describe('saveDraft', () => {
        let typedComponent: ProcessInformationComponentPrivate;
      
        beforeEach(() => {
          typedComponent = component as unknown as ProcessInformationComponentPrivate;
      
          spyOn(typedComponent, 'parseNumber').and.callFake((val) => {
            if (val === null || val === undefined || val === '') return 0;
            return Number(val);
          });
      
          spyOn(typedComponent, 'setFormGroupState');
      
          typedComponent.calculationService = {
            saveDraftProcessInformation: jasmine.createSpy().and.returnValue(of({ response: { success: true } })),
          };
      
          typedComponent.editMode = true;
          typedComponent.fetchedData = [
            { position: 1, subPosition: 1 },
            { position: 1, subPosition: 2 },
          ];
      
          typedComponent.formGroups = {
            '1-1': new FormBuilder().group({
              gas: ['1000'],
              condensateType: ['CGR'],
              cgrValue: ['200'],
              waterType: ['flowrate'],
              waterValue: ['300'],
              h2s: ['10'],
              co2: ['5'],
              exportTemperature: ['75'],
              exportPressure: ['1200'],
            }),
            '1-2': new FormBuilder().group({
              gas: ['1100'],
              condensateType: ['flowrate'],
              condensateValue: ['250'],
              waterType: ['WGR'],
              wgrValue: ['350'],
              h2s: ['15'],
              co2: ['8'],
              exportTemperature: ['70'],
              exportPressure: ['1100'],
            }),
          };
      
          typedComponent.itemPreSelections = {
            '1-1': 'same_as_1',
            '1-2': 'custom',
          };
      
          typedComponent.study = { data: { studyId: 'study123' } };
          typedComponent.transactionId = { data: { transactionId: 'txn456' } };
        });
      
        it('should correctly build payload and call saveDraftProcessInformation', async () => {
          await typedComponent.saveDraft();
      
          expect(typedComponent.calculationService.saveDraftProcessInformation)
            .toHaveBeenCalledWith(jasmine.objectContaining({
              studyId: 'study123',
              transactionId: 'txn456',
              sequenceFlow: '1,2,3,4',
              data: jasmine.any(Array),
            }));
      
          expect(typedComponent.setFormGroupState).toHaveBeenCalledWith(false);
          expect(typedComponent.editMode).toBeFalse();
        });
      
        it('should handle error case in saveDraft', async () => {
          const mockError = { message: 'Save failed' };
          typedComponent.calculationService.saveDraftProcessInformation = jasmine.createSpy().and.returnValue(throwError(() => mockError));
      
          typedComponent.fetchedData = [];
          typedComponent.formGroups = {};
          typedComponent.itemPreSelections = {};
          typedComponent.study = { data: { study_id: 'study123' } };
          typedComponent.transactionId = { data: { transaction_id: 'txn456' } };
      
          try {
            await typedComponent.saveDraft();
            fail('Expected promise to reject');
          } catch (error) {
            expect(error).toEqual(new Error('Something went wrong'));
            expect(typedComponent.calculationService.saveDraftProcessInformation).toHaveBeenCalled();
          }
      
          expect(typedComponent.setFormGroupState).toHaveBeenCalledWith(false);
        });
      });

    describe('onSelectionChange', () => {
        it('should update all related maps and call setPosition with updated itemPreSelections', () => {
            const key = '1-1';
            const selection = 'custom';
            const typedComponent = component as unknown as SelectionMaps & {
                onSelectionChange: (key: string, selection: string) => void;
            };

            typedComponent.itemPreSelections = {};
            typedComponent.positionTypes = {};
            typedComponent.allSelections = {};
            typedComponent.allPositionTypes = {};

            component.onSelectionChange(key, selection);

            typedComponent.onSelectionChange('1-1', 'custom');

            expect(typedComponent.itemPreSelections['1-1']).toBe('custom');
            expect(typedComponent.positionTypes['1-1']).toBe('custom');
            expect(typedComponent.allSelections['1-1']).toBe('custom');
            expect(typedComponent.allPositionTypes['1-1']).toBe('custom');

            expect(mockCalculationContextService.setPosition).toHaveBeenCalledWith(
                typedComponent.itemPreSelections
            );
        });
    });



    describe('getProcessInformation', () => {
        let typedComponent: ProcessInformationComponentPrivate & {
            calculationService: { getProcessInformationById: jasmine.Spy };
            sequenceFlow: string;
            fetchedData: any[];
            formGroups: Record<string, FormGroup>;
            itemPreSelections: Record<string, string>;
        };

        beforeEach(() => {
            typedComponent = component as unknown as typeof typedComponent;
        });

        it('should fetch, sort, map data and update form/context when API returns valid data', fakeAsync(() => {
            const mockData = [
                { position: 2, subPosition: 2 },
                { position: 1, subPosition: 3 },
                { position: 1, subPosition: 1 },
            ];
            const sortedData = [
                { position: 1, subPosition: 1 },
                { position: 1, subPosition: 3 },
                { position: 2, subPosition: 2 },
            ];
            const mockResponse = { data: { sequenceFlow: '9,8,7', data: mockData } };

            typedComponent.calculationService.getProcessInformationById = jasmine
                .createSpy()
                .and.returnValue(of(mockResponse));

            const mapSpy = spyOn(typedComponent, 'mapFetchedDataToForm');
            const validateSpy = spyOn(typedComponent, 'validateProcessInformation');
            const watchSpy = spyOn(typedComponent, 'watchFormChanges');

            typedComponent.getProcessInformation('study123', 'txn456');
            tick();

            expect(typedComponent.sequenceFlow).toBe('1,2,3,4');
            expect(typedComponent.fetchedData).toEqual(sortedData);
            expect(mapSpy).toHaveBeenCalledWith(sortedData);
            expect(mockCalculationContextService.setProcessForm).toHaveBeenCalledWith(typedComponent.formGroups);
            expect(mockCalculationContextService.setProcessInfoForm).toHaveBeenCalledWith(typedComponent.formGroups);
            expect(mockCalculationContextService.setPosition).toHaveBeenCalledWith(typedComponent.itemPreSelections);
            expect(validateSpy).toHaveBeenCalled();
            expect(watchSpy).toHaveBeenCalled();
        }));

        it('should initialize default form when API returns empty data', fakeAsync(() => {
            const mockResponse = { data: { sequenceFlow: '9,8,7', data: [] } };

            typedComponent.calculationService.getProcessInformationById = jasmine
                .createSpy()
                .and.returnValue(of(mockResponse));

            const initSpy = spyOn(typedComponent, 'initializeDefaultForm');

            typedComponent.getProcessInformation('study123', 'txn456');
            tick();

            expect(typedComponent.sequenceFlow).toBe('1,2,3,4');
            expect(initSpy).toHaveBeenCalled();
        }));

        it('should use API sequenceFlow when context returns null', fakeAsync(() => {
            mockCalculationContextService.getSelectPosition = () => null;
            const mockResponse = { data: { sequenceFlow: 'api-sequence', data: [] } };

            typedComponent.calculationService.getProcessInformationById = jasmine
                .createSpy()
                .and.returnValue(of(mockResponse));

            const initSpy = spyOn(typedComponent, 'initializeDefaultForm');

            typedComponent.getProcessInformation('study123', 'txn456');
            tick();

            expect(typedComponent.sequenceFlow).toBe('api-sequence');
            expect(initSpy).toHaveBeenCalled();
        }));

        it('should call initializeDefaultForm on API error', fakeAsync(() => {
            const error = new Error('API error');

            typedComponent.calculationService.getProcessInformationById = jasmine
                .createSpy()
                .and.returnValue(throwError(() => error));

            const initSpy = spyOn(typedComponent, 'initializeDefaultForm');
            const consoleSpy = spyOn(console, 'error');

            typedComponent.getProcessInformation('study123', 'txn456');
            tick();

            expect(consoleSpy).toHaveBeenCalledWith('Failed to load process information:', error);
            expect(initSpy).toHaveBeenCalled();
        }));
    });

    describe('validateProcessInformation', () => {
        beforeEach(() => {
            component['formGroups'] = {
                '1-1': new FormGroup({ field1: new FormControl('valid', Validators.required) }),
                '2-1': new FormGroup({ field2: new FormControl('valid', Validators.required) }),
                '2-2': new FormGroup({ field3: new FormControl('valid', Validators.required) })
            };
        });

        it('should return all invalid as false when all forms are valid', () => {
            const result = component.validateProcessInformation();

            expect(result).toEqual({
                isFormPosition1Invalid: false,
                isFormPosition2Invalid: false,
                isFormPosition3Invalid: false
            });

            expect(mockCalculationContextService.setProcessValid).toHaveBeenCalledWith(result);
        });

        it('should mark formPosition1Invalid as true when form 1-1 is invalid', () => {
            component['formGroups']['1-1'].get('field1')?.setValue('');
            component['formGroups']['1-1'].get('field1')?.markAsTouched();

            const result = component.validateProcessInformation();

            expect(result).toEqual({
                isFormPosition1Invalid: true,
                isFormPosition2Invalid: false,
                isFormPosition3Invalid: false
            });

            expect(mockCalculationContextService.setProcessValid).toHaveBeenCalledWith(result);
        });

        it('should mark formPosition2Invalid as true when form 2-1 is invalid', () => {
            component['formGroups']['2-1'].get('field2')?.setValue('');
            component['formGroups']['2-1'].get('field2')?.markAsTouched();

            const result = component.validateProcessInformation();

            expect(result).toEqual({
                isFormPosition1Invalid: false,
                isFormPosition2Invalid: true,
                isFormPosition3Invalid: false
            });

            expect(mockCalculationContextService.setProcessValid).toHaveBeenCalledWith(result);
        });

        it('should mark formPosition3Invalid as true when form 2-2 is invalid', () => {
            component['formGroups']['2-2'].get('field3')?.setValue('');
            component['formGroups']['2-2'].get('field3')?.markAsTouched();

            const result = component.validateProcessInformation();

            expect(result).toEqual({
                isFormPosition1Invalid: false,
                isFormPosition2Invalid: false,
                isFormPosition3Invalid: true
            });

            expect(mockCalculationContextService.setProcessValid).toHaveBeenCalledWith(result);
        });

        it('should default to false if any form group is missing', () => {
            component['formGroups'] = {};

            const result = component.validateProcessInformation();

            expect(result).toEqual({
                isFormPosition1Invalid: false,
                isFormPosition2Invalid: false,
                isFormPosition3Invalid: false
            });

            expect(mockCalculationContextService.setProcessValid).toHaveBeenCalledWith(result);
        });
    });

    describe('watchFormChanges', () => {
        beforeEach(() => {
            component['formGroups'] = {
                '1-1': new FormGroup({ field1: new FormControl('initial1') }),
                '2-1': new FormGroup({ field2: new FormControl('initial2') })
            };

            component['allFormData'] = {};
            component['destroy$'] = new Subject<void>();
        });

        it('should subscribe to valueChanges and update allFormData with debounced values', fakeAsync(() => {
            component.watchFormChanges();

            component['formGroups']['1-1'].get('field1')?.setValue('updated1');
            component['formGroups']['2-1'].get('field2')?.setValue('updated2');

            tick(300);
            expect(component['allFormData']['1-1']).toEqual({ field1: 'updated1' } as unknown as FormValues);
            expect(component['allFormData']['2-1']).toEqual({ field2: 'updated2' } as unknown as FormValues);

        }));

        it('should not emit changes after destroy$ is triggered', fakeAsync(() => {
            component.watchFormChanges();

            component['destroy$'].next();
            component['destroy$'].complete();

            component['formGroups']['1-1'].get('field1')?.setValue('willNotBeSet');

            tick(300);

            expect(component['allFormData']['1-1']).toBeUndefined();
        }));
    });

    describe('getPositionKey', () => {
        it('should return the correct key string combining position and subPosition', () => {
            const position = 3;
            const subPosition = 2;
            const expectedKey = '3-2';

            const result = component.getPositionKey(position, subPosition);

            expect(result).toBe(expectedKey);
        });

        it('should return correct key even for zero or negative numbers', () => {
            expect(component.getPositionKey(0, 0)).toBe('0-0');
            expect(component.getPositionKey(-1, 5)).toBe('-1-5');
        });
    });

    describe('getSelectedOption', () => {
        beforeEach(() => {
            component.dropdownOptions = [
                { id: 'opt1', name: 'Option 1' },
                { id: 'opt2', name: 'Option 2' },
                { id: 'opt3', name: 'Option 3' },
            ];

            component.itemPreSelections = {
                '1-1': 'opt2',
                '2-1': 'opt3',
                '3-1': 'nonexistent',
            };
        });

        it('should return the matching option object if selectedId exists', () => {
            const result = component.getSelectedOption('1-1');
            expect(result).toEqual({ id: 'opt2', name: 'Option 2' });
        });

        it('should return null if no matching option found', () => {
            const result = component.getSelectedOption('3-1');
            expect(result).toBeNull();
        });

        it('should return null if no selection found for the positionKey', () => {
            const result = component.getSelectedOption('non-existent-key');
            expect(result).toBeNull();
        });
    });


    describe('getDropdownLabel', () => {
        it('should return "Same as position 1" when value is "same_as_1"', () => {
            const result = component.getDropdownLabel('same_as_1', 0);
            expect(result).toBe('Same as position 1');
        });

        it('should return "Custom" when value is "custom"', () => {
            const result = component.getDropdownLabel('custom', 0);
            expect(result).toBe('Custom');
        });

        it('should return "Custom" for any other value', () => {
            const result = component.getDropdownLabel('other_value', 0);
            expect(result).toBe('Custom');
        });
    });

    describe('setFormGroupState', () => {
        it('should enable all form groups when passed true', () => {
            const mockForm1 = jasmine.createSpyObj<FormGroup>('FormGroup', ['enable', 'disable']);
            const mockForm2 = jasmine.createSpyObj<FormGroup>('FormGroup', ['enable', 'disable']);

            component.formGroups = {
                '1-1': mockForm1,
                '2-1': mockForm2,
            };

            component.setFormGroupState(true);

            expect(mockForm1.enable).toHaveBeenCalled();
            expect(mockForm1.disable).not.toHaveBeenCalled();

            expect(mockForm2.enable).toHaveBeenCalled();
            expect(mockForm2.disable).not.toHaveBeenCalled();
        });

        it('should disable all form groups when passed false', () => {
            const mockForm1 = jasmine.createSpyObj<FormGroup>('FormGroup', ['enable', 'disable']);
            const mockForm2 = jasmine.createSpyObj<FormGroup>('FormGroup', ['enable', 'disable']);

            component.formGroups = {
                '1-1': mockForm1,
                '2-1': mockForm2,
            };

            component.setFormGroupState(false);

            expect(mockForm1.disable).toHaveBeenCalled();
            expect(mockForm1.enable).not.toHaveBeenCalled();

            expect(mockForm2.disable).toHaveBeenCalled();
            expect(mockForm2.enable).not.toHaveBeenCalled();
        });
    });

    describe('toggleEditMode', () => {
        it('should toggle editMode and call setFormGroupState with new value', () => {
            const setFormGroupStateSpy = spyOn(
                component as unknown as { setFormGroupState: (enable: boolean) => void },
                'setFormGroupState'
            );

            component.editMode = false;

            component.toggleEditMode();

            expect(component.editMode).toBeTrue();
            expect(setFormGroupStateSpy).toHaveBeenCalledOnceWith(true);

            component.toggleEditMode();

            expect(component.editMode).toBeFalse();
            expect(setFormGroupStateSpy).toHaveBeenCalledWith(false);
        });
    });

    describe('getFormControl', () => {
        let testFormGroup: FormGroup;

        beforeEach(() => {
            testFormGroup = new FormGroup({
                controlA: new FormControl('testValue'),
            });
        });

        it('should return the control when it exists in the form group', () => {
            const result = component.getFormControl(testFormGroup, 'controlA');
            expect(result).toBeTruthy();
            expect(result.value).toBe('testValue');
        });

        it('should throw an error when the control does not exist in the form group', () => {
            expect(() => component.getFormControl(testFormGroup, 'nonExistent')).toThrowError(
                `Control 'nonExistent' not found in form group`
            );
        });
    });

    describe('getFieldError', () => {
        const min = 0;
        const max = 100;

        it('should return empty string if control is null', () => {
            const result = component.getFieldError(null, min, max);
            expect(result).toBe('');
        });

        it('should return empty string if control is not touched or dirty', () => {
            const control = new FormControl('', { validators: Validators.required });
            expect(component.getFieldError(control, min, max)).toBe('');
        });

        it('should return "Required field" if control has required error', () => {
            const control = new FormControl('', { validators: Validators.required });
            control.markAsTouched();
            control.updateValueAndValidity();
            expect(component.getFieldError(control, min, max)).toBe('Required field');
        });

        it('should return "Must be a valid number" if control has invalidNumber error', () => {
            const control = new FormControl('abc');
            control.setErrors({ invalidNumber: true });
            control.markAsDirty();
            expect(component.getFieldError(control, min, max)).toBe('Must be a valid number');
        });

        it('should return correct min error message if control has min error', () => {
            const control = new FormControl(-10);
            control.setErrors({ min: { min: min, actual: -10 } });
            control.markAsTouched();
            const expected = `Must be number and between ${min.toLocaleString()} and ${max.toLocaleString()}`;
            expect(component.getFieldError(control, min, max)).toBe(expected);
        });

        it('should return correct max error message if control has max error', () => {
            const control = new FormControl(150);
            control.setErrors({ max: { max: max, actual: 150 } });
            control.markAsDirty();
            const expected = `Must be number and between ${min.toLocaleString()} and ${max.toLocaleString()}`;
            expect(component.getFieldError(control, min, max)).toBe(expected);
        });

        it('should return "Invalid value" if control has unknown error', () => {
            const control = new FormControl('test');
            control.setErrors({ customError: true });
            control.markAsTouched();
            expect(component.getFieldError(control, min, max)).toBe('Invalid value');
        });

        it('should return empty string if control has no errors', () => {
            const control = new FormControl('valid');
            control.markAsTouched();
            expect(component.getFieldError(control, min, max)).toBe('');
        });
    });
});