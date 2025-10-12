export interface CreateStudyRequest {
    studyName?: string;
    locationId?: string;
    assetId?: string;
}

export interface CreateStudyResponse {
    data: {
        studyId: string;
        studyCode: string;
    };
}

export interface DropDownResponse {
    data?: Data[];
    total?: number
}

export interface Data {
    id?: string;
    name?: string;
}
