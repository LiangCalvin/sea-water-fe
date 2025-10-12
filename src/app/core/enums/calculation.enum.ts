export enum CalculationsModule {
  CALCULATION = 'calculation',
  MODEL_AND_BASIC_COMPOSITION = 'model-and-basic-composition',
  SELECT_POSITION = 'select-position',
  CALCULATION_INPUT = 'calculation-input',
}

export enum CalculationConstants {
  COLUMN_COMPONENT = 'Component / Case',
  COLUMN_VALUE = 'Custom',
  GENERIC = 'generic',
  MANUAL = 'manual',
  TITLE_BASIC_COMPOSITION_TABLE = 'Import Basic Composition data',
  DESC_BASCI_COMPOSITION_TABLE = 'Upload your Excel file for Basic Composition, or use the template below to get started',
  TYPE_BASIC_COMPOSITION = 'basic_composition_excel_template',
  TTTLE_SECTION_PIPESIM_TABLE = 'Import Section data',
  TYPE_SECTION_PIPESIM = 'pipesim_excel_template'
}

export enum AlertMessageConstants {
  MODEL_TITLE_DRAFT = '',
  MODEL_TEXT_DRAFT = 'Your calculation draft has been saved successfully.',
  MODEL_TITLE = 'Model Submitted',
  MODEL_TEXT = 'Your calculation has been saved successfully.',
  SAVE_SUCCESS_TITLE = '',
  SAVE_DRAFT_SUCCESS_TEXT = 'Your calculation draft has been saved successfully.',
  SAVE_SUCCESS_TEXT = 'Your calculation has been saved successfully.',
  SAVE_FAILED_TITLE = 'Save Failed',
  SAVE_FAILED_TEXT = 'Something went wrong while saving',
  SAVE_FAILED_TITLE_MODEL_AND_BASIC_COMPOSITION = 'Required fields missing',
  SAVE_FAILED_TEXT_MODEL_AND_BASIC_COMPOSITION = 'Some fields are missing. Please complete all required data.',
  REVIEW_SUCCESS_TITLE = 'Calculation submitted successfully.',
  REVIEW_SUCCESS_TEXT = 'Your simulation is now processing.',
  REVIEW_FAILED_TITLE = 'Submit Failed.',
  REVIEW_FAILED_TEXT = 'Something went wrong while submiting.',
  IMPORT_FILE_TITLE_FAILED = 'Import Failed',
  PROCESS_INFOMATION_SAVE_TITLE_FAILED = 'Process infomation Failed',
  PIPING_SAVE_TITLE_FAILED = 'Piping Data Failed',
  EROSION_SAVE_TITLE_FAILED = 'Erosion Calculation Failed',
  THERMORWELL_SAVE_TITLE_FAILED = 'Wak Frequency(Thermowell) Failed',
  PIPESIM_SAVE_TITLE_FAILED = 'Pipline Failed',
  RECALCULATE_FAILED_TITLE = 'Recalculated Submit Failed.',
  RECALCULATE_FAILED_TEXT = 'Recalculated failed please try again or contact support.',
  EXPORT_FILE_FAILED_TITLE = 'Export File Failed',
  EXPORT_FILE_FAILED_TEXT = 'Export file failed please try again or contact support.',
  COPY_TEXT_SUCCESS_TITLE = 'Coppy Successfully',
  COPY_TEXT_SUCCESS_TEXT = 'Prompt copied',
  PROCESS_INFOMATION_VALID_TITLE = 'Process Infomation Form',
  PROCESS_INFOMATION_VALID_TEXT = 'Process Infomation Required fields missing',
  PIPING_DATA_VALID_TITLE = 'Piping Data Form',
  PIPING_DATA_VALID_TEXT = 'Piping Data Required fields missing',
  EROSION_VALID_TITLE = 'Erosion calculation Form',
  EROSION_VALID_TEXT = 'Erosion calculation Required fields missing',
  THERMORWELL_VALID_TITLE = 'Wake Frequency(Themorwell) Form',
  THERMORWELL_VALID_TEXT = 'Wake Frequency(Themorwell) Required fields missing',
  PIPESIM_VALID_TITLE = 'Pipeline Form',
  PIPESIM_VALID_TEXT = 'Pipeline Required fields missing',
}

export enum targetPressureType {
  TYPE_PIPELINE = 'Same as Pipeline Design Pressure',
  TYPE_WELLHEAD = 'Same as U/S Wellhead Platform PAHH',
  TYPE_EXPORT = 'Same as Export Pressure (Process Information)',
}

export enum pressureType {
  TYPE_DS = 'D/S Platform Pressure',
  TYPE_US = 'U/S Platform Pressure',
}

export enum innerDiameterType {
  INNER_DIAMETER_ID = 'inner_diameter',
  INNER_DIAMETER = 'Inner Diameter',
  THICKNESS_ID = 'thickness',
  THICKNESS = 'Thickness',
}

export enum titleSummaryType {
  POSITION_1_PRODUCT_MANIFLOD = '1-1',
  POSITION_1_EXPORT_MANIFLOD = '1-2',
  POSITION_2_1 = '2-1',
  POSITION_2_2 = '2-2',
  POSITION_3 = '3-1',
  POSITION_4 = '4',
}

export const titleSummary: Record<titleSummaryType, string> = {
  [titleSummaryType.POSITION_1_PRODUCT_MANIFLOD]:
    'Position 1 Production Manifold',
  [titleSummaryType.POSITION_1_EXPORT_MANIFLOD]: 'Position 1 Export Manifold',
  [titleSummaryType.POSITION_2_1]: 'Position 2.1 Receiving Facility 1',
  [titleSummaryType.POSITION_2_2]: 'Position 2.2 Receiving Facility 2',
  [titleSummaryType.POSITION_3]: 'Position 3 Export Facility',
  [titleSummaryType.POSITION_4]: 'Position 4',
};

export enum flowInduceReccommendation {
  LOF_1 = 'LOF ≥ 1',
  LOF_2 = '1 > LOF ≥ 0.5',
  LOF_3 = '0.5 > LOF ≥ 0.3',
  LOF_4 = 'LOF < 0.3',
  ACTION_1 = 'Main line shall be re-supported or redesigned for relevant piping. Small bore connections actions shall be undertaken',
  ACTION_2 = 'Main line should be re-supported or redesigned for relevant piping as far as practicable, or vibration monitoring of the main line should be undertaken after commissioning. Small bore connections actions shall be undertaken',
  ACTION_3 = 'Modifications to main line are not required however; Small bore connections actions should be undertaken',
  ACTION_4 = 'Acceptable LOF value. No action required',
}

export enum coatingName {
  COATING_3_LPP = '3LPP',
  COATING_3_LPE = '3LPE',
  COATING_FBE = 'FBE',
  COATING_SP_2888 = 'SP-2888',
  COATING_SP_8888 = 'SP-8888',
  HIGH_TEMPERATURE_FBE = 'High Temperature FBE'
}

export const temperatureCoatingName: Record<coatingName, string> = {
  [coatingName.COATING_3_LPP]: '120',
  [coatingName.COATING_3_LPE]: '80',
  [coatingName.COATING_FBE]: '80',
  [coatingName.COATING_SP_2888]: '80',
  [coatingName.COATING_SP_8888]: '150',
  [coatingName.HIGH_TEMPERATURE_FBE]: '155',
};

export enum region {
  REGION_ID_0 = 'region_0',
  REGION_ID_1 = 'region_1',
  REGION_ID_2 = 'region_2',
  REGION_ID_3 = 'region_3',
  REGION_NAME_0 = '0 (Non-sour service)',
  REGION_NAME_1 = 'Region 1',
  REGION_NAME_2 = 'Region 2',
  REGION_NAME_3 = 'Region 3',
}

export enum calculationStep {
  MODEL_COMPOSITION = 'MODEL_COMPOSITION',
  SELECT_POSITION = 'SELECT_POSITION',
  FORM_INPUT = 'FORM_INPUT',
  INPUT_SUMMARY = 'INPUT_SUMMARY',
  PROCESSING = 'PROCESSING',
  RESULT_SUMMARY = 'RESULT_SUMMARY',
}

export const handleStep: Record<calculationStep, number> = {
  [calculationStep.MODEL_COMPOSITION]: 0,
  [calculationStep.SELECT_POSITION]: 1,
  [calculationStep.FORM_INPUT]: 2,
  [calculationStep.INPUT_SUMMARY]: 3,
  [calculationStep.PROCESSING]: 4,
  [calculationStep.RESULT_SUMMARY]: 4,
};

export enum materialType {
  CARBON_STEEL_ID = 'carbon_steel',
  CARBON_STEEL_NAME = 'Carbon Steel',
  STAINLESS_ID = 'stainless_steel',
  STAINLESS_NAME = 'Stainless Steel'
}

export const mapMaterialType: Record<materialType, string> = {
  [materialType.CARBON_STEEL_ID]: materialType.CARBON_STEEL_NAME,
  [materialType.STAINLESS_ID]: materialType.STAINLESS_NAME,
  [materialType.CARBON_STEEL_NAME]: materialType.CARBON_STEEL_NAME,
  [materialType.STAINLESS_NAME]: materialType.STAINLESS_NAME
};

export enum spanType {
  STIFF_ID = 'stiff',
  STIFF_NAME = 'Stiff',
  MEDIUM_STIFF_ID = 'medium_stiff',
  MEDIUM_STIFF_NAME = 'Medium Stiff',
  MEDIUM_ID = 'medium',
  MEDIUM_NAME = 'Medium',
  FLEXIBLE_ID = 'flexible',
  FLEXIBLE_NAME = 'Flexible',
  CUSTOM_ID = 'custom',
  CUSTOM_NAME = 'Custom',
}

export const mapSpanType: Record<any, string> = {
  [spanType.STIFF_ID]: spanType.STIFF_NAME,
  [spanType.MEDIUM_STIFF_ID]: spanType.MEDIUM_STIFF_NAME,
  [spanType.MEDIUM_ID]: spanType.MEDIUM_NAME,
  [spanType.FLEXIBLE_ID]: spanType.FLEXIBLE_NAME,
  [spanType.CUSTOM_ID]: spanType.CUSTOM_NAME,
};

export const mapRegion: Record<any, string> = {
  [region.REGION_ID_0]: region.REGION_NAME_0,
  [region.REGION_ID_1]: region.REGION_NAME_1,
  [region.REGION_ID_2]: region.REGION_NAME_2,
  [region.REGION_ID_3]: region.REGION_NAME_3,
}

export enum stemType {
  STRAIGHT = 'straight',
  TAPERED = 'tapered',
  STEPPED = 'stepped'
}

export enum connectionType {
  THREADED = 'threaded',
  FLANGE = 'flange',
  WELDED = 'welded',
  VAN_STONE = 'van_stone'
}

export enum wakeFrequencyType {
  GAS = 'gas',
  WATER = 'water',
  OIL = 'oil',
}

export enum thermowellMaterial {
  SS_316L = '316l_ss',
  SUPER_DUPLEX = 'super_duplex',
}

export const mappingWakeFrequency: Record<wakeFrequencyType, string> = {
  [wakeFrequencyType.GAS]: 'Gas',
  [wakeFrequencyType.WATER]: 'Water',
  [wakeFrequencyType.OIL]: 'Oil',
}

export const mappingStemType: Record<stemType, string> = {
  [stemType.STRAIGHT]: 'Straight',
  [stemType.TAPERED]: 'Tapered',
  [stemType.STEPPED]: 'Stepped',
}

export const mappingConnectionType: Record<connectionType, string> = {
  [connectionType.THREADED]: 'Threaded',
  [connectionType.FLANGE]: 'Flange',
  [connectionType.WELDED]: 'Welded',
  [connectionType.VAN_STONE]: 'Van Stone',
}

export const mappingThermowellMaterial: Record<thermowellMaterial, string> = {
  [thermowellMaterial.SS_316L]: '316L SS',
  [thermowellMaterial.SUPER_DUPLEX]: 'Super Duplex'
}
