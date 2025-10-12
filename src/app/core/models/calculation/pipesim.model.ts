import { FormArray, FormControl } from "@angular/forms";

export interface CoatingNameDropDownResponse {
    data?: CoatingName[];
}

export interface CoatingName {
    name?: string;
    temperature?: number;
}


export interface PipesimSaveResponse {
    data?: saveResponse;
}


export interface saveResponse {
    studyId?: string;
    transactionId?: string;
}

export interface PipesimResponse {
    data?: PipesimData
}

export interface PipesimExportRequset {
    data?: string
}

export interface PipesimRequest {
    studyId?: string;
    transactionId?: string;
    platformPressure?: PlatformPressure;
    pipelineSection?: PipelineSection[];
    riserDown?: RiserDown[];
    riserUp?: RiserUp[];
    otherData?: Other;
}

export interface PipesimData {
    platformPressure?: PlatformPressure;
    pipelineSection?: PipelineSection[];
    riserDown?: RiserDown[];
    riserUp?: RiserUp[];
    otherData?: Other;
}

export interface PlatformPressure {
    name?: string;
    value?: number;
}

export interface Input {
    name?: string;
    value?: number;
}

export interface Coating {
    order?: number;
    name?: string;
    designTemperature?: number;
    conductivity?: number;
    thickness?: number;
}

export interface PipelineSection {
    position?: number;
    outerDiameter?: number;
    pipelineInput?: Input;
    pipelineLength?: number;
    coating?: Coating[];
}

export interface RiserDown {
    position?: number;
    outerDiameter?: number;
    riserInput?: Input;
    height?: number;
    coating?: Coating[];
}

export interface RiserUp {
    position?: number;
    outerDiameter?: number;
    riserInput?: Input;
    height?: number;
    coating?: Coating[];
}

export interface Other {
    designPressure?: number;
    usPahh?: number;
    pH?: number;
    pipelineDesignRegion?: string

}

export interface PipeLineForm {
    pipeline?: PipelineFormData[]
}
export interface PipelineFormData {
    outerDiameter?: string;
    innerDiameterName?: InnerDiameterFormData;
    innerDiameterValue?: string;
    length?: string;
    coatings?: CoatingFormData[];
}

export interface RiserFormData {
    outerDiameter?: string;
    innerDiameterName?: InnerDiameterFormData;
    innerDiameterValue?: string;
    height?: string;
    coatings?: CoatingFormData[];
}

export interface CoatingFormData {
    coatingName: CoatingNameFormData;
    coatingTemperature: string;
    coatingConductivity: string;
    coatingThickness: string;
}

export interface CoatingNameFormData {
    id?: string;
    name?: string;
    temperature?: number;
}
export interface InnerDiameterFormData {
    id?: string,
    name?: string
}

export interface ComponentForm {
    pipeline: PipelineForm;
    riserUp: RiserForm;
    riserDown: RiserForm;
    others: OthersForm;
}

type RiserForm = FormArray<FormControl<string | null>>;
type PipelineForm = FormArray<FormControl<string | null>>;
type OthersForm = FormArray<FormControl<string | null>>;


export interface ProcessForm {
    group1: {
        value: {
            exportPressure: number | null;
        };
    };
}


export interface RiserData {
    outerDiameter?: string;
    riserInput?: { name: string; value: string };
    height?: string;
    coating?: { order: number; someProp?: string }[];
}