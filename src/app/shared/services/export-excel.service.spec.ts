import { TestBed } from '@angular/core/testing';
import { ExportExcelService } from './export-excel.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

describe('ExportExcelService', () => {
  let service: ExportExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call XLSX utils and FileSaver to export file', () => {
    const sampleData = [{ name: 'Test', value: 1 }];
    const fileName = 'test-export';

    const fakeBuffer = new ArrayBuffer(8);

    spyOn(service, 'writeExcel').and.returnValue(fakeBuffer);
    spyOn(XLSX.utils, 'json_to_sheet').and.callThrough();
    spyOn(FileSaver, 'saveAs').and.stub();

    service.exportAsExcelFile(sampleData, fileName);

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(sampleData);
    expect(service.writeExcel).toHaveBeenCalled();
    expect(FileSaver.saveAs).toHaveBeenCalled();

    const [blobArg, fileArg] = (FileSaver.saveAs as unknown as jasmine.Spy).calls.mostRecent().args;
    expect(blobArg instanceof Blob).toBeTrue();
    expect(fileArg).toBe(`${fileName}.xlsx`);
  });
});