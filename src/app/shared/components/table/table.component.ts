import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { TagComponent } from '../tag/tag.component';
import { Status, StudyDetailsModule, colorStatus, displayStatus, textTooltip } from '../../../core/enums/all-studies.enum'
import { NzIconModule } from 'ng-zorro-antd/icon';
import { COLUMN_ID } from '../../../core/enums/app-config.enum';
import { UserNameService } from '../../services/user-name.service';
import { TooltipComponent } from "../tooltip/tooltip.component";
import { GlobalService } from '../../../services/global.service';
import { RoleEnum } from '../../../core/enums/role.enum';
import { IdName } from '../../models/id-name.model';
import { FormControl } from '@angular/forms';
import { InputTextComponent } from "../input-text/input-text.component";
import { DropdownComponent } from "../dropdown/dropdown.component";
@Component({
  selector: 'app-table',
  imports: [CommonModule, TagComponent, NzIconModule, TooltipComponent, InputTextComponent, DropdownComponent],
  standalone: true,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class
  TableComponent {
  @Input() columnNames: { key: string; label: string }[] = [];
  @Input() data: any[] = [];
  @Input() studies: any[] = [];
  @Input() isLoading = false;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() sortField = '';
  @Input() notFoundText = 'Data Not Found';
  @Input() sortDirection: string = '';
  @Input() displaySelected: boolean = false;
  @Input() listAction: any[] = [];
  @Input() isFoundData = false;
  @Input() isTooltip = false;
  @Input() includeCreatedBy: boolean = false;


  @Input() itemsPerPage = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() totalItems = 0;
  @Output() sortChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() rowChange = new EventEmitter<any>();
  @Output() selectedRowsChange = new EventEmitter<any[]>();
  @Output() actionChange = new EventEmitter<any>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  pageSizeOptionsFormatted: IdName[] = [];
  selectedPageSize: IdName | null = null;
  selectedRows: any[] = [];
  expandedRow: number | null = null;
  Owner: any;
  hasFullAccess: boolean = false;
  goToPageInput: string = '';
  goToPageControl: FormControl = new FormControl('');

  showGoToPage: boolean = false;
  parseInt = parseInt;
  constructor(
    private userNameService: UserNameService,
    private globalService: GlobalService
  ) {
    this.Owner = this.globalService.getUserFullName();
    this.hasFullAccess = this.globalService.hasPermissionSync(RoleEnum.FULL_ACCESS);
  }

  ngOnInit(): void {
    this.formatPageSizeOptions();
    this.setDefaultPageSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSizeOptions'] && !changes['pageSizeOptions'].firstChange) {
      this.formatPageSizeOptions();
    }
    if (changes['itemsPerPage'] && !changes['itemsPerPage'].firstChange) {
      this.setDefaultPageSize();
    }
  }

  private setDefaultPageSize(): void {
    this.selectedPageSize = {
      id: this.itemsPerPage.toString(),
      name: this.itemsPerPage.toString()
    };
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-cell')) {
      this.expandedRow = null;
    }
  }

  sort(field: string): void {
    this.sortChange.emit(field);
  }

  goToPage(page: any): void {
    if (page !== '...') {
      this.pageChange.emit(page);
    }

  }

  // onRowClick(row: any): void {
  //   const id = this.getFirstAvailableKey(row, [COLUMN_ID.STUDY_ID, COLUMN_ID.CALCULATION_ID]);
  //   this.rowChange.emit(id);
  // }
  toggleGoToPage(): void {
    this.showGoToPage = !this.showGoToPage;
    if (this.showGoToPage) {
      this.goToPageInput = '';
      setTimeout(() => {
        const input = document.querySelector('.go-to-page-input') as HTMLInputElement;
        input?.focus();
      }, 0);
    }
  }

  onGoToPageChange(): void {
    const pageNumber = parseInt(this.goToPageControl.value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.goToPage(pageNumber);
      this.showGoToPage = false;
      // this.goToPageControl.setValue('');
    }
  }
  onGoToPageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGoToPageChange();
    } else if (event.key === 'Escape') {
      this.showGoToPage = false;
      this.goToPageControl.setValue('');
    }
  }
  onRowClick(row: any): void {
    // const id = this.getFirstAvailableKey(row, [COLUMN_ID.STUDY_ID, COLUMN_ID.CALCULATION_ID]);

    // if (this.includeCreatedBy) {
    //   // For study-details component, emit object with createdBy
    //   const rowData = {
    //     id: id,
    //     createdBy: row.createdBy,
    //   };
    //   this.rowChange.emit(rowData);
    // } else {
    //   // For other components, emit just the ID (existing behavior)
    //   this.rowChange.emit(id);
    // }
    this.rowChange.emit(row.studyId); // ✅ or row.studyCode if you prefer

  }
  private formatPageSizeOptions(): void {
    this.pageSizeOptionsFormatted = this.pageSizeOptions.map(size => ({
      id: size.toString(),
      name: size.toString()
    }));
  }

  onItemsPerPageChange(selected: IdName): void {
    const newSize = parseInt(selected.id, 10);
    this.itemsPerPage = newSize;
    this.itemsPerPageChange.emit(newSize);
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | '...')[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, '...', total);
      }
      else if (current >= total - 2) {
        pages.push(1, '...', total - 2, total - 1, total);
      }
      else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }

    return pages;
  }

  toggleRowSelection(row: any): void {
    const index = this.selectedRows.findIndex(r => r === row);
    if (index >= 0) {
      this.selectedRows.splice(index, 1);
    } else {
      this.selectedRows.push(row);
    }
    this.selectedRowsChange.emit(this.selectedRows);
  }

  isSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  toggleSelectAll(event: any): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedRows = checked ? [...this.data] : [];
    this.selectedRowsChange.emit(this.selectedRows);
  }

  isAllSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }

  onDisplayListMore(index: number) {
    this.expandedRow = this.expandedRow === index ? null : index;
  }

  onAction(row: any, action: string) {
    const data = {
      row,
      action
    }
    this.expandedRow = null;
    this.actionChange.emit(data);
  }

  displayColorStatus(status: Status): string {
    return colorStatus[status] ?? '#FFFFFF';
  }

  displayTextHover(status: Status) {
    return textTooltip[status] ?? '';
  }

  getFirstAvailableKey(row: any, keys: COLUMN_ID[]): any {
    for (const key of keys) {
      if (row[key] !== undefined) return row[key];
    }
    return undefined;
  }

  displayName(name: string) {
    return this.userNameService.displayName(name);
  }

  displayStudyName(name: string) {
    return this.userNameService.displayStudyName(name);
  }

  getFilteredActions(row: any) {
    return this.listAction.filter(action => {
      if (action.title === StudyDetailsModule.RECALCULATE) {
        return row.status === 'DONE' && (this.Owner === row?.createdBy || this.hasFullAccess);
      }
      if (action.title === StudyDetailsModule.RESUBMIT) {
        return row.status === 'FAILED'
      }
      if (action.title === StudyDetailsModule.EDIT) {
        return row.status === Status.DRAFT && (this.Owner === row?.createdBy || this.hasFullAccess);
      }
      if (action.title === StudyDetailsModule.DELETE) {
        return this.Owner === row?.createdBy || this.hasFullAccess;
      }
      if (action.title === StudyDetailsModule.EXPORT) {
        return row.status === 'DONE';
      }
      return true;
    });
  }

  displayStatus(status: Status): string {
    return displayStatus[status] ?? '';
  }
  getItemRangeText(): string {
    if (this.totalItems === 0) {
      return '0 items';
    }

    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

    return `${startItem}–${endItem} of ${this.totalItems} items`;
  }
}
