import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendationSummaryComponent } from './recommendation-summary.component';
import { UserNameService } from '../../../../../../shared/services/user-name.service';
import { SimpleChange } from '@angular/core';
import { mappingWakeFrequency, titleSummary, wakeFrequencyType } from '../../../../../../core/enums/calculation.enum';

describe('RecommendationSummaryComponent', () => {
  let component: RecommendationSummaryComponent;
  let fixture: ComponentFixture<RecommendationSummaryComponent>;
  let userNameServiceSpy: jasmine.SpyObj<UserNameService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserNameService', [
      'formatOneDecimalIfNeeded',
    ]);

    await TestBed.configureTestingModule({
      imports: [RecommendationSummaryComponent],
      providers: [{ provide: UserNameService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendationSummaryComponent);
    component = fixture.componentInstance;
    userNameServiceSpy = TestBed.inject(
      UserNameService,
    ) as jasmine.SpyObj<UserNameService>;

  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      spyOn(component as any, 'mappingTopSide');
      spyOn(component as any, 'mappingPipeLine');
      spyOn(component as any, 'setTextDefault');
    });

    it('should call mappingTopSide when dataTopSide changes', () => {
      const changes = {
        dataTopSide: new SimpleChange(null, { data: [] }, true),
      };
      component.ngOnChanges(changes);

      expect(component['mappingTopSide']).toHaveBeenCalled();
      expect(component['setTextDefault']).toHaveBeenCalled();
    });

    it('should call mappingPipeLine when dataPipeLine changes', () => {
      const changes = {
        dataPipeLine: new SimpleChange(null, { data: [] }, true),
      };
      component.ngOnChanges(changes);

      expect(component['mappingPipeLine']).toHaveBeenCalled();
      expect(component['setTextDefault']).toHaveBeenCalled();
    });

    it('should always call setTextDefault even if no relevant changes', () => {
      const changes = {};
      component.ngOnChanges(changes);

      expect(component['setTextDefault']).toHaveBeenCalled();
    });
  });

  describe('mappingTopSide', () => {
    beforeEach(() => {
      spyOn(component as any, 'mappingOverView').and.callFake(
        (item: any) => item,
      );
    });

    it('should map dataTopSide and calculate success/failed counts correctly', () => {
      component.dataTopSide = {
        data: [
          { success: true, failed: false },
          { success: false, failed: true },
          { success: true, failed: false },
        ],
      };

      component.mappingTopSide();

      expect(component.topSideDetails).toEqual(component.dataTopSide.data);
      expect(component.topSideData.topside.title).toBe('Topside Verification');
      expect(component.topSideData.topside.sumResult.success).toBe(2);
      expect(component.topSideData.topside.sumResult.failed).toBe(1);
      expect(component.topSideData.topside.sumResult.status).toBeFalse();
    });
  });

  describe('mappingPipeLine', () => {
    beforeEach(() => {
      spyOn(component as any, 'mappingOverViewPipeLine').and.returnValue([
        { success: true },
        { success: false },
      ]);
    });

    it('should map pipeline data correctly', () => {
      component.mappingPipeLine();

      expect(component.pipeLineData.pipeLine.title).toBe(
        'Pipeline Verification',
      );
      expect(component.pipeLineData.pipeLine.results.length).toBe(2);
      expect(component.pipeLineDetails.length).toBe(2);
    });

    it('should set empty array if mappingOverViewPipeLine returns empty', () => {
      (component as any).mappingOverViewPipeLine.and.returnValue([]);

      component.mappingPipeLine();

      expect(component.pipeLineData.pipeLine.results).toEqual([]);
      expect(component.pipeLineDetails).toEqual([]);
    });
  });

  describe('setTextDefault', () => {
    beforeEach(() => {
      spyOn(component as any, 'hasValue').and.callFake((val: any) => !!val);
    });

    it('should set text and titles when dataTopSide has value', () => {
      (component as any).hasValue.and.callFake(
        (val: any) => val === component.dataTopSide,
      );
    
      component.dataTopSide = { mock: true };
      component.topSideData = { 
        topside: { 
          title: 'Topside Verification', 
          results: [{ failed: 0 }] 
        } 
      };
    
      component.setTextDefault();
    
      expect(component.verificationText).toBe('Topside Verification');
      expect(component.title).toBe('Position 1 Production Manifold');
      expect(component.mainTitle).toBe('');
      expect(component.type).toBe('default');
      expect(component.status).toBe('TRUE'); // ✅ เพราะ failed = 0
    });
    
    it('should set text and titles when dataPipeLine has value and dataTopSide is empty', () => {
      (component as any).hasValue.and.callFake(
        (val: any) => val === component.dataPipeLine,
      );
      component.dataTopSide = null;
      component.dataPipeLine = { mock: true };
      component.pipeLineData = { pipeLine: { title: 'Pipeline Verification' } };

      component.setTextDefault();

      expect(component.verificationText).toBe('Pipeline Verification');
      expect(component.title).toBe('Position 4');
      expect(component.mainTitle).toBe('Position 4');
      expect(component.type).toBe('default');
    });

    it('should reset text and titles when no dataTopSide or dataPipeLine has value', () => {
      (component as any).hasValue.and.returnValue(false);
      component.dataTopSide = null;
      component.dataPipeLine = null;

      component.setTextDefault();

      expect(component.verificationText).toBe('');
      expect(component.title).toBe('');
      expect(component.mainTitle).toBe('');
      expect(component.type).toBe('empty');
    });
  });

  describe('hasValue', () => {
    it('should return false when data is null', () => {
      const result = component.hasValue(null);
      expect(result).toBeFalse();
    });

    it('should return false when data is undefined', () => {
      const result = component.hasValue(undefined);
      expect(result).toBeFalse();
    });

    it('should return false when data is an empty array', () => {
      const result = component.hasValue([]);
      expect(result).toBeFalse();
    });

    it('should return true when data is a non-empty array', () => {
      const result = component.hasValue([1, 2, 3]);
      expect(result).toBeTrue();
    });

    it('should return false when data is an empty object', () => {
      const result = component.hasValue({});
      expect(result).toBeFalse();
    });

    it('should return true when data is a non-empty object', () => {
      const result = component.hasValue({ key: 'value' });
      expect(result).toBeTrue();
    });

    it('should return true when data is a primitive value (string)', () => {
      const result = component.hasValue('hello');
      expect(result).toBeTrue();
    });

    it('should return true when data is a primitive value (number)', () => {
      const result = component.hasValue(42);
      expect(result).toBeTrue();
    });
  });

  describe('mappingTitle', () => {
    it('should return correct title from titleSummary if exists', () => {
      const testKey = '1-1';
      (titleSummary as any)[testKey] = 'Test Title';

      const result = component.mappingTitle(1, 1);

      expect(result).toBe('Test Title');
    });

    it('should return empty string if titleSummary has no entry', () => {
      const result = component.mappingTitle(999, 999);
      expect(result).toBe('');
    });
  });

  describe('mappingOverView', () => {
    it('should return overview data with correct counts', () => {
      const mockData = {
        position: 1,
        subPosition: 1,
        overview: { info: 'test' },
        lineSizing: { result: true, momentum: 5, resultMaxVelocity: true },
        fivLof: { result: false, value: 10 },
        fitForService: { result: true, maximumOperatingPressure: 100 },
        thermowell: [
          { compareFrequency: 5, thermowellResult: true, phaseType: 'A' },
        ],
      };

      userNameServiceSpy.formatOneDecimalIfNeeded.and.callFake(
        (value: number) => value,
      );

      const result = component.mappingOverView(mockData);

      expect(result.title).toBe(component.mappingTitle(1, 1));
      expect(result.overView).toEqual(mockData.overview);

      expect(result.details.length).toBeGreaterThan(0);

      const expectedSuccessCount = result.items.filter(
        (i) => i.status === 'TRUE',
      ).length;
      const expectedFailedCount = result.items.filter(
        (i) => i.status === 'FALSE',
      ).length;

      expect(result.success).toBe(expectedSuccessCount);
      expect(result.failed).toBe(expectedFailedCount);
    });

    it('should handle empty input gracefully', () => {
      const mockData = {
        position: 1,
        subPosition: 1,
      };

      const result = component.mappingOverView(mockData);

      expect(result).toBeTruthy();
      expect(result.details.length).toBeGreaterThanOrEqual(0);
      expect(result.items.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('mappingOverViewWakeFrequency', () => {
    it('should map correctly when thermowell exists', () => {
      userNameServiceSpy.formatOneDecimalIfNeeded.and.callFake((val) => val);

      const mockData = {
        thermowell: [
          { phaseType: wakeFrequencyType.GAS, compareFrequency: 10, thermowellResult: true },
          { phaseType: wakeFrequencyType.OIL, compareFrequency: 12, thermowellResult: false },
        ],
      };

      spyOn(component, 'findMaxFrequencyIndex').and.returnValue(1);

      const result = component.mappingOverViewWakeFrequency(mockData);

      expect(result).toEqual({
        verification: 'Frequency Criteria (Oil)',
        value: 12,
        status: 'FALSE',
        unit: '',
      });

      expect(component.findMaxFrequencyIndex).toHaveBeenCalledWith(
        mockData.thermowell,
      );
      expect(userNameServiceSpy.formatOneDecimalIfNeeded).toHaveBeenCalledWith(
        12,
        1,
      );
    });

    it('should return empty array when thermowell does not exist', () => {
      const result = component.mappingOverViewWakeFrequency({});
      expect(result).toEqual([]);
    });
  });

  describe('displayWakeFrequency', () => {
    it('should return mapped value for GAS', () => {
      const result = component.displayWakeFrequency(wakeFrequencyType.GAS);
      expect(result).toBe(mappingWakeFrequency.gas);
    });
  
    it('should return mapped value for WATER', () => {
      const result = component.displayWakeFrequency(wakeFrequencyType.WATER);
      expect(result).toBe(mappingWakeFrequency.water);
    });
  
    it('should return mapped value for OIL', () => {
      const result = component.displayWakeFrequency(wakeFrequencyType.OIL);
      expect(result).toBe(mappingWakeFrequency.oil);
    });
  
    it('should return empty string for invalid key', () => {
      const result = component.displayWakeFrequency('invalid' as any);
      expect(result).toBe('');
    });
  });
  
  
  describe('mappingOverViewPipeLine', () => {
    beforeEach(() => {
      component.dataPipeLine = {
        erosionalVelocity: { result: 'TRUE', data: [1, 2, 3] },
        temperatureProfile: { result: 'FALSE', data: [10, 20] },
        pressureProfile: { result: 'TRUE', data: [5, 15] },
        sourServiceProfile: { result: 'TRUE', data: [100, 200] },
      };

      spyOn(component, 'mappingDataForPipeLine').and.callFake((arr: any[] = []) => arr.length ? arr[arr.length - 1] : 0);
      spyOn(component, 'mappingDataForErosionalVelocity').and.callFake((arr: any[] = []) => arr.length ? arr[arr.length - 1] : 0);
    });
    it('should map correctly when dataPipeLine exists', () => {
      const result = component.mappingOverViewPipeLine();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Position 4');

      const trueCount = result[0].items.filter(i => i.status === 'TRUE').length;
      const falseCount = result[0].items.filter(i => i.status === 'FALSE').length;

      expect(result[0].success).toBe(trueCount);
      expect(result[0].failed).toBe(falseCount);
    });

    it('should return empty array when dataPipeLine is not defined', () => {
      component.dataPipeLine = undefined;
      const result = component.mappingOverViewPipeLine();
      expect(result).toEqual([]);
    });
  });

  describe('mappingOverViewErosinalVelocity', () => {
    beforeEach(() => {
      spyOn(component, 'mappingDataForErosionalVelocity').and.callFake((arr: number[]) => arr[arr.length - 1]);
    });
    it('should return mapped object when erosionalVelocity exists', () => {
      const mockData = {
        erosionalVelocity: {
          result: true,
          data: [0, 5, 10]
        }
      };
      const result = component.mappingOverViewErosinalVelocity(mockData);

      expect(result).toEqual({
        verification: 'Erosional Velocity Ratio',
        value: 10,
        status: 'TRUE',
        unit: '',
      });
    });

    it('should return empty array when erosionalVelocity does not exist', () => {
      const mockData = {};
      const result = component.mappingOverViewErosinalVelocity(mockData);
      expect(result).toEqual([]);
    });
  });


  describe('mappingOverViewSourServiceProfile', () => {
    it('should return mapped object when sourServiceProfile exists', () => {
      const mockData = { sourServiceProfile: { result: false } };
      const result = component.mappingOverViewSourServiceProfile(mockData);

      expect(result).toEqual({
        verification: 'Sour Service Region and Design',
        value: undefined,
        status: "FALSE",
        unit: '',
      });
    });

    it('should return empty array when sourServiceProfile does not exist', () => {
      const mockData = {};
      const result = component.mappingOverViewSourServiceProfile(mockData);
      expect(result).toEqual([]);
    });
  });

  describe('mappingErosinalVelocity', () => {
    it('should return mapped object when erosionalVelocity exists', () => {
      const mockData = { erosionalVelocity: { result: true, data: [1, 2, 3] } };

      spyOn(component, 'mappingDataForErosionalVelocity').and.returnValue(3);

      const result = component.mappingErosinalVelocity(mockData);

      expect(result).toEqual({
        mainTitle: 'Position 4',
        title: 'Erosional Velocity Ratio',
        type: 'erosianol_velocity',
        success: 1,
        failed: 0,
        status: 'TRUE',
        details: [1, 2, 3],
        result: 3
      });
    });

    it('should return empty array when erosionalVelocity does not exist', () => {
      const mockData = {};
      const result = component.mappingErosinalVelocity(mockData);
      expect(result).toEqual([]);
    });
  });

  // describe('mappingTemperatureProfile', () => {
  //   it('should return mapped object when temperatureProfile exists', () => {
  //     const mockData = {
  //       temperatureProfile: { result: false, data: [10, 20], criteria: [5, 15] },
  //     };

  //     spyOn(component, 'mappingDataForPipeLine').and.callFake((arr: number[]) => {
  //       return arr[arr.length - 1];
  //     });

  //     const result = component.mappingTemperatureProfile(mockData);

  //     expect(result).toEqual({
  //       mainTitle: 'Position 4',
  //       title: 'Temperature Profile',
  //       type: 'temperature_profile',
  //       success: 0,
  //       failed: 1,
  //       status: 'FALSE',
  //       details: [10, 20],
  //       result: 20,
  //       resultCriteria: 15,
  //       criteria: [5, 15],
  //     });
  //   });

  //   it('should return empty array when temperatureProfile does not exist', () => {
  //     const mockData = {};
  //     const result = component.mappingTemperatureProfile(mockData);
  //     expect(result).toEqual([]);
  //   });
  // });

  // describe('mappingPressureProfile', () => {
  //   it('should return mapped object when sourServiceProfile exists and result is true', () => {
  //     const mockData = {
  //       sourServiceProfile: {
  //         result: 'TRUE',
  //         data: [100, 200],
  //         criteria: ['A', 'B'],
  //         input: { ph: 7, temp: 25 }
  //       }
  //     };

  //     const result = component.mappingSourServiceProfile(mockData);

  //     expect(result).toEqual({
  //       mainTitle: 'Position 4',
  //       title: 'Sour Service Region and Design',
  //       type: 'sour_service',
  //       success: 1,
  //       failed: 0,
  //       status: 'TRUE',
  //       details: [100, 200],
  //       criteria: ['A', 'B'],
  //       input: { ph: 7, temp: 25 }
  //     });
  //   });

  //   it('should return mapped object when sourServiceProfile exists and result is false', () => {
  //     const mockData = {
  //       sourServiceProfile: {
  //         result: 'FALSE',
  //         data: [],
  //         criteria: [],
  //         input: {}
  //       }
  //     };

  //     const result = component.mappingSourServiceProfile(mockData);

  //     expect(result).toEqual({
  //       mainTitle: 'Position 4',
  //       title: 'Sour Service Region and Design',
  //       type: 'sour_service',
  //       success: 0,
  //       failed: 1,
  //       status: 'FALSE',
  //       details: [],
  //       criteria: [],
  //       input: {}
  //     });
  //   });

  //   it('should return empty array when pressureProfile does not exist', () => {
  //     const mockData = {};
  //     const result = component.mappingPressureProfile(mockData);
  //     expect(result).toEqual([]);
  //   });
  // });

  // describe('mappingSourServiceProfile', () => {
  //   it('should return mapped object when sourServiceProfile exists', () => {
  //     const mockData = {
  //       sourServiceProfile: { result: false, data: [100, 200] },
  //     };
  //     const result = component.mappingSourServiceProfile(mockData);

  //     expect(result).toEqual({
  //       mainTitle: 'Position 4',
  //       title: 'Sour Service Region and Design',
  //       type: 'sour_service',
  //       success: 0,
  //       failed: 1,
  //       status: 'FALSE',
  //       details: [100, 200],
  //       criteria: undefined,
  //       input: undefined
  //     });
  //   });

  //   it('should return empty array when sourServiceProfile does not exist', () => {
  //     const mockData = {};
  //     const result = component.mappingSourServiceProfile(mockData);
  //     expect(result).toEqual([]);
  //   });
  // });

  describe('findMaxFrequencyIndex', () => {
    it('should return the index of the object with the highest compareFrequency', () => {
      const data = [
        { compareFrequency: 10 },
        { compareFrequency: 30 },
        { compareFrequency: 20 },
      ];
      const result = component.findMaxFrequencyIndex(data);
      expect(result).toBe(1);
    });

    it('should return 0 if first element is the highest', () => {
      const data = [
        { compareFrequency: 50 },
        { compareFrequency: 30 },
        { compareFrequency: 20 },
      ];
      const result = component.findMaxFrequencyIndex(data);
      expect(result).toBe(0);
    });

    it('should handle an array with a single element', () => {
      const data = [{ compareFrequency: 100 }];
      const result = component.findMaxFrequencyIndex(data);
      expect(result).toBe(0);
    });
  });

  describe('displayDecimal', () => {
    it('should call userNameService.formatOneDecimalIfNeeded with correct parameters', () => {
      userNameServiceSpy.formatOneDecimalIfNeeded.and.returnValue(5.5);
      const result = component.displayDecimal(5.55, 1);

      expect(
        userNameServiceSpy.formatOneDecimalIfNeeded,
      ).toHaveBeenCalledOnceWith(5.55, 1);
      expect(result).toBe(5.5);
    });
  });
});
