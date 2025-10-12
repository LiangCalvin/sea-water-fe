import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModelAndBasicCompositionComponent } from './model-and-basic-composition.component';
import { FormBuilder } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { CalculationDataService } from '../../services/calculation-data.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ExcelTableService } from '../../../../shared/services/excel-table.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {  manualTableResponse } from '../../../../core/models/calculation/model-and-basic-composition.model';
import { IdName } from '../../../../shared/models/id-name.model';
import { CalculationConstants } from '../../../../core/enums/calculation.enum';

describe('ModelAndBasicCompositionComponent', () => {
  let component: ModelAndBasicCompositionComponent;
  let fixture: ComponentFixture<ModelAndBasicCompositionComponent>;

  let calculationServiceSpy: jasmine.SpyObj<CalculationService>;
  let calculationDataServiceSpy: Partial<CalculationDataService>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;
  let excelTableServiceSpy: jasmine.SpyObj<ExcelTableService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    calculationServiceSpy = jasmine.createSpyObj('CalculationService', [
      'getDropDownModels',
      'getTableModelCompositonById',
      'getModelCompositonById',
      'saveDraftModelComposition',
      'saveModelComposition',
      'getManualData'
    ]);

    alertServiceSpy = jasmine.createSpyObj('AlertService', ['success', 'error', 'getErrorMessage']);

    excelTableServiceSpy = jasmine.createSpyObj('ExcelTableService', ['getTableValue$', 'setTableValue']);
    excelTableServiceSpy.setTableValue.and.stub();

    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    calculationDataServiceSpy = {
      basicModelData: {},
      tableCompositionlData: []
    };

    TestBed.configureTestingModule({
      imports: [ModelAndBasicCompositionComponent],
      providers: [
        FormBuilder,
        { provide: CalculationService, useValue: calculationServiceSpy },
        { provide: CalculationDataService, useValue: calculationDataServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: ExcelTableService, useValue: excelTableServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: Router, useValue: routerSpy },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelAndBasicCompositionComponent);
    component = fixture.componentInstance;

    calculationServiceSpy.getDropDownModels.and.returnValue(of({ data: [{ id: '1', name: 'Model 1' } as IdName] }));
    calculationServiceSpy.getTableModelCompositonById.and.returnValue(of({ data: [] }));
    calculationServiceSpy.getModelCompositonById.and.returnValue(of({ data: { isGeneric: true, compositionName: '50%', modelId: '1', compositions: [] } }));
    excelTableServiceSpy.getTableValue$.and.returnValue(of({ getRawValue: () => ({ rows: [] }), invalid: false }));

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should call setup methods on ngOnInit', fakeAsync(async () => {
    spyOn(component, 'getModelDropDown').and.callThrough();
    spyOn(component, 'initForm').and.callThrough();
    spyOn(component, 'getTableComposition').and.callThrough();
    spyOn(component, 'getComposition').and.callThrough();

    await component.ngOnInit();
    tick();

    expect(component.getModelDropDown).toHaveBeenCalled();
    expect(component.initForm).toHaveBeenCalled();
    expect(component.getTableComposition).toHaveBeenCalled();
    expect(component.getComposition).toHaveBeenCalled();
    expect(component.form).toBeDefined();
  }));

  it('should emit stepInteracted and formChanged when onChange called', () => {
    spyOn(component.stepInteracted, 'emit');
    spyOn(component.formChanged, 'emit');
  
    calculationServiceSpy.getManualData.and.returnValue(of([]));
  
    component.onChange('manual');
  
    expect(component.stepInteracted.emit).toHaveBeenCalledWith(true);
    expect(component.formChanged.emit).toHaveBeenCalledWith(true);
  });
  
  it('should emit nextStep and reset hasInteractedWithForm on onNextStep success', fakeAsync(() => {
    calculationServiceSpy.saveModelComposition.and.returnValue(of({ data: { transactionId: '123', message: 'Saved' } }));

    spyOn(component.stepInteracted, 'emit');
    spyOn(component.nextStep, 'emit');

    component.form.get('whpDesign')?.setValue({ id: '1', name: 'Test' });
    component.onNextStep();
    tick();

    expect(alertServiceSpy.success).toHaveBeenCalled();
    expect(component.hasInteractedWithForm).toBe(false);
    expect(component.nextStep.emit).toHaveBeenCalled();
  }));

  it('should call alertService.success on onSaveDraft success', fakeAsync(() => {
    const mockTable: { getRawValue: () => { rows: unknown[] } } = { getRawValue: () => ({ rows: [] }) };
    excelTableServiceSpy.getTableValue$.and.returnValue(of(mockTable));
    calculationServiceSpy.saveDraftModelComposition.and.returnValue(of({ data: { transactionId: '123', message: 'Saved' } }));

    spyOn(component, 'getComposition');
    spyOn(component, 'getTableComposition');

    component.onSaveDraft();
    tick();

    expect(alertServiceSpy.success).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), true, 3000);
  }));

  it('should update tableComposition on onChangeComposition', () => {
    component.tempAllDataModel = [
      { name: '50%', compositions: [{ name: 'comp1', value: 1 }] }
    ];
    component.form.get('genericComposition')?.setValue({ name: '50%', id: '3' });
  
    component.hasInteractedWithForm = false;
  
    spyOn(component.stepInteracted, 'emit');
    spyOn(component.formChanged, 'emit');
  
    component.onChangeComposition();
  
    expect(component.dataModel.length).toBeGreaterThan(0);
    expect(component.tempDataModelGeneric.length).toBeGreaterThan(0);
    expect(component.stepInteracted.emit).toHaveBeenCalledWith(true);
    expect(component.formChanged.emit).toHaveBeenCalledWith(true);
  });
  
  it('should call onWHPDesignChange and emit events', () => {
    spyOn(component.stepInteracted, 'emit');
    spyOn(component.formChanged, 'emit');

    const selected: IdName = { id: '1', name: 'Design 1' };
    component.onWHPDesignChange(selected);

    expect(component.form.get('whpDesign')?.value).toEqual(selected);
    expect(component.stepInteracted.emit).toHaveBeenCalledWith(true);
    expect(component.formChanged.emit).toHaveBeenCalledWith(true);
  });

  it('should reset data on onClearData', () => {
    component.dataModel = [
        {
          columns: [
            { columnName: CalculationConstants.COLUMN_VALUE, value: 'A' }
          ]
        } as manualTableResponse
      ];

    spyOn(component.stepInteracted, 'emit');
    spyOn(component.formChanged, 'emit');

    component.onClearData();

    expect(component.dataModel[0].columns[0].value).toBe('0');
    expect(component.stepInteracted.emit).toHaveBeenCalledWith(true);
    expect(component.formChanged.emit).toHaveBeenCalledWith(true);
  });
});
