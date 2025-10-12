export interface ErosionCalculation {
  studyId: string;
  transactionId: string;
  calculationOption: {
    type: string;
    value: number;
  };
  sandDiameter: number;
  geometryConstant: number;
}

export interface ErosionCalculationData{
  calculationType?:string;
  sandProductionRate?:number;
  allowableErosionRate?:number;
  geometryConstant?:number;
  sandDiameter?:number;
}