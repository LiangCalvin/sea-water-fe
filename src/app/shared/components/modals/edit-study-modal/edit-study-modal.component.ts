import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { ButtonComponent } from '../../button/button.component';
import { InputTextComponent } from '../../input-text/input-text.component';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateStudyRequest } from '../../../../core/models/create-study/create-study.model';
import { CreateStudyService } from '../../../../services/create-study/create-study.service';

@Component({
  selector: 'app-edit-study-modal',
  standalone: true,
  imports: [CommonModule, NzUploadModule, ButtonComponent, InputTextComponent, DropdownComponent, ReactiveFormsModule],
  templateUrl: './edit-study-modal.component.html',
  styleUrl: './edit-study-modal.component.scss'
})
export class EditStudyModalComponent {
  @Input() title: string = 'Edit Study';
  @Input() subTitle: string = 'Enter the details for your WHP analysis study.';
  @Input() btnSubmitText: string = 'Save';
  @Input() btnCancelText: string = 'Cancel';
  form!: FormGroup;
  locations: any = []
  fieldAssets: any = []
  data: any = []
  constructor(
    private modalRef: NzModalRef,
    private fb: FormBuilder,
    private createStudyService: CreateStudyService,
  ) {

    this.form = this.fb.group({
      studyName: ['', Validators.required],
      location: ['', Validators.required],
      asset: ['', Validators.required],
    });
  }

  async ngOnInit() {
    await this.getAssetDropDown();

    if (this.data) {
      await this.initForm();
    }

    this.form.get('location')?.disable();
    this.form.get('asset')?.valueChanges.subscribe(async (asset: any) => {
      if (asset?.id) {
        const currentLocationValue = this.form.get('location')?.value;

        this.getLocationDropDown(asset.id).then(() => {
          if (currentLocationValue && !this.locations.find((loc: any) => loc.id === currentLocationValue?.id)) {
            this.form.get('location')?.setValue(null);
          }
        });
      } else {
        this.locations = [];
        this.form.get('location')?.setValue(null);
      }
    });
  }

  async initForm() {
    let selectedAsset = this.fieldAssets.find((asset: any) =>
      asset.id === this.data.assetName?.id
    );

    if (!selectedAsset && this.data.assetName) {
      selectedAsset = this.data.assetName;
    }
    if (selectedAsset?.id) {
      await this.getLocationDropDown(selectedAsset.id);

      let selectedLocation = this.locations.find((location: any) =>
        location.id === this.data.locationName?.id
      );

      if (!selectedLocation && this.data.locationName) {
        selectedLocation = this.data.locationName;
      }
      setTimeout(() => {
        this.form.patchValue({
          location: selectedLocation,
          asset: selectedAsset,
          studyName: this.data.studyName,
        });
        this.form.get('location')?.enable();
      });
      
    } else {
      this.form.patchValue({
        studyName: this.data.studyName,
        location: null,
        asset: selectedAsset || null,
      });
      this.form.get('location')?.enable();
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    } else {
      const getForm = this.form.getRawValue()
      const req: CreateStudyRequest = {
        studyName: getForm.studyName,
        locationId: getForm.location?.id,
        assetId: getForm.asset?.id
      }
      this.modalRef.close(req);
    }
  }

  onCancel(): void {
    this.modalRef.destroy();
  }

  getAssetDropDown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.createStudyService.getDropDownAsset().subscribe({
        next: (response: any) => {
          try {
            this.fieldAssets = response.data;
            resolve();
          } catch (error) {
            console.log("error :", error);
            reject(error);
          }
        },
        error: (error) => {
          console.log("Asset dropdown error:", error);
          reject(error);
        }
      });
    });
  }

  getLocationDropDown(assetId?: string): Promise<void> {
    this.locations = [];

    if (!assetId) {
      return Promise.resolve();;
    }

    return new Promise((resolve, reject) => {
      this.createStudyService.getDropDownLocation(assetId).subscribe({
        next: (response: any) => {
          try {
            this.locations = response.data;
            resolve();
          } catch (error) {
            console.log("error :", error);
            reject(error);
          }
        },
        error: (error) => {
          console.log("Location dropdown error:", error);
          reject(error);
        }
      });
    });
  }
}
