export interface Study {
  studyId: string;
  studyCode: string;
  studyName: string;
  assetName: string;
  locationName: string;
  createdBy: string;
  status: string;
  updatedAt: string;
  createdAt: string;
}

export interface ApiStudyResponse {
  studyId: string;
  studyCode: string;
  studyName: string;
  assetName: string;
  locationName: string;
  createdBy: string;
  status: string;
  updatedAt: string;
  createdAt: string;
}

export interface StudyListParams {
  limit?: number;
  page?: number;
  order?: string;
  sort?: string;
  search?: string;
  status?: string;
  asset_name?: string;
  location_name?: string;
  created_by?: string;
}

export interface StudyListResponse {
  data: ApiStudyResponse[];
  total: number;
  totalPage: number;
  query?: StudyListQuery;
}

export interface StudyListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search: string;
}

export interface ExportCalculationResponse {
  data: {
    filename: string;
    data: string;
  };
}