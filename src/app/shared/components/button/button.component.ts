import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from 'ng-zorro-antd/icon';
import { GlobalService } from '../../../services/global.service';
import { StudyDetailsModule } from '../../../core/enums/all-studies.enum';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() type: 'primary' | 'secondary' | 'tertiary' | 'white' | 'danger' | 'icon-text' =
    'primary';
  @Input() size: '1' | '2' | '3' | '4' = '1';
  @Input() disabled = false;
  @Input() className = '';
  @Input() icon = '';
  @Input() img = '';
  @Input() iconAlt = '';
  @Input() width: string | 'auto' = '';
  @Input() height?: string;
  @Input() isLoading = false;
  @Input() listAction: any[] = [];
  @Input() studyDetail: any;
  @Output() actionChange = new EventEmitter<any>();
  @Output() buttonClick = new EventEmitter<void>();

  isDropdownOpen = false;
  private owner?: string;

  constructor(private globalService: GlobalService) {
    this.owner = this.globalService.getUserFullName();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.button-dropdown-container')) {
      this.isDropdownOpen = false;
    }
  }

  get hasDropdown(): boolean {
    return this.listAction && this.listAction.length > 0;
  }
  get buttonStyles(): { [key: string]: string } {
    return {
      width: this.getWidthValue(),
      height: this.height || this.getDefaultHeight(),
      minWidth: this.getMinWidth()
    };
  }
  onButtonClick(): void {
    if (this.hasDropdown) {
      this.isDropdownOpen = !this.isDropdownOpen;
    } else {
      this.buttonClick.emit();
    }
  }

  onDropdownAction(action: any): void {
    const data = {

      action: action.title || action
    };
    this.isDropdownOpen = false;
    this.actionChange.emit(data);
  }

  private getWidthValue(): string {
    if (this.width === 'auto') {
      return 'auto';
    }
    if (this.width) {
      return this.width;
    }
    return this.getDefaultWidth();
  }

  private getMinWidth(): string {
    if (this.width === 'auto') {
      return '40px';
    }
    return '';
  }

  private getDefaultWidth(): string {
    switch (this.size) {
      case '1':
        return '120px';
      case '2':
        return '100px';
      case '3':
        return '80px';
      case '4':
        return '40px';
      default:
        return '120px';
    }
  }

  private getDefaultHeight(): string {
    switch (this.size) {
      case '1':
        return '36px';
      case '2':
        return '30px';
      case '3':
        return '26px';
      case '4':
        return '12px';
      default:
        return '36px';
    }
  }

  getFilteredActions(): any[] {
    if (!this.listAction || !this.studyDetail) return [];

    return this.listAction.filter(action => {
      const actionTitle = action.title || action;

      if (actionTitle === StudyDetailsModule.DELETE) {
        return this.owner === this.studyDetail.createdBy;
      }

      return true;
    });
  }

}
