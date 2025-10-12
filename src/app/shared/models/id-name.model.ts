export interface IdName {
  id: string;
  name: string;
}
export interface PageLink {
  page: string;
  link: string;
  queryParams?: {};
}

export interface AssetOption {
  id: string;
  name: string;
  assetId?: string;
}

export interface LocationOption {
  id: string;
  name: string;
  locationId?: string;
}