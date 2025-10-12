import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSearchComponent } from './input-search.component';

describe('InputSearchComponent', () => {
  let component: InputSearchComponent;
  let fixture: ComponentFixture<InputSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputSearchComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InputSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clickOutside', () => {
    it('should close dropdown if clicked outside element', () => {
      component.isOpen = true;
      const event = new MouseEvent('click', {
        bubbles: true
      });
      // Simulate click outside by creating event target not contained in native element
      spyOn((component as any).eRef.nativeElement, 'contains').and.returnValue(false);

      component.clickOutside(event);

      expect(component.isOpen).toBeFalse();
    });

    it('should not close dropdown if clicked inside element', () => {
      component.isOpen = true;
      const event = new MouseEvent('click');
      spyOn((component as any).eRef.nativeElement, 'contains').and.returnValue(true);

      component.clickOutside(event);

      expect(component.isOpen).toBeTrue();
    });
  });

  describe('onSearch', () => {
    let emitSpy: jasmine.Spy;

    beforeEach(() => {
      emitSpy = spyOn(component.search, 'emit');
    });

    it('should close dropdown and not emit if input is empty', () => {
      const event = { target: { value: '  ' } } as any;
      component.isOpen = true;

      component.onSearch(event);

      expect(component.isOpen).toBeFalse();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should open dropdown and emit if input contains digit', () => {
      const event = { target: { value: 'abc123' } } as any;

      component.onSearch(event);

      expect(component.isOpen).toBeTrue();
      expect(emitSpy).toHaveBeenCalledWith('abc123');
    });

    it('should open dropdown and emit if input contains >= 3 letters', () => {
      const event = { target: { value: 'abcd' } } as any;

      component.onSearch(event);

      expect(component.isOpen).toBeTrue();
      expect(emitSpy).toHaveBeenCalledWith('abcd');
    });

    it('should NOT open dropdown or emit if input has letters but less than 3', () => {
      const event = { target: { value: 'ab' } } as any;

      component.onSearch(event);

      expect(component.isOpen).toBeFalse();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectItem', () => {
    it('should set value, close dropdown and emit valueChange', () => {
      spyOn(component.valueChange, 'emit');
      const item = { label: 'Test Label' };

      component.selectItem(item);

      expect(component.value).toBe('Test Label');
      expect(component.isOpen).toBeFalse();
      expect(component.valueChange.emit).toHaveBeenCalledWith('Test Label');
    });
  });

  describe('onSearchEnter', () => {
    it('should emit enterValueChange with trimmed input value', () => {
      spyOn(component.enterValueChange, 'emit');
      const event = { target: { value: '  test  ' } } as any;

      component.onSearchEnter(event);

      expect(component.enterValueChange.emit).toHaveBeenCalledWith('test');
    });
  });

  describe('onClick', () => {
    it('should emit valueChange with current value', () => {
      spyOn(component.valueChange, 'emit');
      component.value = 'current value';

      component.onClick();

      expect(component.valueChange.emit).toHaveBeenCalledWith('current value');
    });
  });

  describe('onClickInput', () => {
    it('should toggle dropdown if data is not empty', () => {
      component.data = [1, 2, 3];
      component.isOpen = false;

      component.onClickInput();

      expect(component.isOpen).toBeTrue();

      component.onClickInput();

      expect(component.isOpen).toBeFalse();
    });

    it('should not toggle dropdown if data is empty', () => {
      component.data = [];
      component.isOpen = false;

      component.onClickInput();

      expect(component.isOpen).toBeFalse();
    });
  });

  describe('onScroll', () => {
    it('should emit scrollChange with true when scrolled to bottom', () => {
      spyOn(component.scrollChange, 'emit');

      const event = {
        target: {
          scrollTop: 80,
          clientHeight: 20,
          scrollHeight: 100
        }
      } as unknown as Event;

      component.onScroll(event);

      expect(component.scrollChange.emit).toHaveBeenCalledWith(true as any);


    });

    it('should emit scrollChange with false when not scrolled to bottom', () => {
      spyOn(component.scrollChange, 'emit');

      const event = {
        target: {
          scrollTop: 50,
          clientHeight: 20,
          scrollHeight: 100
        }
      } as unknown as Event;

      component.onScroll(event);

      expect(component.scrollChange.emit).toHaveBeenCalledWith(false as any);

    });
  });

});
