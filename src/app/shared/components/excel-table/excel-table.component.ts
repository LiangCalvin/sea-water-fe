import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RangeSelectionTableDirective } from '../../directives/range-selection-table.directive';
import { ExcelTableService } from '../../services/excel-table.service';

@Component({
  selector: 'app-excel-table',
  standalone: true,
  imports: [
    CommonModule,
    NgStyle,
    FormsModule,
    ReactiveFormsModule,
    RangeSelectionTableDirective,
    NgClass
  ],
  templateUrl: './excel-table.component.html',
  styleUrl: './excel-table.component.scss'
})


export class ExcelTableComponent {
  @ViewChild('excelTable', { static: true }) private readonly excelTable!: ElementRef;
  @Output() formValueChanged = new EventEmitter<any>();

  // private readonly excelTable!: ElementRef;

  public _formGroup!: FormGroup;
  private _e2In: any[] = [];

  protected columnNameList: string[] = [];
  protected unitsList: string[] = [];
  @Input() showE2InColumn: boolean = true;
  @Input() data: any[] = [];
  @Input() readonly: boolean = false;
  @Input() order: 'asc' | 'desc' | '' = '';

  @Input()
  set e2In(upatedE2In: any[]) {
    upatedE2In.forEach(u => {
      const rowIndex = this._e2In.findIndex(e => e.date === u.date);

      if (rowIndex === -1) {
        return;
      }

      this._e2In[rowIndex].value = this.formatValue(u.value);
      this._e2In[rowIndex].isUpdate = true;
    });
  }

  get e2In(): any[] {
    return this._e2In;
  }

  get formGroup(): FormGroup {
    return this._formGroup;
  }


  @Input()
  set formGroup(data: any) {
    this._formGroup = this.fb.group({
      rows: this.fb.array([])
    });

    this.columnNameList = [];
    this.unitsList = [];
    this._e2In = [];

    this.findColumnNameList(data);

    data.forEach((d: any) => {
      const columns: FormArray = this.fb.array([]);

      const colsLength = this.columnNameList.length;

      for (let index = 0; index < colsLength; index++) {
        let column: any | undefined = d.columns?.find(
          (c: any) => c.columnName === this.columnNameList[index]
        );
        const defaultValueIDFormControl: any[] = [
          column?.defaultValueID ?? null
        ];

        const valueControl: any[] = [this.formatValue(column?.value)];

        if (column) {
          defaultValueIDFormControl.push(Validators.required);
          valueControl.push([Validators.required]);
        }

        columns.push(
          this.fb.group({
            columnName: [this.columnNameList[index]],
            unit: [this.unitsList[index]],
            value: valueControl,
          })
        );
      }

      this.rows.push(
        this.fb.group({
          columns
        })
      );
    });
  }

  protected columns = (rowIndex: number): FormArray => {
    return (this.rows.at(rowIndex) as FormGroup).get('columns') as FormArray;
  };


  private findColumnNameList(data: any[]): void {
    data.forEach((d: any) => {
      const filteredCols = d.columns
        ? d.columns.filter((c: any) => c.defaultValueID !== null)
        : [];

      if (filteredCols.length > this.columnNameList.length) {
        this.columnNameList = filteredCols.map((c: any) => c.columnName);
      }
    });
  }

  protected parseData(data: {
    clipboardData: DataTransfer;
    row: { startRow: number; endRow: number };
    col: { startCol: number; endCol: number };
  }) {
    if (this.readonly || !data.clipboardData) {
      return;
    }

    const { startRow, endRow } = data.row;
    const { startCol, endCol } = data.col;

    const pastedText = data.clipboardData.getData('text');
    const rowsData = pastedText.split('\n');

    const defaultValue =
      rowsData.length === 1 && rowsData[0].split('\t').length === 1
        ? rowsData[0].split('\t')[0]
        : undefined;

    const startRowIndex = startRow - 1;
    const startColIndex = startCol - 1;

    let limitRow =
      startRow === endRow ? startRowIndex + rowsData.length : endRow;
    let limitCol = startCol === endCol ? this.columnNameList.length : endCol;

    if (limitRow > 121) {
      limitRow = 121;
    }

    if (defaultValue !== undefined) {
      limitCol = endCol;
    }

    for (let index = 0; index < limitRow; index++) {
      this.updateTableCellOnParseValue(
        index,
        rowsData,
        { startIndex: startRowIndex, endIndex: limitRow },
        { startIndex: startColIndex, endIndex: limitCol },
        defaultValue
      );
    }
  }

  protected resetIsUpdateE2InOnRowIndex(rowIndex: number) {
    if (this._e2In[rowIndex]) {
      this._e2In[rowIndex].isUpdate = false;
    }
  }

  protected copyData(data: {
    row: { startRow: number; endRow: number };
    col: { startCol: number; endCol: number };
  }) {

    let output = '';

    const startRowIndex = data.row.startRow - 1;
    const endRowIndex = data.row.endRow - 1;
    const startColIndex = data.col.startCol - 1;
    const endColIndex = data.col.endCol - 1;

    for (let i = startRowIndex; i <= endRowIndex; i++) {
      for (let j = startColIndex; j <= endColIndex; j++) {
        let suffix = '\t';
        if (j === endColIndex) {
          suffix = '';
        }
        output = output + this.columns(i).controls[j].value.value + suffix;
      }
      let suffix = '\n';
      if (i === startRowIndex) {
        suffix = '';
      }
      output = output + suffix;
    }

    navigator.clipboard.writeText(output);
  }

  private updateTableCellOnParseValue(
    index: number,
    rowsData: string[],
    row: { startIndex: number; endIndex: number },
    col: { startIndex: number; endIndex: number },
    defaultValue: string | undefined
  ) {
    const cols = rowsData[index] ? rowsData[index].split('\t') : [];

    if (row.startIndex + index < row.endIndex) {
      for (let j = 0; j < this.columnNameList.length; j++) {
        if (
          j >= col.startIndex &&
          (defaultValue !== undefined ||
            cols[j - col.startIndex] !== undefined) &&
          j < col.endIndex
        ) {
          const value =
            defaultValue ?? this.formatValue(cols[j - col.startIndex]);

          if (
            this.columns(row.startIndex + index).controls[j].value
              .defaultValueID
          ) {
            this.columns(row.startIndex + index).controls[j].patchValue({
              value
            });
            this.columns(row.startIndex + index).controls[j].markAsDirty();
          }
        }
      }

      this.resetIsUpdateE2InOnRowIndex(row.startIndex + index);
    }
  }

  private formatValue(value: string | number | null | undefined): string {
    if (!!value || value === 0) {
      // Remove commas before parsing
      const numericValue = parseFloat(`${value}`.replace(/,/g, ''));
      if (!isNaN(numericValue)) {
        return numericValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }

      return `${value}`;
    }

    return '';
  }

  get rows(): FormArray {
    return this.formGroup.get('rows') as FormArray;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly excelTableService: ExcelTableService
  ) {
    this._formGroup = this.fb.group({
      rows: this.fb.array([])
    });
  }

  // ngOnInit(): void {
  //   this.excelTableService.setTableValue(this.formGroup);
  // }

  ngOnChanges() {
    this._formGroup = this.fb.group({
      rows: this.fb.array([])
    });

    this.columnNameList = [];
    this.unitsList = [];
    this._e2In = [];
    this.findColumnNameList(this.data);
    this.data.forEach((d: any) => {
      const columns: FormArray = this.fb.array([]);

      const colsLength = this.columnNameList.length;

      for (let index = 0; index < colsLength; index++) {
        let column: any | undefined = d.columns?.find(
          (c: any) => c.columnName === this.columnNameList[index]
        );
        const defaultValueIDFormControl: any[] = [
          column?.defaultValueID ?? null
        ];

        const valueControl: any[] = [this.formatValue(column?.value)];

        if (column) {
          defaultValueIDFormControl.push(Validators.required);
          valueControl.push([Validators.required]);
        }

        columns.push(
          this.fb.group({
            columnName: [this.columnNameList[index]],
            unit: [this.unitsList[index]],
            value: valueControl,
          })
        );
      }

      this.rows.push(
        this.fb.group({
          columns
        })
      );
    });

    this.excelTableService.setTableValue(this.formGroup);
  }
  protected formatValueOnBlur(control: AbstractControl): void {
    const invalid = /[^\d,.]/g.test(control.value.value);
    if (invalid) return;
    const value = this.formatValue(control.value.value);
    control.patchValue({ value: value }, { emitEvent: false });
  }

  protected inputEventHandler(event: KeyboardEvent) {
    const { minRow, maxRow } = this.findRowRange();
    const { minCol, maxCol } = this.findColRange();

    if (this.readonly || (minRow === maxRow && minCol === maxCol)) return;

    if (event.key === 'Backspace') {
      this.deleteData();
    }
  }

  protected deleteData() {
    const { minRow, maxRow } = this.findRowRange();
    const { minCol, maxCol } = this.findColRange();

    for (let i = minRow - 1; i < maxRow; i++) {
      for (let j = minCol - 1; j < maxCol; j++) {
        if (this.columns(i).controls[j].value.defaultValueID) {
          this.columns(i).controls[j].patchValue({
            value: '0.00'
          });
          this.columns(i).controls[j].markAsDirty();
        }
      }
      if (this._e2In[i]) {
        this._e2In[i].isUpdate = false;
      }
    }
  }

  protected reorderData() {
    const reversedRows = [...this.rows.controls].reverse(); // Reverse the controls array

    this.rows.clear();

    reversedRows.forEach(row => this.rows.push(row));

    this.order = this.order === 'asc' ? 'desc' : 'asc';
  }

  private findColRange(): { minCol: number; maxCol: number } {
    const minCol = Number(
      this.excelTable.nativeElement.getAttribute('data-start-column')
    );
    const maxCol = Number(
      this.excelTable.nativeElement.getAttribute('data-end-column')
    );

    return { minCol, maxCol };
  }

  private findRowRange(): { minRow: number; maxRow: number } {
    const minRow = Number(
      this.excelTable.nativeElement.getAttribute('data-start-row')
    );
    const maxRow = Number(
      this.excelTable.nativeElement.getAttribute('data-end-row')
    );

    return { minRow, maxRow };
  }

  protected e2InValue(index: number, key: keyof any) {
    if (this.e2In?.[index] && key in this.e2In[index]) {
      return this.e2In[index][key];
    }
    return '';
  }


  formatChemicalText(text: string): string {
    return text.replace(/\b([A-Za-z]+)(\d+)/g, (match, letters, number) => {
      return `${letters}<sub>${number}</sub>`;
    });
  }

}