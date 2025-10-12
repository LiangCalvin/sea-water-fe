import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NumericInputDirective } from './numeric-input.directive';

@Component({
    template: `
    <input type="text"
           appNumericInput
           [enabled]="true"
           [allowDecimals]="allowDecimals"
           [decimalLimit]="decimalLimit"
           [displayCommas]="displayCommas"
           [addLeadingZero]="addLeadingZero"
           #numericInput>
  `,
    standalone: true,
    imports: [NumericInputDirective]
})
class TestComponent {
    allowDecimals: boolean = false;
    decimalLimit: number = 0;
    displayCommas: boolean = false;
    addLeadingZero: boolean = true;
}

describe('NumericInputDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let inputEl: HTMLInputElement;
    let debugEl: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        debugEl = fixture.debugElement.query(By.directive(NumericInputDirective));
        inputEl = debugEl.nativeElement;
    });

    it('should create an instance', () => {
        const directive = debugEl.injector.get(NumericInputDirective);
        expect(directive).toBeTruthy();
    });


    it('should allow only numbers by default (no decimals)', () => {
        inputEl.value = '123abc456';
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('123456');
    });

    it('should remove leading zeros for integers', () => {
        inputEl.value = '007';
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('7');

        inputEl.value = '0';
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('0');
    });

    it('should maintain cursor position when removing leading zeros', (done) => {
        inputEl.value = '00123';
        inputEl.setSelectionRange(2, 2); 
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();

  
        setTimeout(() => {
            expect(inputEl.value).toBe('123');
            expect(inputEl.selectionStart).toBe(0);
            expect(inputEl.selectionEnd).toBe(0);
            done();
        }, 0);
    });


    it('should allow decimals when allowDecimals is true', () => {
        fixture.componentInstance.allowDecimals = true;
        fixture.detectChanges();

        inputEl.value = '123.45';
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('123.45');

        inputEl.value = '123..45'; 
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('123.45');
    });

    it('should add leading zero and correctly position cursor if input starts with a decimal point and addLeadingZero is true', (done) => {
        fixture.componentInstance.allowDecimals = true;
        fixture.componentInstance.addLeadingZero = true;
        fixture.detectChanges();
        inputEl.value = '.123';
      
        inputEl.setSelectionRange(1, 1);

        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        setTimeout(() => {
            expect(inputEl.value).toBe('0.123');
            expect(inputEl.selectionStart).toBe(2);
            expect(inputEl.selectionEnd).toBe(2);
            done();
        }, 0);
    });

    it('should maintain cursor position correctly when adding leading zero in the middle of typing', (done) => {
        fixture.componentInstance.allowDecimals = true;
        fixture.componentInstance.addLeadingZero = true;
        fixture.detectChanges();

        inputEl.value = '123.';
        inputEl.setSelectionRange(4, 4);
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        setTimeout(() => {
         
            inputEl.value = '';
            inputEl.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            inputEl.value = '.123';
            inputEl.setSelectionRange(0, 0);
            inputEl.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            setTimeout(() => {
                expect(inputEl.value).toBe('0.123');
                expect(inputEl.selectionStart).toBe(1);
                done();
            }, 0);
        }, 0);
    });

    // it('should not add leading zero if input starts with a decimal point and addLeadingZero is false', () => {
    //     fixture.componentInstance.allowDecimals = true;
    //     fixture.componentInstance.addLeadingZero = false;
    //     fixture.detectChanges();

    //     inputEl.value = '.123';
    //     inputEl.dispatchEvent(new Event('input'));
    //     fixture.detectChanges();
    //     expect(inputEl.value).toBe('.123');
    // });

    it('should remove leading zeros for decimal numbers during input', (done) => {
        fixture.componentInstance.allowDecimals = true;
        fixture.detectChanges();

        inputEl.value = '00123.45';
        inputEl.setSelectionRange(2, 2); // Cursor after the second zero
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        setTimeout(() => {
            expect(inputEl.value).toBe('123.45');
            expect(inputEl.selectionStart).toBe(0); // Cursor should move
            done();
        }, 0);
    });

    it('should remove leading zeros for decimal numbers on blur', () => {
        fixture.componentInstance.allowDecimals = true;
        fixture.detectChanges();

        inputEl.value = '00123.45';
        inputEl.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('123.45');

        inputEl.value = '0.45'; // Should keep single zero before decimal
        inputEl.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('0.45');
    });


    // --- decimalLimit Tests ---

    it('should limit decimal places when decimalLimit is set', () => {
        fixture.componentInstance.allowDecimals = true;
        fixture.componentInstance.decimalLimit = 2;
        fixture.detectChanges();

        inputEl.value = '123.4567';
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('123.45');
    });

    it('should not limit decimal places when decimalLimit is 0', () => {
        fixture.componentInstance.allowDecimals = true;
        fixture.componentInstance.decimalLimit = 0; // No limit
        fixture.detectChanges();

        inputEl.value = '123.456789';
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('123.456789');
    });

    // --- displayCommas Tests ---

    it('should format with commas on blur when displayCommas is true', () => {
        fixture.componentInstance.displayCommas = true;
        fixture.detectChanges();

        inputEl.value = '1234567';
        inputEl.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('1,234,567');
    });

    it('should format with commas and decimals on blur when displayCommas and allowDecimals are true', () => {
        fixture.componentInstance.displayCommas = true;
        fixture.componentInstance.allowDecimals = true;
        fixture.detectChanges();

        inputEl.value = '1234567.89';
        inputEl.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('1,234,567.89');
    });

    it('should remove commas on focus when displayCommas is true', () => {
        fixture.componentInstance.displayCommas = true;
        fixture.detectChanges();

        // Simulate initial value (e.g., from a loaded form)
        inputEl.value = '1,234,567.89';
        inputEl.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(inputEl.value).toBe('1234567.89');
    });

    it('should re-apply commas on blur after editing a comma-formatted number', () => {
        fixture.componentInstance.displayCommas = true;
        fixture.detectChanges();

        inputEl.value = '1,234,567'; // Initial formatted value
        inputEl.dispatchEvent(new Event('focus')); // Remove commas
        fixture.detectChanges();
        expect(inputEl.value).toBe('1234567');

        inputEl.value = '12345678'; // User types something
        inputEl.dispatchEvent(new Event('blur')); // Re-apply commas
        fixture.detectChanges();
        expect(inputEl.value).toBe('12,345,678');
    });

    it('should apply comma formatting on ngOnInit if value exists and displayCommas is true', (done) => {
        // Reconfigure TestBed to test ngOnInit with an initial value
        TestBed.resetTestingModule(); // Reset previous config
        @Component({
            template: `
        <input type="text"
               appNumericInput
               [enabled]="true"
               [displayCommas]="true"
               [allowDecimals]="false"
               [addLeadingZero]="false"
               value="1234567">
      `,
            standalone: true,
            imports: [NumericInputDirective]
        })
        class InitialValueTestComponent { }

        TestBed.configureTestingModule({
            imports: [InitialValueTestComponent]
        }).compileComponents().then(() => {
            const initialFixture = TestBed.createComponent(InitialValueTestComponent);
            const initialInputEl = initialFixture.debugElement.query(By.directive(NumericInputDirective)).nativeElement;
            initialFixture.detectChanges();

            // ngOnInit uses setTimeout, so we need to wait
            setTimeout(() => {
                expect(initialInputEl.value).toBe('1,234,567');
                done();
            }, 0);
        });
    });

    it('should apply leading zero on ngOnInit if value exists, allowDecimals and addLeadingZero are true', (done) => {
        // Reconfigure TestBed to test ngOnInit with an initial value
        TestBed.resetTestingModule();
        @Component({
            template: `
        <input type="text"
               appNumericInput
               [enabled]="true"
               [allowDecimals]="true"
               [addLeadingZero]="true"
               [displayCommas]="false"
               value=".123">
      `,
            standalone: true,
            imports: [NumericInputDirective]
        })
        class InitialDecimalValueTestComponent { }

        TestBed.configureTestingModule({
            imports: [InitialDecimalValueTestComponent]
        }).compileComponents().then(() => {
            const initialFixture = TestBed.createComponent(InitialDecimalValueTestComponent);
            const initialInputEl = initialFixture.debugElement.query(By.directive(NumericInputDirective)).nativeElement;
            initialFixture.detectChanges();

            setTimeout(() => {
                expect(initialInputEl.value).toBe('0.123');
                done();
            }, 0);
        });
    });


    // --- enabled Test ---

    // it('should do nothing if enabled is false', () => {
    //     fixture.componentInstance.enabled = false;
    //     fixture.detectChanges();

    //     inputEl.value = '123abc';
    //     inputEl.dispatchEvent(new Event('input'));
    //     fixture.detectChanges();
    //     expect(inputEl.value).toBe('123abc'); // Value should remain unchanged
    // });
});
