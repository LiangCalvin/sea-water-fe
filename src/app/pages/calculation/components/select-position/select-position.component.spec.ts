import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectPositionComponent } from './select-position.component';
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../CalculationContext.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PositionGroup } from '../../../../core/models/calculation/position-group.model';
import { CommonService } from '../../../../services/common/common.service';

describe('SelectPositionComponent', () => {
    let component: SelectPositionComponent;
    let fixture: ComponentFixture<SelectPositionComponent>;
    let mockCalculationService: jasmine.SpyObj<CalculationService>;
    let mockContextService: jasmine.SpyObj<CalculationContextService>;
    let mockCommonService: jasmine.SpyObj<CommonService>;

    beforeEach(async () => {
        mockCalculationService = jasmine.createSpyObj('CalculationService', [
            'getProcessInformationById',
            'saveDraftSelectPosition'
        ]);
        mockContextService = jasmine.createSpyObj('CalculationContextService', ['getSelectPosition', 'setSelectPosition']);
        mockCommonService = {} as jasmine.SpyObj<CommonService>;

        await TestBed.configureTestingModule({
            imports: [SelectPositionComponent],
            providers: [
                { provide: CalculationService, useValue: mockCalculationService },
                { provide: CalculationContextService, useValue: mockContextService },
                { provide: CommonService, useValue: mockCommonService },

            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        sessionStorage.setItem('study', JSON.stringify({ data: { studyId: 'study123' } }));
        sessionStorage.setItem('transactionId', JSON.stringify({ data: { transactionId: 'tx456' } }));

        fixture = TestBed.createComponent(SelectPositionComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        sessionStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set sequenceFlow and update context on position change', () => {
        const newPosition: PositionGroup = { sequenceFlow: '2,3,4,5' };
        component['isInitialized'] = true;
        component.onPositionChange(newPosition);
        expect(component.sequenceFlow).toEqual('2,3,4,5');
        expect(mockContextService.setSelectPosition).toHaveBeenCalledWith(newPosition);
    });

    it('should emit backStep on onBackStep()', () => {
        spyOn(component.backStep, 'emit');
        component.onBackStep();
        expect(component.backStep.emit).toHaveBeenCalled();
    });

    it('should not save draft if no position in context', () => {
        mockContextService.getSelectPosition.and.returnValue(null);
        component.onSaveDraft();
        expect(mockCalculationService.saveDraftSelectPosition).not.toHaveBeenCalled();
    });

});