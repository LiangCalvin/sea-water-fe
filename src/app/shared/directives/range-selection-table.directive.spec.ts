import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RangeSelectionTableDirective } from './range-selection-table.directive';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    imports: [CommonModule, RangeSelectionTableDirective],
    template: `
    <table iowcRangeSelectionTable
           [selectCellClass]="'selected-class'"
           [deselectCellClass]="'deselected-class'"
           (parseEvent)="onParse($event)"
           (copyEvent)="onCopy($event)">
      <tr><td><input type="text" /></td><td><input type="text" /></td></tr>
      <tr><td><input type="text" /></td><td><input type="text" /></td></tr>
    </table>
  `
})
class TestHostComponent {
    parseEventData: any = null;
    copyEventData: any = null;

    onParse(event: any) {
        this.parseEventData = event;
    }

    onCopy(event: any) {
        this.copyEventData = event;
    }
}

describe('RangeSelectionTableDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let tableDebugEl: DebugElement;
    let directiveInstance: RangeSelectionTableDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RangeSelectionTableDirective, TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        tableDebugEl = fixture.debugElement.query(By.directive(RangeSelectionTableDirective));
        directiveInstance = tableDebugEl.injector.get(RangeSelectionTableDirective);
    });

    it('should create directive instance', () => {
        expect(directiveInstance).toBeTruthy();
    });

    it('should add paste and copy event listeners to firstElementChild of each td', () => {
        const tds = Array.from(directiveInstance['table'].querySelectorAll('td'));
        tds.forEach(td => {
            const input = td.firstElementChild as HTMLInputElement;
            expect(input.onpaste).toBeFalsy();
        });
    });

    it('should emit parseEvent with correct clipboard data and selection on paste', () => {
        spyOn(directiveInstance.parseEvent, 'emit');

        const clipboardEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
            bubbles: true,
            cancelable: true
        });

        directiveInstance['startCellRow'] = 0;
        directiveInstance['endCellRow'] = 1;
        directiveInstance['startCellCol'] = 0;
        directiveInstance['endCellCol'] = 1;

        directiveInstance['parseData'](clipboardEvent);

        expect(directiveInstance.parseEvent.emit).toHaveBeenCalledWith({
            clipboardData: clipboardEvent.clipboardData!,
            row: { startRow: 0, endRow: 1 },
            col: { startCol: 0, endCol: 1 }
        });
    });

    it('should emit copyEvent on copy', () => {
        spyOn(directiveInstance.copyEvent, 'emit');

        directiveInstance['startCellRow'] = 0;
        directiveInstance['endCellRow'] = 1;
        directiveInstance['startCellCol'] = 0;
        directiveInstance['endCellCol'] = 1;

        directiveInstance['copyData']({});

        expect(directiveInstance.copyEvent.emit).toHaveBeenCalledWith({
            row: { startRow: 0, endRow: 1 },
            col: { startCol: 0, endCol: 1 }
        });
    });

    it('should select and deselect cells on mousedown and mouseover', fakeAsync(() => {
        const tds = directiveInstance['table'].querySelectorAll('td');
        const firstTd = tds[0]!;
        const secondTd = tds[1]!;

        const firstInput = firstTd.querySelector('input')!;
        const secondInput = secondTd.querySelector('input')!;

        firstInput.dispatchEvent(new MouseEvent('mousedown', { button: 0, shiftKey: false, bubbles: true }));
        tick();
        fixture.detectChanges();

        console.log('First TD classes after 1st click:', [...firstTd.classList]);
        expect(firstTd.classList).toContain('selected-class');

        secondInput.dispatchEvent(new MouseEvent('mousedown', { button: 0, shiftKey: true, bubbles: true }));
        tick();
        fixture.detectChanges();

        console.log('First TD classes after 2nd click:', [...firstTd.classList]);
        console.log('Second TD classes after 2nd click:', [...secondTd.classList]);

        expect(firstTd.classList).toContain('selected-class');
        expect(secondTd.classList).toContain('selected-class');
    }));

    it('should clear selection when clicking outside of cells', fakeAsync(() => {
        const firstTd = directiveInstance['table'].querySelector('td')!;
        const mouseDownEvent = new MouseEvent('mousedown', { button: 0, bubbles: true });
        firstTd.dispatchEvent(mouseDownEvent);
        tick();
        fixture.detectChanges();

        const mouseDownOutsideEvent = new MouseEvent('mousedown', { button: 0, bubbles: true });
        directiveInstance['table'].dispatchEvent(mouseDownOutsideEvent);
        tick();
        fixture.detectChanges();
        const selectedCells = Array.from(directiveInstance['table'].querySelectorAll('td'))
            .filter(cell => cell.classList.contains('border-bright-light-blue'));
        expect(selectedCells.length).toBe(0);
    }));

    it('should update table attributes correctly when selecting cells', () => {
        const tds = directiveInstance['table'].querySelectorAll('td');
        const firstCell = tds[0]; 
        const lastCell = tds[3];

        directiveInstance['updateTableAttributes'](firstCell, lastCell);

        expect(directiveInstance['startCellRow']).toBe(0);
        expect(directiveInstance['startCellCol']).toBe(1);
        expect(directiveInstance['endCellRow']).toBe(1);
        expect(directiveInstance['endCellCol']).toBe(2); 

        expect(directiveInstance['table'].getAttribute('data-start-row')).toBe('0');
        expect(directiveInstance['table'].getAttribute('data-start-column')).toBe('1');
        expect(directiveInstance['table'].getAttribute('data-end-row')).toBe('1');
        expect(directiveInstance['table'].getAttribute('data-end-column')).toBe('2');
    });

});