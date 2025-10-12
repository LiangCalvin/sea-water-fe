import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ButtonComponent } from "../../button/button.component";

@Component({
  selector: 'app-unsaved-changes-modal',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './unsaved-changes-modal.component.html',
  styleUrl: './unsaved-changes-modal.component.scss',
  standalone: true,
})
export class UnsavedChangesModalComponent {
  @Input() title: string = 'Are you sure you want to leave this page?';
  @Input() text: string = 'Unsaved data will be lost.';
  @Input() btnSubmitText: string = 'Confirm';
  @Input() btnCancelText: string = 'Cancel';
  constructor(private readonly modalRef: NzModalRef) { }

  onSubmit(): void {
    this.modalRef.close(true);
  }

  onCancel(): void {
    this.modalRef.destroy();
  }
}
