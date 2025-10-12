export interface IdName {
  id: string;
  name: string;
}

export interface PipingClassResponse {
  data: {
    pipingClass: string[];
  };
}

export interface PipingSizeResponse {
  data: {
    pipingSize: number[];
  };
}