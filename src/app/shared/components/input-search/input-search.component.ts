import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-input-search',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule],
  templateUrl: './input-search.component.html',
  styleUrl: './input-search.component.scss'
})
export class InputSearchComponent {
  @Input() placeholder: string = 'Search...';
  @Input() value: string = '';
  @Input() data: any = [];
  @Input() isLoading: boolean = false;
  @Input() isScrollLoading: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();
  @Output() enterValueChange = new EventEmitter<string>();
  @Output() scrollChange = new EventEmitter<string>();
  isOpen: boolean = false;

  constructor(private eRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  onSearch(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value.trim();

    if (inputValue.length === 0) {
      this.isOpen = false;
      return;
    }

    const hasDigit = /\d/.test(inputValue);
    const letterMatches = inputValue.match(/[a-zA-Zก-๙]/g);
    const letterCount = letterMatches ? letterMatches.length : 0;

    if (hasDigit || letterCount >= 3) {
      this.isOpen = true;
      this.search.emit(inputValue);
    }
  }


  selectItem(item: any) {
    this.value = item.label
    this.isOpen = false;
    this.valueChange.emit(this.value);
  }

  onSearchEnter(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value.trim();
    this.enterValueChange.emit(inputValue)
  }

  onClick() {
    this.valueChange.emit(this.value);
  }

  onClickInput(){
    if(this.data.length > 0){
      this.isOpen = !this.isOpen;
    }
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const bottomReached = target.scrollTop + target.clientHeight >= target.scrollHeight;
    let scroll = bottomReached as any
    this.scrollChange.emit(scroll);
  }

}
