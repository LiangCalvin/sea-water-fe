import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressureProfileComponent } from './pressure-profile.component';
import { ElementRef } from '@angular/core';

describe('PressureProfileComponent', () => {
  let component: PressureProfileComponent;
  let fixture: ComponentFixture<PressureProfileComponent>;

  const mockDetails = [
    {
      items: [
        {
          type: 'pressure',
          details: [
            { name: 'Riser Up', data: [{ xCoordinate: 1000, yCoordinate: 50 }] },
            { name: 'Riser Down', data: [{ xCoordinate: 2000, yCoordinate: 100 }] },
            { name: 'Pipeline Hot', data: [{ xCoordinate: 3000, yCoordinate: 150 }] },
            { name: 'Pipeline Cold 1', data: [{ xCoordinate: 4000, yCoordinate: 200 }] },
            { name: 'Pipeline Cold 2', data: [{ xCoordinate: 5000, yCoordinate: 250 }] },
          ],
          criteria: [
            { name: 'U/S Platform Pressure', value: 60 },
            { name: 'Pipeline Design Pressure', value: 120 },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    (window as any).Chart = class {
      destroy() {
        // no-op: mock Chart.js methods for testing
      }
      update() {
        // no-op: mock Chart.js methods for testing
      }
    };
    

    await TestBed.configureTestingModule({
      imports: [PressureProfileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PressureProfileComponent);
    component = fixture.componentInstance;

    component.chartCanvas = {
      nativeElement: document.createElement('canvas'),
    } as ElementRef<HTMLCanvasElement>;

    component.details = mockDetails;
    component.title = 'Test Pressure Profile';
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
      component.details = mockDetails;
      const mappingSpy = spyOn(component, 'mappingDataChart').and.callThrough();
      const changes = {
        details: {
          currentValue: mockDetails,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        }
      };
      component.ngOnChanges(changes);
      expect(mappingSpy).toHaveBeenCalled();
    });
  });

describe('mappingDataChart & calChart', () => {
  beforeEach(() => {
    component.details = [
      {
        items: [
          {
            type: 'pressure',
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
              { name: 'U/S Platform Pressure', value: 30 },
              { name: 'Pipeline Design Pressure', value: 50 }
            ]
          }
        ]
      }
    ];
  });

  it('should set pipeLineLength, backPressure, chartX, chartY correctly', () => {
    spyOn(component as any, 'createChart').and.stub();

    component.mappingDataChart();

    expect(component.pipeLineLength.length).toBe(2);
    expect(component.pipeLineLength[0].data).toEqual({ x: 2000, y: 20 });
    expect(component.pipeLineLength[1].data).toEqual({ x: 1500, y: 15 });

    expect(component.backPressure.length).toBe(5);
    expect(component.backPressure[4]).toEqual({ x: 1500, y: 15 });

    expect(component.chartX).toBeGreaterThan(0);
    expect(component.chartY).toBeGreaterThan(0);

    expect(component.chartX).toBe(4000); 
    expect(component.chartY).toBe(70);  
    
    expect(component.criteriaUs[1].x).toBe(component.chartX);
    expect(component.criteriaPipeLine[1].x).toBe(component.chartX);
  });
});

});
