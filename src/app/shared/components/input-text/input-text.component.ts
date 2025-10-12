
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ControlValueAccessor
} from '@angular/forms';
import { NumericInputDirective } from '../../directives/numeric-input.directive';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { distinctUntilChanged, skip } from 'rxjs';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [
    NumericInputDirective,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    TooltipComponent
  ],
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true
    }
  ]
})
export class InputTextComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() default: string = '';
  @Input() id: string = '';
  @Input() requireLable: boolean = false;
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() textAreaRows: number = 0;
  @Input() maxlength: number = 9999;
  @Input() value: string = '';
  @Input() rounded: string = '';
  @Input() formControl: FormControl = new FormControl('');
  @Input() requireInput: boolean = false;
  @Input() textError: any = '';
  @Input() textWarning: string = '';
  @Input() disableFlag: string = '';
  @Input() isOptionDisabled: boolean = false;
  @Input() fontWeight: number = 700;
  @Input() height: string = '36px';
  @Input() enableTruncate: boolean = false;
  @Input() placeholderColor: string = '#BABABA';
  @Input() disabledBgColor: string = '#F4F4F4';
  @Input() unit: string = '';
  @Input() numeric: boolean = false;
  @Input() allowDecimals: boolean = false;
  @Input() decimalLimit: number = 0;
  @Input() bgColor: string = 'white'
  @Input() tooltipTitle: string = ''
  @Input() error = false;
  @Input() witdthInput: string = 'w-[100%]'
  @Input() unitDropdown: boolean = false;

  @Output() customBlur: EventEmitter<void> = new EventEmitter<void>();
  @Output() interacted: EventEmitter<void> = new EventEmitter<void>();
  requireText = '';
  classInput = '';
  private hasUserFocused = false;

  ngOnInit() {
    this.onCheckRequire();
    if (!this.formControl.value && this.default) {
      this.formControl.setValue(this.default);
    }
    if (this.disableFlag === 'I') {
      this.formControl.disable();
    }
  }

  onCheckRequire() {
    if (this.requireLable) {
      this.requireText = '* ';
    } else {
      this.requireText = '';
    }
  }

  handleBlur() {
    this.customBlur.emit();
  }

  getCustomStyles() {
    return {
      '--placeholder-color': this.placeholderColor,
      '--disabled-bg-color': this.disabledBgColor,
      'background-color': this.bgColor
    };
  }

  getClassInput() {
    const baseClasses = [
      'w-full',
      'border',
      'border-[#E4E4E7]',
      'text-sm',
      'text-gray-800',
      'focus:outline-none',
      'focus:border-[#009FDA]',
      'disabled:bg-[#F4F4F4]'
    ];

    const paddingClasses = ['pl-2'];
    if (this.rounded !== 'right') {
      paddingClasses.push('pr-2');
    }

    let borderRadiusClasses = ['rounded-md'];
    if (this.rounded === 'right') {
      borderRadiusClasses = ['rounded-md', 'rounded-r-none'];
    } else if (this.rounded === 'left') {
      borderRadiusClasses = ['rounded-md', 'rounded-l-none'];
    }

    const specialClasses =
      this.rounded === 'right'
        ? ['focus:ring-blue-500', 'disabled:text-[#BABABA]']
        : [];

    // const errorClass = this.textError || this.error ? ['!border-[#D52B1E]', 'border-1'] : [];
     const borderStateClasses = this.textError || this.error
    ? ['!border-[#D52B1E]', 'border-1']
    : this.textWarning
    ? ['!border-[#F9A825]', 'border-1']
    : [];

    const fontWeightClass = [`font-[${this.fontWeight}]`];

    const heightClass = [`h-[${this.height}]`];

    const allClasses = [
      ...baseClasses,
      ...paddingClasses,
      ...borderRadiusClasses,
      ...specialClasses,
      ...borderStateClasses,
      ...fontWeightClass,
      ...heightClass
    ];

    return allClasses.join(' ');
  }

  private onChange: (value: any) => void = () => {
    // Intentionally empty: will be replaced via registerOnChange
  };

  private onTouched: () => void = () => {
    // Intentionally empty: will be replaced via registerOnTouched
  };

  writeValue(value: any): void {
    this.value = value ?? undefined;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  onFocus() {
    this.hasUserFocused = true;
  }
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
    if (this.hasUserFocused) {
      this.interacted.emit();
    }
  }

}
