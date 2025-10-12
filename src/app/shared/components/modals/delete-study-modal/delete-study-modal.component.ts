import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-delete-study-modal',
  imports: [ButtonComponent],
  templateUrl: './delete-study-modal.component.html',
  styleUrl: './delete-study-modal.component.scss',
})
export class DeleteStudyModalComponent {
  @Input() title: string = 'Are you sure you want to delete this study?';
  @Input() text: string = 'All related calculations will be removed.';
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
