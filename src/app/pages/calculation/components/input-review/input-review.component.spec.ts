import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { InputReviewComponent } from './input-review.component';
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AlertMessageConstants } from '../../../../core/enums/calculation.enum';
import { PipesimData } from '../../../../core/models/calculation/pipesim.model';

describe('InputReviewComponent', () => {
  let component: InputReviewComponent;
  let fixture: ComponentFixture<InputReviewComponent>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;
  let mockCalculationService: jasmine.SpyObj<CalculationService>;

  beforeEach(async () => {
    mockCalculationService = jasmine.createSpyObj('CalculationService', [
      'getProcessInformationById',
      'getPipingDataById',
      'getPipingDetailByClassAndSize',
      'getErosionCalculationDataById',
      'getThermowellData',
      'getPipesimById',
      'submitCalculation',
    ]);
    const alertSpy = jasmine.createSpyObj('AlertService', ['error', 'success']);
    const mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
      snapshot: { params: {}, queryParams: {} },
    };
    await TestBed.configureTestingModule({
      imports: [InputReviewComponent],
      providers: [
        { provide: CalculationService, useValue: mockCalculationService },
        { provide: AlertService, useValue: alertSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputReviewComponent);
    component = fixture.componentInstance;
    mockCalculationService = TestBed.inject(
      CalculationService,
    ) as jasmine.SpyObj<CalculationService>;
    alertServiceSpy = TestBed.inject(
      AlertService,
    ) as jasmine.SpyObj<AlertService>;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      // Mock sessionStorage
      spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'study')
          return JSON.stringify({ data: { studyId: '123' } });
        if (key === 'transactionId')
          return JSON.stringify({ data: { transactionId: 'abc' } });
        return null;
      });

      mockCalculationService.getProcessInformationById.and.returnValue(
        of({ data: { data: [], sequenceFlow: '1,2,3' } }),
      );
      mockCalculationService.getPipingDataById.and.returnValue(
        of({ data: [] }),
      );
      mockCalculationService.getErosionCalculationDataById.and.returnValue(
        of({ data: [] }),
      );
      mockCalculationService.getThermowellData.and.returnValue(
        of({ data: {} }),
      );
      mockCalculationService.getPipesimById.and.returnValue(of({ data: {} }));
    });

    it('should load session data and call all data fetching methods if studyId exists', () => {
      spyOn(component as any, 'loadSessionData').and.callThrough();
      spyOn(component, 'getProcessInformation').and.callThrough();
      spyOn(component, 'getPipingDataById').and.callThrough();
      spyOn(component, 'getErosionCalculationData').and.callThrough();
      spyOn(component, 'getThermowell').and.callThrough();
      spyOn(component, 'getPipesimData').and.callThrough();

      component.ngOnInit();

      expect((component as any).loadSessionData).toHaveBeenCalled();
      expect(component.getProcessInformation).toHaveBeenCalledWith(
        '123',
        'abc',
      );
      expect(component.getPipingDataById).toHaveBeenCalledWith('123', 'abc');
      expect(component.getErosionCalculationData).toHaveBeenCalledWith(
        '123',
        'abc',
      );
      expect(component.getThermowell).toHaveBeenCalledWith('123', 'abc');
      expect(component.getPipesimData).toHaveBeenCalledWith('123', 'abc');
      expect(component.sequenceArray).toEqual([1, 2, 3]);
    });
  });

  describe('loadSessionData', () => {
    it('should load study and transactionId from sessionStorage', () => {
      const mockStudy = { data: { studyId: '123' } };
      const mockTransaction = { data: { transactionId: 'abc' } };
      spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'study') return JSON.stringify(mockStudy);
        if (key === 'transactionId') return JSON.stringify(mockTransaction);
        return null;
      });

      // Access private method via casting
      (component as any).loadSessionData();

      expect(component.study).toEqual(mockStudy);
      expect(component.transactionId).toEqual(mockTransaction);
    });

    it('should default to empty objects if sessionStorage returns null', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null);

      (component as any).loadSessionData();

      expect(component.study).toEqual({});
      expect(component.transactionId).toEqual({});
    });
  });

  describe('shouldDisplayStep', () => {
    it('should return true if stepNumber exists in sequenceArray', () => {
      component.sequenceArray = [1, 2, 3];
      expect(component.shouldDisplayStep(2)).toBeTrue();
    });

    it('should return false if stepNumber does not exist in sequenceArray', () => {
      component.sequenceArray = [1, 2, 3];
      expect(component.shouldDisplayStep(4)).toBeFalse();
    });

    it('should return false if sequenceArray is empty', () => {
      component.sequenceArray = [];
      expect(component.shouldDisplayStep(1)).toBeFalse();
    });
  });

  describe('getProcessInformation', () => {
    it('should load processData and sequenceArray when API returns data', () => {
      const mockResponse = {
        data: {
          data: [
            { position: 2, subPosition: 1 },
            { position: 1, subPosition: 2 },
            { position: 1, subPosition: 1 },
          ],
          sequenceFlow: '1,2,3',
        },
      };
      mockCalculationService.getProcessInformationById.and.returnValue(
        of(mockResponse),
      );

      component.getProcessInformation('studyId', 'txnId');

      expect(component.processData.length).toBe(3);
      expect(component.processData[0].position).toBe(1);
      expect(component.processData[0].subPosition).toBe(1);

      expect(component.sequenceFlow).toBe('1,2,3');
      expect(component.sequenceArray).toEqual([1, 2, 3]);
    });

    it('should handle API error gracefully', () => {
      spyOn(console, 'error');
      mockCalculationService.getProcessInformationById.and.returnValue(
        throwError(() => new Error('API error')),
      );

      component.getProcessInformation('studyId', 'txnId');

      expect(console.error).toHaveBeenCalledWith(
        'Failed to load process information:',
        jasmine.any(Error),
      );
    });
  });

  describe('getPipingDataById', () => {
    it('should load pipingData and piping nozzleLength', () => {
      const mockPipingData = [
        { position: 2, subPosition: 1, pipingClass: 'A', pipingSize: 10 },
        { position: 1, subPosition: 2, pipingClass: 'B', pipingSize: 12 },
      ];
      const mockDetail = { data: { nozzleLength: 100 } };

      mockCalculationService.getPipingDataById.and.returnValue(
        of({ data: mockPipingData }),
      );
      mockCalculationService.getPipingDetailByClassAndSize.and.returnValue(
        of(mockDetail),
      );

      component.getPipingDataById('studyId', 'txnId');

      expect(component.pipingData.length).toBe(2);
      expect(component.pipingData[0].nozzleLength).toBe(100);
    });

    it('should handle empty data response', () => {
      spyOn(console, 'warn');
      mockCalculationService.getPipingDataById.and.returnValue(
        of({ data: [] }),
      );

      component.getPipingDataById('studyId', 'txnId');

      expect(console.warn).toHaveBeenCalledWith('No data returned.');
    });

    it('should handle API error gracefully', () => {
      spyOn(console, 'error');
      mockCalculationService.getPipingDataById.and.returnValue(
        throwError(() => new Error('API error')),
      );

      component.getPipingDataById('studyId', 'txnId');

      expect(console.error).toHaveBeenCalledWith(
        'Failed to load piping calculation data:',
        jasmine.any(Error),
      );
    });
  });

  describe('getErosionCalculationData', () => {
    it('should set erosionData when API returns data', () => {
      const mockErosion = [{ some: 'data' }];
      mockCalculationService.getErosionCalculationDataById.and.returnValue(
        of({ data: mockErosion }),
      );

      component.getErosionCalculationData('studyId', 'txnId');

      expect(component.erosionData).toEqual(mockErosion);
    });

    it('should log warning when API returns empty data', () => {
      spyOn(console, 'warn');
      mockCalculationService.getErosionCalculationDataById.and.returnValue(
        of({ data: null }),
      );

      component.getErosionCalculationData('studyId', 'txnId');

      expect(console.warn).toHaveBeenCalledWith('No data returned.');
    });

    it('should log error on API failure', () => {
      spyOn(console, 'error');
      mockCalculationService.getErosionCalculationDataById.and.returnValue(
        throwError(() => new Error('API error')),
      );

      component.getErosionCalculationData('studyId', 'txnId');

      expect(console.error).toHaveBeenCalledWith(
        'Failed to load erosion calculation data:',
        jasmine.any(Error),
      );
    });
  });

  describe('getThermowell', () => {
    it('should set thermowellData when API returns valid object', () => {
      const mockThermowell = { length: 10 };
      mockCalculationService.getThermowellData.and.returnValue(
        of({ data: mockThermowell }),
      );

      component.getThermowell('studyId', 'txnId');

      expect(component.thermowellData).toEqual(mockThermowell);
    });

    it('should log warning when API returns empty object', () => {
      spyOn(console, 'warn');
      mockCalculationService.getThermowellData.and.returnValue(
        of({ data: {} }),
      );

      component.getThermowell('studyId', 'txnId');

      expect(console.warn).toHaveBeenCalledWith(
        'No data returned. Using default form values.',
      );
    });

    it('should log error on API failure', () => {
      spyOn(console, 'error');
      mockCalculationService.getThermowellData.and.returnValue(
        throwError(() => new Error('API error')),
      );

      component.getThermowell('studyId', 'txnId');

      expect(console.error).toHaveBeenCalledWith(
        'API Error:',
        jasmine.any(Error),
      );
    });
  });

  describe('getPipesimData', () => {
    it('should set pipesimData when API returns valid object', () => {
      const mockPipesim: PipesimData = {
        platformPressure: { name: 'Pressure', value: 100 },
        pipelineSection: [],
        riserDown: [],
        riserUp: [],
        otherData: { designPressure: 200 }
      };
  
      mockCalculationService.getPipesimById.and.returnValue(
        of({ data: mockPipesim }),
      );
  
      component.getPipesimData('studyId', 'txnId');
  
      expect(component.pipesimData).toEqual(mockPipesim);
    });
  
    it('should log warning when API returns empty object', () => {
      spyOn(console, 'warn');
      mockCalculationService.getPipesimById.and.returnValue(of({ data: {} }));
  
      component.getPipesimData('studyId', 'txnId');
  
      expect(console.warn).toHaveBeenCalledWith('No data returned.');
    });
  
    it('should log error on API failure', () => {
      spyOn(console, 'error');
      mockCalculationService.getPipesimById.and.returnValue(
        throwError(() => new Error('API error')),
      );
  
      component.getPipesimData('studyId', 'txnId');
  
      expect(console.error).toHaveBeenCalledWith(
        'API Error:',
        jasmine.any(Error),
      );
    });
  });
  

  describe('submitCalculation', () => {
    beforeEach(() => {
      // Reset study and transaction to valid objects
      component.study = { data: { studyId: 'study1' } };
      component.transactionId = { data: { transactionId: 'txn1' } };
      spyOn(component.nextStep, 'emit');
    });

    it('should call alertService.error if studyId or transactionId is missing', async () => {
      component.study = {} as any; // missing studyId
      component.transactionId = {} as any; // missing transactionId

      await component.submitCalculation();

      expect(alertServiceSpy.error).toHaveBeenCalledWith(
        'Validation Error',
        'Study ID and Transaction ID are required for submission.',
        true,
        5000,
      );

      // Service should not be called
      expect(mockCalculationService.submitCalculation).not.toHaveBeenCalled();
      expect(component.nextStep.emit).not.toHaveBeenCalled();
    });

    it('should call submitCalculation on service and show success alert', async () => {
      // Mock service to return a resolved promise
      mockCalculationService.submitCalculation.and.returnValue(
        of({}), // Return an Observable that emits an empty object and completes
      );

      await component.submitCalculation();

      expect(mockCalculationService.submitCalculation).toHaveBeenCalledWith({
        studyId: 'study1',
        transactionId: 'txn1',
      });

      expect(alertServiceSpy.success).toHaveBeenCalledWith(
        AlertMessageConstants.REVIEW_SUCCESS_TITLE,
        AlertMessageConstants.REVIEW_SUCCESS_TEXT,
        true,
        5000,
      );

      expect(component.nextStep.emit).toHaveBeenCalled();
    });

    it('should show error alert if submission fails', async () => {
      // Mock service to return a rejected promise
      mockCalculationService.submitCalculation.and.returnValue(
        throwError(() => new Error('API failed')),
      );
      await component.submitCalculation();

      expect(alertServiceSpy.error).toHaveBeenCalledWith(
        AlertMessageConstants.REVIEW_FAILED_TITLE,
        AlertMessageConstants.REVIEW_FAILED_TEXT,
        true,
        5000,
      );

      // nextStep should NOT be emitted
      expect(component.nextStep.emit).not.toHaveBeenCalled();
    });
  });
  
});
