import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecommendationComponent } from './recommendation.component';
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { CommonService } from '../../../../services/common/common.service';
import { StudyDetailsService } from '../../../../services/study-details/study-details.service';
import { UserNameService } from '../../../../shared/services/user-name.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('RecommendationComponent', () => {
  let component: RecommendationComponent;
  let fixture: ComponentFixture<RecommendationComponent>;

  let mockCalculationService: Partial<CalculationService>;
  let mockCommonService: Partial<CommonService>;
  let mockStudyDetailsService: Partial<StudyDetailsService>;
  let mockUserNameService: Partial<UserNameService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockCalculationService = {};
    mockCommonService = {
      getHandleStep: jasmine.createSpy(),
    };
    mockStudyDetailsService = {};
    mockUserNameService = {};
    mockRouter = {};
    mockStudyDetailsService = {
      getStudyById: jasmine.createSpy().and.returnValue(of({ data: { id: 1 } }))
    };
    await TestBed.configureTestingModule({
      imports: [RecommendationComponent, CommonModule],
      providers: [
        { provide: CalculationService, useValue: mockCalculationService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: StudyDetailsService, useValue: mockStudyDetailsService },
        { provide: UserNameService, useValue: mockUserNameService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendationComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should parse study and transaction from sessionStorage', () => {
      const mockStudy = { data: { studyId: 1 } };
      const mockTransaction = { data: { transactionId: 123 } };

      spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'study') return JSON.stringify(mockStudy);
        if (key === 'transactionId') return JSON.stringify(mockTransaction);
        return null;
      });

      component.ngOnInit();

      expect(component.study).toEqual(mockStudy);
      expect(component.transaction).toEqual(mockTransaction);
    });
  });

  describe('getCalculationStepInterVal', () => {
    beforeEach(() => {
      component.transaction = { data: { transactionId: 123 } };
      spyOn(component, 'getSummaryTopSide').and.resolveTo();
      spyOn(component, 'getSummaryPipeLine').and.resolveTo();
      spyOn(component, 'getProcessInformation').and.resolveTo();
      spyOn(window, 'clearInterval');
    });

    it('should update calStatus and call summary methods when status is DONE and transactionStep is RESULT_SUMMARY', async () => {
      const intervalId = 123;
      (component as any).intervalId = intervalId;
      const mockResponse = {
        data: { status: 'DONE', transactionStep: 'RESULT_SUMMARY', sequenceFlow: '4' }
      };

      (mockCommonService.getHandleStep as jasmine.Spy).and.returnValue(of(mockResponse));

      await component.getCalculationStepInterVal(intervalId);

      expect(component.calStatus).toBe('DONE');
      expect(component.getSummaryTopSide).toHaveBeenCalled();
      expect(component.getSummaryPipeLine).toHaveBeenCalled();
      expect(component.getProcessInformation).toHaveBeenCalled();
      expect(clearInterval).toHaveBeenCalledWith(intervalId);
    });
  });

  describe('getCalculationStep', () => {
    beforeEach(() => {
      component.transaction = { data: { transactionId: 123 } };
      spyOn(component, 'getSummaryTopSide').and.resolveTo();
      spyOn(component, 'getSummaryPipeLine').and.resolveTo();
      spyOn(component, 'getProcessInformation').and.resolveTo();
    });

    it('should update calStatus and call summary methods when response has data', async () => {
      const mockResponse = { data: { status: 'DONE', transactionStep: 'RESULT_SUMMARY', sequenceFlow: '4' } };
      (mockCommonService.getHandleStep as jasmine.Spy).and.returnValue(of(mockResponse));

      await component.getCalculationStep();

      expect(component.calStatus).toBe('DONE');
      expect(component.getSummaryTopSide).toHaveBeenCalled();
      expect(component.getSummaryPipeLine).toHaveBeenCalled();
      expect(component.getProcessInformation).toHaveBeenCalled();
    });
  });

  describe('getStudyById', () => {
    beforeEach(() => {
      component.study = { data: { studyId: 101 } };
    });

    it('should call studyDetailsService.getStudyById with correct id and set studyDetail', async () => {
      const mockResponse = {
        data: {
          studyId: 101,
          studyCode: 'ST-001',
          studyName: 'My Study',
          asset: 'Asset A',
          location: 'Bangkok',
          status: 'ACTIVE',
          createdBy: 'Tester',
          createdAt: '2025-08-25',
          updatedAt: '2025-08-26',
        },
      };

      (mockStudyDetailsService.getStudyById as jasmine.Spy) = jasmine
        .createSpy()
        .and.returnValue(of(mockResponse));

      await component.getStudyById();

      expect(component.studyDetail).toEqual({
        studyId: 101,
        studyCode: 'ST-001',
        studyName: 'My Study',
        assetName: 'Asset A',
        locationName: 'Bangkok',
        status: 'ACTIVE',
        createdBy: 'Tester',
        createdAt: '2025-08-25',
        updatedAt: '2025-08-26',
      });
    });
  });

  describe('getSummaryTopSide', () => {
    beforeEach(() => {
      component.study = { data: { studyId: 101 } };
      spyOn(console, 'log');
    });

    it('should set dataTopSide when service returns data', async () => {
      (mockCalculationService.getSummaryTopSide as jasmine.Spy) = jasmine
        .createSpy()
        .and.returnValue(of({ data: { value: 123 } }));

      await component.getSummaryTopSide();

      expect(component.dataTopSide).toEqual({ value: 123 });
    });

    it('should handle error when service fails', async () => {
      const mockError = new Error('Service failed');
      (mockCalculationService.getSummaryTopSide as jasmine.Spy) = jasmine
        .createSpy()
        .and.returnValue(throwError(() => mockError));

      await component.getSummaryTopSide();

      expect(console.log).toHaveBeenCalledWith('error', mockError);
    });

    it('should handle error when service fails', async () => {
      const mockError = new Error('Service failed');
      (mockCalculationService.getProcessInformationById as jasmine.Spy) = jasmine
        .createSpy()
        .and.returnValue(throwError(() => mockError));

      await component.getProcessInformation();

      expect(console.log).toHaveBeenCalledWith('error', mockError);
    });
  });


  describe('onNextStep / onBackStep', () => {
    it('should emit nextStep', async () => {
      spyOn(component.nextStep, 'emit');
      await component.onNextStep();
      expect(component.nextStep.emit).toHaveBeenCalled();
    });

    it('should emit backStep', async () => {
      spyOn(component.backStep, 'emit');
      await component.onBackStep();
      expect(component.backStep.emit).toHaveBeenCalled();
    });
  });

  describe('displayName', () => {
    it('should call userNameService.displayName and return its value', () => {
      (mockUserNameService.displayName as jasmine.Spy) = jasmine.createSpy().and.returnValue('John Doe');
      const result = component.displayName('john');
      expect(result).toBe('John Doe');
      expect(mockUserNameService.displayName).toHaveBeenCalledWith('john');
    });
  });

  describe('onScrollTop', () => {
    it('should scroll to top', () => {
      const mockScrollIntoView = jasmine.createSpy();
      component.resultRef = { nativeElement: { scrollIntoView: mockScrollIntoView } };
      component.onScrollTop();
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });
  });
});
