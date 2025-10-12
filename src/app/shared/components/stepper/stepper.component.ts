import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzStepsModule } from 'ng-zorro-antd/steps';
@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [
    CommonModule,
    NzDividerModule,
    NzStepsModule
  ],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent {
  @Input() steps: any[] = [];
  @Input() activeStep: number = 0;
  @Input() stepHeight: number = 4;
  @Input() stepOrigin: number = 0;
  @Output() stepClicked = new EventEmitter<number>();
  @Input() disabled: boolean = false;

  get activeLineHeight(): string {
    const stepSize = 3.57;
    const adjustedHeight = this.activeStep * stepSize;
    return `${adjustedHeight}rem`;
  }

  onStepClick(index: number): void {
    if (this.disabled || index > this.stepOrigin) {
      return;
    }
    this.stepClicked.emit(index);
  }
}
