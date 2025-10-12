import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[appNumericInput]',
  standalone: true
})
export class NumericInputDirective implements OnInit {
  @Input() allowDecimals: boolean = false;
  @Input() decimalLimit: number = 0;
  @Input() enabled: boolean = false;
  @Input() displayCommas: boolean = false; 
  @Input() addLeadingZero: boolean = true;

  private previousValue: string = '';
  private isFormatting: boolean = false;

  constructor(private readonly el: ElementRef) { }

  ngOnInit() {
    setTimeout(() => {
      if (this.el.nativeElement.value) {
        let value = this.el.nativeElement.value;

        if (this.allowDecimals && this.addLeadingZero) {
          value = this.addLeadingZeroIfNeeded(value);
        }

        if (this.displayCommas) {
          this.formatWithCommas(value);
        } else if (value !== this.el.nativeElement.value) {
          this.isFormatting = true;
          this.el.nativeElement.value = value;
          const event = new Event('input', { bubbles: true });
          this.el.nativeElement.dispatchEvent(event);
          this.isFormatting = false;
        }
      }
    });
  }

  @HostListener('focus')
  onFocus() {
    if (this.enabled && this.displayCommas) {
      const input = this.el.nativeElement;
      const value = input.value;
      if (value) {
        const rawValue = value.replace(/,/g, '');

        this.isFormatting = true;
        input.value = rawValue;
        this.previousValue = rawValue;
        this.isFormatting = false;

        setTimeout(() => {
          const len = input.value.length;
          input.setSelectionRange(len, len);
        });
      }
    }
  }


  @HostListener('blur')
  onBlur() {
    if (!this.enabled) return;

    const value = this.el.nativeElement.value;
    if (!value) return;

    let newValue = value;

    const parsed = parseFloat(newValue.replace(/,/g, ''));
    if (!isNaN(parsed)) {
      newValue = parsed.toString();
    }

    if (this.allowDecimals) {
      const parts = newValue.split('.');
      if (parts[0].length > 1 && parts[0].startsWith('0')) {
        parts[0] = parts[0].replace(/^0+/, '') ?? '0';
        newValue = parts.length === 2 ? parts[0] + '.' + parts[1] : parts[0];
      }
    } else if (newValue.length > 1 && newValue.startsWith('0')) {
      newValue = newValue.replace(/^0+/, '') ?? '0';
    }

    if (this.allowDecimals && this.addLeadingZero) {
      newValue = this.addLeadingZeroIfNeeded(newValue);
    }

    if (this.displayCommas) {
      this.formatWithCommas(newValue);
    } else if (newValue !== value) {
      this.isFormatting = true;
      this.el.nativeElement.value = newValue;
      const event = new Event('input', { bubbles: true });
      this.el.nativeElement.dispatchEvent(event);
      this.isFormatting = false;
    }
  }

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    if (!this.enabled || this.isFormatting) return;

    const input = this.el.nativeElement;
    const value = input.value;
    const cursorPos = input.selectionStart ?? 0;

    const pattern = this.allowDecimals ? /[^0-9.]/g : /[^0-9]/g;
    let newValue = value.replace(pattern, '');

    if (this.allowDecimals) {
      const parts = newValue.split('.');
      if (parts.length > 2) {
        newValue = parts[0] + '.' + parts.slice(1).join('');
      }

      if (
        this.decimalLimit > 0 &&
        parts.length === 2 &&
        parts[1].length > this.decimalLimit
      ) {
        newValue = parts[0] + '.' + parts[1].substring(0, this.decimalLimit);
      }

      if (newValue.startsWith('.')) {
        newValue = '0' + newValue;
        if (cursorPos <= 1) {
          setTimeout(() => {
            input.setSelectionRange(cursorPos + 1, cursorPos + 1);
          });
        }
      }
      else if (parts[0].length > 1 && parts[0].startsWith('0')) {
        const oldPartZero = parts[0];
        parts[0] = parts[0].replace(/^0+/, '') ?? '0';

        newValue = parts.length === 2 ? parts[0] + '.' + parts[1] : parts[0];

        if (oldPartZero !== parts[0] && cursorPos > 0) {
          const diff = oldPartZero.length - parts[0].length;
          setTimeout(() => {
            const newPos = Math.max(0, cursorPos - diff);
            input.setSelectionRange(newPos, newPos);
          });
        }
      }
    } else {
      if (newValue.length > 1 && newValue.startsWith('0')) {
        const oldVal = newValue;
        newValue = newValue.replace(/^0+/, '');

        if (oldVal !== newValue && cursorPos > 0) {
          const diff = oldVal.length - newValue.length;
          setTimeout(() => {
            const newPos = Math.max(0, cursorPos - diff);
            input.setSelectionRange(newPos, newPos);
          });
        }
      }
    }

    if (input.value !== newValue) {
      this.isFormatting = true;
      input.value = newValue;
      this.previousValue = newValue;
      this.isFormatting = false;

      const inputEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(inputEvent);
    }
  }

  private addLeadingZeroIfNeeded(value: string): string {
    if (value.startsWith('.')) {
      return '0' + value;
    }
    return value;
  }
private insertCommasToIntegerPart(digits: string): string {
  if (!digits) return '';

  // preserve leading sign if any
  const sign = digits[0] === '-' ? '-' : '';
  const s = sign ? digits.slice(1) : digits;

  let result = '';
  let count = 0;

  // iterate from the end and insert commas every 3 digits
  for (let i = s.length - 1; i >= 0; i--) {
    result = s[i] + result;
    count++;
    if (count === 3 && i !== 0) {
      result = ',' + result;
      count = 0;
    }
  }

  return sign + result;
}

private formatWithCommas(value: string): void {
  // remove existing commas
  const rawValue = value.replace(/,/g, '');

  if (!rawValue) return;

  const parts = rawValue.split('.');
  const wholeNumberPart = parts[0] ?? '';
  const decimalPart = parts.length > 1 ? parts.slice(1).join('.') : '';

  const formattedWholeNumber = this.insertCommasToIntegerPart(wholeNumberPart);

  let formattedValue = formattedWholeNumber;
  if (decimalPart) {
    formattedValue += '.' + decimalPart;
  }

  this.isFormatting = true;
  this.el.nativeElement.value = formattedValue;

  const event = new Event('input', { bubbles: true });
  this.el.nativeElement.dispatchEvent(event);

  this.isFormatting = false;
}
  // private formatWithCommas(value: string): void {
  //   const rawValue = value.replace(/,/g, '');

  //   if (!rawValue) return;

  //   const parts = rawValue.split('.');
  //   const wholeNumberPart = parts[0];

  //   const formattedWholeNumber = wholeNumberPart.replace(
  //     /\B(?=(\d{3})+(?!\d))/g,
  //     ','
  //   );

  //   let formattedValue = formattedWholeNumber;
  //   if (parts.length > 1) {
  //     formattedValue += '.' + parts[1];
  //   }

  //   this.isFormatting = true;
  //   this.el.nativeElement.value = formattedValue;

  //   const event = new Event('input', { bubbles: true });
  //   this.el.nativeElement.dispatchEvent(event);

  //   this.isFormatting = false;
  // }
}