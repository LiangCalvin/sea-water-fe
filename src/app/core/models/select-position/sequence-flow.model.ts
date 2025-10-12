export interface SaveSelectPositionRequest {
    studyId: string;
    transactionId: string;
    sequenceFlow: string;
}

export interface SaveSelectPositionResponse {
    // eslint-disable-next-line rule-name-here
    data: boolean;
}