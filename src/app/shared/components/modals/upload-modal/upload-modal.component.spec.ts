import { provideHttpClient } from '@angular/common/http';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UploadModalComponent } from './upload-modal.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { InjectionToken } from '@angular/core';
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { ExportExcelService } from '../../../services/export-excel.service';
import { CalculationContextService } from '../../../../pages/calculation/CalculationContext.service';
import { of } from 'rxjs';
import { APP_CONFIG } from '../../../../../../src/app/core/interfaces/environment-configuration';
import { CalculationConstants } from '../../../../core/enums/calculation.enum';
import { AlertService } from '../../../services/alert.service';
import { CompositionResponse } from '../../../../core/models/calculation/model-and-basic-composition.model';

const mockModalRef = {
    close: jasmine.createSpy('close'),
    destroy: jasmine.createSpy('destroy'),
};
export const ENV_CONFIG = new InjectionToken<any>('env_config');
const mockEnvConfig = {
    baseUrl: 'http://mock-api'
};
let fileReaderSpy: jasmine.SpyObj<FileReader>;

beforeAll(() => {
    fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsDataURL'], {
        onload: null,
        onerror: null,
        result: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,base64content'
    });

    spyOn(window as any, 'FileReader').and.returnValue(fileReaderSpy);
});


describe('UploadModalComponent', () => {
    let component: UploadModalComponent;
    let fixture: ComponentFixture<UploadModalComponent>;
    let calculationServiceSpy: jasmine.SpyObj<CalculationService>;
    calculationServiceSpy = jasmine.createSpyObj('CalculationService', [
        'postReadExcelComposition',
        'postReadExcelPipesim',
        'getTemplatData'
    ]);
    const mockAlertService = jasmine.createSpyObj('AlertService', ['getErrorMessage']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UploadModalComponent],
            providers: [
                provideHttpClient(),
                { provide: NzModalRef, useValue: mockModalRef },
                { provide: APP_CONFIG, useValue: mockEnvConfig },
                { provide: CalculationService, useValue: jasmine.createSpyObj('CalculationService', ['getTemplatData']) },
                { provide: ExportExcelService, useValue: jasmine.createSpyObj('ExportExcelService', ['exportAsExcelFile']) },
                { provide: CalculationContextService, useValue: jasmine.createSpyObj('CalculationContextService', ['convertTableToCompositions']) },
                { provide: CalculationService, useValue: calculationServiceSpy },
                { provide: AlertService, useValue: mockAlertService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UploadModalComponent);
        component = fixture.componentInstance;
        calculationServiceSpy = TestBed.inject(CalculationService) as jasmine.SpyObj<CalculationService>;
    });

    it('should return false and set fileError for invalid file name', () => {
        const file = new File([''], 'invalid/name.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const result = component.beforeUpload(file as any, []);
        expect(result).toBeFalse();
        expect(component.fileError).toContain('invalid characters');
        expect(component.selectedFile).toBe(file as any);
    });

    it('should return false and set fileError for invalid file name', () => {
        const file = new File([''], 'invalid/name.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const result = component.beforeUpload(file as any, []);
        expect(result).toBeFalse();
        expect(component.fileError).toContain('invalid characters');
        expect(component.selectedFile).toBe(file as any);
    });

    it('should return false and set fileError for invalid file type', () => {
        const file = new File([''], 'test.txt', { type: 'text/plain' });
        const result = component.beforeUpload(file as any, []);
        expect(result).toBeFalse();
        expect(component.fileError).toContain('Invalid file type');
    });

    it('should return false and set fileError for file size too large', () => {
        const file = new File([''], 'large.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        Object.defineProperty(file, 'size', { value: component.MAX_FILE_SIZE + 1 });
        const result = component.beforeUpload(file as any, []);
        expect(result).toBeFalse();
        expect(component.fileError).toContain('File size exceeds');
    });

    it('should return false and set fileError for empty file', () => {
        const file = new File([''], 'empty.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        Object.defineProperty(file, 'size', { value: 0 });
        const result = component.beforeUpload(file as any, []);
        expect(result).toBeFalse();
        expect(component.fileError).toContain('file is empty');
    });

    it('should clear selected file and error on onClearFile()', () => {
        component.selectedFile = new File([''], 'test.xlsx');
        component.fileError = 'Some error';
        const result = component.onClearFile();
        expect(component.selectedFile).toBeNull();
        expect(component.fileError).toBeNull();
        expect(result).toBeFalse();
    });


    it('should close modal with base64 content on onSubmit()', fakeAsync(() => {
        component.selectedFile = new File(['dummy'], 'file.xlsx');
        component.base64Content = 'dummyBase64Content';
        component.templateName = CalculationConstants.TYPE_BASIC_COMPOSITION;
      
      
        const mockResponse: CompositionResponse = { data: [{ name: 'dummy', value: 1 }] };
        calculationServiceSpy.postReadExcelComposition.and.returnValue(of(mockResponse));
      
        component.onSubmit();
        tick();
      
        expect(mockModalRef.close).toHaveBeenCalledWith(mockResponse);
      }));
      
    
    it('should NOT close modal if no file is selected on onSubmit()', () => {
        mockModalRef.close.calls.reset();
    
        component.selectedFile = null;
    
        component.onSubmit();
    
        expect(mockModalRef.close).not.toHaveBeenCalled();
    });

    it('should destroy modal on onCancel()', () => {
        component.onCancel();
        expect(mockModalRef.destroy).toHaveBeenCalled();
    });

    it('should call getTableCompositionTemplate() when downloadSampleTemplate() is called', () => {
        const spy = spyOn(component, 'getTableCompositionTemplate');
        component.downloadSampleTemplate();
        expect(spy).toHaveBeenCalled();
    });

});
