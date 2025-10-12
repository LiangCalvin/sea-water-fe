import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzRadioModule } from 'ng-zorro-antd/radio';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, FormsModule, NzRadioModule, ReactiveFormsModule],
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ]
})
export class RadioComponent implements ControlValueAccessor {
  @Input() options: { label: string; value: any }[] = [];
  @Input() color: string = '#2f3e4e';
  @Input() disabledColor: string = '#9ca3af';
  @Output() valueChange = new EventEmitter<any>();
  @Output() interacted: EventEmitter<void> = new EventEmitter<void>();

  value: any;
  disabled = false;
  private hasUserInteracted = false;
  private onChange: (value: any) => void = () => {
    // Intentionally empty: Angular will replace via registerOnChange
  };

  private onTouched: () => void = () => {
    // Intentionally empty: Angular will replace via registerOnTouched
  };

  get currentColor(): string {
    return this.disabled ? this.disabledColor : this.color;
  }

  writeValue(value: any): void {
    this.value = value ?? undefined;
  }

  onValueChange(newValue: any): void {
    if (newValue !== undefined) {
      this.value = newValue;
      this.onChange(newValue);
      this.onTouched();
      this.valueChange.emit(newValue);
      if (!this.hasUserInteracted) {
        this.hasUserInteracted = true;
        this.interacted.emit();
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
