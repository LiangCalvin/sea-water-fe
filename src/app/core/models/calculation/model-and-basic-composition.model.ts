import { IdName } from "./dropdown-option.model";

export interface TableComposition {
    name?: string;
    value?: number;
}

export interface ModelComposition {
    modelId?: string;
    isGeneric?: boolean;
    compositionName?: string;
    compositions?: TableComposition[];
}

export interface ModelCompositionSaveRequest {
    studyId?:string;
    transactionId?:string;
    compositionName?: string;
    isGeneri?:boolean;
    modelId?: string;
    compositions?: TableComposition[];
}

export interface responseModel {
    studyId?:string;
    transactionId?:string;
    message?:string;
}

export interface ModelCompositionSaveResponse {
    data?:responseModel
}

export interface ModelCompositionResponse {
    data?: ModelComposition;
}

export interface CompositionRequset {
    data?: string
}

export interface CompositionResponse {
    data?: TableComposition[]
}

export interface manualComposition {
    columnName: string;
    value: string | number | undefined;
}

export interface manualTableResponse  {
    columns: manualComposition[] ;
}

export interface ModelDropDownResponse {
    data?:IdName[];
    total?:number;
}

export interface BasicCompositionData {
    name?:string;
    compositions?:TableComposition[];
}
export interface BasicCompositionResponse {
    data?:BasicCompositionData [];
    total?:number;
}


export interface FormBasicComposition{
    genericComposition?:IdName[] | null;
    genericType?:string;
    manualType?:string;
    whpDesign?:IdName[] | null;
}






