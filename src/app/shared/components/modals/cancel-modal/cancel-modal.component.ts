import { Component, Input } from '@angular/core';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { ButtonComponent } from '../../button/button.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancel-modal',
  standalone: true,
  imports: [CommonModule, NzUploadModule, ButtonComponent],
  templateUrl: './cancel-modal.component.html',
  styleUrl: './cancel-modal.component.scss'
})
export class CancelModalComponent {
  @Input() title: string = 'Are you sure you want to cancel?';
  @Input() text: string = 'You will lose all unsaved progress if you leave now.';
  @Input() btnSubmitText: string = 'Leave Page';
  @Input() btnCancelText: string = 'Stay on Page';
  constructor(private readonly modalRef: NzModalRef) { }

  onSubmit(): void {
    this.modalRef.close(true);
  }


  onCancel(): void {
    this.modalRef.destroy();
  }
}
