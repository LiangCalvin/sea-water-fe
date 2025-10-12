import { Component, Input } from '@angular/core';
import { NzUploadFile, NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ButtonComponent } from '../../button/button.component';
import { CommonModule } from '@angular/common';
import { ExportExcelService } from '../../../services/export-excel.service';
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../../../pages/calculation/CalculationContext.service';
import { CalculationConstants } from '../../../../core/enums/calculation.enum';
import { ModelCompositionResponse } from '../../../../core/models/calculation/model-and-basic-composition.model';
import { AlertService } from '../../../services/alert.service';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [CommonModule, NzUploadModule, ButtonComponent],
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss']
})
export class UploadModalComponent {
  @Input() title: string = '';
  @Input() desc: string = ''
  @Input() templateName: string = ''
  selectedFile: File | null = null;
  fileError: string | null = null;
  base64Content: any;
  fileName?: string = '';
  fileType: string = '';
  exampleModel: any;
  constructor(
    private modalRef: NzModalRef,
    private calculationService: CalculationService,
    private alertService: AlertService
  ) { }

  readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  beforeUpload = (file: NzUploadFile, fileList: NzUploadFile[]): boolean => {
    let hasError = false;

    const validName = /^[\w\-.() ]+$/.test(file.name);
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx');
    const isSizeValid = file.size! <= this.MAX_FILE_SIZE;
    const isNotEmpty = file.size !== 0;

    this.selectedFile = file as any;

    if (!validName) {
      this.fileError = `The file name "${file.name}" contains invalid characters.`;
      hasError = true;
    } else if (!isXlsx) {
      this.fileError = `Invalid file type. Only .xlsx files are allowed.`;
      hasError = true;
    } else if (!isSizeValid) {
      this.fileError = `File size exceeds 10 MB.`;
      hasError = true;
    } else if (!isNotEmpty) {
      this.fileError = `The file is empty.`;
      hasError = true;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result || !result.includes(',')) {
          this.fileError = 'Failed to read file as base64.';
          return;
        }
        const base64 = result.split(',')[1];
        if (!base64 || base64.trim() === '') {
          this.fileError = 'Base64 data is empty.';
          return;
        }

        this.base64Content = base64;
        this.fileName = `${file.name}`;
        this.fileType = `${file.type}`;
        this.fileError = null;
      };
      reader.onerror = () => {
        this.fileError = 'Failed to read file. Please try again.';
      };
      reader.readAsDataURL(file as any);
    }
    return false;
  };

  onClearFile() {
    this.selectedFile = null;
    this.fileError = null;
    return false;
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      return;
    }
  
    if (this.templateName === CalculationConstants.TYPE_BASIC_COMPOSITION) {
      this.getTableCompositionByImportExcel(this.base64Content).subscribe({
        next: (response) => {
          this.modalRef.close(response);
        },
        error: (error) => {
          this.fileError = this.alertService.getErrorMessage(error);
        }
      });
    } else {
      this.getTableSectionByImportExcel(this.base64Content).subscribe({
        next: (response) => {
          this.modalRef.close(response);
        },
        error: (error) => {
          this.fileError = this.alertService.getErrorMessage(error);
        }
      });
    }
  }
  


  onCancel(): void {
    this.modalRef.destroy();
  }

  downloadSampleTemplate(): void {
    this.getTableCompositionTemplate();
  }

  getTableCompositionTemplate() {
    this.calculationService.getTemplatData(this.templateName).subscribe(async (response: any) => {
      try {
        const signedUrl = response.data?.signedUrl ?? response.response?.data?.signedUrl;

        if (signedUrl) {
          const a = document.createElement('a');
          a.href = response.data.signedUrl;
          a.download = `${this.templateName}`;
          a.click();
        }

      } catch (error) {
        console.log("error :", error);
      }
    });
  }


  getTableCompositionByImportExcel(fileBase64: string): Observable<any> {
    const request = { data: fileBase64 };
    return this.calculationService.postReadExcelComposition(request).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getTableSectionByImportExcel(fileBase64: string): Observable<any> {
    const request = { data: fileBase64 };
    return this.calculationService.postReadExcelPipesim(request).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}
