import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ExportExcelService {
  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };
    const excelBuffer: any = this.writeExcel(workbook);
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  // Add wrapper method to enable spying
  public writeExcel(workbook: XLSX.WorkBook): any {
    return XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(data, `${fileName}.xlsx`);
  }
}
