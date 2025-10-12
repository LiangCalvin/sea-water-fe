import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";

export interface FormValues {
    gas?: number;
    condensateType?: string;
    condensateValue?: number;
    cgrValue?: number;
    waterType?: string;
    waterValue?: number;
    wgrValue?: number;
    h2s?: number;
    co2?: number;
    exportTemperature?: number;
    exportPressure?: number;
}


export interface Position {
    position?: number;
    subPosition?: number;
}

export interface FlowRate {
    gas: number;
    condensate: { type: string; value: number };
    water: { type: string; value: number };
}

export interface Composition {
    h2s: number;
    co2: number;
}

export interface Temperature {
    export: number;
    pressure: number;
}

export interface FetchedDataItem {
    position: number;
    subPosition: number;
    flowRate: FlowRate;
    composition: Composition;
    temperature: Temperature;
    positionType: string;
}

export interface SelectionMaps {
    itemPreSelections: Record<string, string>;
    positionTypes: Record<string, string>;
    allSelections: Record<string, string>;
    allPositionTypes: Record<string, string>;
}

export interface ProcessInformationComponentPrivate {
    mapFetchedDataToForm: (data: any[]) => void;
    validateProcessInformation: () => void;
    watchFormChanges: () => void;
    initializeDefaultForm: () => void;
    getProcessInformation: (studyId: string, transactionId: string) => void;
  }


 export interface RebuildFormsComponentPrivate {
    sequenceFlow: string;
    rebuildFormsForSequenceFlow: () => void;
    getPositionsForSequenceFlow: (sequenceFlow: string) => { position: number; subPosition: string }[];
    defaultFormValues: FormValues;
    allFormData: Record<string, FormValues>;
    allSelections: Record<string, string>;
    allPositionTypes: Record<string, string>;
    itemPreSelections: Record<string, string>;
    positionTypes: Record<string, string>;
    formGroups: Record<string, { disabled: boolean } & Partial<FormGroup>>;
    editMode: boolean;
  }


  export interface CalculationService {
    saveDraftProcessInformation(...args: unknown[]): unknown;
  }
  
  export interface ProcessInformationComponentPrivate {
    parseNumber(val: string | number | null | undefined): number;
    fetchedData: Array<{ position: number; subPosition: number }>;
    formGroups: Record<string, FormGroup>;
    itemPreSelections: Record<string, string>;
    study: { data: { studyId?: string; study_id?: string } };
    transactionId: { data: { transactionId?: string; transaction_id?: string } };
    setFormGroupState(enabled: boolean): void;
    calculationService: CalculationService;
    editMode: boolean;
    saveDraft(): Promise<void>;
  }

export interface MappedFormEntry {
  position: number;
  positionType: string;
  subPosition: string | number;
  flowRate: FlowRate;
  composition: Composition;
  temperature: Temperature;
}


export interface UploadModalContent {
  title: string;
  templateName: string;
}

export interface ModalRefMock {
  getContentComponent: () => UploadModalContent;
  afterClose: Observable<any>;
}