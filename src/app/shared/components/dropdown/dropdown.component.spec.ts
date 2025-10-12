import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { InputDropdownService } from '../../services/input-dropdown.service';
import { IdName } from '../../models/id-name.model';
import { Component, ElementRef, InputSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';

describe('DropdownComponent', () => {
    let component: DropdownComponent;
    let fixture: ComponentFixture<DropdownComponent>;
    let mockService: jasmine.SpyObj<InputDropdownService>;

    beforeEach(async () => {
        mockService = jasmine.createSpyObj('InputDropdownService', ['closeAllDropdowns']);

        await TestBed.configureTestingModule({
            imports: [DropdownComponent, FormsModule],
            providers: [
                { provide: InputDropdownService, useValue: mockService }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(DropdownComponent);
        component = fixture.componentInstance;
        // fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should write value when writeValue is called', () => {
    //     const option: IdName = { id: '1', name: 'Option 1' };
    //     component.writeValue(option);
    //     expect(component.selectedOption).toEqual(option);
    // });

    it('should register onChange callback', () => {
        const fn = jasmine.createSpy('onChange');
        component.registerOnChange(fn);
        (component as any).onChange('test');
        expect(fn).toHaveBeenCalledWith('test');
    });

    it('should register onTouched callback', () => {
        const fn = jasmine.createSpy('onTouched');
        component.registerOnTouched(fn);
        (component as any).onTouched();
        expect(fn).toHaveBeenCalled();
    });

    it('should emit selectChange when option is selected', () => {
        spyOn(component.selectChange, 'emit');
        const option: IdName = { id: '1', name: 'Option 1' };
        component.selectOption(option);
        expect(component.selectedOption).toEqual(option);
        expect(component.selectChange.emit).toHaveBeenCalledWith(option);
        expect(mockService.closeAllDropdowns).toHaveBeenCalled();
    });

    it('should emit null on clearSelection', () => {
        spyOn(component.selectChange, 'emit');
        const mockEvent = new MouseEvent('click');
        component.clearSelection(mockEvent);
        expect(component.selectedOption).toBeNull();
        expect(component.selectChange.emit).toHaveBeenCalledWith({ id: '', name: '' });
    });

    it('should emit customBlur event on handleBlur', () => {
        spyOn(component.customBlur, 'emit');
        component.handleBlur();
        expect(component.customBlur.emit).toHaveBeenCalled();
    });

    it('should update disabled state', () => {
        component.setDisabledState(true);
        expect(component.isDisabled).toBeTrue();
    });

    it('should return displayValue correctly', () => {
        // Cast writable signal as InputSignal to satisfy typing
        // component.options = signal([{ id: '1', name: 'Test Option' }]) as unknown as InputSignal<IdName[]>;
        component.options = [{ id: '1', name: 'Test Option' }];

        component.selectedOption = { id: '1', name: 'Test Option' };

        expect(component.displayValue).toBe('Test Option');
    });

    it('should return true if option is selected', () => {
        const opt = { id: 'A', name: 'Name' };
        component.selectedOption = { id: 'A', name: 'Name' };
        expect(component.isSelectedOption(opt)).toBeTrue();
    });
});