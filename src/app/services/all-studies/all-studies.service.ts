import { inject, Injectable } from '@angular/core';
import { EnvironmentConfigurationService } from '../environment-configuration.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudyListParams, StudyListResponse } from '../../core/models/all-studies/study-model.model';

@Injectable({
  providedIn: 'root'
})
export class AllStudiesService {
  private envConfigService = inject(EnvironmentConfigurationService);
  private http = inject(HttpClient);
  private readonly BASE_URL = this.envConfigService.getBaseUrl();
  constructor() { }

  getStudyList(params: StudyListParams): Observable<StudyListResponse> {
    return this.http.get<StudyListResponse>(`${this.BASE_URL}/v1/study/list`, {
      params: { ...params }
    });
  }

}