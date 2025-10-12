import {
  inject,
  Injectable,
} from '@angular/core';
import { EnvironmentConfigurationService } from '../environment-configuration.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cleanObject } from '../../shared/Utils/cleanJSON';
import { CompositionRequset, CompositionResponse, manualTableResponse, ModelCompositionSaveRequest, ModelCompositionResponse, TableComposition, ModelCompositionSaveResponse, ModelDropDownResponse, BasicCompositionResponse } from '../../core/models/calculation/model-and-basic-composition.model';
import { CoatingNameDropDownResponse, PipesimExportRequset, PipesimRequest, PipesimResponse, PipesimSaveResponse } from '../../core/models/calculation/pipesim.model';
import { SaveSelectPositionRequest, SaveSelectPositionResponse } from '../../core/models/select-position/sequence-flow.model';
import { PipeLineSummaryResponse, TopSideSummaryResponse } from '../../core/models/calculation/result-summary.model';
import { PipingClassResponse, PipingSizeResponse } from '../../core/models/calculation/dropdown-option.model';

@Injectable({
  providedIn: 'root'
})

export class CalculationService {
  private envConfigService = inject(EnvironmentConfigurationService);
  private http = inject(HttpClient);
  private readonly BASE_URL = this.envConfigService.getBaseUrl();
  constructor() { }

  getTableModelCompositonById(): Observable<BasicCompositionResponse> {
    return this.http.get<BasicCompositionResponse>(`${this.BASE_URL}/v1/model-composition/compositions`);
  }

  getModelCompositonById(studyId?: string, transactionId?: string): Observable<ModelCompositionResponse> {
    const params = {
      study_id: studyId,
      transaction_id: transactionId,
    };
    const req = cleanObject(params);
    return this.http.get<ModelCompositionResponse>(`${this.BASE_URL}/v1/model-composition`, { params: req });
  }


  getProcessInformationById(studyId: string, transactionId: string): Observable<{ data: any }> {
    const params = {
      study_id: studyId,
      transaction_id: transactionId,
    };
    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/process/hysys`, { params });
  }

  getPipingDataById(studyId: string, transactionId: string): Observable<{ data: any }> {
    const params = {
      study_id: studyId,
      transaction_id: transactionId,
    };

    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/piping`, { params });
  }

  getPipingSize(): Observable<PipingSizeResponse> {
    return this.http.get<PipingSizeResponse>(`${this.BASE_URL}/v1/piping/size`);
  }
  getPipingClass(): Observable<PipingClassResponse> {
    return this.http.get<PipingClassResponse>(`${this.BASE_URL}/v1/piping/class`);
  }
  getPipingDetailByClassAndSize(pipingClass: string, size: number): Observable<{ data: any }> {
    const params = { class: pipingClass, size: size.toString() };
    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/piping/detail`, { params });
  }

  getQualityFactor(specNo: string, pipingClass: string): Observable<{ data: any }> {
    const params = { spec_no: specNo, class: pipingClass };
    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/piping/quality-factor`, { params });
  }

  getAllowableStress(specNo: string, temperature: number, grade: string): Observable<{ data: any }> {
    const params = { spec_no: specNo, temperature: temperature.toString(), grade: grade };
    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/piping/allowable-stress`, { params });
  }

  getErosionCalculationDataById(studyId: string, transactionId: string): Observable<{ data: any }> {
    const params = {
      study_id: studyId,
      transaction_id: transactionId,
    };

    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/erosion`, { params });
  }

  getInsertionLength(size: number): Observable<{ data: any }> {
    const params = { size: size.toString() };
    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/insertion-length/`, { params });
  }

  getDropDownModels(): Observable<ModelDropDownResponse> {
    return this.http.get<ModelDropDownResponse>(`${this.BASE_URL}/v1/model-composition/models`);
  }

  getThermowellData(studyId: string, transactionId: string): Observable<{ data: any }> {
    const params = {
      study_id: studyId,
      transaction_id: transactionId,
    };
    return this.http.get<any>(`${this.BASE_URL}/v1/thermowell`, { params });
  }

  getInsertionLengthBySize(size: number): Observable<{ data: any }> {
    const params = { size: size.toString() };
    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/thermowell/insertion-length`, { params });
  }

  saveDraftModelComposition(req: ModelCompositionSaveRequest): Observable<ModelCompositionSaveResponse> {
    return this.http.post<ModelCompositionSaveResponse>(`${this.BASE_URL}/v1/model-composition/draft`, req);
  }

  saveModelComposition(req: ModelCompositionSaveRequest): Observable<ModelCompositionSaveResponse> {
    return this.http.post<ModelCompositionSaveResponse>(`${this.BASE_URL}/v1/model-composition`, req);
  }

  saveDraftSelectPosition(req: SaveSelectPositionRequest): Observable<SaveSelectPositionResponse> {
    return this.http.patch<SaveSelectPositionResponse>(`${this.BASE_URL}/v1/transaction/sequence-flow/draft`, req);
  }

  saveSelectPosition(req: SaveSelectPositionRequest): Observable<SaveSelectPositionResponse> {
    return this.http.patch<SaveSelectPositionResponse>(`${this.BASE_URL}/v1/transaction/sequence-flow`, req);
  }

  saveProcessInformation(req: any): Observable<{ response: any }> {
    return this.http.post<any>(`${this.BASE_URL}/v1/process/hysys`, req);
  }

  saveDraftProcessInformation(req: any): Observable<{ response: any }> {
    return this.http.post<any>(`${this.BASE_URL}/v1/process/hysys/draft`, req);
  }

  saveDraftPipingData(req: any): Observable<{ response: any }> {
    return this.http.post<any>(`${this.BASE_URL}/v1/piping/draft`, req);
  }

  savePipingData(req: any): Observable<{ response: any }> {
    return this.http.post<any>(`${this.BASE_URL}/v1/piping`, req);
  }

  saveDraftErosionCalculationData(req: any): Observable<{ response: any }> {
    return this.http.post<any>(`${this.BASE_URL}/v1/erosion/draft`, req);
  }

  saveDraftThermowell(req: any): Observable<{ response: any }> {
    return this.http.post<any>(`${this.BASE_URL}/v1/thermowell/draft`, req);
  }

  saveThermowellData(req: any): Observable<{ response: any }> {
    return this.http.post<any>(`${this.BASE_URL}/v1/thermowell`, req);
  }

  saveErosionCalculationData(req: any): Observable<{ response: any }> {
    return this.http.post<any>(`${this.BASE_URL}/v1/erosion`, req);
  }

  postReadExcelComposition(req: CompositionRequset): Observable<CompositionResponse> {
    return this.http.post<CompositionResponse>(`${this.BASE_URL}/v1/model-composition/read-composition`, req);
  }

  getPipesimById(studyId: string, transactionId: string): Observable<PipesimResponse> {
    const params = { study_id: studyId, transaction_id: transactionId };
    return this.http.get<PipesimResponse>(`${this.BASE_URL}/v1/pipesim`, { params });
  }

  saveDraftPipesim(req: PipesimRequest): Observable<PipesimSaveResponse> {
    return this.http.post<PipesimSaveResponse>(`${this.BASE_URL}/v1/pipesim/draft`, req);
  }

  submitPipesim(req: PipesimRequest): Observable<PipesimSaveResponse> {
    return this.http.post<PipesimSaveResponse>(`${this.BASE_URL}/v1/pipesim`, req);
  }

  postReadExcelPipesim(req: PipesimExportRequset): Observable<PipesimResponse> {
    return this.http.post<PipesimResponse>(`${this.BASE_URL}/v1/pipesim/read-template`, req);
  }

  getManualData() {
    return this.http.get<manualTableResponse[]>('assets/mock/manual.json');
  }

  getTemplatData(fileName: string): Observable<{ response: any }> {
    return this.http.get<any>(`${this.BASE_URL}/v1/gcp/file?filename=${fileName}.xlsx`);
  }

  getSummaryTopSide(studyId: string, transactionId: string): Observable<TopSideSummaryResponse> {
    const params = { study_id: studyId, transaction_id: transactionId };
    return this.http.get<TopSideSummaryResponse>(`${this.BASE_URL}/v1/calculation/summary/topside`, { params });
  }

  getSummaryPipesim(studyId: string, transactionId: string): Observable<PipeLineSummaryResponse> {
    const params = { study_id: studyId, transaction_id: transactionId };
    return this.http.get<PipeLineSummaryResponse>(`${this.BASE_URL}/v1/calculation/summary/pipesim`, { params });
  }

  getDropDownCoating(): Observable<CoatingNameDropDownResponse> {
    return this.http.get<CoatingNameDropDownResponse>(`${this.BASE_URL}/v1/pipesim/coatings`);
  }

  reCalculation(req: any) {
    return this.http.post<any>(`${this.BASE_URL}/v1/calculation/recalculate`, req);
  }

  submitCalculation(req: any) {
    return this.http.post<any>(`${this.BASE_URL}/v1/process/run`, req);
  }

  getExportSummary(studyId: string, transactionId: string) {
    const params = { study_id: studyId, transaction_id: transactionId };
    return this.http.get<{ data: any }>(`${this.BASE_URL}/v1/calculation/summary/export`, { params });
  }

}