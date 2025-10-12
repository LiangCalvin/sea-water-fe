import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourServiceComponent } from './sour-service.component';
import { Chart } from 'chart.js';
import { mapRegion, region } from '../../../../../../core/enums/calculation.enum';

describe('SourServiceComponent', () => {
  let component: SourServiceComponent;
  let fixture: ComponentFixture<SourServiceComponent>;
  let canvasMock: HTMLCanvasElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourServiceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SourServiceComponent);
    component = fixture.componentInstance;
    canvasMock = document.createElement('canvas');
    component.chartCanvas = { nativeElement: canvasMock } as any;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should call createChart if chartCanvas exists', () => {
      spyOn(component, 'createChart');
      component.ngAfterViewInit();
      expect(component.createChart).toHaveBeenCalled();
    });

    it('should not call createChart if chartCanvas does not exist', () => {
      component.chartCanvas = undefined;
      spyOn(component, 'createChart');
      component.ngAfterViewInit();
      expect(component.createChart).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should call mappingDataChart when details input changes', () => {
      spyOn(component, 'mappingDataChart');
      component.ngOnChanges({
        details: {
          currentValue: [{ items: [] }],
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      } as any);
      expect(component.mappingDataChart).toHaveBeenCalled();
    });

    it('should not call mappingDataChart if other inputs change', () => {
      spyOn(component, 'mappingDataChart');
      component.ngOnChanges({
        title: {
          currentValue: 'new title',
          previousValue: 'old title',
          firstChange: false,
          isFirstChange: () => false,
        },
      } as any);
      expect(component.mappingDataChart).not.toHaveBeenCalled();
    });
  });

  describe('mappingDataChart', () => {
    beforeEach(() => {
      component.scatterChartData = { datasets: [{ data: [] }] };
    });

    it('should set x = 0 when xCoordinate < 0.001', () => {
      component.details = [
        {
          items: [
            {
              type: 'sour_service',
              details: { xCoordinate: 0.0005, yCoordinate: 10 }
            }
          ]
        }
      ];

      component.mappingDataChart();

      expect(component.scatterChartData.datasets[0].data[0]).toEqual({
        x: 0,
        y: 10
      });
    });

    it('should set x = xCoordinate when xCoordinate >= 0.001', () => {
      component.details = [
        {
          items: [
            {
              type: 'sour_service',
              details: { xCoordinate: 1.23, yCoordinate: 20 }
            }
          ]
        }
      ];

      component.mappingDataChart();

      expect(component.scatterChartData.datasets[0].data[0]).toEqual({
        x: 1.23,
        y: 20
      });
    });

    it('should throw if sour_service item is missing', () => {
      component.details = [
        {
          items: [
            { type: 'other_service', details: { xCoordinate: 5, yCoordinate: 50 } }
          ]
        }
      ];

      expect(() => component.mappingDataChart()).toThrowError(TypeError);
    });
  });

  describe('createChart', () => {
    it('should initialize Chart instance', () => {
      component.createChart();
      expect(component.chart).toBeDefined();
      expect(component.chart instanceof Chart).toBeTrue();
    });
  });

  describe('highlightZone', () => {
    beforeEach(() => {
      component.bgZone0 = component.bgZone1 = component.bgZone2 = component.bgZone3 = '';
      component.bgShadowBlurZone0 = component.bgShadowBlurZone1 = component.bgShadowBlurZone2 = component.bgShadowBlurZone3 = 0;
      component.bgShadowColorZone0 = component.bgShadowColorZone1 = component.bgShadowColorZone2 = component.bgShadowColorZone3 = '';
      component.shadowOffsetXZone0 = component.shadowOffsetXZone1 = component.shadowOffsetXZone2 = component.shadowOffsetXZone3 = 0;
      component.shadowOffsetYZone0 = component.shadowOffsetYZone1 = component.shadowOffsetYZone2 = component.shadowOffsetYZone3 = 0;
    });

    it('should highlight Zone0 when displayRegion returns REGION_NAME_0', () => {
      spyOn(component, 'displayRegion').and.returnValue(region.REGION_NAME_0);

      component.highlightZone();

      expect(component.bgZone0).toBe('rgba(173, 216, 230, 2)');
      expect(component.bgShadowBlurZone0).toBe(8);
      expect(component.bgShadowColorZone0).toBe('rgba(0,0,0,0.5)');
      expect(component.shadowOffsetXZone0).toBe(2);
      expect(component.shadowOffsetYZone0).toBe(2);
    });

    it('should highlight Zone1 when displayRegion returns REGION_NAME_1', () => {
      spyOn(component, 'displayRegion').and.returnValue(region.REGION_NAME_1);

      component.highlightZone();

      expect(component.bgZone1).toBe('rgba(144, 238, 144, 2)');
      expect(component.bgShadowBlurZone1).toBe(8);
      expect(component.bgShadowColorZone1).toBe('rgba(0,0,0,0.5)');
      expect(component.shadowOffsetXZone1).toBe(2);
      expect(component.shadowOffsetYZone1).toBe(2);
    });

    it('should highlight Zone2 when displayRegion returns REGION_NAME_2', () => {
      spyOn(component, 'displayRegion').and.returnValue(region.REGION_NAME_2);

      component.highlightZone();

      expect(component.bgZone2).toBe('rgba(255, 255, 153, 2)');
      expect(component.bgShadowBlurZone2).toBe(8);
      expect(component.bgShadowColorZone2).toBe('rgba(0,0,0,0.5)');
      expect(component.shadowOffsetXZone2).toBe(2);
      expect(component.shadowOffsetYZone2).toBe(2);
    });

    it('should highlight Zone3 when displayRegion returns REGION_NAME_3', () => {
      spyOn(component, 'displayRegion').and.returnValue(region.REGION_NAME_3);

      component.highlightZone();

      expect(component.bgZone3).toBe('rgba(255, 99, 132, 1)');
      expect(component.bgShadowBlurZone3).toBe(8);
      expect(component.bgShadowColorZone3).toBe('rgba(0,0,0,0.5)');
      expect(component.shadowOffsetXZone3).toBe(2);
      expect(component.shadowOffsetYZone3).toBe(2);
    });

    it('should not set any zone properties when displayRegion returns an unknown value', () => {
      spyOn(component, 'displayRegion').and.returnValue('UNKNOWN_REGION');

      component.highlightZone();

      expect(component.bgZone0).toBe('');
      expect(component.bgZone1).toBe('');
      expect(component.bgZone2).toBe('');
      expect(component.bgZone3).toBe('');
    });
  });

  describe('displayRegion', () => {
    it('should return mapped region when key exists in mapRegion', () => {
      const mockKey = 'REGION_KEY';
      const mockValue = 'MappedRegion';
      (mapRegion as any)[mockKey] = mockValue;

      const result = component.displayRegion(mockKey);

      expect(result).toBe(mockValue);
    });

    it('should return empty string when key does not exist in mapRegion', () => {
      const result = component.displayRegion('UNKNOWN_KEY');

      expect(result).toBe('');
    });

    it('should return empty string when input is undefined', () => {
      const result = component.displayRegion(undefined as unknown as string);

      expect(result).toBe('');
    });
  });

  describe('createChart', () => {
    beforeEach(() => {
      // Mock canvas context
      const ctxMock = {
        save: jasmine.createSpy('save'),
        restore: jasmine.createSpy('restore'),
        fill: jasmine.createSpy('fill'),
        beginPath: jasmine.createSpy('beginPath'),
        moveTo: jasmine.createSpy('moveTo'),
        lineTo: jasmine.createSpy('lineTo'),
        closePath: jasmine.createSpy('closePath'),
        fillText: jasmine.createSpy('fillText'),
        shadowColor: '',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        fillStyle: '',
        font: ''
      } as any;

      spyOn(component.chartCanvas!.nativeElement, 'getContext').and.returnValue(ctxMock);
    });

    it('should initialize Chart instance', () => {
      component.createChart();
      expect(component.chart).toBeDefined();
      expect(component.chart instanceof Chart).toBeTrue();
    });

    it('should include backgroundZone and zoneLabel plugins', () => {
      component.createChart();
      const pluginIds = (component.chart as any).config.plugins.map((p: any) => p.id);
      expect(pluginIds).toContain('backgroundZone');
      expect(pluginIds).toContain('zoneLabel');
    });

    it('should call canvas context methods when plugins run', () => {
      component.createChart();
      const plugins = (component.chart as any).config.plugins;

      // Mock a fake chart object to simulate beforeDraw
      const fakeChart = {
        ctx: component.chartCanvas!.nativeElement.getContext('2d'),
        scales: {
          x: { getPixelForValue: () => 10, min: 0 },
          y: { getPixelForValue: () => 20 }
        }
      } as any;

      // Run both plugins manually
      plugins.forEach((p: any) => p.beforeDraw(fakeChart));

      const ctx = fakeChart.ctx;
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('Zone 0', jasmine.any(Number), jasmine.any(Number));
    });
  });
});
