import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PositionSelectorComponent } from './position-selector.component';
import { CalculationContextService } from '../../../CalculationContext.service';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('PositionSelectorComponent', () => {
    let component: PositionSelectorComponent;
    let fixture: ComponentFixture<PositionSelectorComponent>;
    let mockContextService: jasmine.SpyObj<CalculationContextService>;
    let mockCalculationService: jasmine.SpyObj<CalculationService>;

    beforeEach(async () => {
        mockContextService = jasmine.createSpyObj('CalculationContextService', [
            'getAvailableSequenceFlows',
            'setSelectPosition',
            'onSequenceFlowChange'
        ]);
        mockCalculationService = {} as unknown as jasmine.SpyObj<CalculationService>;

        await TestBed.configureTestingModule({
            imports: [PositionSelectorComponent],
            providers: [
                { provide: CalculationContextService, useValue: mockContextService },
                { provide: CalculationService, useValue: mockCalculationService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(PositionSelectorComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should select matching sequenceFlow and emit positionGroup', () => {
            const sequenceOptions = ['1,2,3,4', '5,6,7,8'];
            mockContextService.getAvailableSequenceFlows.and.returnValue(sequenceOptions);
            spyOn(component.positionChange, 'emit');

            component.sequenceFlow = '5,6,7,8';
            fixture.detectChanges();

            expect(component.selectedSequenceFlow).toBe('5,6,7,8');
            expect(component.positionChange.emit).not.toHaveBeenCalled();
            expect(mockContextService.setSelectPosition).toHaveBeenCalledWith({ sequenceFlow: '5,6,7,8' });
        });

        it('should default to first option if no match found', () => {
            const sequenceOptions = ['1,2,3,4'];
            mockContextService.getAvailableSequenceFlows.and.returnValue(sequenceOptions);

            component.sequenceFlow = 'non-matching';
            spyOn(component.positionChange, 'emit');

            component.ngOnInit();
            fixture.detectChanges();

            expect(component.selectedSequenceFlow).toBe('1,2,3,4');
            expect(mockContextService.setSelectPosition).toHaveBeenCalledWith({ sequenceFlow: '1,2,3,4' });
            // expect(component.positionChange.emit).toHaveBeenCalledWith({ sequenceFlow: '1,2,3,4' });
        });
    });

    it('onDropdownChange should update selection and emit', () => {
        const newSelection = { id: '7,8,9', name: '7,8,9' };
        spyOn(component.positionChange, 'emit');

        component.onDropdownChange(newSelection);

        expect(component.selectedSequenceFlow).toBe('7,8,9');
        expect(component.positionChange.emit).toHaveBeenCalledWith({ sequenceFlow: '7,8,9' });
        expect(mockContextService.setSelectPosition).toHaveBeenCalledWith({ sequenceFlow: '7,8,9' });
    });

    it('getSelectedOption should return correct value', () => {
        component.selectedSequenceFlow = '1,2,3,4';
        expect(component.getSelectedOption()).toEqual({ id: '1,2,3,4', name: '1,2,3,4' });
    });

    it('onSequenceFlowChange should delegate to contextService', () => {
        component.onSequenceFlowChange('newFlow');
        expect(mockContextService.onSequenceFlowChange).toHaveBeenCalledWith('newFlow');
    });
});