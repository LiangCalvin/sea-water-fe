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
  private _data: any;

  @Input()
  set data(value: any) {
    this._data = value;
    if (value) {
      this.initForm();
    }
  }

  get data() {
    return this._data;
  }

  form!: FormGroup;
  locations: any = []
  fieldAssets: any = []
  // data: any = []
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

  // async ngOnInit() {
  //   await this.getAssetDropDown();

  //   if (this.data) {
  //     await this.initForm();
  //   }

  //   this.form.get('location')?.disable();
  //   this.form.get('asset')?.valueChanges.subscribe(async (asset: any) => {
  //     if (asset?.id) {
  //       const currentLocationValue = this.form.get('location')?.value;

  //       this.getLocationDropDown(asset.id).then(() => {
  //         if (currentLocationValue && !this.locations.find((loc: any) => loc.id === currentLocationValue?.id)) {
  //           this.form.get('location')?.setValue(null);
  //         }
  //       });
  //     } else {
  //       this.locations = [];
  //       this.form.get('location')?.setValue(null);
  //     }
  //   });
  // }
  // async ngOnInit() {
  //   // 1. Load all assets first
  //   await this.getAssetDropDown();

  //   // 2. Only then patch the form
  //   if (this.data) {
  //     await this.initForm(); // now fieldAssets is populated
  //   }

  //   // 3. Subscribe to asset changes
  //   this.form.get('asset')?.valueChanges.subscribe(async (asset: any) => {
  //     if (asset?.id) {
  //       const currentLocationValue = this.form.get('location')?.value;
  //       await this.getLocationDropDown(asset.id);
  //       if (currentLocationValue && !this.locations.find((loc: any) => loc.id === currentLocationValue?.id)) {
  //         this.form.get('location')?.setValue(null);
  //       }
  //     } else {
  //       this.locations = [];
  //       this.form.get('location')?.setValue(null);
  //     }
  //   });
  // }

  async ngOnInit() {
    // Mock the dropdowns using data passed from parent
    if (this._data) {
      this.fieldAssets = [{ id: this._data.assetId, name: this._data.assetName }];
      this.locations = [{ id: this._data.locationId, name: this._data.locationName }];

      this.initForm();
    }

    // Enable reactive updates if you want user to change asset/location
    this.form.get('asset')?.valueChanges.subscribe((asset: any) => {
      if (asset?.id && asset.id !== this.locations[0]?.id) {
        // If asset changes, you may want to clear or update location
        this.form.get('location')?.setValue(null);
      }
    });
  }

  // async initForm() {
  //   let selectedAsset = this.fieldAssets.find((asset: any) =>
  //     asset.id === this.data.assetName?.id
  //   );

  //   if (!selectedAsset && this.data.assetName) {
  //     selectedAsset = this.data.assetName;
  //   }
  //   if (selectedAsset?.id) {
  //     await this.getLocationDropDown(selectedAsset.id);

  //     let selectedLocation = this.locations.find((location: any) =>
  //       location.id === this.data.locationName?.id
  //     );

  //     if (!selectedLocation && this.data.locationName) {
  //       selectedLocation = this.data.locationName;
  //     }
  //     setTimeout(() => {
  //       this.form.patchValue({
  //         location: selectedLocation,
  //         asset: selectedAsset,
  //         studyName: this.data.studyName,
  //       });
  //       this.form.get('location')?.enable();
  //     });

  //   } else {
  //     this.form.patchValue({
  //       studyName: this.data.studyName,
  //       location: null,
  //       asset: selectedAsset || null,
  //     });
  //     this.form.get('location')?.enable();
  //   }
  // }

  async initForm() {
    this.form.patchValue({
      studyName: this._data.studyName,
      asset: this.fieldAssets[0] || null,
      location: this.locations[0] || null
    });

    this.form.get('location')?.enable();
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
