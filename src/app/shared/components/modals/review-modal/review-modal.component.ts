import { Component, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ButtonComponent } from "../../button/button.component";

@Component({
  selector: 'app-review-modal',
  imports: [ButtonComponent],
  templateUrl: './review-modal.component.html',
  styleUrl: './review-modal.component.scss'
})
export class ReviewModalComponent {
  @Input() title: string = 'Confirm submission: Are you sure you want to send this data for simulation?';
  @Input() text: string = '';
  @Input() btnSubmitText: string = 'Yes';
  @Input() btnCancelText: string = 'No';
  constructor(private readonly modalRef: NzModalRef) { }

  onSubmit(): void {
    this.modalRef.close(true);
  }

  onCancel(): void {
    this.modalRef.destroy();
  }
}
