import { Component, inject } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { InputTextComponent } from "../../shared/components/input-text/input-text.component";
import { DropdownComponent } from "../../shared/components/dropdown/dropdown.component";
import { ButtonComponent } from "../../shared/components/button/button.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateStudyService } from '../../services/create-study/create-study.service';
import { CreateStudyRequest } from '../../core/models/create-study/create-study.model';
import { AlertService } from '../../shared/services/alert.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CancelModalComponent } from '../../shared/components/modals/cancel-modal/cancel-modal.component';
import { GlobalTemplateService } from '../../services/global-template.service';
import { CommonModule } from '@angular/common';
import { ImageComponent } from "../../shared/components/image/image.component";
import { UnsavedChangesService } from '../../services/unsaved-changes/unsaved-changes.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-new-study',
  standalone: true,
  imports: [CommonModule, CardComponent, InputTextComponent, DropdownComponent, ButtonComponent, ReactiveFormsModule, ImageComponent],
  templateUrl: './create-new-study.component.html',
  styleUrl: './create-new-study.component.scss'
})

export class CreateNewStudyComponent {
  form!: FormGroup;
  locations: any = [];
  fieldAssets: any = [];
  isLoading = true;
  private hasInteractedWithForm = false;
  private isNavigatingAfterSubmit = false;

  private templateService = inject(GlobalTemplateService);
  private unsavedChangesService = inject(UnsavedChangesService);

  readonly LOADING_TEMPLATE = this.templateService.getTemplate('loading');
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly createStudyService: CreateStudyService,
    private readonly alertService: AlertService,
    private readonly modal: NzModalService,
  ) {
    this.form = this.fb.group({
      studyName: ['', Validators.required],
      locationId: ['', Validators.required],
      assetId: ['', Validators.required],
    });
  }

  ngOnInit() {
    sessionStorage.clear();

    this.form.get('locationId')?.disable();
    this.form.valueChanges.subscribe(() => {
      this.hasInteractedWithForm = true;
    });
    this.form.get('assetId')?.valueChanges.subscribe((asset: any) => {
      if (asset?.id) {
        this.form.get('locationId')?.setValue(null);
        this.getLocationDropDown(asset.id);
      } else {
        this.locations = [];
        this.form.get('locationId')?.setValue(null);
      }
    });
    this.getAssetDropDown();
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  hasUnsavedChanges(): boolean {
    return this.hasInteractedWithForm && !this.isNavigatingAfterSubmit;
  }

  openUnsavedChangesModal(): Observable<boolean> {
    return this.unsavedChangesService.openUnsavedChangesModal();
  }
  onCancel() {
    this.hasInteractedWithForm = false;
    const modalRef = this.modal.create({
      nzContent: CancelModalComponent,
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.router.navigate(['/all-studies'])
      }
    });
  }

  onCreateOnly() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    } else {
      const getForm = this.form.getRawValue()

      const req: CreateStudyRequest = {
        studyName: getForm.studyName,
        locationId: getForm.locationId?.id,
        assetId: getForm.assetId?.id
      }

      this.createStudyService.postCreateStudy(req).subscribe(async (response: any) => {
        try {
          sessionStorage.setItem('study', JSON.stringify(response));
          const modalTitle = 'Study successfully created';
          const modalText = 'The study was saved with all required data';
          this.alertService.success(modalTitle, modalText);

          this.isNavigatingAfterSubmit = true;

          // this.router.navigate(['/all-studies'])
          this.router.navigate(['/study-details'], {
            queryParams: { id: response?.data?.studyId }
          });
        } catch (error) {
          console.log("error :", error);
        }
      });
    }
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    } else {
      const getForm = this.form.getRawValue()

      const req: CreateStudyRequest = {
        studyName: getForm.studyName,
        locationId: getForm.locationId?.id,
        assetId: getForm.assetId?.id
      }

      this.createStudyService.postCreateStudy(req).subscribe(async (response: any) => {
        try {
          sessionStorage.setItem('study', JSON.stringify(response));
          const modalTitle = 'Study successfully created';
          const modalText = 'The study was saved with all required data';
          this.alertService.success(modalTitle, modalText);

          this.isNavigatingAfterSubmit = true;

          this.router.navigate(['/calculation', response?.data?.studyCode])
        } catch (error) {
          console.log("error :", error);
        }
      });
    }
  }

  getAssetDropDown() {
    this.createStudyService.getDropDownAsset().subscribe(async (response: any) => {
      try {
        this.fieldAssets = response.data;
      } catch (error) {
        console.log("error :", error);
      }
    });
  }

  getLocationDropDown(assetId: string) {
    this.locations = [];
    if (!assetId) {
      return;
    }

    this.createStudyService.getDropDownLocation(assetId).subscribe({
      next: (response: any) => {
        try {
          this.locations = response.data;
          this.form.get('locationId')?.enable();
        } catch (error) {
          console.log("error :", error);
        }
      },
      error: (error) => {
        console.log("Location dropdown error:", error);
      }
    });
  }
}
