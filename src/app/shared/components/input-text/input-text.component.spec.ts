import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputTextComponent } from './input-text.component';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('InputTextComponent', () => {
  let component: InputTextComponent;
  let fixture: ComponentFixture<InputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextComponent, ReactiveFormsModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextComponent);
    component = fixture.componentInstance;
    component.formControl = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('writeValue', () => {
    it('should set value and update formControl', () => {
      component.writeValue('');
      expect(component.value).toBe('');
      expect(component.formControl.value).toBe('');
    });
    
    it('should set undefined when value is null', () => {
      component.writeValue(null);
      expect(component.value).toBeUndefined();
    });
    
  });

  describe('onInput', () => {
    it('should update value, formControl, and call onChange', () => {
      const spy = spyOn<any>(component, 'onChange');
      const input = fixture.debugElement.query(By.css('input'));

      input.nativeElement.value = '';
      input.triggerEventHandler('input', { target: input.nativeElement });

      expect(component.value).toBe('');
      expect(component.formControl.value).toBe('');
      expect(spy).toHaveBeenCalledWith('');
    });

    it('should emit interacted event when user has focused', () => {
      component.onFocus();
      spyOn(component.interacted, 'emit');

      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = '123';
      input.triggerEventHandler('input', { target: input.nativeElement });

      expect(component.interacted.emit).toHaveBeenCalled();
    });
  });

  describe('handleBlur', () => {
    it('should emit customBlur', () => {
      spyOn(component.customBlur, 'emit');
      component.handleBlur();
      expect(component.customBlur.emit).toHaveBeenCalled();
    });
  });
});
