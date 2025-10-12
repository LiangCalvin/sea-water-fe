import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PipesimComponent } from './pipesim.component';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { CalculationConstants, pressureType } from '../../../../../core/enums/calculation.enum';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentConfigurationService } from '../../../../../services/environment-configuration.service';
import { Environment } from '../../../../../core/enums/environments.enum';
import { NzModalModule, NzModalRef ,NzModalService} from 'ng-zorro-antd/modal';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { CancelModalComponent } from '../../../../../shared/components/modals/cancel-modal/cancel-modal.component';
import { UploadModalComponent } from '../../../../../shared/components/modals/upload-modal/upload-modal.component';
import { CalculationDataService } from '../../../services/calculation-data.service';
import { ComponentForm, ProcessForm, RiserData } from '../../../../../core/models/calculation/pipesim.model';
import { UploadModalContent } from '../../../../../core/models/calculation/process-information.mode';
describe('PipesimComponent', () => {
  let component: PipesimComponent;
  let fixture: ComponentFixture<PipesimComponent>;
  let mockNzModalService: jasmine.SpyObj<NzModalService>;

  const mockEnvConfig = {
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
    SEQUENCE_FLOW:['1,2,3']
  };
  const mockEnvConfigService = jasmine.createSpyObj('EnvironmentConfigurationService', [
    'getEnvConfig',
    'getBaseUrl',
    'getBaseAPIGW',
    'getSequenceFlow'
  ]);

  const mockCalculationService = jasmine.createSpyObj('CalculationService', [
    'getPipesimById',
    'saveDrafPipesim',
    'submitPipesim',
    'parseLocalizedNumber',
    'getDropDownCoating'
  ]);

  const mockCalculationContextService = jasmine.createSpyObj('CalculationContextService', [
    'setPipesimValidate',
    'getSomeSharedValue',
    'resetValidationStatus',
    'getProcessForm'
  ])

  const mockCalculationDataService = jasmine.createSpyObj('CalculationDataService', [
    'pipesimData'
  ])

  mockCalculationContextService.getSomeSharedValue.and.returnValue('defaultSharedValue');
  mockCalculationContextService.resetValidationStatus.and.returnValue(undefined);
  mockCalculationService.getDropDownCoating.and.returnValue(of([]));
  mockCalculationContextService.getProcessForm.and.returnValue({
    '1-1': new FormGroup({
      exportPressure: new FormControl(100)
    })
  });

  beforeEach(async () => {
    mockEnvConfigService.getEnvConfig.and.returnValue(mockEnvConfig);
    mockEnvConfigService.getBaseUrl.and.returnValue(mockEnvConfig.BASE_URL);
    mockEnvConfigService.getBaseAPIGW.and.returnValue(mockEnvConfig.APIGW_BASE_URL);
    mockEnvConfigService.getSequenceFlow.and.returnValue(mockEnvConfig.SEQUENCE_FLOW);
    mockNzModalService = jasmine.createSpyObj('NzModalService', ['create']);

    await TestBed.configureTestingModule({
      imports: [
        PipesimComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NzModalModule
      ],
      providers: [
        FormBuilder,
        { provide: EnvironmentConfigurationService, useValue: mockEnvConfig },
        { provide: EnvironmentConfigurationService, useValue: mockEnvConfigService },
        { provide: CalculationService, useValue: mockCalculationService },
        { provide: NzModalService, useValue: mockNzModalService },
        { provide: CalculationDataService, useValue: mockCalculationDataService }

      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PipesimComponent);
    component = fixture.componentInstance;
    component.targetPressureData = [
      { id: '1', name: 'DEFAULT' },
      { id: '2', name: 'CUSTOM' },
      { id: '3', name: 'EQUAL_EXPORT' }
    ];
    component.form = new FormGroup({
      pipeline: new FormArray([]),
      riserDown: new FormArray([]),
      riserUp: new FormArray([]),
      others: new FormArray([]),
      pressure: new FormGroup({
        platformPressureName: new FormControl('D/S Platform Pressure'),
        platformPressunreName: new FormControl('D/S Platform Pressure'),
        platformPressureValue: new FormControl(300),
        platformPressureProcessValue: new FormControl(200)
      })
    });

  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  describe('Component Initialization', () => {
    it('should create the component instance', () => {
      expect(component).toBeTruthy();
    });

  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'study') {
          return JSON.stringify({ data: { studyId: 'study123' } });
        }
        if (key === 'transactionId') {
          return JSON.stringify({ data: { transactionId: 'study123' } });
        }
        return null;
      });

      spyOn(component, 'getPipesimData').and.stub();
      spyOn(component, 'watchFormChanges').and.stub();
      spyOn(component, 'getDefaultPressure').and.stub();

      component.ngOnInit();
    });

    it('should parse and assign study and transactionId from sessionStorage', () => {
      expect(component.study).toEqual({ data: { studyId: 'study123' } });
      expect(component.transaction).toEqual({ data: { transactionId: 'study123' } });
    });
  });

  describe('Form Array getters', () => {
    beforeEach(() => {
      component.form = component.fb.group<ComponentForm>({
        pipeline: component.fb.array([component.fb.control('pipelineItem')]),
        riserUp: component.fb.array([component.fb.control('riserUpItem')]),
        riserDown: component.fb.array([component.fb.control('riserDownItem')]),
        others: component.fb.array([component.fb.control('othersItem')]),
      });
    });

    it('should return pipeline FormArray from form', () => {
      expect(component.pipeline instanceof FormArray).toBeTrue();
      expect(component.pipeline.length).toBe(1);
      expect(component.pipeline.at(0).value).toBe('pipelineItem');
    });

    it('should return riserUp FormArray from form', () => {
      expect(component.riserUp instanceof FormArray).toBeTrue();
      expect(component.riserUp.length).toBe(1);
      expect(component.riserUp.at(0).value).toBe('riserUpItem');
    });

    it('should return riserDown FormArray from form', () => {
      expect(component.riserDown instanceof FormArray).toBeTrue();
      expect(component.riserDown.length).toBe(1);
      expect(component.riserDown.at(0).value).toBe('riserDownItem');
    });

    it('should return others FormArray from form', () => {
      expect(component.others instanceof FormArray).toBeTrue();
      expect(component.others.length).toBe(1);
      expect(component.others.at(0).value).toBe('othersItem');
    });
  });

  describe('getDefaultPressure', () => {
    it('should subscribe to processForm observable and patch pressure.platformPressureProcessValue', () => {
      const mockProcessForm: ProcessForm = {
        group1: {
          value: { exportPressure: 123 }
        }
      };
  
      const processFormSubject = new Subject<ProcessForm>();
      spyOn(component['calculationContextService'], 'getProcessForm$')
        .and.returnValue(processFormSubject.asObservable());
  
      component.form = component['fb'].group({
        pressure: component['fb'].group({
          platformPressureProcessValue: ['']
        })
      });
  
      spyOn(component.form.get('pressure.platformPressureProcessValue')!, 'patchValue');
  
      component.getDefaultPressure();
      processFormSubject.next(mockProcessForm);
  
      expect(component.processForm).toBe(mockProcessForm as unknown as FormGroup);
      expect(component.form.get('pressure.platformPressureProcessValue')!.patchValue)
        .toHaveBeenCalledWith(123);
    });
  });
  
  describe('setFormPipesim', () => {
    it('should initialize form groups and populate form arrays based on input data', () => {
      const mockData = {
        platformPressure: { some: 'pressure' },
        pipelineSection: [
          { position: 1, value: 'pipe1' },
          { position: 2, value: 'pipe2' }
        ],
        riserDown: [
          { position: 1, value: 'riserDown1' },
          { position: 2, value: 'riserDown2' }
        ],
        riserUp: [
          { position: 1, value: 'riserUp1' },
          { position: 2, value: 'riserUp2' },
          { position: 3, value: 'riserUp3' }
        ],
        otherData: { some: 'other' }
      };
  
      const fb = new FormBuilder();
  
      spyOn(component, 'createPressure')
        .and.returnValue(fb.group({ mock: new FormControl(true) }));
  
      spyOn(component, 'createPipeLineRow')
        .and.callFake((item?: { position?: number }) =>
          fb.group({ position: new FormControl(item?.position ?? null) })
        );
  
      spyOn(component, 'createRiserDown')
        .and.callFake((item?: { position?: number }) =>
          fb.group({ position: new FormControl(item?.position ?? null) })
        );
  
      spyOn(component, 'createRiserUp')
        .and.callFake((item?: { position?: number }) =>
          fb.group({ position: new FormControl(item?.position ?? null) })
        );
  
      spyOn(component, 'createOther')
        .and.callFake((data?: unknown) =>
          fb.group({ data: new FormControl(data ?? null) })
        );
  
      component.setFormPipesim(mockData);
  
      expect(component.form).toBeDefined();
      expect(component.createPressure).toHaveBeenCalledWith(mockData.platformPressure);
  
      expect(component.pipeline.length).toBe(2);
      expect(component.pipeline.at(0).value.position).toBe(1);
      expect(component.pipeline.at(1).value.position).toBe(2);
  
      expect(component.riserDown.length).toBe(2);
      expect(component.riserDown.at(0).value.position).toBe(1);
      expect(component.riserDown.at(1).value.position).toBe(2);
  
      expect(component.riserUp.length).toBe(3);
      expect(component.riserUp.at(0).value.position).toBe(1);
      expect(component.riserUp.at(1).value.position).toBe(2);
      expect(component.riserUp.at(2).value.position).toBe(3);
  
      expect(component.others.length).toBe(1);
      expect(component.others.at(0).value.data).toEqual(mockData.otherData);
    });
  });
  

  describe('createRiserDown', () => {
    it('should create FormGroup with coatings when data.coating is present', () => {
      const mockCoatings = [
        { order: 1, someProp: 'a' },
        { order: 3, someProp: 'b' }
      ];
  
      const data = {
        outerDiameter: '10',
        riserInput: { name: 'InnerDiam', value: '5' },
        height: '100',
        coating: mockCoatings
      };

      const fb = new FormBuilder();
  
      spyOn(component, 'createCoating').and.callFake((c?: { order?: number; someProp?: string }) =>
        fb.group({
          order: [c?.order ?? null],
          someProp: [c?.someProp ?? null]
        })
      );
  
      spyOn(component, 'onCheckInnerDiameter').and.callFake(
        (name: string) => ({ id: 'mock-id', name: `checked-${name}` })
      );
  
      const group = component.createRiserDown(data);
  
      expect(group).toBeDefined();
      expect(group.get('outerDiameter')?.value).toBe('10');
      expect(group.get('innerDiameterName')?.value).toEqual({
        id: 'mock-id',
        name: 'checked-InnerDiam'
      });
      expect(group.get('innerDiameterValue')?.value).toBe('5');
      expect(group.get('height')?.value).toBe('100');
  
      const coatingsArray = group.get('coatings') as FormArray;
      expect(coatingsArray.length).toBe(3);
      expect(component.createCoating).toHaveBeenCalledTimes(4);
  
      expect(coatingsArray.at(0).value.order).toBe(1);
      expect(coatingsArray.at(1).value.order).toBe(3);
      expect(coatingsArray.at(2).value.order).toBe(3);
    });
  
    it('should create FormGroup with one coating when data.coating is empty or undefined', () => {
      const fb = new FormBuilder();
  
      spyOn(component, 'createCoating').and.callFake(() =>
        fb.group({ order: [null] })
      );
  
      const group1 = component.createRiserDown({});
      const group2 = component.createRiserDown({ coating: [] });
  
      expect(group1).toBeDefined();
      expect(group2).toBeDefined();
  
      expect((group1.get('coatings') as FormArray).length).toBe(1);
      expect((group2.get('coatings') as FormArray).length).toBe(1);
  
      expect(component.createCoating).toHaveBeenCalledTimes(2);
    });
  });
  

  describe('createRiserUp', () => {
    it('should create FormGroup with coatings when data.coating is present', () => {
      const mockCoatings = [
        { order: 1, someProp: 'a' },
        { order: 3, someProp: 'b' }
      ];
  
      const data: RiserData = {
        outerDiameter: '10',
        riserInput: { name: 'InnerDiam', value: '5' },
        height: '100',
        coating: mockCoatings
      };
  
      const fb = new FormBuilder();
  
      spyOn(component, 'createCoating').and.callFake((c?: { order?: number; someProp?: string }) =>
        fb.group({
          order: [c?.order ?? null],
          someProp: [c?.someProp ?? null]
        })
      );
  
      spyOn(component, 'onCheckInnerDiameter').and.callFake(
        (name: string) => ({ id: 'mock-id', name: `checked-${name}` })
      );
  
      const group = component.createRiserUp(data);
  
      expect(group).toBeDefined();
      expect(group.get('outerDiameter')?.value).toBe('10');
      expect(group.get('innerDiameterName')?.value).toEqual({
        id: 'mock-id',
        name: 'checked-InnerDiam'
      });
      expect(group.get('innerDiameterValue')?.value).toBe('5');
      expect(group.get('height')?.value).toBe('100');
  
      const coatingsArray = group.get('coatings') as FormArray;
      expect(coatingsArray.length).toBe(3);
      expect(component.createCoating).toHaveBeenCalledTimes(4);
  
      expect(coatingsArray.at(0).value.order).toBe(1);
      expect(coatingsArray.at(1).value.order).toBe(3);
      expect(coatingsArray.at(2).value.order).toBe(3);
    });
  
    it('should create FormGroup with one coating when data.coating is empty or undefined', () => {
      const fb = new FormBuilder();
  
      spyOn(component, 'createCoating').and.callFake(() =>
        fb.group({ order: [null] })
      );
  
      const group1 = component.createRiserUp({});
      const group2 = component.createRiserUp({ coating: [] });
  
      expect(group1).toBeDefined();
      expect(group2).toBeDefined();
  
      expect((group1.get('coatings') as FormArray).length).toBe(1);
      expect((group2.get('coatings') as FormArray).length).toBe(1);
  
      expect(component.createCoating).toHaveBeenCalledTimes(2);
    });
  });
  

  describe('createPressure', () => {
    it('should create a FormGroup with default values when no data is provided', () => {
      const group = component.createPressure();

      expect(group).toBeDefined();
      expect(group.get('platformPressureName')?.value).toBe(pressureType.TYPE_DS);
      expect(group.get('platformPressureValue')?.value).toBe('33');
      expect(group.get('platformPressureProcessValue')?.value).toBe('0');
    });
  });

  describe('Pipeline Row Management', () => {
    let fb: FormBuilder;
  
    beforeEach(() => {
      fb = new FormBuilder();
  
      component.form = fb.group({
        pipeline: fb.array([]),
        riserUp: fb.array([]),
        riserDown: fb.array([]),
        others: fb.array([]),
        pressure: component.createPressure()
      });
  
      spyOn(component, 'createCoating').and.returnValue(
        fb.group({
          type: ['ValidType'],
          thickness: ['10'],
        })
      );
    });
  
    it('addPipeLineRow should add a new FormGroup to the pipeline FormArray', () => {
      const initialLength = component.pipeline.length;
      component.addPipeLineRow();
  
      expect(component.pipeline.length).toBe(initialLength + 1);
  
      const newPipelineRow = component.pipeline.at(component.pipeline.length - 1) as FormGroup;
  
      newPipelineRow.patchValue({
        outerDiameter: 'some_diameter',
        innerDiameterName: 'some_name',
        innerDiameterValue: 'some_value',
        length: 'some_length'
      });
  
      expect(newPipelineRow.valid).toBeTrue();
    });
  
    it('removePipelineRow should remove FormGroup at given index', () => {
      component.addPipeLineRow();
      component.addPipeLineRow();
      const initialLength = component.pipeline.length;
  
      component.removePipelineRow(0);
  
      expect(component.pipeline.length).toBe(initialLength - 1);
    });
  });
  

  describe('RiserDown Row Management', () => {
    let fb: FormBuilder;
  
    beforeEach(() => {
      fb = new FormBuilder();
  
      component.form = fb.group({
        riserDown: fb.array([]),
        pipeline: fb.array([]),
        riserUp: fb.array([]),
        others: fb.array([]),
        pressure: component.createPressure()
      });
  
      spyOn(component, 'createCoating').and.returnValue(
        fb.group({
          type: ['CoatingTypeA'],
          thickness: ['5'],
        })
      );
  
      spyOn(component, 'onCheckInnerDiameter').and.callFake(
        (name: string) => ({
          id: 'mock-id',
          name: `checked-${name}`
        })
      );
    });
  
    it('addRiserDownRow should add a new FormGroup to the riserDown FormArray', () => {
      const initialLength = component.riserDown.length;
      component.addRiserDownRow();
  
      expect(component.riserDown.length).toBe(initialLength + 1);
  
      const newRiserDownRow = component.riserDown.at(component.riserDown.length - 1) as FormGroup;
  
      newRiserDownRow.patchValue({
        outerDiameter: 'some_riser_down_diam',
        innerDiameterName: 'some_riser_down_name',
        innerDiameterValue: 'some_riser_down_value',
        height: 'some_riser_down_height'
      });
  
      expect(newRiserDownRow.valid).toBeTrue();
    });
  
    it('removeRiserDownRow should remove FormGroup at given index', () => {
      component.addRiserDownRow();
      component.addRiserDownRow();
      const initialLength = component.riserDown.length;
  
      component.removeRiserDownRow(0);
  
      expect(component.riserDown.length).toBe(initialLength - 1);
    });
  });
  
  describe('PipeLine Coatings Management', () => {
    let fb: FormBuilder;
  
    beforeEach(() => {
      fb = new FormBuilder();
  
      component.form = fb.group({
        pipeline: fb.array([
          fb.group({
            coatings: fb.array([component.createCoating()])
          })
        ]),
        riserDown: fb.array([]),
        riserUp: fb.array([]),
        others: fb.array([]),
        pressure: component.createPressure()
      });
    });
  
    it('getCoatings should return the coatings FormArray for given section and index', () => {
      const coatings = component.getCoatings(0, 'pipeline') as FormArray<FormGroup>;
      expect(coatings).toBeTruthy();
      expect(coatings instanceof FormArray).toBeTrue();
      expect(coatings.length).toBe(1);
    });
  
    it('addPipeLineCoating should add a new coating FormGroup to pipeline coatings at specified rowIndex', () => {
      const coatings = component.getCoatings(0, 'pipeline') as FormArray<FormGroup>;
      const initialLength = coatings.length;
  
      component.addPipeLineCoating(0);
  
      expect(coatings.length).toBe(initialLength + 1);
    });
  });
  
  describe('Riser Coatings Accessors', () => {
    let fb: FormBuilder;
  
    beforeEach(() => {
      fb = new FormBuilder();
  
      component.form = fb.group({
        riserUp: fb.array([
          fb.group({
            coatings: fb.array([component.createCoating()])
          })
        ]),
        riserDown: fb.array([
          fb.group({
            coatings: fb.array([component.createCoating()])
          })
        ]),
        pipeline: fb.array([]),
        others: fb.array([]),
        pressure: component.createPressure()
      });
    });
  
    it('getRiserUpCoatings should return the coatings FormArray at given riserUp index', () => {
      const coatings = component.getRiserUpCoatings(0) as FormArray<FormGroup>;
      expect(coatings).toBeTruthy();
      expect(coatings instanceof FormArray).toBeTrue();
      expect(coatings.length).toBe(1);
    });
  
    it('getRiserDownCoatings should return the coatings FormArray at given riserDown index', () => {
      const coatings = component.getRiserDownCoatings(0) as FormArray<FormGroup>;
      expect(coatings).toBeTruthy();
      expect(coatings instanceof FormArray).toBeTrue();
      expect(coatings.length).toBe(1);
    });
  });
  
  describe('Delete Coating Methods', () => {
    let fb: FormBuilder;
  
    beforeEach(() => {
      fb = new FormBuilder();
  
      component.form = fb.group({
        pipeline: fb.array([
          fb.group({
            coatings: fb.array([component.createCoating(), component.createCoating()])
          })
        ]),
        riserDown: fb.array([
          fb.group({
            coatings: fb.array([component.createCoating(), component.createCoating()])
          })
        ]),
        riserUp: fb.array([
          fb.group({
            coatings: fb.array([component.createCoating(), component.createCoating()])
          })
        ]),
        others: fb.array([]),
        pressure: component.createPressure()
      });
    });
  
    it('delPipeLineCoating should remove the last coating from pipeline coatings', () => {
      const coatings = component.getCoatings(0, 'pipeline') as FormArray<FormGroup>;
      expect(coatings.length).toBe(2);
      component.delPipeLineCoating(0);
      expect(coatings.length).toBe(1);
    });
  
    it('delRiserDownCoating should remove the last coating from riserDown coatings', () => {
      const coatings = component.getCoatings(0, 'riserDown') as FormArray<FormGroup>;
      expect(coatings.length).toBe(2);
      component.delRiserDownCoating(0);
      expect(coatings.length).toBe(1);
    });
  
    it('delRiserUpCoating should remove the last coating from riserUp coatings', () => {
      const coatings = component.getCoatings(0, 'riserUp') as FormArray<FormGroup>;
      expect(coatings.length).toBe(2);
      component.delRiserUpCoating(0);
      expect(coatings.length).toBe(1);
    });
  
    it('del methods should not throw error if coatings array is empty', () => {
      (component.getCoatings(0, 'pipeline') as FormArray).clear();
      (component.getCoatings(0, 'riserDown') as FormArray).clear();
      (component.getCoatings(0, 'riserUp') as FormArray).clear();
  
      expect(() => component.delPipeLineCoating(0)).not.toThrow();
      expect(() => component.delRiserDownCoating(0)).not.toThrow();
      expect(() => component.delRiserUpCoating(0)).not.toThrow();
    });
  });
  

  describe('openModalClearData', () => {
    it('should open modal and return result on close', async () => {
      const mockContentInstance = {
        title: '',
        text: '',
        btnSubmitText: '',
        btnCancelText: ''
      };

      const modalRefMock = {
        getContentComponent: () => mockContentInstance,
        afterClose: {
          toPromise: () => Promise.resolve('confirmed')
        }
      };
      mockNzModalService.create.and.returnValue(modalRefMock as any);
      const result = await component.openModalClearData();
      expect(mockNzModalService.create).toHaveBeenCalledWith({
        nzContent: CancelModalComponent,
        nzFooter: null,
        nzWidth: 600
      });

      const instance = (mockNzModalService.create as jasmine.Spy).calls.first().returnValue.getContentComponent();

      expect(instance.title).toBe('Are you sure you want to clear data on this table ?');
      expect(instance.text).toBe('You will lose all this lasted data input, This action cannot be undone');
      expect(instance.btnSubmitText).toBe('Delete');
      expect(instance.btnCancelText).toBe('Cancel');
      expect(result).toBe('confirmed');
    });
  });

  describe('clearPipelineRow', () => {
    it('should reset all pipeline rows if user confirms', async () => {
      spyOn(component, 'openModalClearData').and.returnValue(Promise.resolve(true));

      const group1 = new FormGroup({ field1: new FormControl('value1') });
      const group2 = new FormGroup({ field2: new FormControl('value2') });
      component.form = component['fb'].group({
        pipeline: new FormArray([group1, group2])
      });

      await component.clearPipelineRow();

      expect(component.openModalClearData).toHaveBeenCalled();
      expect(group1.pristine).toBeTrue();
      expect(group1.untouched).toBeTrue();
      expect(group1.value).toEqual({ field1: null });

      expect(group2.pristine).toBeTrue();
      expect(group2.untouched).toBeTrue();
      expect(group2.value).toEqual({ field2: null });
    });


    it('should reset all riserUp rows if user confirms', async () => {
      spyOn(component, 'openModalClearData').and.returnValue(Promise.resolve(true));

      const group1 = new FormGroup({ x: new FormControl('x1') });
      const group2 = new FormGroup({ y: new FormControl('y1') });

      component.form = component['fb'].group({
        riserUp: new FormArray([group1, group2])
      });

      await component.clearRiserUpRow();

      expect(component.openModalClearData).toHaveBeenCalled();
      expect(group1.value).toEqual({ x: null });
      expect(group2.value).toEqual({ y: null });
    });
    it('should replace other row with a new form group if user confirms', async () => {
      spyOn(component, 'openModalClearData').and.returnValue(Promise.resolve(true));
      spyOn(component, 'createOther').and.returnValue(new FormGroup({ someField: new FormControl('') }));

      component.form = component['fb'].group({
        others: new FormArray([new FormGroup({ oldField: new FormControl('old') })])
      });

      await component.clearOtherUpRow(0);

      expect(component.openModalClearData).toHaveBeenCalled();
      expect(component.createOther).toHaveBeenCalled();
      expect((component.others.at(0) as FormGroup).contains('someField')).toBeTrue();
    });
  });

  describe('getPipesimData', () => {

    beforeEach(() => {
      component.study = { data: { studyId: 'study123' } };
      component.transaction = { data: { transactionId: 'tx123' } };
      spyOn(component, 'setFormPipesim');
      spyOn(component, 'getDefaultPressure');
      spyOn(console, 'log');
    });

    describe('when response has data', () => {

      it('should call setFormPipesim and getDefaultPressure if pipesimData is null', fakeAsync(() => {
        mockCalculationDataService.pipesimData = null;
        const mockResponse = {
          data: {
            field: 'value',
            pipelineSection: [{}],
            riserUp: [{}],
            riserDown: [{}]
          }
        };
        mockCalculationService.getPipesimById.and.returnValue(of(mockResponse));
      
        component.getPipesimData();
        tick();
      
        expect(component.setFormPipesim).toHaveBeenCalledWith(mockResponse.data);
        expect(component.getDefaultPressure).toHaveBeenCalled();
      }));
      

      it('should use existing pipesimData and mark form touched if pipesimData exists', fakeAsync(() => {
        mockCalculationDataService.pipesimData = { field: 'existing' };
        const mockResponse = {
          data: {
            field: 'value',
            pipelineSection: [{}],
            riserUp: [{}],
            riserDown: [{}]
          }
        };
        mockCalculationService.getPipesimById.and.returnValue(of(mockResponse));
      
        component.getPipesimData();
        tick();
      
        expect(component.setFormPipesim).toHaveBeenCalledWith(mockCalculationDataService.pipesimData);
        expect(component.getDefaultPressure).toHaveBeenCalled();
      }));
    });

    describe('when error occurs', () => {

      it('should call getDefaultPressure if pipesimData is null (404 error)', fakeAsync(() => {
        mockCalculationDataService.pipesimData = null;
        mockCalculationService.getPipesimById.and.returnValue(throwError({ status: 404 }));

        component.getPipesimData();
        tick();

        expect(component.getDefaultPressure).toHaveBeenCalled();
        expect(component.setFormPipesim).not.toHaveBeenCalled();
      }));

      it('should use existing pipesimData and mark form touched if pipesimData exists (404 error)', fakeAsync(() => {
        mockCalculationDataService.pipesimData = { field: 'existing' };
        mockCalculationService.getPipesimById.and.returnValue(throwError({ status: 404 }));

        component.getPipesimData();
        tick();

        expect(component.setFormPipesim).toHaveBeenCalledWith(mockCalculationDataService.pipesimData);
        expect(component.getDefaultPressure).toHaveBeenCalled();
      }));

      it('should behave same for non-404 errors', fakeAsync(() => {
        mockCalculationDataService.pipesimData = { field: 'existing' };
        mockCalculationService.getPipesimById.and.returnValue(throwError({ status: 500 }));

        component.getPipesimData();
        tick();

        expect(component.setFormPipesim).toHaveBeenCalledWith(mockCalculationDataService.pipesimData);
        expect(component.getDefaultPressure).toHaveBeenCalled();
      }));
    });
  });


  describe('createSectionData', () => {
    beforeEach(() => {
      component.form = new FormGroup({
        pipeline: new FormArray([
          new FormGroup({
            innerDiameterName: new FormControl({ id: 'Pipe A' }),
            innerDiameterValue: new FormControl('10.5'),
            outerDiameter: new FormControl('12'),
            length: new FormControl('100')
          })
        ]),
        riserDown: new FormArray([
          new FormGroup({
            innerDiameterName: new FormControl({ id: 'Riser D1' }),
            innerDiameterValue: new FormControl('8.5'),
            outerDiameter: new FormControl('10'),
            height: new FormControl('50')
          })
        ]),
        riserUp: new FormArray([
          new FormGroup({
            innerDiameterName: new FormControl({ id: 'Riser U1' }),
            innerDiameterValue: new FormControl('9'),
            outerDiameter: new FormControl('11'),
            height: new FormControl('60')
          })
        ]),
        others: new FormArray([
          new FormGroup({
            pipleDesignPressure: new FormControl('150'),
            usPahh: new FormControl('25'),
            targetPressureValue: new FormControl('75'),
            ph: new FormControl('23'),
            pipelineDesignRegion: new FormControl({ id: 'region_0' })

          })
        ]),
        pressure: new FormGroup({
          platformPressureName: new FormControl('D/S Platform Pressure'),
          platformPressunreName: new FormControl('D/S Platform Pressure'),
          platformPressureValue: new FormControl('300'),
          platformPressureProcessValue: new FormControl('200')
        })
      });

      spyOn(component, 'getPipeLineCoatings').and.returnValue(new FormArray([
        new FormGroup({
          coatingName: new FormControl({ name: '1' }),
          coatingTemperature: new FormControl('120'),
          coatingConductivity: new FormControl('0.5'),
          coatingThickness: new FormControl('2')
        })
      ]));
      spyOn(component, 'getRiserDownCoatings').and.returnValue(new FormArray([
        new FormGroup({
          coatingName: new FormControl({ name: '1' }),
          coatingTemperature: new FormControl('120'),
          coatingConductivity: new FormControl('0.3'),
          coatingThickness: new FormControl('1.5')
        })
      ]));
      spyOn(component, 'getRiserUpCoatings').and.returnValue(new FormArray([
        new FormGroup({
          coatingName: new FormControl({ name: '1' }),
          coatingTemperature: new FormControl('120'),
          coatingConductivity: new FormControl('0.4'),
          coatingThickness: new FormControl('1.8')
        })
      ]));
      component.study = { data: { studyId: '123' } };
      component.transaction = { data: { transactionId: '456' } };
    });

    it('should return a clean structured data object from form values', () => {
      const result = component.createSectionData();

      expect(result.studyId).toBe('123');
      expect(result.transactionId).toBe('456');

      expect(result.pipelineSection.length).toBe(1);
      expect(result.pipelineSection[0].pipelineInput.name).toBe('Pipe A');
      expect(result.pipelineSection[0].coating[0].name).toBe('1');

      expect(result.riserDown.length).toBe(1);
      expect(result.riserDown[0].riserInput.name).toBe('Riser D1');
      expect(result.riserDown[0].coating[0].name).toBe('1');

      expect(result.riserUp.length).toBe(1);
      expect(result.riserUp[0].riserInput.name).toBe('Riser U1');
      expect(result.riserUp[0].coating[0].name).toBe('1');

      expect(result.otherData.designPressure).toBe(150);
      expect(result.platformPressure.value).toBe(300);
    });
  });

  describe('PipesimComponent Full watchFormChanges & onChangeTargetPressure', () => {
    let processInfoFormSubject: BehaviorSubject<FormGroup>;

    beforeEach(() => {
      processInfoFormSubject = new BehaviorSubject(
        new FormGroup({
          exportPressure: new FormControl(0),
          h2s: new FormControl(0),
          co2: new FormControl(0)
        })
      );

      mockCalculationContextService.processInfoForm$ = processInfoFormSubject.asObservable();

      component.form = new FormGroup({
        others: new FormArray([
          new FormGroup({
            targetPressureName: new FormControl('A'),
            usWellHeadPlatformPath: new FormControl(10)
          })
        ]),
        pipeline: new FormArray([new FormGroup({ key: new FormControl('') })]),
        riserDown: new FormArray([new FormGroup({ key: new FormControl('') })]),
        riserUp: new FormArray([new FormGroup({ key: new FormControl('') })]),
        pressure: new FormGroup({
          platformPressureProcessValue: new FormControl('')
        })
      });

      Object.defineProperty(component, 'others', {
        get: () => component.form.get('others') as FormArray
      });

      component.watchFormChanges();
    });

    describe('onChangeTargetPressure', () => {
      it('should call tryUpdateTargetPressure immediately and on valueChanges', () => {
        spyOn(component, 'tryUpdateTargetPressure');

        component.onChangeTargetPressure();

        const group = component.others.at(0);

        group.get('targetPressureName')?.setValue('B', { emitEvent: true });
        group.get('usWellHeadPlatformPath')?.setValue(20, { emitEvent: true });

        expect(component.tryUpdateTargetPressure).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('checkTypeTargetPressure', () => {
    beforeEach(() => {
      component.targetPressureData = [{ id: '1', name: 'DEFAULT' }, { id: '2', name: 'CUSTOM' }, { id: '3', name: 'EQUAL_EXPORT' }];

      const mockFormGroup = new FormGroup({
        exportPressure: new FormControl(100)
      });

      const processForm = { '1-1': mockFormGroup };
    });

    it('should return default when value is null', () => {
      const result = component.checkTypeTargetPressure(null as unknown as number);
      expect(result).toEqual({ id: '1', name: 'DEFAULT' });
    });

    it('should return default when value is 77', () => {
      const result = component.checkTypeTargetPressure(77);
      expect(result).toEqual({ id: '1', name: 'DEFAULT' });
    });

    it('should return EQUAL_EXPORT when value matches exportPressure', () => {
      const result = component.checkTypeTargetPressure(100);
      expect(result).toEqual({ id: '2', name: 'CUSTOM' });
    });

    it('should return CUSTOM when value does not match exportPressure or 77', () => {
      const result = component.checkTypeTargetPressure(85);
      expect(result).toEqual({ id: '2', name: 'CUSTOM' });
    });
  });

  describe('openUploadDialog', () => {
    let modalRefMock: NzModalRef<UploadModalContent, unknown>;
  
    beforeEach(() => {
      modalRefMock = {
        afterClose: new Subject<unknown>(),
        close: jasmine.createSpy('close'),
        destroy: jasmine.createSpy('destroy'),
        getContentComponent: jasmine.createSpy<() => UploadModalContent>().and.returnValue({
          title: '',
          templateName: ''
        }),
        componentInstance: undefined,
        containerInstance: undefined,
        overlayRef: undefined,
        config: undefined
      } as unknown as NzModalRef<UploadModalContent, unknown>;
  
      mockNzModalService.create = jasmine.createSpy().and.returnValue(modalRefMock);
    });
  
    it('should open modal with correct config and set content properties', () => {
      component.openUploadDialog();
  
      const instance = modalRefMock.getContentComponent();
      expect(instance.title).toBe(CalculationConstants.TTTLE_SECTION_PIPESIM_TABLE);
      expect(instance.templateName).toBe('pipesim_excel_template');
  
      expect(mockNzModalService.create).toHaveBeenCalledWith({
        nzContent: UploadModalComponent,
        nzFooter: null,
        nzWidth: 600
      });
    });
  });

  
  describe('Form control getters', () => {
    beforeEach(() => {
      component.form = new FormGroup({
        pipeline: new FormArray([
          new FormGroup({
            diameter: new FormControl(100),
            coating: new FormArray([
              new FormGroup({
                thickness: new FormControl(5)
              })
            ])
          })
        ])
      });
    });

    describe('getPipelineControl', () => {
      it('should return the FormControl at the given pipeline index and control name', () => {
        const control = component.getPipelineControl(0, 'diameter');
        expect(control).toBeTruthy();
        expect(control.value).toBe(100);
      });

      it('should return undefined if control does not exist', () => {
        const control = component.getPipelineControl(0, 'nonExistingField');
        expect(control).toBeNull();
      });
    });

    describe('getCoatingControl', () => {
      it('should return the FormControl for a coating field at specified pipeline and coating index', () => {
        spyOn(component, 'getCoatingArray').and.callFake((pipelineIndex: number) => {
          return (component.form.get('pipeline') as FormArray)
            .at(pipelineIndex)
            .get('coating') as FormArray;
        });

        const control = component.getCoatingControl(0, 0, 'thickness');
        expect(control).toBeTruthy();
        expect(control.value).toBe(5);
      });

      it('should return undefined if coating index or field is invalid', () => {
        spyOn(component, 'getCoatingArray').and.returnValue(
          new FormArray([
            new FormGroup({})
          ])
        );

        const control = component.getCoatingControl(0, 0, 'nonExistingField');
        expect(control).toBeNull();
      });
    });
  });

  describe('Coating-related methods', () => {
    beforeEach(() => {
      component.form = new FormGroup({
        pipeline: new FormArray([
          new FormGroup({
            coatings: new FormArray([
              new FormGroup({}),
              new FormGroup({})
            ])
          }),
          new FormGroup({
            coatings: new FormArray([
              new FormGroup({})
            ])
          }),
          new FormGroup({
            coatings: new FormArray([])
          })
        ])
      });
    });

    describe('getCoatingArray', () => {
      it('should return the coatings FormArray for a given pipeline index', () => {
        const coatingArray = component.getCoatingArray(0);
        expect(coatingArray instanceof FormArray).toBeTrue();
        expect(coatingArray.length).toBe(2);
      });

      it('should return an empty FormArray if coatings are empty', () => {
        const coatingArray = component.getCoatingArray(2);
        expect(coatingArray instanceof FormArray).toBeTrue();
        expect(coatingArray.length).toBe(0);
      });
    });

    describe('getMaxCoatingLength', () => {
      it('should return the maximum number of coatings among all pipelines', () => {
        const maxLength = component.getMaxCoatingLength();
        expect(maxLength).toBe(2);
      });

      it('should return 0 if all coating arrays are empty', () => {
        component.form = new FormGroup({
          pipeline: new FormArray([
            new FormGroup({ coatings: new FormArray([]) }),
            new FormGroup({ coatings: new FormArray([]) })
          ])
        });

        const maxLength = component.getMaxCoatingLength();
        expect(maxLength).toBe(0);
      });

      it('should handle missing coatings control gracefully', () => {
        component.form = new FormGroup({
          pipeline: new FormArray([
            new FormGroup({}),
            new FormGroup({})
          ])
        });

        const maxLength = component.getMaxCoatingLength();
        expect(maxLength).toBe(0);
      });
    });
  });

  describe('removeLast methods', () => {
    beforeEach(() => {
      component.form = new FormGroup({
        pipeline: new FormArray([
          new FormGroup({}),
          new FormGroup({})
        ]),
        riserDown: new FormArray([
          new FormGroup({})
        ]),
        riserUp: new FormArray([])
      });
    });

    describe('removeLastPipeline', () => {
      it('should remove the last pipeline item when available', () => {
        expect(component.pipeline.length).toBe(2);
        component.removeLastPipeline();
        expect(component.pipeline.length).toBe(1);
      });
    });

    describe('removeLastRiserDown', () => {
      it('should remove the last riserDown item when available', () => {
        expect(component.riserDown.length).toBe(1);
        component.removeLastRiserDown();
        expect(component.riserDown.length).toBe(0);
      });
    });

    describe('removeLastRiserUp', () => {
      it('should remove last item in riserUp if present', () => {
        component.form.setControl('riserUp', new FormArray([
          new FormGroup({}),
          new FormGroup({})
        ]));
        expect(component.riserUp.length).toBe(2);
        component.removeLastRiserUp();
        expect(component.riserUp.length).toBe(1);
      });
    });
  });

});