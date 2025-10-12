import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExcelTableComponent } from './excel-table.component';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RangeSelectionTableDirective } from '../../directives/range-selection-table.directive';
import { ExcelTableService } from '../../services/excel-table.service';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ElementRef } from '@angular/core';

describe('ExcelTableComponent', () => {
  let component: ExcelTableComponent;
  let fixture: ComponentFixture<ExcelTableComponent>;
  let mockService: jasmine.SpyObj<ExcelTableService>;
  let clipboardSpy: jasmine.Spy;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ExcelTableService', ['setTableValue']);

    await TestBed.configureTestingModule({
      imports: [
        ExcelTableComponent,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
      ],
      providers: [
        FormBuilder,
        { provide: ExcelTableService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExcelTableComponent);
    component = fixture.componentInstance;

    Object.defineProperty(component, 'excelTable', {
      value: {
        nativeElement: {
          getAttribute: (attr: string) => {
            if (attr === 'data-start-row') return '1';
            if (attr === 'data-end-row') return '2';
            if (attr === 'data-start-column') return '1';
            if (attr === 'data-end-column') return '2';
            return null;
          },
        },
      },
    });
    if (!(navigator.clipboard as any)) {
      (navigator as any).clipboard = { writeText: () => Promise.resolve() };
    }
    if (!(navigator.clipboard.writeText as any).and) {
      clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(
        Promise.resolve(),
      );
    }
  });

  describe('set e2In', () => {
    beforeEach(() => {
      component['_e2In'] = [
        { date: '2025-01-01', value: '1.00', isUpdate: false },
      ];
      spyOn<any>(component, 'formatValue').and.callFake((v: any) => v);
    });

    it('should update matching row', () => {
      component.e2In = [{ date: '2025-01-01', value: '2.50' }];
      expect(component['_e2In'][0].value).toBe('2.50');
      expect(component['_e2In'][0].isUpdate).toBeTrue();
    });

    it('should skip if no date match', () => {
      component.e2In = [{ date: '2025-01-02', value: '5.00' }];
      expect(component['_e2In'][0].value).toBe('1.00');
    });
  });

  describe('get formGroup', () => {
    it('should return _e2In when accessing e2In', () => {
      const mockE2In = [
        { date: '2025-08-25', value: 123, isUpdate: false },
        { date: '2025-08-26', value: 456, isUpdate: true },
      ];

      // inject directly into private field
      (component as any)._e2In = mockE2In;

      expect(component.e2In).toEqual(mockE2In);
    });

    it('should return _formGroup when accessing formGroup', () => {
      const mockFormGroup = new FormBuilder().group({
        testField: ['test-value'],
      });

      // inject directly into private field
      (component as any)._formGroup = mockFormGroup;

      expect(component.formGroup).toBe(mockFormGroup);
      expect(component.formGroup.get('testField')?.value).toBe('test-value');
    });
  });

  describe('set formGroup', () => {
    it('should apply Validators.required when column is present', () => {
      const mockData = [
        {
          columns: [
            {
              columnName: 'Pressure',
              unit: 'psi',
              value: 100,
              defaultValueID: 1,
            },
          ],
        },
      ];

      spyOn(component as any, 'findColumnNameList').and.callFake(() => {
        (component as any).columnNameList = ['Pressure'];
        (component as any).unitsList = ['psi'];
      });

      component.formGroup = mockData;

      const rows = component.formGroup.get('rows') as FormArray;
      const firstCol = (rows.at(0).get('columns') as FormArray).at(
        0,
      ) as FormGroup;

      expect(firstCol.get('value')?.validator).toBeTruthy();
    });
  });

  describe('findColumnNameList', () => {
    it('should update columnNameList when filteredCols is longer', () => {
      const data = [
        {
          columns: [
            { columnName: 'Pressure', defaultValueID: 1 },
            { columnName: 'Temperature', defaultValueID: 2 },
          ],
        },
      ];

      (component as any).columnNameList = []; // initially empty

      (component as any).findColumnNameList(data);

      expect((component as any).columnNameList).toEqual([
        'Pressure',
        'Temperature',
      ]);
    });

    it('should not update columnNameList if filtered list is shorter', () => {
      (component as any).columnNameList = ['Pressure', 'Temperature'];

      const data = [
        {
          columns: [{ columnName: 'Pressure', defaultValueID: 1 }], // shorter
        },
      ];

      (component as any).findColumnNameList(data);

      // should keep the longer original list
      expect((component as any).columnNameList).toEqual([
        'Pressure',
        'Temperature',
      ]);
    });

    it('should ignore columns with null defaultValueID', () => {
      const data = [
        {
          columns: [
            { columnName: 'Pressure', defaultValueID: null },
            { columnName: 'Temperature', defaultValueID: 2 },
          ],
        },
      ];

      (component as any).columnNameList = [];

      (component as any).findColumnNameList(data);

      expect((component as any).columnNameList).toEqual(['Temperature']);
    });

    it('should keep columnNameList empty if no valid columns exist', () => {
      const data = [
        {
          columns: [
            { columnName: 'Pressure', defaultValueID: null },
            { columnName: 'Temperature', defaultValueID: null },
          ],
        },
      ];

      (component as any).columnNameList = [];

      (component as any).findColumnNameList(data);

      expect((component as any).columnNameList).toEqual([]);
    });

    it('should pick the longest filteredCols list across multiple rows', () => {
      const data = [
        {
          columns: [{ columnName: 'Pressure', defaultValueID: 1 }],
        },
        {
          columns: [
            { columnName: 'Temp', defaultValueID: 2 },
            { columnName: 'Flow', defaultValueID: 3 },
          ],
        },
      ];

      (component as any).columnNameList = [];

      (component as any).findColumnNameList(data);

      expect((component as any).columnNameList).toEqual(['Temp', 'Flow']);
    });
  });

  // describe('copyData', () => {
  //   it('should copy selected cell values to clipboard', () => {
  //     const inputData = [
  //       {
  //         columns: [
  //           { columnName: 'A', defaultValueID: 1, value: 11 },
  //           { columnName: 'B', defaultValueID: 2, value: 22 },
  //         ],
  //       },
  //     ];
  //     component.formGroup = inputData;

  //     (component as any).copyData({
  //       row: { startRow: 1, endRow: 1 },
  //       col: { startCol: 1, endCol: 2 },
  //     });

  //     expect(clipboardSpy).toHaveBeenCalledWith('11.00\t22.00');
  //   });
  // });

  describe('copyData', () => {
    it('should copy selected cell values to clipboard', () => {
      // Must match the setter structure: array of { columns: [...] }
      const inputData = [
        {
          columns: [
            { columnName: 'A', defaultValueID: 1, value: 11 },
            { columnName: 'B', defaultValueID: 2, value: 22 },
          ],
        },
      ];

      // Assign properly using setter
      component.formGroup = inputData;

      (component as any).copyData({
        row: { startRow: 1, endRow: 1 },
        col: { startCol: 1, endCol: 2 },
      });

      // The spy should now be defined and called
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '11.00\t22.00',
      );
    });
  });

  describe('parseData', () => {
    it('should skip parsing when readonly is true', () => {
      component.readonly = true;
      const data = {
        clipboardData: { getData: () => '1\t2\n3\t4' } as any,
        row: { startRow: 1, endRow: 2 },
        col: { startCol: 1, endCol: 2 },
      };
      spyOn<any>(component, 'updateTableCellOnParseValue');

      (component as any).parseData(data);

      expect(component['updateTableCellOnParseValue']).not.toHaveBeenCalled();
    });
  });

  describe('ExcelTableComponent private method: formatValue', () => {
    it('should format numeric string with commas and 2 decimals', () => {
      const input = '1234567.891';
      const result = (component as any).formatValue(input);
      expect(result).toBe('1,234,567.89');
    });

    it('should format number with 2 decimals', () => {
      const input = 1234.5;
      const result = (component as any).formatValue(input);
      expect(result).toBe('1,234.50');
    });

    it('should return "0.00" for 0', () => {
      const input = 0;
      const result = (component as any).formatValue(input);
      expect(result).toBe('0.00');
    });

    it('should return original string if not a number', () => {
      const input = 'abc';
      const result = (component as any).formatValue(input);
      expect(result).toBe('abc');
    });

    it('should remove commas before formatting', () => {
      const input = '1,234,567.89';
      const result = (component as any).formatValue(input);
      expect(result).toBe('1,234,567.89'); // already formatted correctly
    });

    it('should return empty string for null', () => {
      const input = null;
      const result = (component as any).formatValue(input);
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const input = undefined;
      const result = (component as any).formatValue(input);
      expect(result).toBe('');
    });
  });
});
