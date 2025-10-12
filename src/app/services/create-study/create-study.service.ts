import {
  inject,
  Injectable,
} from '@angular/core';
import { EnvironmentConfigurationService } from '../environment-configuration.service';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { CreateStudyRequest, CreateStudyResponse } from '../../core/models/create-study/create-study.model';

@Injectable({
  providedIn: 'root'
})

export class CreateStudyService {
  private readonly envConfigService = inject(EnvironmentConfigurationService);
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = this.envConfigService.getBaseUrl();

  constructor() { }

  // postCreateStudy(req: CreateStudyRequest): Observable<CreateStudyResponse> {
  //   return this.http.post<CreateStudyResponse>(`${this.BASE_URL}/v1/study`, req);
  // }

  getDropDownAsset(): Observable<{ response: any }> {
    return this.http.get<any>(`${this.BASE_URL}/v1/study/field-assets`);
  }

  getDropDownLocation(assetId: string): Observable<{ response: any }> {
    return this.http.get<any>(`${this.BASE_URL}/v1/study/locations?asset_id=${assetId}`);
  }
  postCreateStudy(req: any) {
    const mockResponse = {
      data: { studyCode: 'FAKE-123', ...req },
      message: 'Mock API success'
    };
    return of(mockResponse).pipe(delay(500));
  }
}