import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemperatureProfileComponent } from './temperature-profile.component';
import { ElementRef } from '@angular/core';

describe('TemperatureProfileComponent', () => {
  let component: TemperatureProfileComponent;
  let fixture: ComponentFixture<TemperatureProfileComponent>;

  const mockDetails = [
    {
      items: [
        {
          type: 'temperature_profile',
          details: [
            {
              name: 'Riser Up',
              data: [{ xCoordinate: 1000, yCoordinate: 50 }],
            },
            {
              name: 'Riser Down',
              data: [{ xCoordinate: 2000, yCoordinate: 100 }],
            },
            {
              name: 'Pipeline Hot',
              data: [{ xCoordinate: 3000, yCoordinate: 150 }],
            },
            {
              name: 'Pipeline Cold 1',
              data: [{ xCoordinate: 4000, yCoordinate: 200 }],
            },
            {
              name: 'Pipeline Cold 2',
              data: [{ xCoordinate: 5000, yCoordinate: 250 }],
            },
          ],
          criteria: [
            { data: [{ xCoordinate: 0, yCoordinate: 20 }] }
          ]
        },
      ],
    },
  ];

  beforeEach(async () => {
    (window as any).Chart = class {
      constructor(public ctx: HTMLCanvasElement | CanvasRenderingContext2D, public config: any) { }
      destroy() { }
      update() { }
    };


    await TestBed.configureTestingModule({
      imports: [TemperatureProfileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TemperatureProfileComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();

    component.chartCanvas = {
      nativeElement: document.createElement('canvas'),
    } as ElementRef<HTMLCanvasElement>;

    component.details = mockDetails;
    component.title = 'Test Temperature Profile';
    component.mappingDataChart();

  });

  describe('ngAfterViewInit', () => {
    it('should call createChart when chartCanvas exists', () => {
      const createChartSpy = spyOn(component, 'createChart').and.stub();

      component.ngAfterViewInit();

      expect(createChartSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should call mappingDataChart when details changes', () => {
      const mappingSpy = spyOn(component, 'mappingDataChart').and.callThrough();

      component.ngOnChanges({
        details: {
          currentValue: mockDetails,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(mappingSpy).toHaveBeenCalled();
    });
  });

  describe('TemperatureProfileComponent mappingDataChart', () => {
    beforeEach(() => {
      component.details = [
        {
          items: [
            {
              type: 'temperature_profile',
              details: [
                {
                  name: 'Pipe1',
                  data: [
                    { xCoordinate: 0, yCoordinate: 0 },
                    { xCoordinate: 1000, yCoordinate: 10 },
                    { xCoordinate: 2000, yCoordinate: 20 }
                  ]
                },
                {
                  name: 'Pipe2',
                  data: [
                    { xCoordinate: 0, yCoordinate: 5 },
                    { xCoordinate: 1500, yCoordinate: 15 }
                  ]
                }
              ],
              criteria: [
                {
                  data: [
                    { xCoordinate: 500, yCoordinate: 7 },
                    { xCoordinate: 2500, yCoordinate: 25 }
                  ]
                }
              ]
            }
          ]
        }
      ];
    });

    it('should map pipeLineLength, temperature, criteria, chartX, chartY correctly', () => {
      spyOn(component as any, 'createChart').and.stub();

      component.mappingDataChart();

      // pipeLineLength
      expect(component.pipeLineLength.length).toBe(2);
      expect(component.pipeLineLength[0].data).toEqual({ x: 2000, y: 20 });

      // temperature
      expect(component.temperature.length).toBe(5);
      expect(component.temperature[0]).toEqual({ x: 0, y: 0 });

      // criteria
      expect(component.criteria.length).toBe(2);
      expect(component.criteria[1]).toEqual({ x: 2500, y: 25 });

      // chartX / chartY
      const overAll = [...component.temperature, ...component.criteria];
      const maxX = Math.max(...overAll.map(p => p.x)); // 2500
      const maxY = Math.max(...overAll.map(p => p.y)); // 25
      const convertNumX = Math.floor(maxX / 1000) * 1000; // 2000
      const convertNumY = Math.floor(maxY / 10) * 10; // 20

      expect(component.chartX).toBe(convertNumX + 2000); // 4000
      expect(component.chartY).toBe(convertNumY + 20);   // 40
    });
  });

  describe('createChart', () => {
    it('should create chart instance', () => {
      component.createChart();
      expect(component.chart).toBeDefined();
      expect(component.chart.config.data.datasets.length).toBeGreaterThan(0);

      const datasetLabels = component.chart.config.data.datasets.map((d: any) => d.label);
      expect(datasetLabels).toContain('Temperature');
      expect(datasetLabels).toContain('Coating Design Temperature');
      expect(datasetLabels).toContain('Riser Down');
    });
  });

  describe('TemperatureProfileComponent - formatValue', () => {
    it('should format integer values without decimals', () => {
      const result = component.formatValue(1234);
      expect(result).toBe('1,234');
    });

    it('should format floating-point values with up to 2 decimals', () => {
      const result = component.formatValue(1234.5678);
      expect(result).toBe('1,234.57');
    });

    it('should format integer-like float as integer', () => {
      const result = component.formatValue(1000.000000001);
      expect(result).toBe('1,000');
    });

    it('should format value from object correctly', () => {
      const input = { value: 5678.9, verification: undefined };
      const result = component.formatValue(input);
      expect(result).toBe('5,678.9');
    });

    it('should ignore verification key and format default case', () => {
      const input = { value: 123, verification: 'something' };
      const result = component.formatValue(input);
      expect(result).toBe('123');
    });
  });
});
