import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../../CalculationContext.service';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ErosionCalculation, ErosionCalculationData } from '../../../../../core/models/calculation/erosion.model';
import { InputTextComponent } from '../../../../../shared/components/input-text/input-text.component';
import { RadioComponent } from '../../../../../shared/components/radio/radio.component';
import { firstValueFrom, Subject } from 'rxjs';
import { AlertMessageConstants } from '../../../../../core/enums/calculation.enum';
import { AlertService } from '../../../../../shared/services/alert.service';
import { CalculationDataService } from '../../../services/calculation-data.service';

@Component({
  selector: 'app-erosion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CollapseComponent,
    NzGridModule,
    InputTextComponent,
    RadioComponent,
  ],
  templateUrl: './erosion.component.html',
  styleUrl: './erosion.component.scss',
  standalone: true,
})
export class ErosionComponent implements OnInit {
  @ViewChild('innerDiv', { read: ElementRef }) innerDiv!: ElementRef;
  @Output() interacted = new EventEmitter<void>();

  expanded = true;
  erosionForm!: FormGroup;
  studyCode: string = '';
  study: any;
  transactionId: any;
  erosionRadioOptions = [
    { label: 'Calculate Max Sand Rate', value: 'maxSandRate' },
    {
      label: 'Calculate Erosion Rate',
      value: 'allowableErosionRate',
    },
  ];
  private readonly defaultFormValues = {
    calculationType: 'maxSandRate',
    allowableErosionRate: 0.1,
    sandProductionRate: null,
    sandDiameter: 100,
    geometryConstant: 5.5,
  };
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly calculationService: CalculationService,
    private readonly calculationContextService: CalculationContextService,
    private readonly alertService: AlertService,
    private readonly calculationDataService: CalculationDataService,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadSessionData();

    this.setupConditionalValidators(
      this.erosionForm.get('calculationType')?.value,
    );
    this.erosionForm.updateValueAndValidity();

    if (this.study?.data?.studyId) {
      this.getErosionCalculationData(
        this.study?.data?.studyId,
        this.transactionId?.data?.transactionId,
      );
    }
    this.erosionForm.valueChanges.subscribe(() => {
      this.calculationContextService.setErosionValid(this.erosionForm.valid);
    });
  }

  private loadSessionData() {
    this.study = JSON.parse(sessionStorage.getItem('study') || '{}');
    this.transactionId = JSON.parse(sessionStorage.getItem('transactionId') || '{}');
  }

  ngOnDestroy(): void {

    if (!this.erosionForm) {

      this.destroy$.next();
      this.destroy$.complete();
      return;
    }

    const data = this.erosionForm.getRawValue() || {};
    const newData = {
      calculationType: data.calculationType,
      sandProductionRate: data.sandProductionRate,
      allowableErosionRate: data.allowableErosionRate,
      geometryConstant: data.geometryConstant,
      sandDiameter: data.sandDiameter,

    }
    this.calculationDataService.erosionData = newData;
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.erosionForm = this.fb.group({
      calculationType: ['maxSandRate', Validators.required],
      allowableErosionRate: [0.1, [Validators.required, Validators.min(0.1)]],
      sandProductionRate: [null, [Validators.required, Validators.min(0.001)]],
      sandDiameter: [100, [Validators.required, Validators.min(1)]],
      geometryConstant: [5.5, [Validators.required, Validators.min(0.1)]],
    });

    this.erosionForm.get('calculationType')?.valueChanges.subscribe((value) => {
      const allowableErosionRateControl = this.erosionForm.get(
        'allowableErosionRate',
      );
      const sandProductionRateControl =
        this.erosionForm.get('sandProductionRate');

      if (value === 'allowableErosionRate') {
        sandProductionRateControl?.setValidators([
          Validators.required,
          Validators.min(0.001),
        ]);
        sandProductionRateControl?.updateValueAndValidity();

        allowableErosionRateControl?.clearValidators();
        allowableErosionRateControl?.updateValueAndValidity();
      } else {
        allowableErosionRateControl?.setValidators([
          Validators.required,
          Validators.min(0.1),
        ]);
        allowableErosionRateControl?.updateValueAndValidity();

        sandProductionRateControl?.clearValidators();
        sandProductionRateControl?.updateValueAndValidity();
      }
    });

    this.calculationContextService.setErosionForm(this.erosionForm);
  }

  setErosionForm(data: ErosionCalculationData) {
    this.erosionForm = this.fb.group({
      calculationType: [data.calculationType || 'maxSandRate', Validators.required],
      allowableErosionRate: [data.allowableErosionRate || null, [Validators.required, Validators.min(0.1)]],
      sandProductionRate: [data.sandProductionRate || null, [Validators.required, Validators.min(0.001)]],
      sandDiameter: [data.sandDiameter || null, [Validators.required, Validators.min(1)]],
      geometryConstant: [data.geometryConstant || null, [Validators.required, Validators.min(0.1)]],
    });
  }

  getErosionCalculationData(studyId: string, transactionId: string): void {
    this.calculationService
      .getErosionCalculationDataById(studyId, transactionId)
      .subscribe({
        next: (res) => {
          const data = res.data;
          if (data) {
            if (!this.calculationDataService.erosionData) {
              this.mapFetchedDataToForm(data);
            } else {
              this.mapFetchedDataToFormByTemp(this.calculationDataService.erosionData);
            }
          } else {
            if (!this.calculationDataService.erosionData) {
              this.initializeForm();
            } else {
              this.mapFetchedDataToFormByTemp(this.calculationDataService.erosionData);
            }
          }
          this.calculationContextService.setErosionForm(this.erosionForm);
        },
        error: (err) => {
          console.error('Failed to load erosion calculation data:', err);
        },
      });
  }

  private mapFetchedDataToForm(data: any): void {
    const calculationOption = data.calculationOption;
    if (!calculationOption) {
      return;
    }

    const calculationType =
      calculationOption.type === 'allowable_erosion_rate'
        ? 'allowableErosionRate'
        : 'maxSandRate';

    this.setupConditionalValidators(calculationType);

    const formValues = {
      calculationType: calculationType,
      allowableErosionRate:
        calculationOption.type === 'max_sand_rate'
          ? calculationOption.value
          : null,
      sandProductionRate:
        calculationOption.type === 'allowable_erosion_rate'
          ? calculationOption.value
          : null,
      sandDiameter: data.sandDiameter ?? this.defaultFormValues.sandDiameter,
      geometryConstant:
        data.geometryConstant ?? this.defaultFormValues.geometryConstant,
    };

    this.erosionForm.patchValue(formValues);
    this.erosionForm.updateValueAndValidity();
  }

  private mapFetchedDataToFormByTemp(data: any): void {
    const formValues = {
      calculationType: data.calculationType,
      allowableErosionRate:
        data.calculationType === 'maxSandRate'
          ? (data.allowableErosionRate ?? 0.1)
          : null,
      sandProductionRate:
        data.calculationType === 'allowableErosionRate'
          ? data.sandProductionRate
          : null,
      sandDiameter: data.sandDiameter ?? this.defaultFormValues.sandDiameter,
      geometryConstant:
        data.geometryConstant ?? this.defaultFormValues.geometryConstant,
    };

    this.erosionForm.patchValue(formValues);
    this.erosionForm.updateValueAndValidity();
  }

  private setupConditionalValidators(calculationType: string): void {
    const allowableErosionRateControl = this.erosionForm.get(
      'allowableErosionRate',
    );
    const sandProductionRateControl =
      this.erosionForm.get('sandProductionRate');

    if (calculationType === 'allowableErosionRate') {
      sandProductionRateControl?.setValidators([
        Validators.required,
        Validators.min(0.001),
      ]);
      allowableErosionRateControl?.clearValidators();
    } else {
      allowableErosionRateControl?.setValidators([
        Validators.required,
        Validators.min(0.1),
      ]);
      sandProductionRateControl?.clearValidators();
    }
    allowableErosionRateControl?.updateValueAndValidity();
    sandProductionRateControl?.updateValueAndValidity();
  }

  parseNumber(val: any): number {
    if (typeof val === 'string') {
      return parseFloat(val.replace(/,/g, ''));
    }
    return typeof val === 'number' ? val : 0;
  }

  async saveDraft(): Promise<void> {
    return new Promise((resolve, reject) => {
      const formValue = this.erosionForm.getRawValue();
      const calculationType = formValue.calculationType;

      const calculationOption = {
        type:
          calculationType === 'maxSandRate'
            ? 'max_sand_rate'
            : 'allowable_erosion_rate',
        value: this.parseNumber(
          calculationType === 'maxSandRate'
            ? formValue.allowableErosionRate
            : formValue.sandProductionRate,
        ),
      };

      const requestPayload: ErosionCalculation = {
        studyId: this.study?.data?.studyId,
        transactionId: this.transactionId?.data?.transactionId,
        calculationOption: calculationOption,
        sandDiameter: this.parseNumber(formValue.sandDiameter),
        geometryConstant: this.parseNumber(formValue.geometryConstant),
      };

      this.calculationService
        .saveDraftErosionCalculationData(requestPayload)
        .subscribe({
          next: (response) => {
            resolve();
          },
          error: (error) => {
            console.error('Submission error:', error);
            reject(new Error('Something went wrong'));
          },
        });
    });
  }

  private buildErosionPayload() {
    const formValue = this.erosionForm.getRawValue();
    const calculationType = formValue.calculationType;

    const calculationOption = {
      type: calculationType === 'maxSandRate' ? 'max_sand_rate' : 'allowable_erosion_rate',
      value: this.parseNumber(
        calculationType === 'maxSandRate'
          ? formValue.allowableErosionRate
          : formValue.sandProductionRate,
      ),
    };

    return {
      studyId: this.study?.data?.studyId,
      transactionId: this.transactionId?.data?.transactionId,
      calculationOption,
      sandDiameter: this.parseNumber(formValue.sandDiameter),
      geometryConstant: this.parseNumber(formValue.geometryConstant),
    };
  }

  async saveErosionData(): Promise<boolean> {
    if (this.erosionForm.invalid) {
      this.erosionForm.markAllAsTouched();
      return false;
    }

    const requestPayload = this.buildErosionPayload();

    try {
      await firstValueFrom(
        this.calculationService.saveErosionCalculationData(requestPayload)
      );
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      const modalTitle = AlertMessageConstants.EROSION_SAVE_TITLE_FAILED;
      const modalText = this.alertService.getErrorMessage(error);
      this.alertService.error(modalTitle, modalText, true, 5000);
      return false;
    }
  }

  get isFormValid(): boolean {
    const isValid = this.erosionForm ? this.erosionForm.valid : false;
    this.calculationContextService.setErosionValid(isValid);
    return isValid;
  }

  getFormControl(formGroup: FormGroup, controlName: string): FormControl {
    const control = formGroup.get(controlName);
    if (!control) {
      throw new Error(`Control '${controlName}' not found in form group`);
    }
    return control as FormControl;
  }
  getFieldError(control: FormControl | null, min: number, max: number): string {
    if (!control || !(control.dirty || control.touched)) return '';

    if (control.errors?.['required']) {
      return 'Required field';
    }
    return '';
  }

  scrollIntoView() {
    this.innerDiv.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  onChildInteracted(): void {
    this.interacted.emit();
  }
}