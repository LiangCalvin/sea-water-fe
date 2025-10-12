import { Injectable, ComponentRef, ViewContainerRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UnsavedChangesModalComponent } from '../../../shared/components/modals/unsaved-changes-modal/unsaved-changes-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
// import { NzModalService } from 'ng-zorro-antd/modal';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesService {
  private modalComponentRef?: ComponentRef<UnsavedChangesModalComponent>;
  private viewContainerRef?: ViewContainerRef;

  constructor(
    private modal: NzModalService
  ) {

  }
  setViewContainerRef(viewContainerRef: ViewContainerRef): void {
    this.viewContainerRef = viewContainerRef;
  }

  openUnsavedChangesModal(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const modalRef = this.modal.create({
        nzContent: UnsavedChangesModalComponent,
        nzFooter: null,
        nzWidth: 500,
        nzClosable: false,
        nzMaskClosable: false,
        nzViewContainerRef: this.viewContainerRef,

      });

      modalRef.afterClose.subscribe((result: boolean | undefined) => {
        observer.next(!!result);
        observer.complete();
      });
    });
  }

  private closeModal(): void {
    if (this.modalComponentRef) {
      this.modalComponentRef.destroy();
      this.modalComponentRef = undefined;
    }
  }
}