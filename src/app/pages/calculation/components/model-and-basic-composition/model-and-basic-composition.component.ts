import { Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { CardComponent } from "../../../../shared/components/card/card.component";
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { ExcelTableComponent } from "../../../../shared/components/excel-table/excel-table.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UploadModalComponent } from '../../../../shared/components/modals/upload-modal/upload-modal.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { CalculationConstants, AlertMessageConstants } from '../../../../core/enums/calculation.enum';
import { RadioComponent } from "../../../../shared/components/radio/radio.component";
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ExcelTableService } from '../../../../shared/services/excel-table.service';
import { finalize, firstValueFrom, Subject, take, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { cleanObject } from '../../../../shared/Utils/cleanJSON';
import { GlobalTemplateService } from '../../../../services/global-template.service';
import { BasicCompositionData, manualComposition, manualTableResponse, ModelComposition, ModelCompositionResponse } from '../../../../core/models/calculation/model-and-basic-composition.model';
import { IdName } from '../../../../core/models/calculation/dropdown-option.model';
import { Study, Transaction } from '../../../../core/models/common/common.mode';
import { CalculationDataService } from '../../services/calculation-data.service';
import { UnsavedChangesService } from '../../../../services/unsaved-changes/unsaved-changes.service';
import { StepComponentWithUnsavedChanges } from '../../../../core/models/calculation/step-unsave-changes.model';

@Component({
  selector: 'app-model-and-basic-composition',
  standalone: true,
  imports: [CommonModule, FormsModule, NzRadioModule, CardComponent, DropdownComponent, ExcelTableComponent, ButtonComponent, RadioComponent, ReactiveFormsModule],
  templateUrl: './model-and-basic-composition.component.html',
  styleUrl: './model-and-basic-composition.component.scss'
})
export class ModelAndBasicCompositionComponent implements StepComponentWithUnsavedChanges {

  @ViewChild(ExcelTableComponent) excelTableComponent!: ExcelTableComponent;

  @Output() cancel = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();
  @Output() setLoading = new EventEmitter<boolean>();
  @Output() formChanged = new EventEmitter<boolean>();
  @Output() stepInteracted = new EventEmitter<boolean>();

  defaultType: string = CalculationConstants.GENERIC;
  study: Study = {};
  transaction: Transaction = {};
  dataModel: manualTableResponse[] = []
  isLoading: boolean = false;
  tempAllDataModel: BasicCompositionData[] = [];
  tempDataModelGeneric: manualTableResponse[] = [];
  models: IdName[] = [];
  form!: FormGroup;
  public hasInteractedWithForm = false;
  private isNavigatingAfterSubmit = false;
  private unsavedChangesService = inject(UnsavedChangesService);
  isSubmit: boolean = false;
  tableComposition: manualComposition[] = [];
  compositionGeneric: IdName[] = []

  generic: { label: string; value: string }[] = [
    {
      label: "Generic",
      value: "generic"
    }
  ]

  manual: { label: string; value: string }[] = [
    {
      label: "Manual",
      value: 'manual'
    }
  ]
  private templateService = inject(GlobalTemplateService);
  private destroy$ = new Subject<void>();
  readonly LOADING_TEMPLATE = this.templateService.getTemplate('loading');

  constructor(
    private readonly fb: FormBuilder,
    private readonly modal: NzModalService,
    private readonly calculationService: CalculationService,
    private readonly calculationDataService: CalculationDataService,
    private readonly alertService: AlertService,
    private readonly excelTableService: ExcelTableService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      whpDesign: [null, Validators.required],
      genericType: [this.defaultType],
      manualType: [''],
      genericComposition: [null]
    });
  }


  async ngOnInit(): Promise<void> {
    this.setupFormChangeTracking();
    this.models = [
      { id: 'M01', name: 'Wellhead Model A' },
      { id: 'M02', name: 'Wellhead Model B' },
      { id: 'M03', name: 'Wellhead Model C' },
    ];
    this.compositionGeneric = [
      { id: '25%', name: '25%' },
      { id: '50%', name: '50%' },
      { id: '75%', name: '75%' }
    ];
    this.form.valueChanges.subscribe(() => {
      this.hasInteractedWithForm = true;
    });
    const getStudy: any = sessionStorage.getItem('study');
    const getTransaction: any = sessionStorage.getItem('transactionId');
    this.study = JSON.parse(getStudy);
    this.transaction = JSON.parse(getTransaction);
    await this.getModelDropDown();
    await this.initForm();
    await this.getTableComposition();
    await this.getComposition();

  }

  async initForm(): Promise<void> {
    this.form = this.fb.group({
      whpDesign: [null, Validators.required],
      genericType: [this.defaultType],
      manualType: [''],
      genericComposition: [{ id: '3', name: '50%' }]
    });
  }

  ngOnDestroy() {
    if (!this.form || this.isSubmit) {
      this.destroy$.next();
      this.destroy$.complete();
      return;
    }

    const data = this.form.getRawValue() || {};

    this.excelTableService.getTableValue$().pipe(take(1)).subscribe({
      next: (dataTable) => {
        const getDataTable = dataTable.getRawValue?.();
        this.calculationDataService.basicModelData = data;
        this.calculationDataService.tableCompositionlData = getDataTable?.rows;
      },
      error: (err) => console.error('Error fetching table value:', err),
      complete: () => {
        this.destroy$.next();
        this.destroy$.complete();
      }
    });
  }

  private setupFormChangeTracking(): void {
    this.form.valueChanges.subscribe(() => {
      if (!this.hasInteractedWithForm) {
        this.hasInteractedWithForm = true;
        this.stepInteracted.emit(true);
      }
      this.formChanged.emit(true);
    });
  }

  hasUnsavedChanges(): boolean {
    const formDirty = this.form?.dirty || this.hasInteractedWithForm;
    const result = formDirty && !this.isNavigatingAfterSubmit;
    return result;
  }

  openUnsavedChangesModal(): Observable<boolean> {
    return this.unsavedChangesService.openUnsavedChangesModal(

    );
  }
  public resetInteractionState(): void {
    this.hasInteractedWithForm = false;
    this.stepInteracted.emit(false);
  }
  onExcelValueChanged(value: any) {
    this.tableComposition = value;
    if (!this.hasInteractedWithForm) {
      this.hasInteractedWithForm = true;
      this.stepInteracted.emit(true);
    }
    this.formChanged.emit(true);
  }

  onChange(value: string): void {
    if (value === CalculationConstants.MANUAL) {
      this.form.get('genericType')?.patchValue('');
      this.form.get('genericComposition')?.setValue(this.form.get('genericComposition')?.value ?? this.compositionGeneric[2]);
      this.form.get('genericComposition')?.disable();
      this.getTableCompositionTemplate();
    } else {
      this.form.get('manualType')?.patchValue('');
      this.form.get('genericComposition')?.enable();
      const findGeneric = this.tempAllDataModel.find((e) => e.name === this.form.get('genericComposition')?.value?.name);
      const table = {
        data: findGeneric
      }
      this.dataModel = this.convertCompositionsToTableFormat(table, findGeneric?.name) as manualTableResponse[];
    }
    if (!this.hasInteractedWithForm) {
      this.hasInteractedWithForm = true;
      this.stepInteracted.emit(true);
    }
    this.formChanged.emit(true);
  }
  onWHPDesignChange(selected: IdName) {
    this.form.get('whpDesign')?.patchValue(selected);

    if (!this.hasInteractedWithForm) {
      this.hasInteractedWithForm = true;
      this.stepInteracted.emit(true);
    }
    this.formChanged.emit(true);
  }

  onClearData() {
    const newData = this.dataModel.map((item: any) => ({
      ...item,
      columns: item.columns.map((column: any) => ({
        ...column,
        value: column.columnName === CalculationConstants.COLUMN_VALUE ? '0' : column.value
      }))
    }));
    this.dataModel = newData;
    if (!this.hasInteractedWithForm) {
      this.hasInteractedWithForm = true;
      this.stepInteracted.emit(true);
    }
    this.formChanged.emit(true);
  }

  openUploadDialog(): void {
    const modalRef = this.modal.create({
      nzContent: UploadModalComponent,
      nzFooter: null,
      nzWidth: 600
    });
    const instance = modalRef.getContentComponent();
    instance.title = CalculationConstants.TITLE_BASIC_COMPOSITION_TABLE;
    instance.desc = CalculationConstants.DESC_BASCI_COMPOSITION_TABLE;
    instance.templateName = CalculationConstants.TYPE_BASIC_COMPOSITION;
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.getTableCompositionByImportExcel(result);
        if (!this.hasInteractedWithForm) {
          this.hasInteractedWithForm = true;
          this.stepInteracted.emit(true);
        }
        this.formChanged.emit(true);
      }
    });
  }

  async getModelDropDown(): Promise<void> {
    try {
      const response = await firstValueFrom(this.calculationService.getDropDownModels());
      setTimeout(() => {
        this.models = response.data as IdName[];
      });
    } catch (error) {
      console.error("Error getModelDropDown:", error);
    }
  }

  async getTableComposition(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.calculationService.getTableModelCompositonById());
      const res = response?.data as BasicCompositionData[];
      this.tempAllDataModel = res;
      this.mappingDropdown(res);
      const filterName = res.filter((e) => e.name === this.compositionGeneric[2]?.name)
      const setModelCompositon = { data: { compositions: filterName[0]?.compositions } };
      const convertData = this.convertCompositionsToTableFormat(setModelCompositon, filterName[0]?.name)
      this.dataModel = convertData as manualTableResponse[];
      this.tempDataModelGeneric = convertData as manualTableResponse[];
    } catch (error) {
      console.error('Error fetching table composition:', error);
    } finally {
      this.isLoading = false;
    }
  }


  getComposition(): void {
    this.isLoading = true;
    const transactionId = this.transaction?.data?.transactionId;
    const studyId = this.study?.data?.studyId;
    this.calculationService.getModelCompositonById(studyId, transactionId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (!response?.data?.isGeneric) {
            this.form.get('genericComposition')?.disable();
          }

          const mapped = this.mapApiToForm(response?.data as ModelComposition);
          this.form.setValue(mapped);
          const convertData = this.convertCompositionsToTableFormat(response, response?.data?.compositionName || 'Custom');
          this.dataModel = convertData as manualTableResponse[];

          // Note : use state data confuse
          // if (this.calculationDataService.basicModelData?.whpDesign == null && (!this.calculationDataService.tableCompositionlData || this.calculationDataService.tableCompositionlData.length === 0)) {
          //   const mapped = this.mapApiToForm(response?.data as ModelComposition);
          //   this.form.setValue(mapped);
          //   const convertData = this.convertCompositionsToTableFormat(response, response?.data?.compositionName || 'Custom');
          //   this.dataModel = convertData as manualTableResponse[];
          // } else {
          //   this.form.setValue(this.calculationDataService.basicModelData);
          //   this.dataModel = this.calculationDataService.tableCompositionlData as manualTableResponse[];
          // }
        },
        error: error => {
          console.error('Error fetching strategy content:', error);
        }
      });
  }

  private mapApiToForm(data: ModelComposition) {
    const modelMatched = this.models.find((e) => e.id === data.modelId);
    const nameMatched = this.compositionGeneric.find((e) => e.name === data?.compositionName);
    return {
      whpDesign: modelMatched ?? null,
      genericType: data?.isGeneric ? CalculationConstants.GENERIC : '',
      manualType: !data?.isGeneric ? CalculationConstants.MANUAL : '',
      genericComposition: nameMatched
    };
  }

  mappingDropdown(data: BasicCompositionData[]) {
    const mapping = data.map((e, index) => {
      return {
        id: `${index + 1}`,
        name: e.name
      }
    })
    this.compositionGeneric = mapping as IdName[];
  }

  getTableCompositionByImportExcel(data: ModelCompositionResponse) {
    const compositionTable = data;
    const convertData = this.convertCompositionsToTableFormat(compositionTable, 'Custom')
    this.dataModel = convertData as manualTableResponse[];
  }

  getTableCompositionTemplate() {
    this.calculationService.getManualData().subscribe(async (response) => {
      try {
        this.dataModel = response;
      } catch (error) {
        console.log("error :", error);
      }
    });
  }


  convertCompositionsToTableFormat(source?: ModelCompositionResponse, name?: string) {
    if (!source?.data?.compositions) return [];
    return source?.data?.compositions.map(comp => ({
      columns: [
        { columnName: 'Component / Case', value: comp.name },
        {
          columnName: name === 'Custom' ? 'Custom' : `${name} CO2 (Mol%)`,
          value: comp.value
        }
      ]
    }));
  }


  onChangeComposition() {
    const getForm = this.form.getRawValue();
    const filterDataModel = this.tempAllDataModel.filter((e: any) => e.name === getForm?.genericComposition?.name)
    const setModelCompositon = {
      data: {
        compositions: filterDataModel[0]?.compositions
      }
    }
    const convertData = this.convertCompositionsToTableFormat(setModelCompositon, getForm?.genericComposition?.name);
    this.dataModel = convertData as manualTableResponse[];
    this.tempDataModelGeneric = convertData as manualTableResponse[];
    if (!this.hasInteractedWithForm) {
      this.hasInteractedWithForm = true;
      this.stepInteracted.emit(true);
    }
    this.formChanged.emit(true);
  }


  async onSaveDraft(): Promise<void> {
    const getFormModel = this.form.getRawValue();
    const transactionId = this.transaction?.data?.transactionId;
    const studyId = this.study?.data?.studyId;
    try {
      const dataTable = await firstValueFrom(this.excelTableService.getTableValue$());
      const getDataTable = dataTable.getRawValue?.();
      const convertDataComposition = this.convertTableToCompositions(getDataTable?.rows ?? []);
      const body = {
        studyId: studyId,
        modelId: getFormModel.whpDesign?.id,
        transactionId: transactionId,
        compositionName: getFormModel?.genericType ? getFormModel?.genericComposition?.name : '',
        isGeneric: getFormModel?.genericType ? true : false,
        compositions: convertDataComposition?.data?.compositions || []
      };
      const req = cleanObject(body);

      // this.calculationService.saveDraftModelComposition(req).subscribe({
      //   next: (response) => {
      //     if (response?.data?.transactionId) {
      //       const transactionData = { data: { transactionId: response.data.transactionId } };
      //       sessionStorage.setItem('transactionId', JSON.stringify(transactionData));
      //       const getStudy: any = sessionStorage.getItem('study');
      //       const getTransaction: any = sessionStorage.getItem('transactionId')
      //       this.study = JSON.parse(getStudy);
      //       this.transaction = JSON.parse(getTransaction);
      //     }
      //     const modalTitle = AlertMessageConstants.MODEL_TITLE_DRAFT;
      //     const modalText = response?.data?.message ?? AlertMessageConstants.MODEL_TEXT_DRAFT;
      //     this.alertService.success(modalTitle, modalText, true, 3000);
      //   },
      //   error: (error) => {
      //     const modalTitle = AlertMessageConstants.SAVE_FAILED_TEXT;
      //     const modalText = this.alertService.getErrorMessage(error);
      //     this.alertService.error(modalTitle, modalText, true, 5000);
      //   }
      // });
      console.log("draft")
      const modalTitle = AlertMessageConstants.MODEL_TITLE_DRAFT;
      const modalText = AlertMessageConstants.MODEL_TEXT_DRAFT;
      this.alertService.success(modalTitle, modalText, true, 3000);
    } catch (err) {
      console.error('Failed to get table values for draft', err);
      this.alertService.error('Unexpected error', 'Could not retrieve table data.', true, 3000);
    }
    const modalTitle = AlertMessageConstants.MODEL_TITLE_DRAFT;
    const modalText = AlertMessageConstants.MODEL_TEXT_DRAFT;
    this.alertService.success(modalTitle, modalText, true, 3000);
  }

  private convertTableToCompositions(data: any[]) {
    const compositions = data.map((item: any) => {
      const name = item.columns.find((col: any) => col.columnName === 'Component / Case')?.value ?? '';
      const valueStr = item.columns.find((col: any) =>
        col.columnName.includes('(Mol%)') || col.columnName.includes('Custom')
      )?.value || '0';

      return {
        name,
        value: parseFloat(valueStr)
      };
    });

    return {
      data: {
        compositions
      }
    };
  }

  async onNextStep(): Promise<void> {

    if (this.form.get('whpDesign')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const getFormModel = this.form.getRawValue();
    const dataTable = await firstValueFrom(this.excelTableService.getTableValue$());
    const getDataTable = dataTable.getRawValue?.() || dataTable;
    const convertDataComposition = this.convertTableToCompositions(getDataTable?.rows || []);
    const transactionId = this.transaction?.data?.transactionId;
    const studyId = this.study?.data?.studyId;
    const body = {
      studyId: studyId,
      transactionId: transactionId,
      modelId: getFormModel.whpDesign?.id,
      compositionName: getFormModel?.genericType ? getFormModel?.genericComposition?.name : '',
      isGeneric: getFormModel?.genericType ? true : false,
      compositions: convertDataComposition?.data?.compositions || []
    };

    if (dataTable.invalid) {
      const modalTitle = AlertMessageConstants.SAVE_FAILED_TITLE_MODEL_AND_BASIC_COMPOSITION;
      const modalText = AlertMessageConstants.SAVE_FAILED_TEXT_MODEL_AND_BASIC_COMPOSITION;
      this.alertService.error(modalTitle, modalText, true, 3000);
    } else {
      try {
        const req = cleanObject(body);
        this.calculationService.saveModelComposition(req).subscribe({
          next: (response) => {
            if (response?.data?.transactionId) {
              const transactionData = { data: { transactionId: response.data.transactionId } };
              sessionStorage.setItem('transactionId', JSON.stringify(transactionData));
              this.isSubmit = true;
            }

            const newCO2Value = convertDataComposition?.data?.compositions?.find(c => c.name === 'CO2')?.value;

            if (newCO2Value !== undefined) {
              const currentProcessData = this.calculationDataService.processData;
              if (Array.isArray(currentProcessData)) {
                this.calculationDataService.processData = currentProcessData.map((d: any) => ({
                  ...d,
                  composition: {
                    ...d.composition,
                    co2: newCO2Value
                  }
                }));
              } else {
                console.warn('processData is not an array, skipping CO2 update', currentProcessData);
              }
            }

            const modalTitle = AlertMessageConstants.MODEL_TITLE;
            const modalText = response?.data?.message ?? AlertMessageConstants.MODEL_TEXT;
            this.getComposition();
            this.getTableComposition();
            this.alertService.success(modalTitle, modalText, true, 3000);

            this.hasInteractedWithForm = false;
            this.stepInteracted.emit(false);

            this.nextStep.emit();
          },
          error: (error) => {
            const modalTitle = AlertMessageConstants.SAVE_FAILED_TITLE;
            const modalText = this.alertService.getErrorMessage(error);
            this.alertService.error(modalTitle, modalText, true, 5000);
          }
        });
      } catch (err) {
        console.error('Error reading table data', err);
      }
    }
  }

  getBasicComposition(value: string | null | undefined) {
    return this.compositionGeneric.find(opt => opt.id === value) || this.compositionGeneric[2];
  }
}
