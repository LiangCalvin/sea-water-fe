import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  effect,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  Input,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { InputDropdownService } from '../../services/input-dropdown.service';
import { IdName } from '../../models/id-name.model';
import { FloatingDropdownDirective } from '../../directives/floating-dropdown.directive';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, NzDropDownModule, FloatingDropdownDirective],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor {
  @ViewChild('dropdownInput') dropdownInputRef!: ElementRef;

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() textError: string = '';
  @Input() placeholder: string = '';
  @Input() options: IdName[] = [];
  @Input() defaultSelected: IdName | null = null;
  @Input() removable: boolean = false;
  @Input() isRequired: boolean = false;

  @Input() bgColor: string = 'white';
  @Output() customBlur: EventEmitter<void> = new EventEmitter<void>();
  @Output() opened: EventEmitter<void> = new EventEmitter<void>();
  @Output() selectChange: EventEmitter<IdName> = new EventEmitter<IdName>();
  @Output() interacted: EventEmitter<void> = new EventEmitter<void>();
  isOpened: boolean = false;
  selectedOption: IdName | null = null;
  inputWidth = 0;
  isDisabled = false;

  private pendingValue: IdName | null = null;

  constructor(
    private readonly inputDropdownService: InputDropdownService,
    private readonly cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const def = this.defaultSelected;
      if (def) {
        this.writeValue(def);
      }
    });

    effect(() => {
      if (this.options?.length && this.pendingValue) {
        this.setSelectedFromOptions(this.pendingValue);
        this.pendingValue = null;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['defaultSelected']?.currentValue) {
      if (this.options?.length) {
        this.writeValue(changes['defaultSelected'].currentValue);
      } else {
        this.pendingValue = changes['defaultSelected'].currentValue;
      }
    }
  }
  

  
  ngAfterViewInit() {
    this.isOpened = false;
    this.inputWidth = this.dropdownInputRef.nativeElement.offsetWidth;
    this.cdr.detectChanges();
  }

  get displayValue() {
    return (
      this.options.find(
        o => o.id.toLowerCase() === this.selectedOption?.id?.toLowerCase()
      )?.name ?? ''
    );
  }

  isSelectedOption(option: IdName): boolean {
    return (
      !!this.selectedOption &&
      this.selectedOption.id?.toLowerCase() === option.id?.toLowerCase()
    );
  }

  handleBlur() {
    this.customBlur.emit();
  }

  selectOption(option: IdName) {
    this.selectedOption = option;
    this.onChange(option);
    this.onTouched();
    this.isOpened = false;
    this.selectChange.emit(option);
    this.interacted.emit();
    this.inputDropdownService.closeAllDropdowns();
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedOption = null;
    this.onChange(null);
    this.onTouched();
    const defaultEmpty: IdName = { id: '', name: '' };
    this.selectChange.emit(defaultEmpty);
    this.interacted.emit();
    this.isOpened = false;
  }

  private onChange: (value: IdName | null) => void = () => {
    // Intentionally empty: will be replaced via registerOnChange
  };
  private onTouched: () => void = () => {
    // Intentionally empty: will be replaced via registerOnChange
  };

  writeValue(value: IdName | null): void {
    if (!value) {
      this.selectedOption = null;
      return;
    }

    if (!this.options?.length) {
      this.pendingValue = value;
      return;
    }

    this.setSelectedFromOptions(value);
  }

  private setSelectedFromOptions(value: IdName) {
    const found = this.options.find(
      o => o.id?.toLowerCase() === value.id?.toLowerCase()
    );
    this.selectedOption = found ?? null;
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }
  
}
