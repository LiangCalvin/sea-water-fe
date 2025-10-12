import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';

@Directive({
  selector: 'table[iowcRangeSelectionTable]',
  standalone: true
})
export class RangeSelectionTableDirective implements AfterViewInit, OnDestroy {
  @Input() selectCellClass: string = 'border-bright-light-blue';
  @Input() deselectCellClass: string = 'border-line-primary';

  @Input() enableCellChild: boolean = false;
  @Input() selectChildClass: string = 'border-bright-light-blue';
  @Input() deselectChildClass: string = 'border-transparent';

  @Input() limitFirstCol: boolean = false;

  @Output() parseEvent = new EventEmitter<{
    clipboardData: DataTransfer;
    row: { startRow: number; endRow: number };
    col: { startCol: number; endCol: number };
  }>();
  @Output() copyEvent = new EventEmitter<{
    row: { startRow: number; endRow: number };
    col: { startCol: number; endCol: number };
  }>();

  private readonly table: HTMLTableElement;

  private startCell: HTMLTableCellElement | null = null;
  private startCellRow: number = 0;
  private startCellCol: number = 0;

  private endCell: HTMLTableCellElement | null = null;
  private endCellRow: number = 0;
  private endCellCol: number = 0;

  private readonly selectedCells = new Set<HTMLTableCellElement>();

  constructor({ nativeElement }: ElementRef<HTMLTableElement>) {
    this.table = nativeElement;
  }

  ngAfterViewInit(): void {
    const tableCells = this.table.querySelectorAll('td');
    tableCells.forEach((cell: HTMLTableCellElement) => {
      if (cell.firstElementChild) {
        cell.firstElementChild.addEventListener('paste', event => {
          this.parseData(event as ClipboardEvent);
        });
        cell.firstElementChild.addEventListener('copy', event => {
          this.copyData(event);
        });
      }
    });
  }

  ngOnDestroy(): void {
    const tableCells = this.table.querySelectorAll('td');
    tableCells.forEach((cell: HTMLTableCellElement) => {
      if (cell.firstElementChild) {
        cell.firstElementChild.removeEventListener('paste', event => {
          this.parseData(event as ClipboardEvent);
        });
        cell.firstElementChild.removeEventListener('copy', event => {
          this.copyData(event);
        });
      }
    });
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button !== 0) {
      return;
    }

    const cell = (event.target as HTMLElement).closest<HTMLTableCellElement>(
      'td'
    );
    if (cell) {
      if (!this.startCell || !event.shiftKey) {
        // Single cell selection
        this.startCell = cell;
        this.endCell = null;
        this.clearTableSelection();
        this.selectCell(this.startCell);
        this.updateTableAttributes(this.startCell, this.startCell);
      } else {
        // Multi-cell selection with Shift key
        this.endCell = cell;
        this.clearTableSelection();
        this.selectCellsBetween(this.startCell, this.endCell);
        this.updateTableAttributes(this.startCell, this.endCell);
      }
    } else {
      this.clearTableSelection();
    }
  }

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    const cell = (event.target as HTMLElement).closest<HTMLTableCellElement>(
      'td'
    );
    if (cell && this.startCell && event.buttons === 1) {
      this.endCell = cell;
      this.clearTableSelection();
      this.selectCellsBetween(this.startCell, this.endCell);
      this.updateTableAttributes(this.startCell, this.endCell);
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(_event: MouseEvent) {
    if (this.startCell && this.endCell) {
      this.updateTableAttributes(this.startCell, this.endCell);
    }
  }

  private parseData(event: ClipboardEvent) {
    event.preventDefault();

    const clipboardData = event.clipboardData;

    if (!clipboardData) {
      return;
    }

    this.parseEvent.emit({
      clipboardData,
      row: { startRow: this.startCellRow, endRow: this.endCellRow },
      col: { startCol: this.startCellCol, endCol: this.endCellCol }
    });
  }

  private copyData(_event: any) {
    this.copyEvent.emit({
      row: { startRow: this.startCellRow, endRow: this.endCellRow },
      col: { startCol: this.startCellCol, endCol: this.endCellCol }
    });
  }

  private selectCell(cell: HTMLTableCellElement) {
    cell.classList.add(...this.selectCellClass.split(' '));
    cell.classList.remove(...this.deselectCellClass.split(' '));
    if (this.enableCellChild && cell.firstElementChild) {
      cell.firstElementChild.classList.remove(
        ...this.deselectChildClass.split(' ')
      );
      cell.firstElementChild.classList.add(...this.selectChildClass.split(' '));
    }
    this.selectedCells.add(cell);
  }

  private selectCellsBetween(
    startCell: HTMLTableCellElement,
    endCell: HTMLTableCellElement
  ) {
    const cells = Array.from(this.table.querySelectorAll('td'));

    const startRowIndex = (startCell.parentElement as HTMLTableRowElement)
      .rowIndex;
    const startColIndex = startCell.cellIndex;
    const endRowIndex = (endCell.parentElement as HTMLTableRowElement).rowIndex;
    const endColIndex = endCell.cellIndex;

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = this.limitFirstCol
      ? minCol
      : Math.max(startColIndex, endColIndex);

    cells.forEach(cell => {
      const rowIndex = (cell.parentElement as HTMLTableRowElement).rowIndex;
      const colIndex = cell.cellIndex;

      if (
        rowIndex >= minRow &&
        rowIndex <= maxRow &&
        colIndex >= minCol &&
        colIndex <= maxCol
      ) {
        this.selectCell(cell);
      }
    });
  }

  private clearTableSelection() {
    Array.from(this.selectedCells).forEach(cell => {
      cell.classList.add(...this.deselectCellClass.split(' '));
      cell.classList.remove(...this.selectCellClass.split(' '));
      if (this.enableCellChild && cell.firstElementChild) {
        cell.firstElementChild.classList.add(
          ...this.deselectChildClass.split(' ')
        );
        cell.firstElementChild.classList.remove(
          ...this.selectChildClass.split(' ')
        );
      }
    });

    this.selectedCells.clear();

    this.table.removeAttribute('data-start-row');
    this.table.removeAttribute('data-start-column');
    this.table.removeAttribute('data-end-row');
    this.table.removeAttribute('data-end-column');
  }

  private updateTableAttributes(
    startCell: HTMLTableCellElement,
    endCell: HTMLTableCellElement
  ) {
    const startRowIndex = (startCell.parentElement as HTMLTableRowElement)
      .rowIndex;
    const startColIndex = startCell.cellIndex + 1;
    const endRowIndex = (endCell.parentElement as HTMLTableRowElement).rowIndex;
    const endColIndex = endCell.cellIndex + 1;

    this.startCellRow = Math.min(startRowIndex, endRowIndex);
    this.startCellCol = Math.min(startColIndex, endColIndex);
    this.endCellRow = Math.min(endRowIndex, endRowIndex);
    this.endCellCol = Math.min(endColIndex, endColIndex);

    this.table.setAttribute('data-start-row', this.startCellRow.toString());
    this.table.setAttribute('data-start-column', this.startCellCol.toString());
    this.table.setAttribute('data-end-row', this.endCellRow.toString());
    this.table.setAttribute(
      'data-end-column',
      this.limitFirstCol
        ? this.startCellCol.toString()
        : this.endCellCol.toString()
    );
  }
}
