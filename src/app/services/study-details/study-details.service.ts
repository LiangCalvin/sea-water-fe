import { inject, Injectable } from '@angular/core';
import { EnvironmentConfigurationService } from '../environment-configuration.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, filter, Observable, take } from 'rxjs';
import { ExportCalculationResponse } from '../../core/models/all-studies/study-model.model';

@Injectable({
  providedIn: 'root'
})
export class StudyDetailsService {
  private envConfigService = inject(EnvironmentConfigurationService);
  private http = inject(HttpClient);
  private readonly BASE_URL = this.envConfigService.getBaseUrl();
  constructor() { }


  getStudyById(studyId: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/v1/study/${studyId}`);
  }

  editStudy(req: any) {
    return this.http.put<any>(`${this.BASE_URL}/v1/study`, req);
  }


  getCalculationList(params: any): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/v1/transaction/list`, {
      params: { ...params }
    });
  }

  reCalculation(req: any) {
    return this.http.post<any>(`${this.BASE_URL}/v1/calculation/recalculate`, req);
  }

  deleteTransaction(transactionId: string) {
    return this.http.delete<any>(`${this.BASE_URL}/v1/transaction/${transactionId}`);
  }

  deleteStudy(studyId: string) {
    return this.http.delete<any>(`${this.BASE_URL}/v1/study/${studyId}`);
  }

  exportCalculation(params: {
    study_id: string;
    transaction_id: string;
  }): Observable<ExportCalculationResponse> {
    return this.http.get<ExportCalculationResponse>(
      `${this.BASE_URL}/v1/calculation/summary/export`,
      { params }
    );
  }
}
