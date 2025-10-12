export interface TopSideSummaryResponse {
    data?: TopSideSummaryResponse
}

export interface TopSideSummaryData {
    transactionId?: string;
    sequenceFlow?: string;
    data?: DataPosition[];
}

export interface DataPosition {
    position?: number;
    subPosition?: number;
    lineSizing?: LineSizing;
    fivLof?: FivLof;
    thermowell?: Thermowell;
    pipingDetail?: PipingDetail;
    hyshysysOutputysOut: HysysOutput;
}

export interface LineSizing {
    momentum?: number;
    velocity?: number;
    vapi?: number;
     // eslint-disable-next-line rule-name-here
    resultMaxMomentum?: boolean;
     // eslint-disable-next-line rule-name-here
    resultVmaxVelocity?: boolean;
     // eslint-disable-next-line rule-name-here
    resultCmaxVelocity?: boolean;
    maxVelocityRangeUpperBound?: number;
    maxVelocityRangeLowerBound?: number;
    topsideDesignPressure?: number;
    vmax?: number;
    ErosionCalculationInput?: ErosionCalculation;
    ErosionCalculationOutput?: ErosionCalculation;
     // eslint-disable-next-line rule-name-here
    ErosionCalculationResult?: boolean;
    geometryConstant?: number;
    sandDiameter?: number;
}

export interface ErosionCalculation {
    type?: string;
    value?: number;
}

export interface FivLof {
    // eslint-disable-next-line rule-name-here
    result?: boolean;
    lof?: number;
}

export interface Thermowell {
    phaseType?: string;
    compareFrequency?: number;
     // eslint-disable-next-line rule-name-here
    thermowellResult?: boolean;
}

export interface PipingDetail {
    position?: number;
    subPosition?: number;
    positionType?: string;
    pipingSize?: number;
    pipingClass?: string;
    innerDiameter?: DimaterType;
    outerDiameter?: DimaterType;
    thickness?: DimaterType;
    material?: string;
    erosionVelocityConstant?: number;
    specNo?: string;
    maxOperatingTemp?: number;
    allowableStress?: number;
    coefficient?: number;
    qualityFactor?: number;
    corrosionAllowance?: number;
    weldingJointStrength?: number;
    spanType?: string;
    spanLength?: number;
    pipelineDesignPressure?: number;
    actualThickness?: number;
}

export interface DimaterType {
    value?: number;
    unit?: string;
}

export interface HysysOutput {
    fluidMixtureVelocity?: number;
    overallActvolumeflow?: number;
    overallDensity?: number;
    vapViscoity?: number;
}

export interface PipeLineSummaryResponse {
    data?: PipeLineSummaryData;
}

export interface PipeLineSummaryData {
    transactionId?: string;
    erosionalVelocity?: ErosionalVelocity;
    temperatureProfile?: TemperatureProfile;
    pressureProfile?: PressureProfile;
}

export interface ErosionalVelocity {
    // eslint-disable-next-line rule-name-here
    result?: boolean;
    data?: ErosionalVelocityData[];
}

export interface ErosionalVelocityData {
    // eslint-disable-next-line rule-name-here
    result?: boolean;
    pipeType?: string;
    position?: number;
    order?: number;
    erosionalVelocityRatio?: number;
}

export interface TemperatureProfile {
    // eslint-disable-next-line rule-name-here
    result?: boolean;
    data?: TemperatureProfileData[];
    criteria?: TemperatureProfileData[];
}

export interface TemperatureProfileData {
    name?: string;
    data?: Grahp[];
}

export interface PressureProfile {
    // eslint-disable-next-line rule-name-here
    result?: boolean;
    data?: TemperatureProfileData[];
    criteria?: TemperatureProfileData[];
}

export interface PressureProfileData {
    // eslint-disable-next-line rule-name-here
    result?: boolean;
    data?: Grahp[];
    criteria?: PressureProfileCriteria[];
}

export interface PressureProfileCriteria {
    // eslint-disable-next-line rule-name-here
    result?: boolean;
    data?: PressureProfileData[];
    criteria?: TemperatureProfileData[];
}

export interface PressureProfileCriteria {
    name?: string;
    value?: number;
}

export interface SourServiceProfile {
    // eslint-disable-next-line rule-name-here
    result?: boolean;
    input?: SourServiceProfileInput;
    data?: Grahp;
    criteria?: SourServiceProfileCriteria;
}

export interface SourServiceProfileInput {
    co2?: number;
    h2s?: number;
    targetPressure?: number;
    ph?: number;
    pipelineDesignRegion?: string;
}

export interface SourServiceProfileCriteria {
    calculatePh?: number;
    pipelineDesignRegion?: string
}


export interface Grahp {
    xCoordinate?: number;
    yCoordinate?: number;
}