import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { InputTextComponent } from '../../../../../shared/components/input-text/input-text.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { ButtonComponent } from "../../../../../shared/components/button/button.component";
import { CalculationContextService } from '../../../CalculationContext.service';
import { cleanObject } from '../../../../../shared/Utils/cleanJSON';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { distinctUntilChanged, filter, firstValueFrom, merge, Subject, Subscription } from 'rxjs';
import { UploadModalComponent } from '../../../../../shared/components/modals/upload-modal/upload-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CalculationConstants, coatingName, innerDiameterType, pressureType, region, targetPressureType, temperatureCoatingName } from '../../../../../core/enums/calculation.enum';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RadioComponent } from "../../../../../shared/components/radio/radio.component";
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { TooltipComponent } from "../../../../../shared/components/tooltip/tooltip.component";
import { CancelModalComponent } from '../../../../../shared/components/modals/cancel-modal/cancel-modal.component';
import { AlertService } from '../../../../../shared/services/alert.service';
import { Study, Transaction } from '../../../../../core/models/common/common.mode';
import { IdName } from '../../../../../core/models/calculation/dropdown-option.model';
import { CalculationDataService } from '../../../services/calculation-data.service';
import { CoatingFormData, PipelineFormData, RiserFormData } from '../../../../../core/models/calculation/pipesim.model';
import { MessagePipesim } from '../../../../../core/enums/error.enum';
import { ImageCarouselComponent } from "../../../../../shared/components/image-carousel/image-carousel.component";
@Component({
  selector: 'app-pipesim',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CollapseComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    NzIconModule,
    NzToolTipModule,
    RadioComponent,
    TooltipComponent,
    ImageCarouselComponent
],
  standalone: true,
  templateUrl: './pipesim.component.html',
  styleUrl: './pipesim.component.scss'
})
export class PipesimComponent {
  @Output() scrollToProcessInfo = new EventEmitter<void>();
  @ViewChild('innerDiv', { read: ElementRef }) innerDiv!: ElementRef;
  @Output() interacted = new EventEmitter<void>();

  expanded = true;
  decimalLimit: number = 4;
  form!: FormGroup;
  coatingForm!: FormGroup;
  defaultPressure: string = pressureType.TYPE_DS
  pressure: { label: string; value: string }[] = [
    {
      label: pressureType.TYPE_DS,
      value: pressureType.TYPE_DS
    },
    {
      label: pressureType.TYPE_US,
      value: pressureType.TYPE_US
    }
  ]
  platformPressureData: IdName[] = [
    {
      id: '1',
      name: pressureType.TYPE_DS
    },
    {
      id: '2',
      name: pressureType.TYPE_US
    }
  ]

  targetPressureData: IdName[] = [
    {
      id: '1',
      name: targetPressureType.TYPE_PIPELINE,
    },
    {
      id: '2',
      name: targetPressureType.TYPE_WELLHEAD
    },
    {
      id: '3',
      name: targetPressureType.TYPE_EXPORT
    }
  ]

  regionData: IdName[] = [
    {
      id: region.REGION_ID_0,
      name: region.REGION_NAME_0,
    },
    {
      id: region.REGION_ID_1,
      name: region.REGION_NAME_1
    },
    {
      id: region.REGION_ID_2,
      name: region.REGION_NAME_2
    },
    {
      id: region.REGION_ID_3,
      name: region.REGION_NAME_3
    }
  ]

  innerDiameterData: IdName[] = [
    {
      id: innerDiameterType.INNER_DIAMETER_ID,
      name: innerDiameterType.INNER_DIAMETER
    },
    {
      id: innerDiameterType.THICKNESS_ID,
      name: innerDiameterType.THICKNESS,
    }
  ]
  study: Study = {};
  transaction: Transaction = {};
  formPipesim!: FormGroup;
  unitForInner: string = 'inch'
  tooltipDelCoating: string = 'Delete Latest Coating';
  tooltipAddCoating: string = 'Add More Coating'
  processForm: FormGroup | null = null;
  exportPressure: any;
  dropDownCoating: any = [];
  co2Value: number = 0;
  h2sValue: number = 0;
  private sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly fb: FormBuilder,
    private readonly modal: NzModalService,
    private readonly calculationService: CalculationService,
    private readonly calculationContextService: CalculationContextService,
    private readonly alertService: AlertService,
    private readonly calculationDataService: CalculationDataService

  ) {

    this.form = this.fb.group({
      pressure: this.createPressure(),
      pipeline: this.fb.array(
        Array(1).fill(null).map(() => this.createPipeLineRow())
      ),
      riserUp: this.fb.array(
        Array(3).fill(null).map(() => this.createRiserUp())
      ),
      riserDown: this.fb.array(
        Array(3).fill(null).map(() => this.createRiserDown())
      ),
      others: this.fb.array([this.createOther()])
    });
  }

  async ngOnInit(): Promise<void> {
    const getStudy: any = sessionStorage.getItem('study');
    const getTransaction: any = sessionStorage.getItem('transactionId');
    this.study = JSON.parse(getStudy);
    this.transaction = JSON.parse(getTransaction);
    await this.getDropDownCoating();
    this.watchFormChanges();
    if (this.study?.data?.studyId) {
      this.getPipesimData();
      this.getDefaultPressure();
      this.getCo2AndH2s();
    }
  }

  ngOnDestroy(): void {
    if (!this.form) {
      this.destroy$.next();
      this.destroy$.complete();
      return;
    }
    const data = this.form.getRawValue();
    const pressure = data.pressure || {};
    const pipeline = data.pipeline || [];
    const riserDown = data.riserDown || [];
    const riserUp = data.riserUp || [];
    const others = data.others || [];
    const newData = {
      platformPressure: {
        name: pressure.platformPressureName,
        value:
          pressure.platformPressureName === pressureType.TYPE_DS
            ? pressure.platformPressureValue
            : pressure.platformPressureProcessValue
      },
      pipelineSection: pipeline.map((e: PipelineFormData, index: number) => ({
        position: index + 1,
        outerDiameter: e.outerDiameter,
        pipelineInput: { name: e.innerDiameterName?.id, value: e.innerDiameterValue },
        pipelineLength: e.length,
        coating: e.coatings?.map((c: CoatingFormData, coatingIndex: number) => ({
          order: coatingIndex + 1,
          name: c.coatingName?.name,
          designTemperature: c.coatingName?.temperature,
          conductivity: c.coatingConductivity,
          thickness: c.coatingThickness
        }))
      })),
      riserDown: riserDown.map((e: RiserFormData, index: number) => ({
        position: index + 1,
        outerDiameter: e.outerDiameter,
        riserInput: { name: e.innerDiameterName?.id, value: e.innerDiameterValue },
        height: e.height,
        coating: e.coatings?.map((c: CoatingFormData, coatingIndex: number) => ({
          order: coatingIndex + 1,
          name: c.coatingName?.name,
          designTemperature: c.coatingName?.temperature,
          conductivity: c.coatingConductivity,
          thickness: c.coatingThickness
        }))
      })),
      riserUp: riserUp.map((e: RiserFormData, index: number) => ({
        position: index + 1,
        outerDiameter: e.outerDiameter,
        riserInput: { name: e.innerDiameterName?.id, value: e.innerDiameterValue },
        height: e.height,
        coating: e.coatings?.map((c: CoatingFormData, coatingIndex: number) => ({
          order: coatingIndex + 1,
          name: c.coatingName?.name,
          designTemperature: c.coatingName?.temperature,
          conductivity: c.coatingConductivity,
          thickness: c.coatingThickness
        }))
      })),
      otherData:
        others.length > 0
          ? {
            designPressure: others[0].pipleDesignPressure,
            usPahh: others[0].usWellHeadPlatformPath,
            targetPressure: others[0].targetPressureValue,
            pH: others[0].ph,
            pipelineDesignRegion: others[0].pipelineDesignRegion?.id
          }
          : {}
    };
    this.calculationDataService.pipesimData = newData;
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pipeline(): FormArray {
    return this.form?.get('pipeline') as FormArray;
  }

  get riserUp(): FormArray {
    return this.form?.get('riserUp') as FormArray;
  }

  get riserDown(): FormArray {
    return this.form?.get('riserDown') as FormArray;
  }

  get others(): FormArray {
    return this.form?.get('others') as FormArray;
  }

  getDefaultPressure() {
    this.sub.add(
      this.calculationContextService.getProcessForm$()
        .pipe(filter(fg => fg !== null))
        .subscribe(fg => {
          this.processForm = fg!;
          const firstKey = Object.keys(fg)[0];
          if (firstKey) {
            const firstGroup = fg[firstKey];
            this.form.get('pressure.platformPressureProcessValue')?.patchValue(firstGroup?.value?.exportPressure)
          }
        })
    );
  }
  getCo2AndH2s() {
    this.sub.add(
      this.calculationContextService.getProcessForm$()
        .pipe(filter(fg => fg !== null))
        .subscribe(fg => {
          this.processForm = fg!;
          const firstKey = Object.keys(fg)[0];
          if (firstKey) {
            const firstGroup = fg[firstKey];
            this.h2sValue = firstGroup?.value?.h2s ?? 0;
            this.co2Value = firstGroup?.value?.co2 ?? 0;
          }
        })
    );
  }

  getPipesimData() {
    const studyId = this.study?.data?.studyId as string;
    const transactionId = this.transaction?.data?.transactionId as string;
    this.calculationService.getPipesimById(studyId, transactionId).subscribe({
      next: async (response) => {
        if (response?.data) {
          if(!response.data.pipelineSection && !response.data.riserDown && !response.data.riserUp){
            this.form = this.fb.group({
              pressure: this.createPressure(),
              pipeline: this.fb.array(
                Array(1).fill(null).map(() => this.createPipeLineRow())
              ),
              riserUp: this.fb.array(
                Array(3).fill(null).map(() => this.createRiserUp())
              ),
              riserDown: this.fb.array(
                Array(3).fill(null).map(() => this.createRiserDown())
              ),
              others: this.fb.array([this.createOther()])
            });
          }else{
            if (!this.calculationDataService.pipesimData) {
              this.setFormPipesim(response.data);
              this.getDefaultPressure();
            } else {
              this.setFormPipesim(this.calculationDataService.pipesimData);
              this.getDefaultPressure();
            }
          }
        }
      },
      error: (err) => {
        if (err.status === 404) {
          if (!this.calculationDataService.pipesimData) {
            this.getDefaultPressure();
          } else {
            this.setFormPipesim(this.calculationDataService.pipesimData);
            this.getDefaultPressure();
          }
        } else {
          if (!this.calculationDataService.pipesimData) {
            this.getDefaultPressure();
          } else {
            this.setFormPipesim(this.calculationDataService.pipesimData);
            this.getDefaultPressure();
          }
        }
      }
    });

  }

  setFormPipesim(data: any) {
    this.form = this.fb.group({
      pressure: this.createPressure(data?.platformPressure),
      pipeline: this.fb.array(
        Array(0).fill(null).map(() => this.createPipeLineRow())
      ),
      riserUp: this.fb.array(
        Array(3).fill(null).map(() => this.createRiserUp())
      ),
      riserDown: this.fb.array(
        Array(3).fill(null).map(() => this.createRiserDown())
      ),
      others: this.fb.array([this.createOther()])
    });


    const pipelineArray = this.form.get('pipeline') as FormArray;
    pipelineArray.clear();

    const maxPositionPipeLine = Math.max(
      ...data?.pipelineSection?.map((item: any) => item.position)
    );

    for (let i = 0; i < maxPositionPipeLine; i++) {
      const emptyGroup = this.createPipeLineRow({ position: i + 1 });
      emptyGroup.addControl('empty', new FormControl(true));
      pipelineArray.push(emptyGroup);
    }

    data?.pipelineSection?.forEach((item: any) => {
      const index = item.position - 1;
      const group = this.createPipeLineRow(item);
      group.addControl('empty', new FormControl(false));
      pipelineArray.setControl(index, group);
    });


    const riserDownArray = this.form.get('riserDown') as FormArray;
    riserDownArray.clear()

    const maxPositionRiserDown = Math.max(...data?.riserDown.map((item: any) => item.position));

    for (let i = 0; i < maxPositionRiserDown; i++) {
      const emptyGroup = this.createRiserDown({ position: i + 1 });
      emptyGroup.addControl('empty', new FormControl(true));
      riserDownArray.push(emptyGroup);
    }

    data?.riserDown.forEach((item: any) => {
      const index = item.position - 1;
      const group = this.createRiserDown(item);
      group.addControl('empty', new FormControl(false));
      riserDownArray.setControl(index, group);
    });


    const riserUpArray = this.form.get('riserUp') as FormArray;
    riserUpArray.clear();


    const maxPositionRiserUp = Math.max(...data?.riserUp.map((item: any) => item.position));

    for (let i = 0; i < maxPositionRiserUp; i++) {
      const emptyGroup = this.createRiserUp({ position: i + 1 });
      emptyGroup.addControl('empty', new FormControl(true));
      riserUpArray.push(emptyGroup);
    }

    data?.riserUp.forEach((item: any) => {
      const index = item.position - 1;
      const group = this.createRiserUp(item);
      group.addControl('empty', new FormControl(false));
      riserUpArray.setControl(index, group);
    });


    const otherArray = this.form.get('others') as FormArray;
    otherArray.clear();


    otherArray.push(this.createOther(data.otherData));

    this.watchFormChanges()
  }

  setFormPipesimExcel(data: any) {

    if (data?.pipelineSection?.length) {
      const pipelineArray = this.form.get('pipeline') as FormArray;
      pipelineArray.clear();
      const maxPositionPipeLine = Math.max(...data.pipelineSection.map((item: any) => item.position));

      const findForSetInnerDiameter = data.pipelineSection.find((e: any) => e.pipelineInput);
      const valueOfInnerDiameter = this.onCheckInnerDiameter(findForSetInnerDiameter?.pipelineInput?.name);
      const setInnerDiameter = valueOfInnerDiameter || "";

      for (let i = 0; i < maxPositionPipeLine; i++) {
        const emptyGroup = this.createPipeLineRow({ position: i + 1 });
        emptyGroup.addControl('empty', new FormControl(true));
        emptyGroup.get('innerDiameterName')?.setValue(setInnerDiameter);
        pipelineArray.push(emptyGroup);
      }

      data.pipelineSection.forEach((item: any) => {
        const index = item.position - 1;
        const group = this.createPipeLineRow(item);
        group.addControl('empty', new FormControl(false));
        group.get('innerDiameterName')?.setValue(setInnerDiameter);
        pipelineArray.setControl(index, group);
      });
    }



    if (data?.riserDown?.length) {
      const riserDownArray = this.form.get('riserDown') as FormArray;
      riserDownArray.clear()

      const maxPositionRiserDown = Math.max(...data?.riserDown.map((item: any) => item.position));
      const findForSetInnerDiameter = data.riserDown.find((e: any) => e.riserInput);
      const valueOfInnerDiameter = this.onCheckInnerDiameter(findForSetInnerDiameter?.riserInput?.name);
      const setInnerDiameter = valueOfInnerDiameter || "";
      for (let i = 0; i < maxPositionRiserDown; i++) {
        const emptyGroup = this.createRiserDown({ position: i + 1 });
        emptyGroup.addControl('empty', new FormControl(true));
        emptyGroup.get('innerDiameterName')?.setValue(setInnerDiameter);
        riserDownArray.push(emptyGroup);
      }

      data?.riserDown.forEach((item: any) => {
        const index = item.position - 1;
        const group = this.createRiserDown(item);
        group.addControl('empty', new FormControl(false));
        group.get('innerDiameterName')?.setValue(setInnerDiameter);
        riserDownArray.setControl(index, group);
      });
    }



    if (data?.riserUp?.length) {
      const riserUpArray = this.form.get('riserUp') as FormArray;
      riserUpArray.clear();


      const maxPositionRiserUp = Math.max(...data?.riserUp.map((item: any) => item.position));
      const findForSetInnerDiameter = data.riserUp.find((e: any) => e.riserInput);
      const valueOfInnerDiameter = this.onCheckInnerDiameter(findForSetInnerDiameter?.riserInput?.name);
      const setInnerDiameter = valueOfInnerDiameter || "";
      for (let i = 0; i < maxPositionRiserUp; i++) {
        const emptyGroup = this.createRiserUp({ position: i + 1 });
        emptyGroup.addControl('empty', new FormControl(true));
        emptyGroup.get('innerDiameterName')?.setValue(setInnerDiameter);
        riserUpArray.push(emptyGroup);
      }

      data?.riserUp.forEach((item: any) => {
        const index = item.position - 1;
        const group = this.createRiserUp(item);
        group.addControl('empty', new FormControl(false));
        group.get('innerDiameterName')?.setValue(setInnerDiameter);
        riserUpArray.setControl(index, group);
      });
    }
    this.watchFormChanges()
  }

  createPipeLineRow(data?: any): FormGroup {
    const coatingArray = new FormArray<FormGroup>([]);
    const coatings = data?.coating ?? [];
    if (coatings.length > 0) {
      const maxOrder = Math.max(...coatings.map((c: any) => c.order));

      for (let i = 1; i < maxOrder; i++) {
        coatingArray.push(this.createCoating({ order: i + 1 }));
      }

      coatings.forEach((c: any) => {
        const index = c.order - 1;
        coatingArray.setControl(index, this.createCoating(c));
      });
    } else {
      coatingArray.push(this.createCoating());
    }

    return this.fb.group({
      outerDiameter: [data?.outerDiameter ?? '', Validators.required],
      innerDiameterName: [data?.pipelineInput?.name ? this.onCheckInnerDiameter(data?.pipelineInput?.name) : '', Validators.required],
      innerDiameterValue: [data?.pipelineInput?.value ?? '', Validators.required],
      length: [data?.pipelineLength ?? '', Validators.required],
      coatings: coatingArray
    });
  }

  createRiserUp(data?: any): FormGroup {
    const coatingArray = new FormArray<FormGroup>([]);
    const coatings = data?.coating ?? [];
    if (coatings.length > 0) {
      const maxOrder = Math.max(...coatings.map((c: any) => c.order));

      for (let i = 1; i < maxOrder; i++) {
        coatingArray.push(this.createCoating({ order: i + 1 }));
      }

      coatings.forEach((c: any) => {
        const index = c.order - 1;
        coatingArray.setControl(index, this.createCoating(c));
      });
    } else {
      coatingArray.push(this.createCoating());
    }

    return this.fb.group({
      outerDiameter: [data?.outerDiameter ?? '', Validators.required],
      innerDiameterName: [data?.riserInput?.name ? this.onCheckInnerDiameter(data?.riserInput?.name) : '', Validators.required],
      innerDiameterValue: [data?.riserInput?.value ?? '', Validators.required],
      height: [data?.height ?? '', Validators.required],
      coatings: coatingArray
    })
  }

  createRiserDown(data?: any): FormGroup {
    const coatingArray = new FormArray<FormGroup>([]);
    const coatings = data?.coating ?? [];
    if (coatings.length > 0) {
      const maxOrder = Math.max(...coatings.map((c: any) => c.order));

      for (let i = 1; i < maxOrder; i++) {
        coatingArray.push(this.createCoating({ order: i + 1 }));
      }

      coatings.forEach((c: any) => {
        const index = c.order - 1;
        coatingArray.setControl(index, this.createCoating(c));
      });
    } else {
      coatingArray.push(this.createCoating());
    }

    return this.fb.group({
      outerDiameter: [data?.outerDiameter ?? '', Validators.required],
      innerDiameterName: [data?.riserInput?.name ? this.onCheckInnerDiameter(data?.riserInput?.name) : '', Validators.required],
      innerDiameterValue: [data?.riserInput?.value ?? '', Validators.required],
      height: [data?.height ?? '', Validators.required],
      coatings: coatingArray
    })
  }


  addNewPipeLineRow(data?: any): FormGroup {
    const coatingArray = new FormArray<FormGroup>([]);
    const coatings = data?.coating ?? [];
    if (coatings.length > 0) {
      const maxOrder = Math.max(...coatings.map((c: any) => c.order));

      for (let i = 1; i < maxOrder; i++) {
        coatingArray.push(this.createCoating({ order: i + 1 }));
      }

      coatings.forEach((c: any) => {
        const index = c.order - 1;
        coatingArray.setControl(index, this.createCoating(c));
      });
    } else {
      coatingArray.push(this.createCoating());
    }

    const pipeLine = this.pipeline.getRawValue();
    const findPipeLine = pipeLine.find((e: any) => e.innerDiameterName);

    return this.fb.group({
      outerDiameter: ['', Validators.required],
      innerDiameterName: [findPipeLine?.innerDiameterName ?? '', Validators.required],
      innerDiameterValue: ['', Validators.required],
      length: ['', Validators.required],
      coatings: coatingArray
    });
  }

  addNewRiserDown(data?: any): FormGroup {
    const coatingArray = new FormArray<FormGroup>([]);
    const coatings = data?.coating ?? [];
    if (coatings.length > 0) {
      const maxOrder = Math.max(...coatings.map((c: any) => c.order));

      for (let i = 1; i < maxOrder; i++) {
        coatingArray.push(this.createCoating({ order: i + 1 }));
      }

      coatings.forEach((c: any) => {
        const index = c.order - 1;
        coatingArray.setControl(index, this.createCoating(c));
      });
    } else {
      coatingArray.push(this.createCoating());
    }

    const riserDown = this.riserDown.getRawValue();
    const findRiserDown = riserDown.find((e: any) => e.innerDiameterName);
    return this.fb.group({
      outerDiameter: ['', Validators.required],
      innerDiameterName: [findRiserDown?.innerDiameterName ?? '', Validators.required],
      innerDiameterValue: ['', Validators.required],
      height: ['', Validators.required],
      coatings: coatingArray
    })
  }

  addRiserUp(data?: any): FormGroup {
    const coatingArray = new FormArray<FormGroup>([]);
    const coatings = data?.coating ?? [];
    if (coatings.length > 0) {
      const maxOrder = Math.max(...coatings.map((c: any) => c.order));

      for (let i = 1; i < maxOrder; i++) {
        coatingArray.push(this.createCoating({ order: i + 1 }));
      }

      coatings.forEach((c: any) => {
        const index = c.order - 1;
        coatingArray.setControl(index, this.createCoating(c));
      });
    } else {
      coatingArray.push(this.createCoating());
    }
    const riserUp = this.riserUp.getRawValue();
    const findRiserUp = riserUp.find((e: any) => e.innerDiameterName);

    return this.fb.group({
      outerDiameter: ['', Validators.required],
      innerDiameterName: [findRiserUp?.innerDiameterName ?? '', Validators.required],
      innerDiameterValue: ['', Validators.required],
      height: ['', Validators.required],
      coatings: coatingArray
    })
  }

  createOther(data?: any): FormGroup {
    return this.fb.group({
      pipleDesignPressure: [data?.designPressure ?? 77, Validators.required],
      usWellHeadPlatformPath: [data?.usPahh ?? '', Validators.required],
      targetPressureName: [this.checkTypeTargetPressure(data?.targetPressure ?? null)],
      targetPressureValue: [data?.targetPressure ?? 77],
      ph: [data?.pH ?? ''],
      pipelineDesignRegion: [this.getRegionById(data?.pipelineDesignRegion) ?? '', Validators.required]
    });
  }

  createCoating(data?: any): FormGroup {
    return this.fb.group({
      coatingName: [this.getCoatingByName(data?.name) ?? '', Validators.required],
      coatingTemperature: [this.mappingTemperature(data?.name) ?? data?.designTemperature ?? '0'],
      coatingConductivity: [data?.conductivity ?? '', Validators.required],
      coatingThickness: [data?.thickness ?? '', Validators.required]
    });
  }

  createPressure(data?: any): FormGroup {
    return this.fb.group({
      platformPressureName: [data?.name ?? pressureType.TYPE_DS, Validators.required],
      platformPressureValue: [data?.value ?? '33', [Validators.required, Validators.min(0), Validators.max(91)]],
      platformPressureProcessValue: [data?.name === pressureType.TYPE_US ? data.value : '0']
    });
  }

  addPipeLineRow(): void {
    this.pipeline.push(this.addNewPipeLineRow());
    this.interacted.emit();
  }

  removePipelineRow(index: number): void {
    this.pipeline.removeAt(index);
  }

  addRiserUpRow(): void {
    this.riserUp.push(this.addRiserUp());
    this.interacted.emit();
  }

  removeRiserUpRow(index: number): void {
    this.riserUp.removeAt(index);
  }

  addRiserDownRow(): void {
    this.riserDown.push(this.addNewRiserDown());
    this.interacted.emit();
  }

  removeRiserDownRow(index: number): void {
    this.riserDown.removeAt(index);
  }

  addPipeLineCoating(rowIndex: number): void {
    this.getPipeLineCoatings(rowIndex)?.push(this.createCoating());
  }

  getCoatings(sectionIndex: number, section: string): FormArray {
    return (this.form.get(section) as FormArray)
      .at(sectionIndex)
      .get('coatings') as FormArray;
  }

  delPipeLineCoating(sectionIndex: number) {
    const coatings = this.getCoatings(sectionIndex, 'pipeline');
    if (coatings.length > 0) {
      coatings.removeAt(coatings.length - 1);
    }
  }

  delRiserDownCoating(sectionIndex: number) {
    const coatings = this.getCoatings(sectionIndex, 'riserDown');
    if (coatings.length > 0) {
      coatings.removeAt(coatings.length - 1);
    }
  }

  delRiserUpCoating(sectionIndex: number) {
    const coatings = this.getCoatings(sectionIndex, 'riserUp');
    if (coatings.length > 0) {
      coatings.removeAt(coatings.length - 1);
    }
  }

  addRiserUpCoating(rowIndex: number): void {
    this.getRiserUpCoatings(rowIndex)?.push(this.createCoating());
  }

  addRiserDownCoating(rowIndex: number): void {
    this.getRiserDownCoatings(rowIndex)?.push(this.createCoating());
  }

  getPipeLineCoatings(rowIndex: number): FormArray {
    return this.pipeline.at(rowIndex).get('coatings') as FormArray;
  }

  getRiserUpCoatings(rowIndex: number): FormArray {
    return this.riserUp.at(rowIndex).get('coatings') as FormArray;
  }

  getRiserDownCoatings(rowIndex: number): FormArray {
    return this.riserDown.at(rowIndex).get('coatings') as FormArray;
  }

  async openModalClearData(): Promise<any> {
    const modalRef = this.modal.create({
      nzContent: CancelModalComponent,
      nzFooter: null,
      nzWidth: 600
    });

    const instance = modalRef.getContentComponent();
    instance.title = 'Are you sure you want to clear data on this table ?';
    instance.text = 'You will lose all this lasted data input, This action cannot be undone';
    instance.btnSubmitText = 'Delete';
    instance.btnCancelText = 'Cancel';

    const result = await modalRef.afterClose.toPromise();
    return result;
  }

  async clearPipelineRow() {
    const res = await this.openModalClearData();
    if (res) {
      this.pipeline.controls.forEach((group: AbstractControl) => {
        group.reset();
      });
      this.interacted.emit();
    }
  }

  async clearRiserDownRow() {
    const res = await this.openModalClearData();
    if (res) {
      this.riserDown.controls.forEach((group: AbstractControl) => {
        group.reset();
      });
      this.interacted.emit();
    }
  }

  async clearRiserUpRow() {
    const res = await this.openModalClearData();
    if (res) {
      this.riserUp.controls.forEach((group: AbstractControl) => {
        group.reset();
      });
      this.interacted.emit();
    }
  }

  async clearOtherUpRow(index: number) {
    const res = await this.openModalClearData();
    if (res) {
      this.others.setControl(index, this.createOther());
      this.interacted.emit();
    }
  }

  onInnerDiameterSelectedForPipeline(value: any): void {
    this.pipeline.controls.forEach(group => {
      group.get('innerDiameterName')?.setValue(value);
    });
  }

  onInnerDiameterSelectedForRiserDown(value: any): void {
    this.riserDown.controls.forEach(group => {
      group.get('innerDiameterName')?.setValue(value);
    });
  }

  onInnerDiameterSelectedForRiserUp(value: any): void {
    this.riserUp.controls.forEach(group => {
      group.get('innerDiameterName')?.setValue(value);
    });
  }

  onCheckInnerDiameter(value: string) {
    if (value.toUpperCase() === innerDiameterType.THICKNESS.toLocaleUpperCase()) {
      return this.innerDiameterData[1]
    } else {
      return this.innerDiameterData[0]
    }
  }

  onCheckUnitInnerDiameter(value: any) {
    const name = value?.name ?? '';
    if (name.toLocaleUpperCase() === innerDiameterType.THICKNESS.toLocaleUpperCase()) {
      return 'mm'
    } else if (name.toLocaleUpperCase() === innerDiameterType.INNER_DIAMETER.toLocaleUpperCase()) {
      return 'mm'
    } else {
      return ''
    }
  }

  onChangeTargetPressure() {
    this.others.controls.forEach((group: AbstractControl, index: number) => {
      group.get('targetPressureName')?.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => {
          this.tryUpdateTargetPressure(group, index);
        });

      group.get('usWellHeadPlatformPath')?.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => {
          this.tryUpdateTargetPressure(group, index);
        });
      this.tryUpdateTargetPressure(group, index);
    });
  }

  tryUpdateTargetPressure(group: AbstractControl, index: number) {
    const selected = group.get('targetPressureName')?.value?.name;
    const path = group.get('usWellHeadPlatformPath')?.value;
    const pipeline = group.get('pipleDesignPressure')?.value;
    const exportPressure = this.calculationContextService.getProcessForm()['1-1']?.get('exportPressure')?.value;
    switch (selected) {
      case targetPressureType.TYPE_PIPELINE:
        if (pipeline) group.get('targetPressureValue')?.patchValue(pipeline);
        break;
      case targetPressureType.TYPE_WELLHEAD:
        if (path) group.get('targetPressureValue')?.patchValue(path);
        break;
      case targetPressureType.TYPE_EXPORT:
        if (exportPressure) group.get('targetPressureValue')?.patchValue(exportPressure.toString());
        break;
      default:
        group.get('targetPressureValue')?.patchValue(pipeline);
        break;
    }
  }

  saveDraft(): Promise<void> {
    const reqBody = this.createSectionData();
    return new Promise((resolve, reject) => {
      this.calculationService.saveDraftPipesim(reqBody).subscribe({
        next: (response: any) => {
          try {
            if (response) {
              this.getPipesimData();
            }
            resolve();
          } catch (error) {
            console.log("error :", error);
            reject(error);
          }
        },
        error: (err) => {
          console.log("Submission error:", err);
          reject(err);
        },
      });
    });
  }

  async submit(): Promise<boolean | MessagePipesim> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    const reqBody = this.createSectionData();
    try {
      await firstValueFrom(this.calculationService.submitPipesim(reqBody));
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      const modalText = this.alertService.getStatusCode(error) as MessagePipesim;
      return modalText;
    }
  }

  createSectionData() {
    const pipeLineBody = (this.form?.get('pipeline')?.getRawValue()).map((pipelineItem: any, pipelineIndex: number) => {
      return {
        position: pipelineIndex + 1,
        pipelineInput: {
          name: pipelineItem?.innerDiameterName?.id,
          value: this.calculationContextService.parseLocalizedNumber(pipelineItem?.innerDiameterValue)
        },
        outerDiameter: this.calculationContextService.parseLocalizedNumber(pipelineItem?.outerDiameter),
        pipelineLength: this.calculationContextService.parseLocalizedNumber(pipelineItem.length),
        coating: this.getPipeLineCoatings(pipelineIndex).getRawValue().map((coatingItem: any, coatingIndex: number) => {
          return {
            order: coatingIndex + 1,
            name: coatingItem?.coatingName?.name,
            designTemperature: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingTemperature),
            conductivity: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingConductivity),
            thickness: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingThickness)
          }
        })
      };
    });

    const riserDownBody = (this.form?.get('riserDown')?.getRawValue()).map((riserDown: any, riserDownIndex: number) => {
      return {
        position: riserDownIndex + 1,
        outerDiameter: this.calculationContextService.parseLocalizedNumber(riserDown?.outerDiameter),
        riserInput: {
          name: riserDown.innerDiameterName?.id,
          value: this.calculationContextService.parseLocalizedNumber(riserDown?.innerDiameterValue)
        },
        height: this.calculationContextService.parseLocalizedNumber(riserDown?.height),
        coating: this.getRiserDownCoatings(riserDownIndex).getRawValue().map((coatingItem: any, coatingIndex: number) => {
          return {
            order: coatingIndex + 1,
            name: coatingItem?.coatingName?.name,
            designTemperature: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingTemperature),
            conductivity: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingConductivity),
            thickness: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingThickness)
          }
        })
      }
    });


    const riserUpBody = (this.form?.get('riserUp')?.getRawValue()).map((riserUp: any, riserUpIndex: number) => {
      return {
        position: riserUpIndex + 1,
        outerDiameter: this.calculationContextService.parseLocalizedNumber(riserUp?.outerDiameter),
        riserInput: {
          name: riserUp.innerDiameterName?.id,
          value: this.calculationContextService.parseLocalizedNumber(riserUp?.innerDiameterValue)
        },
        height: this.calculationContextService.parseLocalizedNumber(riserUp?.height),
        coating: this.getRiserUpCoatings(riserUpIndex).getRawValue().map((coatingItem: any, coatingIndex: number) => {
          return {
            order: coatingIndex + 1,
            name: coatingItem?.coatingName?.name,
            designTemperature: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingTemperature),
            conductivity: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingConductivity),
            thickness: this.calculationContextService.parseLocalizedNumber(coatingItem?.coatingThickness)
          }
        })
      }
    });


    const otherBody = (this.form?.get('others')?.getRawValue()).map((other: any) => {
      return {
        designPressure: this.calculationContextService.parseLocalizedNumber(other?.pipleDesignPressure),
        usPahh: this.calculationContextService.parseLocalizedNumber(other?.usWellHeadPlatformPath),
        targetPressure: this.calculationContextService.parseLocalizedNumber(other?.targetPressureValue),
        ph: this.calculationContextService.parseLocalizedNumber(other?.ph),
        pipelineDesignRegion: other?.pipelineDesignRegion.id
      }
    });

    const pressureBody = this.form?.get('pressure')?.getRawValue();

    const studyId = this.study?.data?.studyId as string;
    const transactionId = this.transaction?.data?.transactionId as string;

    const data = {
      studyId: studyId,
      transactionId: transactionId,
      platformPressure: {
        name: pressureBody?.platformPressureName,
        value: pressureBody?.platformPressureName === 'D/S Platform Pressure' ? this.calculationContextService.parseLocalizedNumber(pressureBody?.platformPressureValue) : this.calculationContextService.parseLocalizedNumber(pressureBody?.platformPressureProcessValue)
      },
      pipelineSection: pipeLineBody,
      riserDown: riserDownBody,
      riserUp: riserUpBody,
      otherData: otherBody[0]
    }
    const response = cleanObject(data);

    return response;
  }

  validateAllSections(): {
    isOthersInvalid: boolean;
    isPipelineInvalid: boolean;
    isRiserDownInvalid: boolean;
    isRiserUpInvalid: boolean;
  } {
    const isOthersInvalid = this.form.get('others')?.invalid ?? false;
    const isPipelineInvalid = this.form.get('pipeline')?.invalid ?? false;
    const isRiserDownInvalid = this.form.get('riserDown')?.invalid ?? false;
    const isRiserUpInvalid = this.form.get('riserUp')?.invalid ?? false;
  
    const resValid = {
      isOthersInvalid,
      isPipelineInvalid,
      isRiserDownInvalid,
      isRiserUpInvalid
    };
  
    this.calculationContextService.setPipesimValidate(resValid);
  
    return resValid;
  }

  watchFormChanges(): void {
    const others = this.form.get('others');
    const pipeline = this.form.get('pipeline');
    const riserDown = this.form.get('riserDown');
    const riserUp = this.form.get('riserUp');

    merge(
      others?.valueChanges ?? [],
      pipeline?.valueChanges ?? [],
      riserDown?.valueChanges ?? [],
      riserUp?.valueChanges ?? []
    ).subscribe(() => {
      this.validateAllSections();
    });

    this.calculationContextService.processInfoForm$
      .pipe(filter((fg): fg is FormGroup => fg instanceof FormGroup))
      .subscribe((data: FormGroup) => {
        this.form
          .get('pressure.platformPressureProcessValue')
          ?.patchValue(data.get('exportPressure')?.value || '0');
        this.onChangeTargetPressure();
        this.h2sValue = data.get('h2s')?.value ?? 0;
        this.co2Value = data.get('co2')?.value ?? 0;
      });
  }

  checkTypeTargetPressure(value: number) {
    const form = this.calculationContextService.getProcessForm();
    const exportPressure = form?.['1-1']?.get('exportPressure')?.value;

    if (value == null || value === 77) {
      return this.targetPressureData[0];
    } else if (value === exportPressure) {
      return this.targetPressureData[2];
    } else {
      return this.targetPressureData[1];
    }
  }

  openUploadDialog(): void {
    const modalRef = this.modal.create({
      nzContent: UploadModalComponent,
      nzFooter: null,
      nzWidth: 600,
    });
    this.interacted.emit();

    const instance = modalRef.getContentComponent();
    instance.title = CalculationConstants.TTTLE_SECTION_PIPESIM_TABLE
    instance.templateName = 'pipesim_excel_template'
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.setFormPipesimExcel(result.data)
      }
    });
  }

  getPipelineControl(index: number, controlName: string): FormControl {
    return this.pipeline.at(index)?.get(controlName) as FormControl;
  }

  getCoatingControl(pipelineIndex: number, coatingIndex: number, field: string): FormControl {
    const coatingArray = this.getCoatingArray(pipelineIndex);
    return coatingArray?.at(coatingIndex)?.get(field) as FormControl;
  }

  getValueCoatingControl(pipelineIndex: number, coatingIndex: number, field: string): FormControl {
    const coatingArray = this.getCoatingArray(pipelineIndex);
    return coatingArray?.at(coatingIndex)?.get(field)?.value as FormControl;
  }

  getCoatingArray(pipelineIndex: number): FormArray {
    return this.pipeline.at(pipelineIndex)?.get('coatings') as FormArray;
  }

  getMaxCoatingLength(): number {
    return Math.max(...this.pipeline.controls.map(ctrl => {
      const coating = ctrl.get('coatings') as FormArray;
      return coating?.length ?? 0;
    }));
  }

  removeLastPipeline(): void {
    const lastIndex = this.pipeline.length - 1;
    this.interacted.emit();
    if (lastIndex >= 0) {
      this.pipeline.removeAt(lastIndex);
    }
  }

  removeLastRiserDown(): void {
    const lastIndex = this.riserDown.length - 1;
    if (lastIndex >= 0) {
      this.riserDown.removeAt(lastIndex);
    }
  }

  removeLastRiserUp(): void {
    const lastIndex = this.riserUp.length - 1;
    if (lastIndex >= 0) {
      this.riserUp.removeAt(lastIndex);
    }
  }

  addCoatingToAllPipelines(i: number): void {
    const group = this.pipeline.at(i) as FormGroup;
    if (!group) {
      return;
    }
    this.interacted.emit();
    const coatingArray = group.get('coatings') as FormArray | null;
    if (coatingArray) {
      coatingArray.push(this.fb.group({
        coatingName: ['', Validators.required],
        coatingTemperature: [''],
        coatingConductivity: ['', Validators.required],
        coatingThickness: ['', Validators.required]
      }));
    }
  }

  removeLastCoatingFromPipeline(i: number): void {
    const group = this.pipeline.at(i) as FormGroup;
    if (!group) {
      return;
    }
    this.interacted.emit();
    const coatingArray = group.get('coatings') as FormArray | null;
    if (coatingArray && coatingArray.length > 0) {
      coatingArray.removeAt(coatingArray.length - 1);
    }
  }

  removeLastCoatingFromRiserDown(i: number): void {
    const group = this.riserDown.at(i) as FormGroup;
    if (!group) {
      return;
    }
    this.interacted.emit();
    const coatingArray = group.get('coatings') as FormArray | null;
    if (coatingArray && coatingArray.length > 0) {
      coatingArray.removeAt(coatingArray.length - 1);
    }
  }

  removeLastCoatingFromRiserUp(i: number): void {
    const group = this.riserUp.at(i) as FormGroup;
    if (!group) {
      return;
    }
    this.interacted.emit();
    const coatingArray = group.get('coatings') as FormArray | null;
    if (coatingArray && coatingArray.length > 0) {
      coatingArray.removeAt(coatingArray.length - 1);
    }
  }

  getRiserDownControl(index: number, controlName: string): FormControl {
    return this.riserDown.at(index).get(controlName) as FormControl;
  }

  getCoatingRiserDownControl(riserDownIndex: number, coatingIndex: number, field: string): FormControl {
    const coatingArray = this.getCoatingRiserDownArray(riserDownIndex);
    return coatingArray?.at(coatingIndex)?.get(field) as FormControl;
  }

  getValueCoatingRiserDownControl(riserDownIndex: number, coatingIndex: number, field: string): FormControl {
    const coatingArray = this.getCoatingRiserDownArray(riserDownIndex);
    return coatingArray?.at(coatingIndex)?.get(field)?.value as FormControl;
  }

  getCoatingRiserDownArray(riserDownIndex: number): FormArray {
    return this.riserDown.at(riserDownIndex).get('coatings') as FormArray;
  }

  getMaxCoatingRiserDownLength(): number {
    return Math.max(...this.riserDown.controls.map(ctrl => {
      const coating = ctrl.get('coatings') as FormArray;
      return coating?.length ?? 0;
    }));
  }

  addCoatingToAllRiserDown(i: number): void {
    const group = this.riserDown.at(i) as FormGroup;
    if (!group) {
      return;
    }
    this.interacted.emit();
    const coatingArray = group.get('coatings') as FormArray | null;
    if (coatingArray) {
      coatingArray.push(this.fb.group({
        coatingName: ['', Validators.required],
        coatingTemperature: [''],
        coatingConductivity: ['', Validators.required],
        coatingThickness: ['', Validators.required]
      }));
    }
  }

  getRiserUpControl(index: number, controlName: string): FormControl {
    return this.riserUp.at(index).get(controlName) as FormControl;
  }

  getCoatingRiserUpControl(riserUpIndex: number, coatingIndex: number, field: string): FormControl {
    const coatingArray = this.getCoatingRiserUpArray(riserUpIndex);
    return coatingArray?.at(coatingIndex)?.get(field) as FormControl;
  }

  getValueCoatingRiserUpControl(riserUpIndex: number, coatingIndex: number, field: string): FormControl {
    const coatingArray = this.getCoatingRiserUpArray(riserUpIndex);
    return coatingArray?.at(coatingIndex)?.get(field)?.value as FormControl;
  }

  getCoatingRiserUpArray(riserUpIndex: number): FormArray {
    return this.riserUp.at(riserUpIndex).get('coatings') as FormArray;
  }

  getMaxCoatingRiserUpLength(): number {
    return Math.max(...this.riserUp.controls.map(ctrl => {
      const coating = ctrl.get('coatings') as FormArray;
      return coating?.length || 0;
    }));
  }

  addCoatingToAllRiserUp(i: number): void {
    const group = this.riserUp.at(i) as FormGroup;
    if (!group) {
      return;
    }
    this.interacted.emit();
    const coatingArray = group.get('coatings') as FormArray | null;
    if (coatingArray) {
      coatingArray.push(this.fb.group({
        coatingName: ['', Validators.required],
        coatingTemperature: [''],
        coatingConductivity: ['', Validators.required],
        coatingThickness: ['', Validators.required]
      }));
    }
  }

  getFormControl<T = any>(formGroup: FormGroup, controlName: string): FormControl<T> {
    const control = formGroup.get(controlName);
    if (!control) {
      throw new Error(`Control '${controlName}' not found in form group`);
    }
    return control as FormControl<T>;
  }

  getFieldError(control: FormControl<any> | null, min?: number | null, max?: number | null): string {
    if (!control || !(control.dirty || control.touched)) return '';

    if (control.errors?.['required']) {
      return 'Required field';
    }
    if (control.errors?.['min'] || control.errors?.['max']) {
      return `Must be number and between ${min?.toLocaleString()} and ${max?.toLocaleString()}`;
    }
    return '';
  }

  async getDropDownCoating(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.calculationService.getDropDownCoating()
      );

      if (response.data?.length > 0) {
        this.dropDownCoating = response.data.map((e: any, index: number) => ({
          id: `${index + 1}`,
          name: e.name,
          temperature: e.temperature,
        }));
      }
    } catch (error) {
      console.log("error :", error);
    }
  }

  mappingTemperature(name: coatingName) {
    return temperatureCoatingName[name] ?? '0';
  }

  getCoatingByName(name: string) {
    if (!name || !this.dropDownCoating) {
      return null;
    }
    return this.dropDownCoating.find((item: any) => item?.name === name) || null;
  }

  getRegionById(id: string) {
    if (!id || !this.dropDownCoating) {
      return null;
    }
    return this.regionData.find((item: any) => item?.id === id);
  }

  onChangeTemperature(value: any, form: FormControl) {
    if (form) {
      form.patchValue(value.temperature);
    }
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