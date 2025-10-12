import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PositionSelectorComponent } from "../calculation-input/position-selector/position-selector.component";
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../CalculationContext.service';
import { PositionGroup } from '../../../../core/models/calculation/position-group.model';
import { AlertMessageConstants } from '../../../../core/enums/calculation.enum';
import { AlertService } from '../../../../shared/services/alert.service';
import { CommonService } from '../../../../services/common/common.service';
import { ImageComponent } from "../../../../shared/components/image/image.component";
import { StepComponentWithUnsavedChanges } from '../../../../core/models/calculation/step-unsave-changes.model';

@Component({
  selector: 'app-select-position',
  standalone: true,
  imports: [
    CardComponent,
    CommonModule,
    ReactiveFormsModule,
    PositionSelectorComponent,
    ImageComponent
],
  templateUrl: './select-position.component.html',
  styleUrl: './select-position.component.scss'
})
export class SelectPositionComponent implements OnInit, StepComponentWithUnsavedChanges {
  @Output() backStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();
  @Input() sequenceFlow: string = '1,2,3,4';
  @Output() stepInteracted = new EventEmitter<boolean>();
  @Output() updateStep = new EventEmitter<void>();
  study: any;
  transaction: any;

  private hasInteracted = false;
  private isInitialized = false;
  constructor(
    private readonly calculationService: CalculationService,
    private readonly calculationContextService: CalculationContextService,
    private readonly alertService: AlertService
  ) {

  }

  ngOnInit(): void {
    const getStudy: any = sessionStorage.getItem('study');
    const getTransactionId: any = sessionStorage.getItem('transactionId');
    this.study = JSON.parse(getStudy);
    this.transaction = JSON.parse(getTransactionId);
    setTimeout(() => {
      this.isInitialized = true;
    }, 0);
  }

  hasUnsavedChanges(): boolean {
    return this.hasInteracted;
  }

  resetInteractionState(): void {
    this.hasInteracted = false;
    this.stepInteracted.emit(false);
  }

  onPositionChange(positionGroup: PositionGroup): void {
    if (!this.isInitialized) {
      return;
    }
    this.sequenceFlow = positionGroup.sequenceFlow;
    this.calculationContextService.setSelectPosition(positionGroup);
    this.hasInteracted = true;
    this.stepInteracted.emit(true);
  }

  onSaveDraft() {
    const currentPosition = this.calculationContextService.getSelectPosition();
    if (!currentPosition) {
      return;
    }
    const requestPayload = {
      studyId: this.study?.data?.studyId,
      transactionId: this.transaction?.data?.transactionId,
      sequenceFlow: currentPosition.sequenceFlow
    };
    this.calculationService.saveDraftSelectPosition(requestPayload).subscribe({
      next: (response) => {
        const modalTitle = AlertMessageConstants.SAVE_SUCCESS_TITLE;
        const modalText = AlertMessageConstants.SAVE_DRAFT_SUCCESS_TEXT;
        this.alertService.success(modalTitle, modalText, true, 5000);
        this.resetInteractionState();
      },
      error: (error) => {
        console.error('Failed to save sequence flow draft:', error);
      }
    });
  }

  async onNextStep(): Promise<void> {
    const currentPosition = this.calculationContextService.getSelectPosition();
    if (!currentPosition) {
      return;
    }
    const requestPayload = {
      studyId: this.study?.data?.studyId,
      transactionId: this.transaction?.data?.transactionId,
      sequenceFlow: currentPosition.sequenceFlow
    };

    this.calculationService.saveSelectPosition(requestPayload).subscribe({
      next: (response) => {
        const modalTitle = AlertMessageConstants.SAVE_SUCCESS_TITLE;
        const modalText = AlertMessageConstants.SAVE_SUCCESS_TEXT;
        this.alertService.success(modalTitle, modalText, true, 5000);
        this.resetInteractionState();
      },
      error: (error) => {
        console.error('Failed to save sequence flow draft:', error);
      }
    });
    this.nextStep.emit();
  }

  async onBackStep(): Promise<void> {
    this.backStep.emit();
  }
}
