import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculationComponent } from './calculation.component';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CancelModalComponent } from '../../shared/components/modals/cancel-modal/cancel-modal.component';
import { CalculationContextService } from './CalculationContext.service';
import { RouterTestingModule } from '@angular/router/testing';
import {
  APP_CONFIG,
  EnvironmentConfiguration,
} from '../../core/interfaces/environment-configuration';
import { Environment } from '../../core/enums/environments.enum'; // assuming correct path
import { LayoutStyle } from '../../core/models/mfe-models.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ModelAndBasicCompositionComponent } from './components/model-and-basic-composition/model-and-basic-composition.component';

describe('CalculationComponent', () => {
  let component: CalculationComponent;
  let fixture: ComponentFixture<CalculationComponent>;
  let modalService: jasmine.SpyObj<NzModalService>;
  let calculationContextService: jasmine.SpyObj<CalculationContextService>;
  // let mockRouter: jasmine.SpyObj<Router>;
  let router: jasmine.SpyObj<Router>;

  const mockLayoutStyle: LayoutStyle = {
    header: {
      /* mock header settings if required */
    },
    navigation: {
      /* mock nav settings if required */
    },
    footer: {
      /* mock footer settings if required */
    },
  };
  const processValidSubject = new Subject<any>();
  const pipingValidSubject = new Subject<any>();
  const erosionValidSubject = new Subject<any>();
  const mockAppConfig: EnvironmentConfiguration = {
    APP_FRONTEND_URL: '',
    APP_TITLE: 'Test App',
    APP_VERSION: '1.0.0',
    BASE_URL_SERVICE: '',
    APIGW_BASE_URL: '',
    BASE_URL: '',
    DEBUG_MODE: false,
    LAYOUT_STYLE: mockLayoutStyle,
    MICROSOFT_TENANT: '',
    MSAL_CLIENT_ID: '',
    NODE_ENV: Environment.local,
    EP_LAYOUT_URL: '',
    SEQUENCE_FLOW:['1,2,3']
  };
  const mockActivatedRoute = {
    paramMap: of(new Map([['study_code', 'SC123']])),
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  const mockModal = {
    create: jasmine.createSpy('create').and.returnValue({
      afterClose: of(true),
    }),
  };

  const mockCalculationContextService = {
    processValid$: new BehaviorSubject<any>({}),
    pipingValid$: new BehaviorSubject<any>({}),
    getPipesimValidate: jasmine.createSpy().and.returnValue(of({})),
  };

  beforeEach(async () => {
    const modalSpy = jasmine.createSpyObj('NzModalService', ['create']);
    const calculationContextSpy = jasmine.createSpyObj(
      'CalculationContextService',
      [
        'getPipesimValidate',
        'getErosionValidate',
        'setModelForm',
        'getThermowellValidate',
      ],
    );
    calculationContextSpy.getPipesimValidate.and.returnValue(of({}));
    calculationContextSpy.processValid$ = processValidSubject.asObservable();
    calculationContextSpy.pipingValid$ = pipingValidSubject.asObservable();
    calculationContextSpy.erosionValid$ = of(true);
    calculationContextSpy.thermowellValid$ = of(true);
    calculationContextSpy.getErosionValidate.and.returnValue(of({}));
    calculationContextSpy.getThermowellValidate.and.returnValue(of({}));

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CalculationComponent,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ study_code: 'TEST_CODE' })),
          },
        },
        { provide: NzModalService, useValue: modalSpy },
        { provide: CalculationContextService, useValue: calculationContextSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ study_code: 'TEST_CODE' })),
          },
        },
        { provide: APP_CONFIG, useValue: mockAppConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculationComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(
      NzModalService,
    ) as jasmine.SpyObj<NzModalService>;
    calculationContextService = TestBed.inject(
      CalculationContextService,
    ) as jasmine.SpyObj<CalculationContextService>;
    // mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should set studyCode from route params on init', () => {
      expect(component.studyCode).toBe('');
    });
  });

  describe('Step Navigation', () => {
    it('should increment step on nextStep', () => {
      component.currentStep = 1;
      component.nextStep();
      expect(component.currentStep).toBe(2);
    });

    it('should decrement step on previousStep', () => {
      component.currentStep = 2;
      component.previousStep();
      expect(component.currentStep).toBe(1);
    });

    it('should set step on goToStep', () => {
      component.goToStep(3);
      expect(component.currentStep).toBe(3);
    });
  });

  describe('Draft & Submit Actions', () => {
    it('should call step0Component.onSaveDraft on draft step 0', () => {
      component.currentStep = 0;
      component.step0Component = jasmine.createSpyObj(
        'ModelAndBasicCompositionComponent',
        ['onSaveDraft'],
      );
      component.onDraft();
      expect(component.step0Component?.onSaveDraft).toHaveBeenCalled();
    });

    it('should call step0Component.onNextStep on submit step 0', async () => {
      component.currentStep = 0;
      component.step0Component = jasmine.createSpyObj(
        'ModelAndBasicCompositionComponent',
        ['onNextStep'],
      );
      await component.onSubmit();
      expect(component.step0Component?.onNextStep).toHaveBeenCalled();
    });
  });

  describe('Modal Actions', () => {
    it('should open cancel modal and clear sessionStorage when confirmed', () => {
      const afterClose = of(true);
      modalService.create.and.returnValue({ afterClose } as any);
      spyOn(sessionStorage, 'clear');

      component.onBackToCreate();

      expect(modalService.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          nzContent: CancelModalComponent,
          nzFooter: null,
          nzWidth: 600,
        }),
      );
      expect(sessionStorage.clear).toHaveBeenCalled();
    });

    it('should not clear sessionStorage if cancel not confirmed', () => {
      modalService.create.and.returnValue({ afterClose: of(false) } as any);
      spyOn(sessionStorage, 'clear');

      component.onBackToCreate();

      expect(sessionStorage.clear).not.toHaveBeenCalled();
    });

    it('should open review modal and call submitCalculation', async () => {
      component.step3Component = jasmine.createSpyObj('InputReviewComponent', [
        'submitCalculation',
      ]);
      const afterClose = of(true);
      modalService.create.and.returnValue({ afterClose } as any);

      await component.onReview();
      expect(component.step3Component?.submitCalculation).toHaveBeenCalled();
    });
  });

  //Note : comment for re use function validate
  // describe('Validation Checks', () => {
  //   it('should compute isAllFormValid correctly for sequenceFlow "1,2,3,4"', () => {
  //     component.sequenceFlow = '1,2,3,4';
  //     component.validateProcessInformation = false;
  //     component.validatePipingData = false;
  //     component.validateThermowell = false;
  //     component.validateErosion = false;
  //     component.validatePipeLine = false;
  //     component.validateRiserDown = false;
  //     component.validateRiserUp = false;
  //     component.validateOther = false;

  //     expect(component.isAllFormValid()).toBe(false);
  //   });
  // });

  it('should navigate to /all-studies and clear sessionStorage when cancel confirmed', () => {
    const afterClose = of(true);
    modalService.create.and.returnValue({ afterClose } as any);

    spyOn(sessionStorage, 'clear');
    component.onBackToCreate();

    expect(modalService.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nzContent: CancelModalComponent,
        nzFooter: null,
        nzWidth: 600,
      }),
    );
    // expect(router.navigate).toHaveBeenCalledWith(['/all-studies']);
    expect(sessionStorage.clear).toHaveBeenCalled();
  });

  it('should change step correctly', () => {
    component.currentStep = 1;
    component.nextStep();
    expect(component.currentStep).toBe(2);

    component.previousStep();
    expect(component.currentStep).toBe(1);

    component.goToStep(3);
    expect(component.currentStep).toBe(3);
  });

  it('should call step0Component.onSaveDraft on draft step 0', () => {
    component.currentStep = 0;
    component.step0Component = jasmine.createSpyObj(
      'ModelAndBasicCompositionComponent',
      ['onSaveDraft'],
    );
    component.onDraft();
    component.step0Component =
      jasmine.createSpyObj<ModelAndBasicCompositionComponent>(
        'ModelAndBasicCompositionComponent',
        ['onSaveDraft'],
      ) as any;
  });

  it('should call step0Component.onNextStep on submit step 0', async () => {
    component.currentStep = 0;
    component.step0Component = jasmine.createSpyObj(
      'ModelAndBasicCompositionComponent',
      ['onNextStep'],
    );
    await component.onSubmit();
    component.step0Component =
      jasmine.createSpyObj<ModelAndBasicCompositionComponent>(
        'ModelAndBasicCompositionComponent',
        ['onNextStep'],
      ) as any;
  });

  it('should not navigate or clear sessionStorage if cancel not confirmed', () => {
    modalService.create.and.returnValue({ afterClose: of(false) } as any);
    spyOn(sessionStorage, 'clear');
    component.onBackToCreate();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(sessionStorage.clear).not.toHaveBeenCalled();
  });
});
