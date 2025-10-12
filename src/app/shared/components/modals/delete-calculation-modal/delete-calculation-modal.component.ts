import { Component, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-delete-calculation-modal',
  imports: [ButtonComponent],
  templateUrl: './delete-calculation-modal.component.html',
  styleUrl: './delete-calculation-modal.component.scss',
})
export class DeleteCalculationModalComponent {
  @Input() title: string = 'Are you sure you want to delete this calculation?';
  @Input() text: string =
    'You will lose all this calculation history, This action cannot be undone';
  @Input() btnSubmitText: string = 'Delete';
  @Input() btnCancelText: string = 'Cancel';
  constructor(private readonly modalRef: NzModalRef) {}

  onSubmit(): void {
    this.modalRef.close(true);
  }

  onCancel(): void {
    this.modalRef.destroy();
  }
}
