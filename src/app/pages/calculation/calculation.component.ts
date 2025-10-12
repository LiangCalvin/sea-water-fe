import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { StepperComponent } from "../../shared/components/stepper/stepper.component";
import { ActivatedRoute, Router } from '@angular/router';
import { TagComponent } from '../../shared/components/tag/tag.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModelAndBasicCompositionComponent } from "./components/model-and-basic-composition/model-and-basic-composition.component";
import { SelectPositionComponent } from "./components/select-position/select-position.component";
import { CalculationInputComponent } from "./components/calculation-input/calculation-input.component";
import { RecommendationComponent } from "./components/recommendation/recommendation.component";
import { NzModalService } from 'ng-zorro-antd/modal';
import { CancelModalComponent } from '../../shared/components/modals/cancel-modal/cancel-modal.component';
import { InputReviewComponent } from "./components/input-review/input-review.component";
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CalculationContextService } from './CalculationContext.service';
import { GlobalTemplateService } from '../../services/global-template.service';
import { CommonService } from '../../services/common/common.service';
import { calculationStep, handleStep } from '../../core/enums/calculation.enum';
import { ReviewModalComponent } from '../../shared/components/modals/review-modal/review-modal.component';
import { GlobalService } from '../../services/global.service';
import { CalculationDataService } from './services/calculation-data.service';

import { UnsavedChangesService } from '../../services/unsaved-changes/unsaved-changes.service';
import { Observable } from 'rxjs';
import { ComponentCanDeactivate } from '../../guards/can-deactivate.guard';
import { RoleEnum } from '../../core/enums/role.enum';
@Component({
  selector: 'app-calculation',
  standalone: true,
  imports: [CommonModule, StepperComponent, TagComponent, ReactiveFormsModule, ModelAndBasicCompositionComponent, SelectPositionComponent, CalculationInputComponent, RecommendationComponent, InputReviewComponent, ButtonComponent],
  templateUrl: './calculation.component.html',
  styleUrl: './calculation.component.scss'
})
export class CalculationComponent implements ComponentCanDeactivate {
  stepRoutes = ['model-and-basic-composition', 'calculation-input', 'input-review', 'result'];
  currentIndex = 0;
  currentStep = 0;
  studyCode: string = '';
  study: any;
  transaction: any;
  validateProcessInformation: any;
  validatePipingData: any;
  validateOther: any;
  validatePipeLine: any;
  validateRiserUp: any;
  validateRiserDown: any
  validatePipesim: any;
  validateErosion: any;
  validateThermowell: any;

  erosionValid = false;
  isSequenceFlow: any;
  sequenceFlow: string = '1,2,3,4';
  step: any;
  stepOrigin: any;
  stepValue: string = '';
  Owner: any;
  hasFullAccess: boolean = false;
  private isDirty = false;
  private hasInteractedWithForm = false;
  readonly calculationStep = calculationStep;
  readonly THERMOWELL_AND_EROSION_SEQUENCE_FLOWS = ['1,2,3,4', '1,2,3', '1,3,4', '1,3'];
  readonly PIPESIM_SEQUNCES_FLOWS = ['1,2,3,4', '1,3,4', '1,4'];
  @ViewChild('step0', { static: false }) step0Component?: ModelAndBasicCompositionComponent;
  @ViewChild('step1', { static: false }) step1Component?: SelectPositionComponent;
  @ViewChild('step2', { static: false }) step2Component?: CalculationInputComponent;
  @ViewChild('step3', { static: false }) step3Component?: InputReviewComponent;

  stepList = [
    { name: 'Model & Composition' },
    { name: 'Select Position' },
    { name: 'Calculation Input' },
    { name: 'Input Review' },
    { name: 'Recommendation / Details result' }
  ];
  // ADD: Create stepComponents array for easier access
  get stepComponents() {
    return [
      //--Note: don't use for Black to Create
      //this.step0Component,
      this.step1Component,
      this.step2Component,
      this.step3Component,
    ];
  }
  nextStep(): void {
    if (this.currentStep < this.stepList.length - 1) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }

  }
  constructor(
    private readonly route: ActivatedRoute,
    private readonly modal: NzModalService,
    private readonly calculationContextService: CalculationContextService,
    private readonly calculationDataService: CalculationDataService,
    private cd: ChangeDetectorRef,
    private readonly commonService: CommonService,
    private router: Router,
    private globalService: GlobalService,
    private unsavedChangesService: UnsavedChangesService,
  ) {
    this.Owner = this.globalService.getUserFullName();
    this.hasFullAccess = this.globalService.hasPermissionSync(RoleEnum.FULL_ACCESS);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.studyCode = params.get('study_code') ?? 'N/A';
    });

    this.calculationDataService.resetCalculationData();

    // NOTE : for re use function validate
    // this.getValidateProcessInfomation();
    // this.getValidatePipingData();
    // this.getValidateErosion();
    // this.getValidationThermowell();
    // this.getValidatePipesim();

    this.calculationContextService.selectPosition$.subscribe(position => {
      if (position?.sequenceFlow) {
        this.sequenceFlow = position?.sequenceFlow;
      }
    });


    const getStudy: any = sessionStorage.getItem('study');
    const getTransaction: any = sessionStorage.getItem('transactionId')
    this.study = JSON.parse(getStudy)
    this.transaction = JSON.parse(getTransaction)
  }

  ngAfterViewInit() {
    if (this.transaction) {
      this.getStep();
    } else {
      this.sequenceFlow = "1,2,3,4"
    }
  }

  onFormChange(): void {
    this.isDirty = true;
  }

  onSave(): void {
    this.isDirty = false;
  }

  hasUnsavedChanges(): boolean {
    const localChanges = this.isDirty || this.hasInteractedWithForm;
    const currentStepDirty = this.currentStepHasUnsavedChanges();
    return localChanges || currentStepDirty;
  }

  openUnsavedChangesModal(): Observable<boolean> {
    return this.unsavedChangesService.openUnsavedChangesModal();
  }

  markAsDirty(): void {
    this.isDirty = true;
  }

  markAsClean(): void {
    this.isDirty = false;
    this.hasInteractedWithForm = false;
    //  this.resetAllStepsInteractionState();
  }
  goToStep(step: number) {
    this.currentStep = step;
    this.cd.detectChanges();
    const element = document.querySelector('.calculation-layout') || document.querySelector('.sidebar');
    if (element) {
      element.scrollIntoView({ block: 'start', behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  onBackToStudyDetails() {
    const studyId = this.study?.data?.studyId || this.study?.studyId;
    if (!studyId) {
      return;
    }
    this.router.navigate(['/study-details'], {
      queryParams: {
        from: 'my-studies',
        id: studyId
      }
    });
  }

  onBackToCreate() {
    this.hasInteractedWithForm = false;
    const modalRef = this.modal.create({
      nzContent: CancelModalComponent,
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.router.navigate(['/all-studies']);
        sessionStorage.clear();
      }
    });
  }

  onReview() {
    const modalRef = this.modal.create({
      nzContent: ReviewModalComponent,
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe(async (result) => {
      if (result) {
        try {
          await this.step3Component?.submitCalculation();
          this.markAsClean();
        } catch (error) {
          console.error('Error during review submission:', error);
        }
      }
    });
  }
  async onBackToSelectPosition() {
    if (this.canUserEdit()) {
      await this.onDraftStepper();
    }
    this.goToStep(this.currentStep - 1);
  }

  async onDraftStepper() {
    switch (this.currentStep) {
      case 0:
        this.step0Component?.onSaveDraft();
        break;
      case 1:
        this.step1Component?.onSaveDraft();
        break;
      case 2:
        //await this.step2Component?.onSaveDraftStepper();
        break;
    }
  }

  async onDraft() {
    switch (this.currentStep) {
      case 0:
        this.step0Component?.onSaveDraft();
        break;
      case 1:
        this.step1Component?.onSaveDraft();
        break;
      case 2:
        await this.step2Component?.onSaveDraft();
        break;
    }
  }

  async onSubmit() {
    if (!this.canUserEdit()) {
      this.goToStep(this.currentStep + 1);
      return;
    }
    switch (this.currentStep) {
      case 0:
        await this.step0Component?.onNextStep();
        this.updateStep();
        break;
      case 1:
        await this.step1Component?.onNextStep();
        this.updateStep();
        break;
      case 2:
        await this.step2Component?.onNextStep();
        this.updateStep();
        break;
    }
  }

  // Note : comment for re use function validate 
  // getValidateProcessInfomation() {
  //   this.calculationContextService.processValid$.subscribe(res => {
  //     if (res) {
  //       this.validateProcessInformation = res?.formPosition1Invalid ?? res?.formPosition2Invalid ?? res?.formPosition3Invalid
  //     }
  //   });
  // }

  // getValidatePipingData() {
  //   this.calculationContextService.pipingValid$.subscribe(res => {
  //     if (res) {
  //       this.validatePipingData = res?.formPosition1Invalid ?? res?.formPosition2Invalid ?? res?.formPosition3Invalid
  //     }
  //   });
  // }

  // getValidatePipesim() {
  //   this.calculationContextService.getPipesimValidate().subscribe(res => {
  //     if (res) {
  //       const { riserUpInvalid, pipelineInvalid, riserDownInvalid, othersInvalid } = res ?? {};
  //       this.validatePipeLine = (pipelineInvalid);
  //       this.validateRiserDown = riserDownInvalid;
  //       this.validateRiserUp = riserUpInvalid;
  //       this.validateOther = (othersInvalid);
  //     }
  //   });
  // }

  // getValidateErosion() {
  //   this.calculationContextService.erosionValid$.subscribe(res => {
  //     this.validateErosion = !res;
  //   });
  // }

  // getValidationThermowell() {
  //   this.calculationContextService.thermowellValid$.subscribe(res => {
  //     if (res) {
  //       const { formInvalid } = res ?? {};
  //       this.validateThermowell = formInvalid;
  //     }
  //   })
  // }

  // isAllFormValid(): boolean {
  //   const baseValidationsInvalid = this.validateProcessInformation || this.validatePipingData;
  //   switch (this.sequenceFlow) {
  //     case '1,2,3,4':
  //     case '1,3,4':
  //       return baseValidationsInvalid
  //         || this.validateThermowell
  //         || this.validateErosion
  //         || this.validatePipeLine
  //         || this.validateRiserDown
  //         || this.validateRiserUp
  //         || this.validateOther;

  //     case '1,2,3':
  //     case '1,3':
  //       return baseValidationsInvalid
  //         || this.validateThermowell
  //         || this.validateErosion;

  //     case '1,4':
  //       return baseValidationsInvalid
  //         || this.validatePipeLine
  //         || this.validateRiserDown
  //         || this.validateRiserUp
  //         || this.validateOther;

  //     default:
  //       return baseValidationsInvalid;
  //   }
  // }

  getStep() {
    this.commonService.getHandleStep(this.transaction?.data?.transactionId).subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.sequenceFlow = response?.data?.sequenceFlow
          this.currentStep = this.mappingHandleStep(response?.data?.transactionStep);
          this.stepOrigin = this.mappingHandleStep(response?.data?.transactionStep);
          this.stepValue = response?.data?.transactionStep;
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.log(error)
      }
    });
  }

  mappingHandleStep(key: calculationStep): number {
    return handleStep[key] ?? 0;
  }

  canUserEdit(): boolean {
    if (this.hasFullAccess) {
      return true;
    }
    if (!this.transaction?.data?.createdBy || !this.Owner) {
      return true;
    }
    return this.Owner === this.transaction.data.createdBy;
  }

  async saveDraftAndGoToStep(targetStep: number) {
    this.goToStep(targetStep);
  }

  onStepInteracted(hasInteracted: boolean) {
    if (hasInteracted) {
      this.hasInteractedWithForm = true;
    }
  }

  onStepFormChanged(hasChanged: boolean) {
    if (hasChanged) {
      this.hasInteractedWithForm = true;
    }
  }

  currentStepHasUnsavedChanges(): boolean {
    const currentStepComponent = this.stepComponents[this.currentStep];
    if (currentStepComponent && typeof currentStepComponent.hasUnsavedChanges === 'function') {
      return currentStepComponent.hasUnsavedChanges();
    }
    return false;
  }

  resetAllStepsInteractionState() {
    this.stepComponents.forEach((component, index) => {
      if (component && typeof component.resetInteractionState === 'function') {
        component.resetInteractionState();
      }
    });
    this.hasInteractedWithForm = false;
  }

  updateStep(){
    this.commonService.getHandleStep(this.transaction?.data?.transactionId).subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.sequenceFlow = response?.data?.sequenceFlow
          this.stepOrigin = this.mappingHandleStep(response?.data?.transactionStep);
          this.stepValue = response?.data?.transactionStep;
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.log(error)
      }
    });
  }
}