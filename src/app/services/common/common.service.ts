import { inject, Injectable } from '@angular/core';
import { EnvironmentConfigurationService } from '../environment-configuration.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransactionConfigResponse } from '../../core/models/common/common.mode';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private readonly envConfigService = inject(EnvironmentConfigurationService);
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = this.envConfigService.getBaseUrl();

  constructor() { }

  getHandleStep(id: string): Observable<TransactionConfigResponse> {
    return this.http.get<TransactionConfigResponse>(`${this.BASE_URL}/v1/transaction/${id}`);
  }
}
