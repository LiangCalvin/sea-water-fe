import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { PipingDataComponent } from './piping-data.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { defer, of, throwError } from 'rxjs';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../../CalculationContext.service';
import { AlertMessageConstants } from '../../../../../core/enums/calculation.enum';
import { AlertService } from '../../../../../shared/services/alert.service';

describe('PipingDataComponent', () => {
    let component: PipingDataComponent;
    let fixture: ComponentFixture<PipingDataComponent>;
    let mockCalculationService: jasmine.SpyObj<CalculationService>;
    let mockCalculationContextService: jasmine.SpyObj<CalculationContextService>;
    let fb: FormBuilder;

    beforeEach(async () => {
        mockCalculationService = jasmine.createSpyObj('CalculationService', [
            'getPipingDataById',
            'saveDraftPipingData',
            'getPipingDetailByClassAndSize',
            'getPipingSize',
            'getAllowableStress',
            'getQualityFactor',
            'getPipingClass'
        ]);
        mockCalculationContextService = jasmine.createSpyObj('CalculationContextService', [
            'setPipingForm', 'setPositionTypePiping', 'getSelectPosition',
            'setPipingValid'
        ]);
        mockCalculationService.getPipingDataById.and.returnValue(of({ data: {} }));
        mockCalculationContextService.selectPosition$ = of(null);
        mockCalculationContextService.getSelectPosition.and.returnValue({ sequenceFlow: '1,2' });
        mockCalculationService.getPipingDetailByClassAndSize.and.returnValue(
            of({ data: { grade: 'A105', allowableStress: 2000 } })
        );
        mockCalculationService.getPipingClass.and.returnValue(
            of({ data: { pipingClass: ['A', 'B', 'C'] } })
        );

        mockCalculationService.getPipingSize.and.returnValue(
            of({ data: { pipingSize: [10, 12, 15] } })
        );

        mockCalculationService.getQualityFactor.and.returnValue(
            of({ data: { qualityFactor: 0.9 } })
        );

        mockCalculationService.getAllowableStress.and.returnValue(
            of({ data: { allowableStress: 100 } })
        );
        mockCalculationService.getPipingDetailByClassAndSize.and.returnValue(
            defer(() => of({ data: { grade: 'A105', allowableStress: 2000, nozzleLength: 50 } }))
        );

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, HttpClientTestingModule, PipingDataComponent],
            providers: [
                FormBuilder,
                { provide: CalculationService, useValue: mockCalculationService },
                { provide: CalculationContextService, useValue: mockCalculationContextService },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { params: {} } }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PipingDataComponent);
        component = fixture.componentInstance;

        component.formGroups = {
            '1-1': new FormGroup({
                pipingSize: new FormControl(10),
                pipingClass: new FormControl('A'),
                innerDiameter: new FormControl(5),
                innerDiameterUnit: new FormControl('inch'),
                outerDiameter: new FormControl(7),
                outerDiameterUnit: new FormControl('inch'),
                thickness: new FormControl(1),
                thicknessUnit: new FormControl('mm'),
                material: new FormControl('Steel'),
                erosionVelocityConstant: new FormControl(100),
                specNo: new FormControl('Spec1'),
                maxOperatingTemp: new FormControl(200),
                allowableStress: new FormControl(150),
                coefficient: new FormControl(0.4),
                qualityFactor: new FormControl(1),
                corrosionAllowance: new FormControl(0.5),
                weldingJointStrength: new FormControl(1),
                spanType: new FormControl('default'),
                spanLength: new FormControl(10),
                pipelineDesignPressure: new FormControl(80)
            }),
            '2-1': new FormGroup({
                pipingSize: new FormControl(15),
                pipingClass: new FormControl('B'),
                innerDiameter: new FormControl(6),
                innerDiameterUnit: new FormControl('inch'),
                outerDiameter: new FormControl(8),
                outerDiameterUnit: new FormControl('inch'),
                thickness: new FormControl(2),
                thicknessUnit: new FormControl('mm'),
                material: new FormControl('Alloy'),
                erosionVelocityConstant: new FormControl(120),
                specNo: new FormControl('Spec2'),
                maxOperatingTemp: new FormControl(220),
                allowableStress: new FormControl(160),
                coefficient: new FormControl(0.5),
                qualityFactor: new FormControl(0.9),
                corrosionAllowance: new FormControl(0.3),
                weldingJointStrength: new FormControl(0.95),
                spanType: new FormControl('custom'),
                spanLength: new FormControl(15),
                pipelineDesignPressure: new FormControl(90)
            }),
        };

        component.fetchedData = [
            { position: 1, subPosition: 1 },
            { position: 2, subPosition: 1 }
        ];

        component.itemPreSelections = {
            '1-1': 'custom',
            '2-1': 'same_as_1'
        };

        spyOn(component as any, 'setupPipingDataWatcher').and.callThrough();
        spyOn(component as any, 'fetchPipingDetails').and.callThrough();
        spyOn(component as any, 'fetchQualityFactor').and.callThrough();
    });



    describe('getPipingDataById', () => {
        const mockResponse = {
            data: [
                { position: 2, subPosition: 2, pipingSize: 5 },
                { position: 1, subPosition: 1, pipingSize: 10 },
                { position: 3, subPosition: 1, pipingSize: 15 }
            ],
            sequenceFlow: '2,3'
        };

        beforeEach(() => {
            spyOn(component as any, 'mapFetchedDataToForm');
            mockCalculationContextService.getSelectPosition.and.returnValue({ sequenceFlow: '2,3' });
            mockCalculationService.getPipingDataById.and.returnValue(of(mockResponse));

        });

        it('should fetch, sort, filter and call mapFetchedDataToForm with filtered data', fakeAsync(() => {
            component.getPipingDataById('S1', 'T1');
            tick();

            // After fakeAsync completion
            expect(mockCalculationService.getPipingDataById).toHaveBeenCalledWith('S1', 'T1');

            // Confirm that filter retains pos 1 always and others per flow 2,3
            const expected = [
                { position: 1, subPosition: 1, pipingSize: 10 },
                { position: 2, subPosition: 2, pipingSize: 5 },
                { position: 3, subPosition: 1, pipingSize: 15 }
            ];
            expect((component as any).mapFetchedDataToForm).toHaveBeenCalledWith(expected);

            expect(mockCalculationContextService.setPipingForm).toHaveBeenCalledWith(component.formGroups);
            expect(mockCalculationContextService.setPositionTypePiping)
                .toHaveBeenCalledWith(component.itemPreSelections);
        }));

        it('should call initializeDefaultForm if response data is empty', fakeAsync(() => {
            (mockCalculationService.getPipingDataById as jasmine.Spy).and.returnValue(of({ data: [], sequenceFlow: '2' }));
            spyOn(component as any, 'initializeDefaultForm');

            component.getPipingDataById('S1', 'T1');
            tick();

            expect((component as any).initializeDefaultForm).toHaveBeenCalled();
        }));

        it('should call initializeDefaultForm on error', fakeAsync(() => {
            (mockCalculationService.getPipingDataById as jasmine.Spy).and.returnValue(throwError(() => new Error('API fail')));
            spyOn(component as any, 'initializeDefaultForm');

            component.getPipingDataById('S1', 'T1');
            tick();

            expect((component as any).initializeDefaultForm).toHaveBeenCalled();
        }));
    });

    describe('Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should load session data from sessionStorage', () => {
            spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
                if (key === 'study') return JSON.stringify({ data: { study_id: '123' } });
                if (key === 'transactionId') return JSON.stringify({ data: { transaction_id: '456' } });
                return null;
            });

            component['loadSessionData']();
            expect(component.study).toEqual({ data: { study_id: '123' } });
            expect(component.transactionId).toEqual({ data: { transaction_id: '456' } });
        });
    });

    describe('Sequence flow logic', () => {
        it('should return correct positions for sequence flow', () => {
            const result = component['getPositionsForSequenceFlow']('1,3');
            expect(result.map(p => p.position)).toContain(1);
            expect(result.map(p => p.position)).toContain(3);
            expect(result.map(p => p.position)).not.toContain(2);
        });
    });

    describe('Form preservation', () => {
        it('should preserve current form values', () => {
            const key = '1-1';
            component.formGroups[key] = component['createFormGroup']({ ...component['defaultFormValues'], pipingClass: 'A' });
            component.itemPreSelections[key] = 'custom';
            component.positionTypes[key] = 'custom';

            component['preserveCurrentFormData']();

            expect(component['allFormData'][key].pipingClass).toBe('A');
            expect(component['allSelections'][key]).toBe('custom');
            expect(component['customFormValues'][key].pipingClass).toBe('A');
        });
    });

    describe('handleSequenceFlowChange', () => {
        let rebuildSpy: jasmine.Spy;
        let preserveSpy: jasmine.Spy;
        let getPositionsSpy: jasmine.Spy;

        beforeEach(() => {
            // Spy on private methods
            rebuildSpy = spyOn(component as any, 'rebuildFormsForSequenceFlow');
            preserveSpy = spyOn(component as any, 'preserveCurrentFormData');
            getPositionsSpy = spyOn(component as any, 'getPositionsForSequenceFlow').and.returnValue([
                { position: 1, subPosition: 1 }
            ]);
        });

        it('should call rebuildFormsForSequenceFlow with "allFormData" when pipingData is null', () => {
            component['calculationDataService'].pipingData = null;
            component['sequenceFlow'] = '1,2';

            (component as any).handleSequenceFlowChange();

            expect(preserveSpy).toHaveBeenCalled();
            expect(getPositionsSpy).toHaveBeenCalledWith('1,2');
            expect(component.fetchedData).toEqual([{ position: 1, subPosition: 1 }]);
            expect(rebuildSpy).toHaveBeenCalledWith('allFormData');
        });

        it('should call rebuildFormsForSequenceFlow with "pipingData" when pipingData exists', () => {
            component['calculationDataService'].pipingData = [{}];
            component['sequenceFlow'] = '1,2';

            (component as any).handleSequenceFlowChange();

            expect(preserveSpy).toHaveBeenCalled();
            expect(getPositionsSpy).toHaveBeenCalledWith('1,2');
            expect(component.fetchedData).toEqual([{ position: 1, subPosition: 1 }]);
            expect(rebuildSpy).toHaveBeenCalledWith('pipingData');
        });
    });

    describe('rebuildFormsForSequenceFlow', () => {
        beforeEach(() => {
            (component as any).sequenceFlow = '1,2,3';
            (component as any).allFormData = {
                '1-1': component['defaultFormValues'],
                '2-1': component['defaultFormValues'],
            };
            (component as any).allSelections = {
                '1-1': 'custom',
                '2-1': 'same_as_1',
            };
            (component as any).allPositionTypes = {
                '1-1': 'custom',
                '2-1': 'same_as_1',
            };
            (component as any).customFormValues = {
                '1-1': {
                    ...component['defaultFormValues'],
                    piping_class: 'A',
                },
            };
            fb = TestBed.inject(FormBuilder);
        });
        it('should reset formGroups, itemPreSelections, and positionTypes', () => {
            component.formGroups['foo'] = {} as any;
            component.itemPreSelections['foo'] = 'custom';
            component.positionTypes['foo'] = 'custom';

            spyOn(component as any, 'getPositionsForSequenceFlow').and.returnValue([]);

            (component as any).rebuildFormsForSequenceFlow();

            expect(component.formGroups).toEqual({});
            expect(component.itemPreSelections).toEqual({});
            expect(component.positionTypes).toEqual({});
        });

        it('should create form groups for positions with no existing data using defaultFormValues and default types', () => {
            const positions = [
                { position: 1, subPosition: 1 },
                { position: 2, subPosition: 1 },
                { position: 3, subPosition: 1 }
            ];

            spyOn(component as any, 'getPositionsForSequenceFlow').and.returnValue(positions);

            (component as any).rebuildFormsForSequenceFlow();

            const firstKey = '1-1';
            const expectedFirstValue = (component as any).defaultFormValues;

            positions.forEach(pos => {
                const key = `${pos.position}-${pos.subPosition}`;
                expect(component.formGroups[key]).toBeDefined();

                if (pos.position === 1) {
                    expect(component.formGroups[key].get('pipingClass')?.value).toBe('');
                    expect(component.itemPreSelections[key]).toBe('custom');
                    expect(component.positionTypes[key]).toBe('custom');
                    expect((component as any).allSelections[key]).toBe('custom');
                    expect((component as any).allPositionTypes[key]).toBe('custom');
                } else {
                    const referenceValue = component.formGroups[firstKey].value;
                    expect(component.formGroups[key].value).toEqual(referenceValue);
                    expect(component.itemPreSelections[key]).toBe('same_as_1');
                    expect(component.positionTypes[key]).toBe('same_as_1');
                    expect((component as any).allSelections[key]).toBe('same_as_1');
                    expect((component as any).allPositionTypes[key]).toBe('same_as_1');
                }
            });
        });

        it('should use existing allFormData and validate existing selections for positions 2 and 3', () => {
            const positions = [
                { position: 2, subPosition: 1 },
                { position: 3, subPosition: 1 }
            ];
            spyOn(component as any, 'getPositionsForSequenceFlow').and.returnValue(positions);

            (component as any).allFormData = {
                '2-1': { pipingClass: 'existing2' },
                '3-1': { pipingClass: 'existing3' }
            };
            (component as any).allSelections = {
                '2-1': 'same_as_1',
                '3-1': 'custom'
            };
            (component as any).allPositionTypes = {
                '2-1': 'same_as_1',
                '3-1': 'custom'
            };

            (component as any).rebuildFormsForSequenceFlow();

            positions.forEach(pos => {
                const key = `${pos.position}-${pos.subPosition}`;
                expect(component.formGroups[key].value.pipingClass).toBe((component as any).allFormData[key].pipingClass);
                expect(component.itemPreSelections[key]).toBe((component as any).allSelections[key]);
                expect(component.positionTypes[key]).toBe((component as any).allPositionTypes[key]);
            });
        });

        it('should reset invalid existing selections for positions 2 and 3 to default "same_as_1"', () => {
            const positions = [
                { position: 2, subPosition: 1 },
                { position: 3, subPosition: 1 }
            ];
            spyOn(component as any, 'getPositionsForSequenceFlow').and.returnValue(positions);

            (component as any).allFormData = {
                '2-1': { someField: 'existing2' },
                '3-1': { someField: 'existing3' }
            };
            (component as any).allSelections = {
                '2-1': 'invalid_selection',
                '3-1': 'invalid_selection'
            };
            (component as any).allPositionTypes = {
                '2-1': 'invalid_selection',
                '3-1': 'invalid_selection'
            };

            (component as any).rebuildFormsForSequenceFlow();

            positions.forEach(pos => {
                const key = `${pos.position}-${pos.subPosition}`;
                expect(component.itemPreSelections[key]).toBe('same_as_1');
                expect(component.positionTypes[key]).toBe('same_as_1');
                expect((component as any).allSelections[key]).toBe('same_as_1');
                expect((component as any).allPositionTypes[key]).toBe('same_as_1');
            });
        });
    });

    describe('initializeDefaultForm', () => {
        beforeEach(() => {
            mockCalculationContextService.getSelectPosition.and.returnValue(null);
        });

        it('should initialize formGroups for all default positions', () => {
            (component as any).initializeDefaultForm();

            const expectedKeys = ['1-1', '1-2', '2-1', '2-2', '3-1'];

            expectedKeys.forEach(key => {
                expect(component.formGroups[key]).toBeDefined();
                expect(component.itemPreSelections[key]).toBeDefined();
                expect(component.positionTypes[key]).toBeDefined();
            });
        });

        it('should set correct default itemPreSelections for each key', () => {
            (component as any).initializeDefaultForm();

            expect(component.itemPreSelections['1-1']).toBe('custom');
            expect(component.itemPreSelections['1-2']).toBe('same_as_1');
            expect(component.itemPreSelections['2-1']).toBe('same_as_1');
            expect(component.itemPreSelections['2-2']).toBe('same_as_1');
            expect(component.itemPreSelections['3-1']).toBe('same_as_1');
        });

        it('should have enabled controls for 1-1 (custom)', () => {
            (component as any).initializeDefaultForm();
            const formGroup = component.formGroups['1-1'];
            const allEnabled = Object.values(formGroup.controls).every(control => control.enabled);
            expect(allEnabled).toBeTrue();
        });

        it('should have disabled controls for same_as_1 positions', () => {
            (component as any).initializeDefaultForm();
            ['1-2', '2-1', '2-2', '3-1'].forEach(key => {
                const formGroup = component.formGroups[key];
                const allDisabled = Object.values(formGroup.controls).every(control => control.disabled);
                expect(allDisabled).toBeTrue();
            });
        });
    })

    describe('mapFetchedDataToForm', () => {
        let nozzleLengthsChangeSpy: jasmine.Spy;

        beforeEach(() => {
            nozzleLengthsChangeSpy = spyOn(component.nozzleLengthsChange, 'emit');
        });

        it('should map fetched data to formGroups and apply defaults when values are missing', () => {
            const fetchedMockData = [
                {
                    position: 1,
                    subPosition: 1,
                    pipingSize: 10,
                    pipingClass: 'CL150',
                    innerDiameter: { value: 8, unit: 'inch' },
                    outerDiameter: { value: 10.75, unit: 'inch' },
                    thickness: { value: 1.375, unit: 'mm' },
                    material: 'carbon',
                    erosionVelocityConstant: 120,
                    specNo: 'SPEC001',
                    maxOperatingTemp: 150,
                    allowableStress: 20000,
                    coefficient: 0.5,
                    qualityFactor: 0.9,
                    corrosionAllowance: 3,
                    weldingJointStrength: 1,
                    spanType: 'medium',
                    spanLength: 6,
                    pipelineDesignPressure: 100,
                    nozzleLength: 12,
                    positionType: 'custom'
                },
                {
                    position: 2,
                    subPosition: 1,
                    pipingSize: null,
                    positionType: null
                }
            ];

            component['mapFetchedDataToForm'](fetchedMockData);
            expect(Object.keys(component.formGroups)).toContain('1-1');
            expect(Object.keys(component.formGroups)).toContain('2-1');

            const form1 = component.formGroups['1-1'];
            expect(form1.value.pipingSize).toBe(10);
            expect(form1.value.pipingClass).toBe('CL150');
            expect(form1.value.innerDiameter).toBe(8);
            expect(form1.value.innerDiameterUnit).toBe('inch');
            expect(form1.value.outerDiameter).toBe(10.75);
            expect(form1.value.thicknessUnit).toBe('mm');
            expect(component.itemPreSelections['1-1']).toBe('custom');

            const form2 = component.formGroups['2-1'];
            expect(form2.value.pipingSize).toBeNull();
            expect(component.itemPreSelections['2-1']).toBe('same_as_1');

            expect(nozzleLengthsChangeSpy).toHaveBeenCalledOnceWith({ '1-1': 12 });
            form1.patchValue({ pipingSize: 20 });
            expect(mockCalculationContextService.setPipingForm).toHaveBeenCalledWith(form1);

            expect(component.positionTypes['1-1']).toBe('custom');
            expect(component.positionTypes['2-1']).toBe('same_as_1');
            expect(mockCalculationContextService.setPositionTypePiping).toHaveBeenCalledWith(component.itemPreSelections);
        });
    })

    describe('getPositionsForSequenceFlow', () => {
        it('should return positions matching the sequence plus always include position 1', () => {
            const mockDefaultPositions = [
                { position: 1 },
                { position: 2 },
                { position: 3 },
                { position: 4 }
            ];
            (component as any)['defaultPositions'] = mockDefaultPositions;

            const result = component['getPositionsForSequenceFlow']('2,4');
            expect(result).toEqual([
                { position: 1 },
                { position: 2 },
                { position: 4 }
            ]);
        });
    });

    describe('createFormGroup', () => {
        it('should create a FormGroup with the expected controls and values', () => {
            const values = {
                pipingSize: 10,
                pipingClass: 'A',
                innerDiameter: 100,
                innerDiameterUnit: 'mm',
                outerDiameter: 110,
                outerDiameterUnit: 'mm',
                thickness: 5,
                thicknessUnit: 'mm',
                material: 'Steel',
                erosionVelocityConstant: 2.5,
                specNo: 'SPEC-123',
                maxOperatingTemp: 200,
                allowableStress: 250,
                coefficient: 0.85,
                qualityFactor: 1,
                corrosionAllowance: 1,
                weldingJointStrength: 0.9,
                spanType: 'fixed',
                spanLength: 6,
                pipelineDesignPressure: 150
            };

            const formGroup = component['createFormGroup'](values);

            expect(formGroup instanceof FormGroup).toBeTrue();
            expect(formGroup.get('pipingSize')?.value).toBe(10);
            expect(formGroup.get('material')?.value).toBe('Steel');
            expect(formGroup.contains('nozzleLength')).toBeTrue();
            expect(formGroup.get('nozzleLength')?.value).toBeNull();
        });
    });

    describe('Form creation', () => {
        it('should create a form group with correct default values and validators', () => {
            const formGroup = component['createFormGroup'](component['defaultFormValues']);
            expect(formGroup.controls['pipingSize'].valid).toBeFalse();
            expect(formGroup.controls['material'].valid).toBeFalse();
            expect(formGroup.controls['coefficient'].value).toBe(0.4);
        });
    });

    describe('getItemKey', () => {
        it('should return a string key in the format position-subPosition', () => {
            const key = component.getItemKey({ position: 3, subPosition: 2 });
            expect(key).toBe('3-2');
        });
    });

    describe('getSelectedOption', () => {
        beforeEach(() => {
            component.dropdownOptions = [
                { id: 'same_as_1', name: 'Same as Production Manifold' },
                { id: 'custom', name: 'Custom' }
            ];
        });

        it('should return matching dropdown option when selection is valid', () => {
            component.itemPreSelections['1-1'] = 'custom';
            const result = component.getSelectedOption('1-1');
            expect(result).toEqual({ id: 'custom', name: 'Custom' });
        });

        it('should return null if selection not found', () => {
            component.itemPreSelections['1-2'] = 'unknown';
            const result = component.getSelectedOption('1-2');
            expect(result).toBeNull();
        });
    });

    describe('getPositionKey', () => {
        it('should format position-subPosition correctly', () => {
            const key = component.getPositionKey(4, 3);
            expect(key).toBe('4-3');
        });
    });

    describe('parseNumber', () => {
        it('should parse number from comma-separated string', () => {
            expect(component.parseNumber('1,234.56')).toBeCloseTo(1234.56);
        });

        it('should return number as-is', () => {
            expect(component.parseNumber(789)).toBe(789);
        });

        it('should return 0 for non-number/invalid input', () => {
            expect(component.parseNumber(null)).toBe(0);
            expect(component.parseNumber(undefined)).toBe(0);
            expect(component.parseNumber({})).toBe(0);
        });
    });

    describe('saveDraft', () => {
        beforeEach(() => {
            const fg = new FormGroup({
                pipingSize: new FormControl('100'),
                pipingClass: new FormControl('A'),
                innerDiameter: new FormControl('10'),
                innerDiameterUnit: new FormControl('inch'),
                outerDiameter: new FormControl('12'),
                outerDiameterUnit: new FormControl('inch'),
                thickness: new FormControl('1.5'),
                thicknessUnit: new FormControl('mm'),
                material: new FormControl('Steel'),
                erosionVelocityConstant: new FormControl('130'),
                specNo: new FormControl('SP1'),
                maxOperatingTemp: new FormControl('250'),
                allowableStress: new FormControl('300'),
                coefficient: new FormControl('0.4'),
                qualityFactor: new FormControl('1'),
                corrosionAllowance: new FormControl('0.2'),
                weldingJointStrength: new FormControl('1.0'),
                spanType: new FormControl('custom'),
                spanLength: new FormControl('20'),
                pipelineDesignPressure: new FormControl('77'),
            });

            component.fetchedData = [{ position: 1, subPosition: 1 }];
            component.formGroups = { '1-1': fg };
            component.itemPreSelections = { '1-1': 'custom' };
            component.study = { data: { studyId: 'study123' } } as any;
            component.transactionId = { data: { transactionId: 'tx456' } } as any;
            mockCalculationService.saveDraftPipingData.and.returnValue(of({ response: { success: true } }));
            mockCalculationContextService.getSelectPosition.and.returnValue({ sequenceFlow: '1,2,3' });

        });

        it('should build payload and call saveDraftPipingData', async () => {
            await component.saveDraft();

            expect((component as any).calculationService.saveDraftPipingData).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    studyId: 'study123',
                    transactionId: 'tx456',
                    sequenceFlow: '1,2,3',
                    data: jasmine.any(Array),
                })
            );
        });
    });

    describe('onItemOptionChange', () => {
        it('should update selections, enable form and call watcher for custom option', () => {
            const position = '2-1';
            const selectedOption = 'custom';

            const form = component.formGroups[position];
            const patchSpy = spyOn(form, 'patchValue').and.callThrough();
            const enableSpy = spyOn(form, 'enable').and.callThrough();

            component.onItemOptionChange(position, selectedOption);

            expect(component.itemPreSelections[position]).toBe(selectedOption);
            expect(component.positionTypes[position]).toBe(selectedOption);
            expect(patchSpy).toHaveBeenCalledWith(form.getRawValue());
            expect(enableSpy).toHaveBeenCalled();
            expect((component as any).setupPipingDataWatcher).toHaveBeenCalledWith(position);
            expect(mockCalculationContextService.setPositionTypePiping).toHaveBeenCalledWith(component.itemPreSelections);
        });

        it('should patch values from reference form and disable form for same_as_1 option', () => {
            const position = '2-1';
            const selectedOption = 'same_as_1';

            const form = component.formGroups[position];
            const patchSpy = spyOn(form, 'patchValue').and.callThrough();
            const disableSpy = spyOn(form, 'disable').and.callThrough();

            component.onItemOptionChange(position, selectedOption);

            expect(component.itemPreSelections[position]).toBe(selectedOption);
            expect(component.positionTypes[position]).toBe(selectedOption);
            expect(patchSpy).toHaveBeenCalledWith(component.formGroups['1-1'].getRawValue());
            expect(disableSpy).toHaveBeenCalled();
            expect(mockCalculationContextService.setPositionTypePiping).toHaveBeenCalledWith(component.itemPreSelections);
        });

        it('should return early if formGroups does not contain the position key', () => {
            const position = 'non-existent';
            const selectedOption = 'custom';

            component.onItemOptionChange(position, selectedOption);

            expect(mockCalculationContextService.setPositionTypePiping).not.toHaveBeenCalled();
        });
    });

    describe('setupAllPipingDataWatchers', () => {
        it('should call setupPipingDataWatcher for each formGroup key', () => {
            component.formGroups = {
                '1-1': component.formGroups['1-1'],
                '2-1': component.formGroups['2-1'],
            };

            (component as any).setupAllowableStressWatcher();
            spyOn(component as any, 'setupAllowableStressWatcher').and.callThrough();
            component['setupAllPipingDataWatchers']();
            expect(component['setupAllowableStressWatcher']).toHaveBeenCalledTimes(2);
            expect(component['setupAllowableStressWatcher']).toHaveBeenCalledWith('1-1');
            expect(component['setupAllowableStressWatcher']).toHaveBeenCalledWith('2-1');
        });
    });

    describe('preserveCurrentFormData', () => {
        beforeEach(() => {
            // Setup some sample formGroups
            component.formGroups = {
                '1-1': new FormGroup({
                    pipingSize: new FormControl(10),
                    pipingClass: new FormControl('A')
                }),
                '2-1': new FormGroup({
                    pipingSize: new FormControl(20),
                    pipingClass: new FormControl('B')
                })
            };

            // Setup itemPreSelections and positionTypes
            component.itemPreSelections = {
                '1-1': 'custom',
                '2-1': 'same_as_1'
            };

            component.positionTypes = {
                '1-1': 'type1',
                '2-1': 'type2'
            };

            // Clear existing data
            (component as any).allFormData = {};
            (component as any).allSelections = {};
            (component as any).allPositionTypes = {};
            (component as any).customFormValues = {};
        });

        it('should preserve all form values, selections, and position types', () => {
            (component as any).preserveCurrentFormData();

            // Check that allFormData is populated
            expect((component as any).allFormData['1-1']).toEqual({ pipingSize: 10, pipingClass: 'A' });
            expect((component as any).allFormData['2-1']).toEqual({ pipingSize: 20, pipingClass: 'B' });

            // Check that allSelections is preserved
            expect((component as any).allSelections['1-1']).toBe('custom');
            expect((component as any).allSelections['2-1']).toBe('same_as_1');

            // Check that allPositionTypes is preserved
            expect((component as any).allPositionTypes['1-1']).toBe('type1');
            expect((component as any).allPositionTypes['2-1']).toBe('type2');

            // Check that customFormValues is populated only for 'custom' selection
            expect((component as any).customFormValues['1-1']).toEqual({ pipingSize: 10, pipingClass: 'A' });
            expect((component as any).customFormValues['2-1']).toBeUndefined();
        });
    });

    describe('buildPipingPayload', () => {
        beforeEach(() => {
            // Sample formGroups
            component.formGroups = {
                '1-1': new FormGroup({
                    pipingSize: new FormControl(10),  // number
                    pipingClass: new FormControl('A'),
                    innerDiameter: new FormControl(5),
                    innerDiameterUnit: new FormControl('inch'),
                    outerDiameter: new FormControl(7),
                    outerDiameterUnit: new FormControl('inch'),
                    thickness: new FormControl(1),
                    thicknessUnit: new FormControl('mm'),
                    material: new FormControl('Steel'),
                    erosionVelocityConstant: new FormControl(100),
                    specNo: new FormControl('Spec1'),
                    maxOperatingTemp: new FormControl(200),
                    allowableStress: new FormControl(150),
                    coefficient: new FormControl(0.4),
                    qualityFactor: new FormControl(1),
                    corrosionAllowance: new FormControl(0.5),
                    weldingJointStrength: new FormControl(1),
                    pipelineDesignPressure: new FormControl(80),
                    actualThickness: new FormControl(1),
                    spanType: new FormControl('custom'),
                    spanLength: new FormControl(10)
                }),
                '2-1': new FormGroup({
                    pipingSize: new FormControl(15),
                    pipingClass: new FormControl('B'),
                    innerDiameter: new FormControl(6),
                    innerDiameterUnit: new FormControl('inch'),
                    outerDiameter: new FormControl(8),
                    outerDiameterUnit: new FormControl('inch'),
                    thickness: new FormControl(2),
                    thicknessUnit: new FormControl('mm'),
                    material: new FormControl('Alloy'),
                    erosionVelocityConstant: new FormControl(120),
                    specNo: new FormControl('Spec2'),
                    maxOperatingTemp: new FormControl(220),
                    allowableStress: new FormControl(160),
                    coefficient: new FormControl(0.5),
                    qualityFactor: new FormControl(0.9),
                    corrosionAllowance: new FormControl(0.3),
                    weldingJointStrength: new FormControl(0.95),
                    pipelineDesignPressure: new FormControl(90),
                    actualThickness: new FormControl(2),
                    spanType: new FormControl('same_as_1'),
                    spanLength: new FormControl(15)
                }),
            };

            component.fetchedData = [
                { position: 1, subPosition: 1 },
                { position: 2, subPosition: 1 }
            ];

            component.itemPreSelections = {
                '1-1': 'custom',
                '2-1': 'same_as_1'
            };

            (component as any).pipingGrades = {
                '1-1': 'A105',
                '2-1': 'A106'
            };

            spyOn(component as any, 'getItemKey').and.callFake((item: any) => {
                return item.position === 1 ? '1-1' : '2-1';
            });

            spyOn(component as any, 'parseNumber').and.callFake((v: any) => {
                if (v instanceof FormControl) return Number(v.value);
                if (typeof v === 'string') return parseFloat(v.replace(/,/g, ''));
                if (typeof v === 'number') return v;
                return 0;
            });
        });

        it('should build piping payload correctly', () => {
            const payload = (component as any).buildPipingPayload();

            expect(payload.length).toBe(2);

            // First item (custom)
            expect(payload[0].position).toBe(1);
            expect(payload[0].positionType).toBe('custom');
            expect(payload[0].pipingSize).toBe(10);
            expect(payload[0].grade).toBe('A105');
            expect(payload[0].spanLength).toBe(10);

            // Second item (same_as_1)
            expect(payload[1].position).toBe(2);
            expect(payload[1].positionType).toBe('same_as_1');
            expect(payload[1].pipingSize).toBe(10);
            expect(payload[1].grade).toBe('A105');
            expect(payload[1].spanLength).toBe(10);
        });
    });

    describe('setupAllPipingDataWatchers', () => {
        beforeEach(() => {
            // prepare some dummy formGroups
            component.formGroups = {
                '1-1': new FormGroup({ pipingSize: new FormControl(10) }),
                '2-1': new FormGroup({ pipingSize: new FormControl(20) }),
                '3-1': new FormGroup({ pipingSize: new FormControl(30) })
            };

            // spy on setupAllowableStressWatcher
            spyOn(component as any, 'setupAllowableStressWatcher');
        });

        it('should call setupAllowableStressWatcher for each form key', () => {
            (component as any).setupAllPipingDataWatchers();

            // check if called 3 times (once per key)
            expect((component as any).setupAllowableStressWatcher).toHaveBeenCalledTimes(3);

            // check if called with correct keys
            expect((component as any).setupAllowableStressWatcher).toHaveBeenCalledWith('1-1');
            expect((component as any).setupAllowableStressWatcher).toHaveBeenCalledWith('2-1');
            expect((component as any).setupAllowableStressWatcher).toHaveBeenCalledWith('3-1');
        });
    });

    describe('setupPipingDataWatcher', () => {
        beforeEach(() => {
            component.formGroups = {
                '1-1': new FormGroup({
                    pipingSize: new FormControl(10),
                    pipingClass: new FormControl('A'),
                    specNo: new FormControl('Spec1'),
                    maxOperatingTemp: new FormControl(200),
                    innerDiameter: new FormControl(5),
                    innerDiameterUnit: new FormControl('inch'),
                    outerDiameter: new FormControl(7),
                    outerDiameterUnit: new FormControl('inch'),
                    thickness: new FormControl(1),
                    thicknessUnit: new FormControl('mm'),
                    material: new FormControl('Steel'),
                    erosionVelocityConstant: new FormControl(100),
                    allowableStress: new FormControl(150),
                    coefficient: new FormControl(0.4),
                    qualityFactor: new FormControl(1),
                    corrosionAllowance: new FormControl(0.5),
                    weldingJointStrength: new FormControl(1),
                    spanType: new FormControl('default'),
                    spanLength: new FormControl(10),
                    pipelineDesignPressure: new FormControl(80),
                    actualThickness: new FormControl(1.2)
                })
            };
        });

        it('should subscribe to specNo and pipingClass changes and call fetchQualityFactor', fakeAsync(() => {
            (component as any).setupPipingDataWatcher('1-1');

            const formGroup = component.formGroups['1-1'];

            formGroup.get('specNo')!.setValue('Spec2', { emitEvent: true });
            tick(500);

            formGroup.get('pipingClass')!.setValue('C', { emitEvent: true });
            tick(500);

            fixture.detectChanges();

            expect((component as any).fetchQualityFactor)
                .toHaveBeenCalledWith('1-1', 'Spec2', 'C');
        }));

        it('should subscribe to pipingSize and pipingClass changes and call fetchPipingDetails', fakeAsync(() => {
            (component as any).setupPipingDataWatcher('1-1');

            const formGroup = component.formGroups['1-1'];

            formGroup.get('pipingSize')!.setValue(12, { emitEvent: true });
            formGroup.get('pipingClass')!.setValue('B', { emitEvent: true });


            flushMicrotasks();
            tick(500);

            expect((component as any).fetchPipingDetails)
                .toHaveBeenCalledWith('1-1', 'B', 12, false);
        }));


        it('should do nothing if formGroup is undefined', () => {
            (component as any).setupPipingDataWatcher('non-existing-key');

            expect((component as any).fetchPipingDetails).not.toHaveBeenCalled();
            expect((component as any).fetchQualityFactor).not.toHaveBeenCalled();
        });
    });

    describe('setupAllowableStressWatcher', () => {

        beforeEach(() => {
            // Initialize formGroups and pipingGrades
            component.formGroups['1-1'] = new FormGroup({
                specNo: new FormControl('Spec1'),
                maxOperatingTemp: new FormControl(200),
            });
            (component as any).pipingGrades = { '1-1': 'A' };

            spyOn(component as any, 'fetchAllowableStress').and.stub();
        });

        it('should call fetchAllowableStress when specNo changes', fakeAsync(() => {
            (component as any).setupAllowableStressWatcher('1-1');

            const formGroup = component.formGroups['1-1'];

            formGroup.get('specNo')!.setValue('Spec2');
            tick();

            expect((component as any).fetchAllowableStress)
                .toHaveBeenCalledWith('1-1', 'Spec2', 200, 'A');
        }));

        it('should call fetchAllowableStress when maxOperatingTemp changes', fakeAsync(() => {
            (component as any).setupAllowableStressWatcher('1-1');

            const formGroup = component.formGroups['1-1'];

            formGroup.get('maxOperatingTemp')!.setValue(250);
            tick();

            expect((component as any).fetchAllowableStress)
                .toHaveBeenCalledWith('1-1', 'Spec1', 250, 'A');
        }));

        it('should call fetchAllowableStress when grade is updated via updateFormWithPipingDetails', fakeAsync(() => {
            (component as any).setupAllowableStressWatcher('1-1');

            (component as any).updateFormWithPipingDetails('1-1', { grade: 'B' });
            tick();

            expect((component as any).fetchAllowableStress)
                .toHaveBeenCalledWith('1-1', 'Spec1', 200, 'B');
        }));

        it('should do nothing if formGroup is undefined', () => {
            (component as any).setupAllowableStressWatcher('non-existing-key');

            expect((component as any).fetchAllowableStress).not.toHaveBeenCalled();
        });
    });

    describe('fetchPipingDetails', () => {
        beforeEach(() => {
            // Reset component state
            component.isLoadingPipingDetails = {};
            component.nozzleLengths = {};
            component.nozzleLengthsChange = jasmine.createSpyObj('EventEmitter', ['emit']);

            // Mock CalculationService.getPipingDetailByClassAndSize to emit asynchronously
            const sampleResponse = {
                data: {
                    innerDiameter: { value: 202.74, unit: 'mm' },
                    thickness: { value: 8.18, unit: 'mm' },
                    outerDiameter: { value: 219.1, unit: 'mm' },
                    material: 'duplex_ss',
                    corrosionAllowance: 0,
                    nozzleLength: 150,
                    grade: '',
                    specNo: 'A790'
                }
            };

            mockCalculationService.getPipingDetailByClassAndSize.and.returnValue(
                defer(() => of(sampleResponse)) // async observable
            );

            spyOn(component as any, 'updateFormWithPipingDetails').and.callThrough();
        });

        it('should not update nozzleLengths if key is not 1-1', fakeAsync(() => {
            (component as any).fetchPipingDetails('2-1', 'A', 200);

            tick();

            expect(component.nozzleLengths['2-1']).toBeUndefined();
            expect(component.nozzleLengthsChange.emit).not.toHaveBeenCalled();
        }));

        it('should handle service errors gracefully', fakeAsync(() => {
            const error = new Error('API Failed');
            mockCalculationService.getPipingDetailByClassAndSize.and.returnValue(
                defer(() => { throw error; })
            );

            spyOn(console, 'error');

            (component as any).fetchPipingDetails('1-1', 'A', 200);

            tick();

            expect(component.isLoadingPipingDetails['1-1']).toBeFalse();
            expect(console.error).toHaveBeenCalledWith('Error fetching piping details:', error);
            expect((component as any).updateFormWithPipingDetails).not.toHaveBeenCalled();
        }));
    });

    describe('fetchQualityFactor', () => {
        beforeEach(() => {
            // Reset formGroups
            component.formGroups = {
                '1-1': new FormGroup({
                    qualityFactor: new FormControl(1)
                }),
                '2-1': new FormGroup({
                    qualityFactor: new FormControl(0.9)
                })
            };

            // Mock CalculationService.getQualityFactor to emit asynchronously
            mockCalculationService.getQualityFactor.and.callFake((specNo: string, pipingClass: string) => {
                return defer(() => of({ data: { qualityFactor: 0.85 } }));
            });

            spyOn(console, 'error');
        });

        it('should call service and update formGroup', fakeAsync(() => {
            (component as any).fetchQualityFactor('1-1', 'Spec1', 'A');

            tick(); // resolve observable

            expect(mockCalculationService.getQualityFactor).toHaveBeenCalledWith('Spec1', 'A');
            expect(component.formGroups['1-1'].get('qualityFactor')!.value).toBe(0.85);
        }));

        it('should do nothing if formGroup does not exist', fakeAsync(() => {
            (component as any).fetchQualityFactor('non-existing', 'Spec1', 'A');

            tick();

            // Service still called
            expect(mockCalculationService.getQualityFactor).toHaveBeenCalledWith('Spec1', 'A');
            // No error should be thrown, formGroups unchanged
            expect(component.formGroups['1-1'].get('qualityFactor')!.value).toBe(1);
        }));

        it('should handle service errors gracefully', fakeAsync(() => {
            const error = new Error('API Failed');
            mockCalculationService.getQualityFactor.and.returnValue(throwError(() => error));

            (component as any).fetchQualityFactor('1-1', 'Spec1', 'A');

            tick();

            expect(console.error).toHaveBeenCalledWith('Error fetching quality factor:', error);
            // Form value should remain unchanged
            expect(component.formGroups['1-1'].get('qualityFactor')!.value).toBe(1);
        }));
    });


    describe('fetchAllowableStress', () => {
        beforeEach(() => {
            // Reset formGroups
            component.formGroups = {
                '1-1': new FormGroup({
                    allowableStress: new FormControl(150)
                }),
                '2-1': new FormGroup({
                    allowableStress: new FormControl(160)
                })
            };

            // Mock service to emit asynchronously
            mockCalculationService.getAllowableStress.and.callFake((specNo: string, temperature: number, grade: string) => {
                return defer(() => of({ data: { allowableStress: 180 } }));
            });

            spyOn(console, 'error');
        });

        it('should call service and update formGroup', fakeAsync(() => {
            (component as any).fetchAllowableStress('1-1', 'Spec1', 200, 'A');

            tick(); // resolve observable

            expect(mockCalculationService.getAllowableStress)
                .toHaveBeenCalledWith('Spec1', 200, 'A');
            expect(component.formGroups['1-1'].get('allowableStress')!.value).toBe(180);
        }));

        it('should do nothing if formGroup does not exist', fakeAsync(() => {
            (component as any).fetchAllowableStress('non-existing', 'Spec1', 200, 'A');

            tick();

            expect(mockCalculationService.getAllowableStress)
                .toHaveBeenCalledWith('Spec1', 200, 'A');
            // Existing formGroups remain unchanged
            expect(component.formGroups['1-1'].get('allowableStress')!.value).toBe(150);
        }));

        it('should handle service errors gracefully', fakeAsync(() => {
            const error = new Error('API Failed');
            mockCalculationService.getAllowableStress.and.returnValue(throwError(() => error));

            (component as any).fetchAllowableStress('1-1', 'Spec1', 200, 'A');

            tick();

            expect(console.error).toHaveBeenCalledWith('Error fetching allowable stress:', error);
            expect(component.formGroups['1-1'].get('allowableStress')!.value).toBe(150);
        }));
    });

    describe('updateFormWithPipingDetails', () => {
        beforeEach(() => {
            // Initialize formGroups
            component.formGroups = {
                '1-1': new FormGroup({
                    innerDiameter: new FormControl(5),
                    innerDiameterUnit: new FormControl('inch'),
                    outerDiameter: new FormControl(7),
                    outerDiameterUnit: new FormControl('inch'),
                    thickness: new FormControl(1),
                    thicknessUnit: new FormControl('mm'),
                    specNo: new FormControl('Spec1'),
                    material: new FormControl('Steel'),
                    corrosionAllowance: new FormControl(0.5),
                    nozzleLength: new FormControl(10),
                })
            };
            (component as any).pipingGrades = { '1-1': 'A' };
        });

        it('should patch form values and update pipingGrades', () => {
            const data = {
                innerDiameter: { value: 202.74, unit: 'mm' },
                outerDiameter: { value: 219.1, unit: 'mm' },
                thickness: { value: 8.18, unit: 'mm' },
                specNo: 'A790',
                material: 'duplex_ss',
                corrosionAllowance: 0,
                nozzleLength: 150,
                grade: 'B'
            };

            (component as any).updateFormWithPipingDetails('1-1', data, true);

            const form = component.formGroups['1-1'];

            expect(form.get('innerDiameter')!.value).toBe(202.74);
            expect(form.get('innerDiameterUnit')!.value).toBe('mm');

            expect(form.get('outerDiameter')!.value).toBe(219.1);
            expect(form.get('outerDiameterUnit')!.value).toBe('mm');

            expect(form.get('thickness')!.value).toBe(8.18);
            expect(form.get('thicknessUnit')!.value).toBe('mm');

            expect(form.get('specNo')!.value).toBe('A790');
            expect(form.get('material')!.value).toBe('duplex_ss');
            expect(form.get('corrosionAllowance')!.value).toBe(0.5);
            expect(form.get('nozzleLength')!.value).toBe(150);

            expect((component as any).pipingGrades['1-1']).toBe('B');
        });

        it('should not update specNo if isUserChange is false and current value exists', () => {
            const data = { specNo: 'NEW_SPEC' };
            (component as any).updateFormWithPipingDetails('1-1', data, false);

            const form = component.formGroups['1-1'];
            expect(form.get('specNo')!.value).toBe('Spec1'); // unchanged
        });

        it('should update specNo if current value is empty', () => {
            component.formGroups['1-1'].get('specNo')!.setValue('');
            const data = { specNo: 'NEW_SPEC' };
            (component as any).updateFormWithPipingDetails('1-1', data, false);

            const form = component.formGroups['1-1'];
            expect(form.get('specNo')!.value).toBe('NEW_SPEC'); // updated
        });

        it('should do nothing if formGroup is undefined', () => {
            const data = { specNo: 'A790' };
            expect(() => {
                (component as any).updateFormWithPipingDetails('non-existing', data);
            }).not.toThrow();
        });

        it('should do nothing if data is undefined', () => {
            expect(() => {
                (component as any).updateFormWithPipingDetails('1-1', undefined);
            }).not.toThrow();
        });
    });

    describe('Unit and SpanType helper methods', () => {
        beforeEach(() => {
            // Sample options
            component.unitOptions = [
                { id: 'mm', name: 'Millimeter' },
                { id: 'inch', name: 'Inch' }
            ];

            component.spanTypeOptions = [
                { id: 'default', name: 'Default' },
                { id: 'custom', name: 'Custom' }
            ];
        });

        describe('getUnitOption', () => {
            it('should return the option matching the id', () => {
                const result = component.getUnitOption('mm');
                expect(result).toEqual({ id: 'mm', name: 'Millimeter' });
            });

            it('should return the first option if id does not match', () => {
                const result = component.getUnitOption('unknown');
                expect(result).toEqual({ id: 'mm', name: 'Millimeter' }); // first option
            });

            it('should return the first option if id is null', () => {
                const result = component.getUnitOption(null);
                expect(result).toEqual({ id: 'mm', name: 'Millimeter' });
            });
        });

        describe('getUnitOptions', () => {
            it('should return only the valid options', () => {
                const result = component.getUnitOptions(['inch']);
                expect(result).toEqual([{ id: 'inch', name: 'Inch' }]);
            });

            it('should return empty array if no valid ids match', () => {
                const result = component.getUnitOptions(['unknown']);
                expect(result).toEqual([]);
            });
        });

        describe('getSpanTypeOption', () => {
            it('should return the option matching the value', () => {
                const result = component.getSpanTypeOption('custom');
                expect(result).toEqual({ id: 'custom', name: 'Custom' });
            });

            it('should return null if no match is found', () => {
                const result = component.getSpanTypeOption('unknown');
                expect(result).toBeNull();
            });

            it('should return null if value is undefined', () => {
                const result = component.getSpanTypeOption(undefined);
                expect(result).toBeNull();
            });

            it('should return null if value is null', () => {
                const result = component.getSpanTypeOption(null);
                expect(result).toBeNull();
            });
        });
    });

    describe('PipingDataComponent option helpers and setters', () => {
        beforeEach(() => {
            component.pipingSizeOptions = [
                { id: '10', name: '10 mm' },
                { id: '15', name: '15 mm' }
            ];

            component.pipingClassOptions = [
                { id: 'A', name: 'Class A' },
                { id: 'B', name: 'Class B' }
            ];

            component.materialOptions = [
                { id: 'steel', name: 'Steel' },
                { id: 'alloy', name: 'Alloy' }
            ];

            component.formGroups = {
                '1-1': new FormGroup({
                    innerDiameterUnit: new FormControl('mm'),
                    outerDiameterUnit: new FormControl('mm'),
                    thicknessUnit: new FormControl('mm'),
                    spanType: new FormControl('default')
                })
            };
        });

        describe('getPipingSizeOption', () => {
            it('should return the matching option by stringified id', () => {
                const result = component.getPipingSizeOption('10');
                expect(result).toEqual({ id: '10', name: '10 mm' });
            });

            it('should return null if value is null or undefined', () => {
                expect(component.getPipingSizeOption(null)).toBeNull();
                expect(component.getPipingSizeOption(undefined)).toBeNull();
            });

            it('should return null if no match is found', () => {
                expect(component.getPipingSizeOption('99')).toBeNull();
            });
        });

        describe('getPipingClassOption', () => {
            it('should return matching option', () => {
                expect(component.getPipingClassOption('A')).toEqual({ id: 'A', name: 'Class A' });
            });

            it('should return null if no match', () => {
                expect(component.getPipingClassOption('Z')).toBeNull();
            });
        });

        describe('getMaterialOption', () => {
            it('should return matching option', () => {
                expect(component.getMaterialOption('steel')).toEqual({ id: 'steel', name: 'Steel' });
            });

            it('should return null if no match', () => {
                expect(component.getMaterialOption('plastic')).toBeNull();
            });
        });

        describe('onUnitChange', () => {
            it('should update the specified form control', () => {
                component.onUnitChange({ id: 'inch', name: 'Inch' }, '1-1', 'innerDiameterUnit');
                expect(component.formGroups['1-1'].get('innerDiameterUnit')?.value).toBe('inch');
            });
        });

        describe('onSpanTypeChange', () => {
            it('should update spanType in formGroup', () => {
                component.onSpanTypeChange({ id: 'custom', name: 'Custom' }, '1-1');
                expect(component.formGroups['1-1'].get('spanType')?.value).toBe('custom');
            });
        });
    });

    describe('PipingDataComponent change handlers', () => {
        beforeEach(() => {
            component.formGroups = {
                '1-1': new FormGroup({
                    material: new FormControl('steel'),
                    pipingSize: new FormControl(10),
                    pipingClass: new FormControl('A')
                })
            };

            component.itemPreSelections = {};
            component.positionTypes = {};

        });

        describe('onMaterialChange', () => {
            it('should update material control and mark as dirty/touched', () => {
                component.onMaterialChange({ id: 'alloy', name: 'Alloy' }, '1-1');

                const control = component.formGroups['1-1'].get('material');
                expect(control?.value).toBe('alloy');
                expect(control?.dirty).toBeTrue();
                expect(control?.touched).toBeTrue();
            });
        });

        describe('onRadioSelectionChange', () => {
            it('should update itemPreSelections and positionTypes', () => {
                component.onRadioSelectionChange('custom', '1-1');

                expect(component.itemPreSelections['1-1']).toBe('custom');
                expect(component.positionTypes['1-1']).toBe('custom');
            });

            it('should enable form group if custom', () => {
                const group = component.formGroups['1-1'];
                spyOn(group, 'enable').and.callThrough();
                spyOn(group, 'disable').and.callThrough();

                component.onRadioSelectionChange('custom', '1-1');
                expect(group.enable).toHaveBeenCalled();
                expect(group.disable).not.toHaveBeenCalled();
            });

            it('should disable form group if not custom', () => {
                const group = component.formGroups['1-1'];
                spyOn(group, 'enable').and.callThrough();
                spyOn(group, 'disable').and.callThrough();

                component.onRadioSelectionChange('same_as_1', '1-1');
                expect(group.disable).toHaveBeenCalled();
                expect(group.enable).not.toHaveBeenCalled();
            });
        });

        describe('onPipingSizeChange', () => {
            it('should update pipingSize control and mark as dirty/touched', () => {
                component.onPipingSizeChange({ id: '12', name: '12 mm' }, '1-1');

                const control = component.formGroups['1-1'].get('pipingSize');
                expect(control?.value).toBe('12');
                expect(control?.dirty).toBeTrue();
                expect(control?.touched).toBeTrue();
            });

            it('should call fetchPipingDetails if pipingClass and size exist', () => {
                component.onPipingSizeChange({ id: '12', name: '12 mm' }, '1-1');

                expect((component as any).fetchPipingDetails).toHaveBeenCalledWith('1-1', 'A', 12, true);
            });
        });

        describe('onPipingClassChange', () => {
            it('should update pipingClass control and mark as dirty/touched', () => {
                component.onPipingClassChange({ id: 'B', name: 'Class B' }, '1-1');

                const control = component.formGroups['1-1'].get('pipingClass');
                expect(control?.value).toBe('B');
                expect(control?.dirty).toBeTrue();
                expect(control?.touched).toBeTrue();
            });

            it('should call fetchPipingDetails if pipingSize exists', () => {
                component.onPipingClassChange({ id: 'B', name: 'Class B' }, '1-1');

                expect((component as any).fetchPipingDetails).toHaveBeenCalledWith('1-1', 'B', 10, true);
            });
        });
    });

});