import { FormControl } from "@angular/forms";

export interface ThermowellData{
    insulationThickness?:number;
    stemType?:string;
    insertionLength?:number;
    wellLength?:number;
    thermowellMaterial?:string;
    youngModulus?:number;
    rootDiameter?:number;
    tipDiameter?:number;
    boreDiameter?:number;
    avg?:number;
    connectionType?:string;
    pipingSize?:number;
    pipingClass?:string;
    innerDiameter?:number;
    innerDiameterUnit?:string;
    nozzleLength?:number;
    thickNess?:number;
}

export interface PipingFormControls {
    pipingSize: FormControl<number | null>;
    pipingClass: FormControl<number | null>;
    innerDiameter: FormControl<number | null>;
    nozzleLength: FormControl<number | null>;
    thickNess: FormControl<number | null>;
  }

  export interface ThermowellDetail {
    phaseType:string | 'gas' | 'oil' | 'water'; 
    compareFrequency: number | null;
    thermowellResult: boolean | null;
    reynoldNumber: number | null;
    strouhalNumber: number | null;
    wakeFrequency: number | null;
    secondMomentOfArea: number | null;
    crossSectionalArea: number | null;
    naturalFrequency: number | null;
    velocity: number | null;
  }