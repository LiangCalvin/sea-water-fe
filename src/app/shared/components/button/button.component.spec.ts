import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { GlobalService } from '../../../services/global.service';
import { StudyDetailsModule } from '../../../core/enums/all-studies.enum';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let globalServiceSpy: jasmine.SpyObj<GlobalService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('GlobalService', ['getUserFullName']);

    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [{ provide: GlobalService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    globalServiceSpy = TestBed.inject(GlobalService) as jasmine.SpyObj<GlobalService>;

    globalServiceSpy.getUserFullName.and.returnValue('mock-user');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(globalServiceSpy.getUserFullName).toHaveBeenCalled();
  });

  describe('button click', () => {
    it('should emit buttonClick when no dropdown', () => {
      spyOn(component.buttonClick, 'emit');

      component.listAction = [];
      component.onButtonClick();

      expect(component.buttonClick.emit).toHaveBeenCalled();
      expect(component.isDropdownOpen).toBeFalse();
    });

    it('should toggle dropdown when hasDropdown', () => {
      component.listAction = [{ title: 'Test' }];
      expect(component.hasDropdown).toBeTrue();

      component.onButtonClick();
      expect(component.isDropdownOpen).toBeTrue();

      component.onButtonClick();
      expect(component.isDropdownOpen).toBeFalse();
    });
  });

  describe('dropdown action', () => {
    it('should emit actionChange and close dropdown', () => {
      spyOn(component.actionChange, 'emit');

      component.isDropdownOpen = true;
      const action = { title: 'ACTION1' };

      component.onDropdownAction(action);

      expect(component.isDropdownOpen).toBeFalse();
      expect(component.actionChange.emit).toHaveBeenCalledWith({ action: 'ACTION1' });
    });
  });

  describe('click outside', () => {
    it('should close dropdown if clicked outside', () => {
      component.isDropdownOpen = true;
      const event = { target: document.createElement('div') } as any;
      component.handleClickOutside(event);

      expect(component.isDropdownOpen).toBeFalse();
    });

    it('should not close dropdown if clicked inside .button-dropdown-container', () => {
      component.isDropdownOpen = true;
      const el = document.createElement('div');
      el.classList.add('button-dropdown-container');
      const event = { target: el } as any;

      component.handleClickOutside(event);
      expect(component.isDropdownOpen).toBeTrue();
    });
  });

  describe('styles', () => {
    it('should return default styles for size 1', () => {
      component.size = '1';
      component.width = '';
      const styles = component.buttonStyles;

      expect(styles['width']).toBe('120px');
      expect(styles['height']).toBe('36px');
    });

    it('should return auto width and minWidth when width="auto"', () => {
      component.width = 'auto';
      const styles = component.buttonStyles;

      expect(styles['width']).toBe('auto');
      expect(styles['minWidth']).toBe('40px');
    });

    it('should return custom width if set', () => {
      component.width = '200px';
      const styles = component.buttonStyles;

      expect(styles['width']).toBe('200px');
    });

    it('should return custom height if set', () => {
      component.height = '50px';
      const styles = component.buttonStyles;

      expect(styles['height']).toBe('50px');
    });
  });
});
